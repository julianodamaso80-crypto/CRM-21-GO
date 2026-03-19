import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateVehicleDTO {
  associadoId: string
  placa: string
  renavam?: string
  chassi?: string
  marca: string
  modelo: string
  anoFabricacao: number
  anoModelo: number
  cor?: string
  combustivel?: string
  tipo: string
  codigoFipe?: string
  valorFipe?: number
  plano: string
  valorMensal?: number
  temRastreador?: boolean
  rastreadorMarca?: string
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {
  vistoriaStatus?: string
  vistoriaData?: string
  ativo?: boolean
}

export interface ListVehiclesQuery {
  page?: number
  limit?: number
  search?: string
  associadoId?: string
  plano?: string
  ativo?: boolean
}

export class VehiclesService {
  async listVehicles(companyId: string, query: ListVehiclesQuery) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = { companyId }

    if (query.associadoId) {
      where.associadoId = query.associadoId
    }

    if (query.plano) {
      where.plano = query.plano
    }

    if (query.ativo !== undefined) {
      where.ativo = query.ativo
    }

    if (query.search) {
      where.OR = [
        { placa: { contains: query.search, mode: 'insensitive' } },
        { marca: { contains: query.search, mode: 'insensitive' } },
        { modelo: { contains: query.search, mode: 'insensitive' } },
        { associado: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ]
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          associado: {
            select: { id: true, fullName: true, cpf: true },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  async getVehicleById(id: string, companyId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, companyId },
      include: {
        associado: {
          select: { id: true, fullName: true, cpf: true, phone: true, whatsapp: true },
        },
      },
    })

    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'NOT_FOUND')
    }

    return vehicle
  }

  async getVehiclesByAssociado(associadoId: string, companyId: string) {
    return prisma.vehicle.findMany({
      where: { associadoId, companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createVehicle(companyId: string, data: CreateVehicleDTO) {
    // Validar placa unica na empresa
    const existing = await prisma.vehicle.findFirst({
      where: { companyId, placa: data.placa.toUpperCase() },
    })

    if (existing) {
      throw new AppError('Ja existe um veiculo com esta placa', 400, 'DUPLICATE_PLACA')
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        companyId,
        associadoId: data.associadoId,
        placa: data.placa.toUpperCase(),
        renavam: data.renavam,
        chassi: data.chassi,
        marca: data.marca,
        modelo: data.modelo,
        anoFabricacao: data.anoFabricacao,
        anoModelo: data.anoModelo,
        cor: data.cor,
        combustivel: data.combustivel,
        tipo: data.tipo,
        codigoFipe: data.codigoFipe,
        valorFipe: data.valorFipe,
        plano: data.plano,
        valorMensal: data.valorMensal,
        temRastreador: data.temRastreador || false,
        rastreadorMarca: data.rastreadorMarca,
        vistoriaStatus: 'pendente',
        ativo: true,
        dataInclusao: new Date(),
      },
      include: {
        associado: { select: { id: true, fullName: true, cpf: true } },
      },
    })

    return vehicle
  }

  async updateVehicle(id: string, companyId: string, data: UpdateVehicleDTO) {
    const existing = await prisma.vehicle.findFirst({ where: { id, companyId } })

    if (!existing) {
      throw new AppError('Vehicle not found', 404, 'NOT_FOUND')
    }

    if (data.placa && data.placa.toUpperCase() !== existing.placa) {
      const placaExists = await prisma.vehicle.findFirst({
        where: { companyId, placa: data.placa.toUpperCase(), id: { not: id } },
      })
      if (placaExists) {
        throw new AppError('Ja existe um veiculo com esta placa', 400, 'DUPLICATE_PLACA')
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        placa: data.placa ? data.placa.toUpperCase() : undefined,
        dataExclusao: data.ativo === false ? new Date() : undefined,
      },
      include: {
        associado: { select: { id: true, fullName: true, cpf: true } },
      },
    })

    return vehicle
  }

  async deleteVehicle(id: string, companyId: string) {
    const existing = await prisma.vehicle.findFirst({ where: { id, companyId } })

    if (!existing) {
      throw new AppError('Vehicle not found', 404, 'NOT_FOUND')
    }

    await prisma.vehicle.delete({ where: { id } })

    return { success: true, message: 'Veiculo removido' }
  }
}
