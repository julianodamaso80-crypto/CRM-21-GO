import axios from 'axios'
import { prisma } from '../../config/database'
const TAXA_ADMIN = 35
const TAXAS = { basico: 0.018, completo: 0.028, premium: 0.038 } as const
const DAILY_LIMIT = 100
const API_TIMEOUT = 8000 // 8s (API Brasil pode demorar)

interface ApiBrasilResponse {
  response?: {
    MARCA?: string
    MODELO?: string
    ano?: string
    anoModelo?: string
    cor?: string
    chassi?: string
    extra?: {
      fipe?: {
        dados?: Array<{
          valor?: string
          codigo_fipe?: string
          combustivel?: string
        }>
      }
    }
  }
  error?: boolean
  message?: string
}

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

function parseFipeValue(raw: string | undefined): number {
  if (!raw) return 0
  // "R$ 78.000,00" -> 78000
  return Number(raw.replace(/[^\d,]/g, '').replace(',', '.')) || 0
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
    const result = cached.result as unknown as PlateResponse
    return result
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
      'https://gateway.apibrasil.io/api/v2/vehicles/dados',
      { placa: normalized },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
      },
    )

    // API returned error
    if (data.error || !data.response) {
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

    const r = data.response
    const fipeData = r.extra?.fipe?.dados?.[0]
    const fipeValue = parseFipeValue(fipeData?.valor)

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
        marca: r.MARCA || '',
        modelo: r.MODELO || '',
        ano: r.anoModelo || r.ano || '',
        cor: r.cor || '',
        fipeValue,
        fipeCode: fipeData?.codigo_fipe || '',
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
        marca: response.vehicle.marca,
        modelo: response.vehicle.modelo,
        ano: response.vehicle.ano,
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
