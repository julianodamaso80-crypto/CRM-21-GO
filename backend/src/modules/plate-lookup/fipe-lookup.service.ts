import axios from 'axios'
import { getApplicablePlans, type QuotePlan } from './pricing'

/* ─────────────────────────────────────────────────────────────────────────────
 * FIPE Lookup por marca/modelo/ano (fallback quando usuário não tem placa)
 * Fonte: FIPE Parallelum v2 — pública, gratuita, sem token
 * https://deividfortuna.github.io/fipe/
 * Cache in-memory com TTL (marcas/modelos/anos raramente mudam; preço TTL menor)
 * ─────────────────────────────────────────────────────────────────────────── */

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v2'
const API_TIMEOUT = 10000

export type VehicleKind = 'carros' | 'motos'

interface FipeItem {
  code: string
  name: string
}

interface FipePriceRaw {
  vehicleType: string
  brand: string
  model: string
  modelYear: number
  fuel: string
  codeFipe: string
  referenceMonth: string
  price: string
}

/* ─── In-memory cache ─── */
type CacheEntry<T> = { value: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value as T
}

function setCached<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

const TTL_LIST = 7 * 24 * 60 * 60 * 1000   // 7 dias — marcas/modelos/anos
const TTL_PRICE = 24 * 60 * 60 * 1000      // 24 horas — preço (FIPE atualiza mensalmente)

function kindToPath(kind: VehicleKind): string {
  return kind === 'motos' ? 'motorcycles' : 'cars'
}

async function fetchJson<T>(url: string): Promise<T> {
  const { data } = await axios.get<T>(url, { timeout: API_TIMEOUT })
  return data
}

/* ─── Parser: "R$ 45.000,00" -> 45000 ─── */
function parseBRL(s: string): number {
  const digits = s.replace(/[^\d,]/g, '').replace(',', '.')
  const n = parseFloat(digits)
  return Number.isFinite(n) ? n : 0
}

/* ─── Public API ─── */

export async function listMarcas(kind: VehicleKind): Promise<FipeItem[]> {
  const key = `brands:${kind}`
  const cached = getCached<FipeItem[]>(key)
  if (cached) return cached

  const url = `${FIPE_BASE}/${kindToPath(kind)}/brands`
  const data = await fetchJson<FipeItem[]>(url)
  setCached(key, data, TTL_LIST)
  return data
}

export async function listModelos(
  kind: VehicleKind,
  marcaCode: string,
): Promise<FipeItem[]> {
  const key = `models:${kind}:${marcaCode}`
  const cached = getCached<FipeItem[]>(key)
  if (cached) return cached

  const url = `${FIPE_BASE}/${kindToPath(kind)}/brands/${marcaCode}/models`
  const data = await fetchJson<FipeItem[]>(url)
  setCached(key, data, TTL_LIST)
  return data
}

export async function listAnos(
  kind: VehicleKind,
  marcaCode: string,
  modeloCode: string,
): Promise<FipeItem[]> {
  const key = `years:${kind}:${marcaCode}:${modeloCode}`
  const cached = getCached<FipeItem[]>(key)
  if (cached) return cached

  const url = `${FIPE_BASE}/${kindToPath(kind)}/brands/${marcaCode}/models/${modeloCode}/years`
  const data = await fetchJson<FipeItem[]>(url)
  setCached(key, data, TTL_LIST)
  return data
}

export interface FipePriceResult {
  success: true
  vehicle: {
    marca: string
    modelo: string
    ano: string
    fipeValue: number
    fipeCode: string
    categoria: string
    combustivel: string
  }
  plans: QuotePlan[]
}

export interface FipePriceError {
  success: false
  error: string
}

export async function lookupFipePrice(
  kind: VehicleKind,
  marcaCode: string,
  modeloCode: string,
  anoCode: string,
): Promise<FipePriceResult | FipePriceError> {
  const key = `price:${kind}:${marcaCode}:${modeloCode}:${anoCode}`
  const cachedRaw = getCached<FipePriceRaw>(key)

  let raw: FipePriceRaw
  if (cachedRaw) {
    raw = cachedRaw
  } else {
    try {
      const url = `${FIPE_BASE}/${kindToPath(kind)}/brands/${marcaCode}/models/${modeloCode}/years/${anoCode}`
      raw = await fetchJson<FipePriceRaw>(url)
      setCached(key, raw, TTL_PRICE)
    } catch (err: any) {
      const message = err.code === 'ECONNABORTED'
        ? 'Consulta demorou demais. Tente novamente.'
        : 'Não foi possível consultar a tabela FIPE agora. Tente novamente.'
      return { success: false, error: message }
    }
  }

  const fipeValue = parseBRL(raw.price)
  if (fipeValue <= 0) {
    return { success: false, error: 'Valor FIPE não encontrado para este veículo' }
  }

  // Para o motor de planos: categoria é deduzida pelo kind, cilindrada pela presença do ano
  const categoria = kind === 'motos' ? 'MOTOCICLETA' : 'AUTOMOVEL'
  // Cilindrada não vem da FIPE Parallelum — usuário seleciona faixa ao escolher "Moto até 400cc" vs "Moto 450-1000cc"
  // Este caminho sem placa serve para carros; para moto o atendimento humano refina.

  const plans = getApplicablePlans(
    fipeValue,
    categoria,
    raw.fuel,
    undefined,
    raw.model,
  )

  return {
    success: true,
    vehicle: {
      marca: raw.brand,
      modelo: raw.model,
      ano: String(raw.modelYear),
      fipeValue,
      fipeCode: raw.codeFipe,
      categoria,
      combustivel: raw.fuel,
    },
    plans,
  }
}
