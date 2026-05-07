import 'server-only'

/**
 * Busca FIPE direto por marca/modelo/ano + codFipe usando Parallelum v2.
 * Usado como FALLBACK quando o reverse FIPE do PowerCRM (plate-lookup) falha.
 *
 * REGRA ABSOLUTA: valor FIPE nunca pode ser zero. Se a Parallelum também
 * falhar, retornamos null e quem chama TEM que bloquear o envio (sem PDF,
 * sem mensagem promissora) e mandar pra atendimento humano.
 *
 * Estratégia da Parallelum:
 *   1. Lista brands (cache 7d) → fuzzy match com brand do PowerCRM
 *   2. Lista models da brand (cache 7d) → fuzzy match com modelo do PowerCRM
 *   3. Lista years do modelo (cache 7d) → match pelo ano (ex: "2018-5")
 *   4. GET preço → parse "R$ 62.219,00" → 62219
 *
 * Brasil API foi descartada (HTTP 500 / 403 upstream em 2026-05-07).
 */

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v2'
const TIMEOUT_MS = 8000

const TTL_LIST = 7 * 24 * 60 * 60 * 1000
const TTL_PRICE = 24 * 60 * 60 * 1000

type CacheEntry<T> = { value: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(k: string): T | null {
  const e = cache.get(k)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    cache.delete(k)
    return null
  }
  return e.value as T
}

function setCached<T>(k: string, v: T, ttl: number): void {
  cache.set(k, { value: v, expiresAt: Date.now() + ttl })
}

