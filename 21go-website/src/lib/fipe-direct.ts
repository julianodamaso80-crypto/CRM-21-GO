import 'server-only'

/**
 * Busca FIPE direto por código FIPE + ano, usando cascata de fontes públicas.
 * Usado como fallback quando o reverse FIPE do PowerCRM (plate-lookup) falha.
 *
 * Cascata:
 *   1. Brasil API (https://brasilapi.com.br/api/fipe/preco/v1/{codigo}) — sem auth
 *   2. Parallelum v2 (https://parallelum.com.br/fipe/api/v2/cars/...)    — sem auth
 *
 * Cache em memória 12h. Sem retry: se falhar, retorna null (chamador decide).
 */

const TIMEOUT_MS = 7000
const CACHE_TTL = 12 * 60 * 60 * 1000

type CacheEntry = { value: number; expiresAt: number }
const cache = new Map<string, CacheEntry>()

function cacheKey(codFipe: string, year: number | string): string {
  return `${codFipe}:${year}`
}

function getCached(k: string): number | null {
  const e = cache.get(k)
  if (!e) return null
  if (Date.now() > e.expiresAt) {
    cache.delete(k)
    return null
  }
  return e.value
}

function setCached(k: string, v: number): void {
  cache.set(k, { value: v, expiresAt: Date.now() + CACHE_TTL })
}

function parseBRL(s: string): number {
  const digits = s.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(digits)
  return Number.isFinite(n) && n > 0 ? n : 0
}

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

/* ─── Brasil API ─── */

interface BrasilFipePriceItem {
  valor: string
  marca: string
  modelo: string
  anoModelo: number
  combustivel: string
  codigoFipe: string
  mesReferencia: string
}

async function fetchBrasilApi(
  codFipe: string,
  year: number | string,
): Promise<number | null> {
  try {
    // brasilapi aceita codigoFipe sem hifen — testamos os dois formatos
    const codes = [codFipe, codFipe.replace('-', '')]
    for (const code of codes) {
      const url = `https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(code)}`
      const res = await fetchWithTimeout(url)
      if (!res.ok) continue
      const list = (await res.json().catch(() => null)) as BrasilFipePriceItem[] | null
      if (!Array.isArray(list) || list.length === 0) continue
      // filtra pelo ano (anoModelo) — pega primeiro match (mais recente)
      const yearNum = Number(year)
      const match = list.find((p) => p.anoModelo === yearNum) || list[0]
      const value = parseBRL(match.valor)
      if (value > 0) return value
    }
  } catch {
    /* segue */
  }
  return null
}

/* ─── Parallelum v2 ─── */

interface ParallelumPrice {
  price: string
  modelYear: number
  fuel: string
  codeFipe: string
}

async function fetchParallelum(
  codFipe: string,
  year: number | string,
  kind: 'cars' | 'motorcycles' = 'cars',
): Promise<number | null> {
  try {
    // Parallelum exige marca/modelo IDs internos. Sem eles, usamos o endpoint
    // alternativo /trucks ou /cars sem código (não funciona). Como temos só
    // codFipe, vamos tentar uma rota indireta via brand search — mas isso
    // requer percorrer todas marcas. Em vez disso, cacheamos só Brasil API.
    // Se Brasil API falhar, retornamos null e quem chamou usa fallback texto.
    void codFipe
    void year
    void kind
    return null
  } catch {
    return null
  }
}

/* ─── Public ─── */

export async function lookupFipeByCode(
  codFipe: string | null | undefined,
  year: number | string | null | undefined,
): Promise<number | null> {
  if (!codFipe || !year) return null
  const k = cacheKey(codFipe, year)
  const c = getCached(k)
  if (c !== null) return c

  // 1) Brasil API
  const brasil = await fetchBrasilApi(codFipe, year)
  if (brasil && brasil > 0) {
    setCached(k, brasil)
    return brasil
  }

  // 2) Parallelum (placeholder — requer infra adicional)
  const para = await fetchParallelum(codFipe, year)
  if (para && para > 0) {
    setCached(k, para)
    return para
  }

  return null
}
