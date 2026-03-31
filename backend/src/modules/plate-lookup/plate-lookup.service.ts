import axios from 'axios'
import { prisma } from '../../config/database'

const TAXA_ADMIN = 35
const TAXAS = { basico: 0.018, completo: 0.028, premium: 0.038 } as const
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
  }
  plans: {
    basico: { monthly: number; name: string }
    completo: { monthly: number; name: string }
    premium: { monthly: number; name: string }
  }
}

export interface PlateErrorResponse {
  success: false
  error: string
}

function calcMonthly(fipeValue: number, plan: keyof typeof TAXAS): number {
  return Math.round((fipeValue * TAXAS[plan]) / 12 + TAXA_ADMIN)
}

// Safe DB operations — don't crash if table doesn't exist yet
async function tryCache(placa: string): Promise<PlateResponse | null> {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const cached = await prisma.plateLookup.findFirst({
      where: { placa, success: true, createdAt: { gte: todayStart } },
      orderBy: { createdAt: 'desc' },
    })
    if (cached?.result) return cached.result as unknown as PlateResponse
  } catch { /* table may not exist yet */ }
  return null
}

async function tryLog(data: Record<string, unknown>): Promise<void> {
  try {
    await prisma.plateLookup.create({ data: data as any })
  } catch { /* table may not exist yet */ }
}

export async function lookupPlate(placa: string): Promise<PlateResponse | PlateErrorResponse> {
  const normalized = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')

  if (normalized.length !== 7) {
    return { success: false, error: 'Placa deve ter 7 caracteres' }
  }

  // 1. Check cache
  const cached = await tryCache(normalized)
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
      },
    )

    if (data.error || !data.data?.resultados?.length) {
      await tryLog({ placa: normalized, success: false, fromCache: false, errorMessage: data.message || 'Veículo não encontrado', result: {} })
      return { success: false, error: data.message || 'Veículo não encontrado' }
    }

    const veiculo = data.data.resultados.find(r => r.principal) || data.data.resultados[0]
    const fipeValue = veiculo.valor

    if (fipeValue <= 0) {
      await tryLog({ placa: normalized, success: false, fromCache: false, errorMessage: 'Valor FIPE não encontrado', result: {} })
      return { success: false, error: 'Valor FIPE não encontrado para este veículo' }
    }

    const response: PlateResponse = {
      success: true,
      vehicle: {
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.anoModelo,
        cor: veiculo.cor,
        fipeValue,
        fipeCode: veiculo.codigoFipe,
      },
      plans: {
        basico: { monthly: calcMonthly(fipeValue, 'basico'), name: 'Básico' },
        completo: { monthly: calcMonthly(fipeValue, 'completo'), name: 'Completo' },
        premium: { monthly: calcMonthly(fipeValue, 'premium'), name: 'Premium' },
      },
    }

    await tryLog({ placa: normalized, success: true, fromCache: false, fipeValue, marca: veiculo.marca, modelo: veiculo.modelo, ano: veiculo.anoModelo, result: response as any })

    return response
  } catch (err: any) {
    const message = err.code === 'ECONNABORTED'
      ? 'Consulta demorou demais. Tente novamente.'
      : 'Erro ao consultar veículo. Tente novamente.'

    await tryLog({ placa: normalized, success: false, fromCache: false, errorMessage: message, result: {} })
    return { success: false, error: message }
  }
}
