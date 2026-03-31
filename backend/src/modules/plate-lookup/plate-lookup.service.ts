import axios from 'axios'
import { prisma } from '../../config/database'

const TAXA_ADMIN = 35
const TAXAS = { basico: 0.018, completo: 0.028, premium: 0.038 } as const
const DAILY_LIMIT = 100
const API_TIMEOUT = 10000 // 10s

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
  historico?: Array<{ mes: string; valor: number }>
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
interface VehicleResult {
  marca: string
  modelo: string
  ano: string
  cor: string
  fipeValue: number
  fipeCode: string
}

interface PlanResult {
  monthly: number
  name: string
}

export interface PlateResponse {
  success: true
  vehicle: VehicleResult
  plans: {
    basico: PlanResult
    completo: PlanResult
    premium: PlanResult
  }
}

export interface PlateErrorResponse {
  success: false
  error: string
}

function calcMonthly(fipeValue: number, plan: keyof typeof TAXAS): number {
  return Math.round((fipeValue * TAXAS[plan]) / 12 + TAXA_ADMIN)
}

export async function lookupPlate(placa: string): Promise<PlateResponse | PlateErrorResponse> {
  const normalized = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')

  if (normalized.length !== 7) {
    return { success: false, error: 'Placa deve ter 7 caracteres' }
  }

  // 1. Check cache (same plate queried today)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const cached = await prisma.plateLookup.findFirst({
    where: {
      placa: normalized,
      success: true,
      createdAt: { gte: todayStart },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (cached && cached.result) {
    return cached.result as unknown as PlateResponse
  }

  // 2. Check daily rate limit
  const todayCount = await prisma.plateLookup.count({
    where: {
      createdAt: { gte: todayStart },
      fromCache: false,
    },
  })

  if (todayCount >= DAILY_LIMIT) {
    return { success: false, error: 'Limite diário de consultas atingido. Tente novamente amanhã.' }
  }

  // 3. Call API Brasil
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

    // API returned error
    if (data.error || !data.data?.resultados?.length) {
      await prisma.plateLookup.create({
        data: {
          placa: normalized,
          success: false,
          fromCache: false,
          errorMessage: data.message || 'Veículo não encontrado',
          result: {},
        },
      })
      return { success: false, error: data.message || 'Veículo não encontrado' }
    }

    // Get the principal result (or first one)
    const veiculo = data.data.resultados.find(r => r.principal) || data.data.resultados[0]
    const fipeValue = veiculo.valor

    if (fipeValue <= 0) {
      await prisma.plateLookup.create({
        data: {
          placa: normalized,
          success: false,
          fromCache: false,
          errorMessage: 'Valor FIPE não encontrado para este veículo',
          result: {},
        },
      })
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

    // Save to cache + log
    await prisma.plateLookup.create({
      data: {
        placa: normalized,
        success: true,
        fromCache: false,
        fipeValue,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.anoModelo,
        result: response as any,
      },
    })

    return response
  } catch (err: any) {
    const message = err.code === 'ECONNABORTED'
      ? 'Consulta demorou demais. Tente novamente.'
      : 'Erro ao consultar veículo. Tente novamente.'

    await prisma.plateLookup.create({
      data: {
        placa: normalized,
        success: false,
        fromCache: false,
        errorMessage: message,
        result: {},
      },
    })

    return { success: false, error: message }
  }
}