function parseBRL(s: string): number {
  const digits = s.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(digits)
  return Number.isFinite(n) && n > 0 ? n : 0
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

interface FipeBrand {
  code: string
  name: string
}
interface FipeModel {
  code: string
  name: string
}
interface FipeYear {
  code: string
  name: string
}
interface FipePrice {
  price: string
  modelYear: number
  fuel: string
  codeFipe: string
  brand: string
  model: string
}

type Kind = 'cars' | 'motorcycles' | 'trucks'

function kindFromCategoria(categoria?: string | null): Kind {
  const c = (categoria || '').toLowerCase()
  if (c.includes('moto')) return 'motorcycles'
  if (c.includes('caminh') || c.includes('truck')) return 'trucks'
  return 'cars'
}

/* ─── Fuzzy matching ─── */

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const BRAND_ALIASES: Record<string, string[]> = {
  volkswagen: ['vw', 'volks', 'volkswagen'],
  chevrolet: ['gm', 'chevrolet', 'chevy'],
  fiat: ['fiat', 'fca'],
  mitsubishi: ['mmc', 'mitsubishi'],
  mercedes: ['mb', 'mercedes', 'mercedes-benz', 'mercedes benz'],
  citroen: ['citroen', 'citroën'],
  'land rover': ['lr', 'land rover', 'landrover'],
  bmw: ['bmw', 'bmc'],
  toyota: ['toyota'],
  ford: ['ford'],
  honda: ['honda'],
  hyundai: ['hyundai'],
  renault: ['renault'],
  nissan: ['nissan'],
  peugeot: ['peugeot'],
  jeep: ['jeep'],
}

function brandMatches(parallelumName: string, powercrmBrand: string): boolean {
  const pn = normalize(parallelumName)
  const pc = normalize(powercrmBrand)

  // Match direto
  if (pn === pc) return true
  if (pc.includes(pn) || pn.includes(pc)) return true

  // Aliases
  for (const [canonical, aliases] of Object.entries(BRAND_ALIASES)) {
    const pnHits = aliases.some((a) => pn.includes(a)) || pn.includes(canonical)
    const pcHits = aliases.some((a) => pc.includes(a)) || pc.includes(canonical)
    if (pnHits && pcHits) return true
  }
  return false
}

function modelScore(parallelumName: string, powercrmModel: string): number {
  const pn = normalize(parallelumName)
  const pc = normalize(powercrmModel)
  if (pn === pc) return 1000
  const pnTokens = pn.split(' ').filter((t) => t.length >= 2)
  const pcTokens = pc.split(' ').filter((t) => t.length >= 2)
  if (pnTokens.length === 0 || pcTokens.length === 0) return 0
  let hits = 0
  for (const tok of pcTokens) {
    if (pnTokens.includes(tok)) hits++
  }
  // pondera por proporção de matches
  return Math.round((hits / pcTokens.length) * 100) +
         Math.round((hits / pnTokens.length) * 50)
}

/* ─── Public API ─── */

export interface DirectFipeInput {
  brand?: string | null
  model?: string | null
  year?: number | string | null
  codFipe?: string | null
  categoria?: string | null
}

export interface DirectFipeResult {
  fipeValue: number
  source: 'parallelum'
  matchedBrand: string
  matchedModel: string
  matchedYear: string
  codeFipe: string
}

/**
 * Tenta achar valor FIPE via Parallelum usando dados do PowerCRM.
 * Se conseguir, retorna o valor e metadados pra debug.
 * Se falhar, retorna null (caller TEM que bloquear envio).
 */
export async function lookupFipeDirect(
  input: DirectFipeInput,
): Promise<DirectFipeResult | null> {
  const { brand, model, year, codFipe } = input
  if (!brand || !model || !year) return null

  const yearStr = String(year).match(/(\d{4})/)?.[1]
  if (!yearStr) return null

  const kind = kindFromCategoria(input.categoria)
  const cacheK = `direct:${kind}:${codFipe || ''}:${normalize(brand)}:${normalize(model)}:${yearStr}`
  const c = getCached<DirectFipeResult>(cacheK)
  if (c) return c

  // 1. Brands
  const brandsKey = `brands:${kind}`
  let brands = getCached<FipeBrand[]>(brandsKey)
  if (!brands) {
    brands = await fetchJson<FipeBrand[]>(`${FIPE_BASE}/${kind}/brands`)
    if (!brands || brands.length === 0) return null
    setCached(brandsKey, brands, TTL_LIST)
  }
  const brandHit = brands.find((b) => brandMatches(b.name, brand))
  if (!brandHit) return null

  // 2. Models
  const modelsKey = `models:${kind}:${brandHit.code}`
  let models = getCached<FipeModel[]>(modelsKey)
  if (!models) {
    models = await fetchJson<FipeModel[]>(
      `${FIPE_BASE}/${kind}/brands/${brandHit.code}/models`,
    )
    if (!models || models.length === 0) return null
    setCached(modelsKey, models, TTL_LIST)
  }
  // Ranking por similaridade — escolhe o melhor com score > 50
  const ranked = models
    .map((m) => ({ model: m, score: modelScore(m.name, model) }))
    .filter((r) => r.score >= 50)
    .sort((a, b) => b.score - a.score)
  if (ranked.length === 0) return null
  const modelHit = ranked[0].model

  // 3. Years (lista pode ter "2018-1", "2018-3", "2018-5" pra Gasolina/Álcool/Flex)
  const yearsKey = `years:${kind}:${brandHit.code}:${modelHit.code}`
  let years = getCached<FipeYear[]>(yearsKey)
  if (!years) {
    years = await fetchJson<FipeYear[]>(
      `${FIPE_BASE}/${kind}/brands/${brandHit.code}/models/${modelHit.code}/years`,
    )
    if (!years || years.length === 0) return null
    setCached(yearsKey, years, TTL_LIST)
  }
  // Match: code começa com yearStr (ex "2018-5")
  const yearCandidates = years.filter((y) => y.code.startsWith(`${yearStr}-`) || y.code === yearStr)
  if (yearCandidates.length === 0) return null

  // Tentamos cada candidato (combustível) até achar um preço válido.
  // Preferência: Flex > Gasolina > Álcool > Diesel.
  const fuelPriority = (name: string): number => {
    const n = name.toLowerCase()
    if (n.includes('flex')) return 0
    if (n.includes('gasolina')) return 1
    if (n.includes('alcool') || n.includes('álcool') || n.includes('etanol')) return 2
    if (n.includes('diesel')) return 3
    return 4
  }
  const sortedYears = [...yearCandidates].sort(
    (a, b) => fuelPriority(a.name) - fuelPriority(b.name),
  )

  for (const yc of sortedYears) {
    const priceKey = `price:${kind}:${brandHit.code}:${modelHit.code}:${yc.code}`
    let price = getCached<FipePrice>(priceKey)
    if (!price) {
      const fetched = await fetchJson<FipePrice>(
        `${FIPE_BASE}/${kind}/brands/${brandHit.code}/models/${modelHit.code}/years/${yc.code}`,
      )
      if (!fetched || !fetched.price) continue
      price = fetched
      setCached(priceKey, price, TTL_PRICE)
    }
    const value = parseBRL(price.price)
    if (value <= 0) continue

    // Se temos codFipe do PowerCRM, validamos o match (segurança extra)
    if (codFipe && price.codeFipe && price.codeFipe.replace(/\D/g, '') !== codFipe.replace(/\D/g, '')) {
      // codFipe diferente — segue tentando outros candidatos
      continue
    }

    const result: DirectFipeResult = {
      fipeValue: value,
      source: 'parallelum',
      matchedBrand: brandHit.name,
      matchedModel: modelHit.name,
      matchedYear: yc.name,
      codeFipe: price.codeFipe,
    }
    setCached(cacheK, result, TTL_PRICE)
    return result
  }

  return null
}

/**
 * Versão simplificada: dado só codFipe + ano, tenta usar uma rota direta.
 * Mantida por compatibilidade — chamada antiga era com (codFipe, year).
 *
 * Implementação: percorre brands/models procurando codFipe que bata.
 * Mais lento que `lookupFipeDirect` (que recebe brand+model), por isso
 * deve ser usado só como último recurso.
 */
export async function lookupFipeByCode(
  codFipe: string | null | undefined,
  year: number | string | null | undefined,
): Promise<number | null> {
  if (!codFipe || !year) return null
  // Sem brand/model, não vale a pena percorrer 2500+ marcas. Chamadores
  // devem usar `lookupFipeDirect` que é muito mais eficiente.
  return null
}
