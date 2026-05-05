import axios from 'axios'
import { getApplicablePlans, type QuotePlan } from '@/data/pricing'

const API_TIMEOUT = 10000

/* ─── API Brasil Response Types ─── */
interface ApiBrasilVeiculo {
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: string
  cor: string
  chassi: string
  codigoFipe: string
  combustivel: string
  categoria: string
  valor: number
  principal: boolean
  cilindrada?: number
}

interface ApiBrasilResponse {
  error: boolean
  message: string
  balance?: string
  data?: {
    resultados: ApiBrasilVeiculo[]
  }
}

/* ─── Output Types ─── */
export interface PlateResponse {
  success: true
  vehicle: {
    marca: string
    modelo: string
    ano: string
    cor: string
    fipeValue: number
    fipeCode: string
    categoria: string
    combustivel: string
    cilindrada?: number
    chassi?: string
  }
  plans: QuotePlan[]
}

export interface PlateErrorResponse {
  success: false
  error: string
}

/* ─── In-memory cache (substitui Prisma do CRM original) ─── */
type CacheEntry = { value: PlateResponse; expiresAt: number }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h

function getCached(placa: string): PlateResponse | null {
  const entry = cache.get(placa)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(placa)
    return null
  }
  return entry.value
}

function setCached(placa: string, value: PlateResponse) {
  cache.set(placa, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

export async function lookupPlate(placa: string): Promise<PlateResponse | PlateErrorResponse> {
  const normalized = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')

  if (normalized.length !== 7) {
    return { success: false, error: 'Placa deve ter 7 caracteres' }
  }

  // 1. Check cache
  const cached = getCached(normalized)
  if (cached) return cached

  // 2. Call API Brasil
  const token = process.env.APIBRASIL_TOKEN
  if (!token) {
    return { success: false, error: 'Serviço de consulta indisponível no momento.' }
  }

  try {
    const { data } = await axios.post<ApiBrasilResponse>(
      'https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits',
      {
        tipo: 'fipe-chassi',
        placa: normalized,
        homolog: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
      },
    )

    if (data.error || !data.data?.resultados?.length) {
      return { success: false, error: data.message || 'Veículo não encontrado' }
    }

    const veiculo = data.data.resultados.find((r) => r.principal) || data.data.resultados[0]
    const fipeValue = veiculo.valor

    if (fipeValue <= 0) {
      return { success: false, error: 'Valor FIPE não encontrado para este veículo' }
    }

    const plans = getApplicablePlans(
      fipeValue,
      veiculo.categoria,
      veiculo.combustivel,
      veiculo.cilindrada,
      veiculo.modelo,
    )

    const response: PlateResponse = {
      success: true,
      vehicle: {
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.anoModelo,
        cor: veiculo.cor,
        fipeValue,
        fipeCode: veiculo.codigoFipe,
        categoria: veiculo.categoria,
        combustivel: veiculo.combustivel,
        cilindrada: veiculo.cilindrada,
        chassi: veiculo.chassi,
      },
      plans,
    }

    setCached(normalized, response)
    return response
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    const message =
      code === 'ECONNABORTED'
        ? 'Consulta demorou demais. Tente novamente.'
        : 'Erro ao consultar veículo. Tente novamente.'
    return { success: false, error: message }
  }
}
