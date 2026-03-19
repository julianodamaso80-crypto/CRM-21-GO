import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateAssociadoDTO {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  whatsapp?: string
  cpf?: string
  rg?: string
  dateOfBirth?: string
  address?: string
  bairro?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  status?: string
  dataAdesao?: string
  dataCancelamento?: string
  motivoCancelamento?: string
  hinovaId?: string
  indicadoPor?: string
  vendedorId?: string
  origem?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface UpdateAssociadoDTO extends Partial<CreateAssociadoDTO> {}

export interface ListAssociadosQuery {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
  status?: string
  origem?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName'
  sortOrder?: 'asc' | 'desc'
}

export class AssociadosService {
  async listAssociados(companyId: string, query: ListAssociadosQuery) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {
      companyId,
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { cpf: { contains: query.search } },
        { whatsapp: { contains: query.search } },
      ]
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags }
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.origem) {
      where.origem = query.origem
    }

    const orderBy: any = {}
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    orderBy[sortBy] = sortOrder

    const [associados, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          companyId: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          cpf: true,
          rg: true,
          dateOfBirth: true,
          whatsapp: true,
          address: true,
          bairro: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,
          status: true,
          dataAdesao: true,
          dataCancelamento: true,
          motivoCancelamento: true,
          hinovaId: true,
          indicadoPor: true,
          vendedorId: true,
          totalIndicacoes: true,
          descontoMgm: true,
          npsScore: true,
          ultimoNps: true,
          origem: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          tags: true,
          customFields: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leads: true,
              deals: true,
              conversations: true,
              vehicles: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: associados,
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

  async getAssociadoById(id: string, companyId: string) {
    const associado = await prisma.contact.findFirst({
      where: { id, companyId },
      include: {
        leads: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            status: true,
            stage: {
              select: { id: true, name: true, color: true },
            },
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        conversations: {
          select: {
            id: true,
            status: true,
            channel: {
              select: { type: true, name: true },
            },
            lastMessageAt: true,
            createdAt: true,
          },
          orderBy: { lastMessageAt: 'desc' },
          take: 10,
        },
        activities: {
          select: {
            id: true,
            type: true,
            subject: true,
            description: true,
            activityDate: true,
            status: true,
          },
          orderBy: { activityDate: 'desc' },
          take: 20,
        },
        vehicles: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!associado) {
      throw new AppError('Associado nao encontrado', 404, 'NOT_FOUND')
    }

    return associado
  }

  async createAssociado(companyId: string, data: CreateAssociadoDTO) {
    const fullName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sem nome'

    if (data.cpf) {
      const existingCpf = await prisma.contact.findFirst({
        where: { companyId, cpf: data.cpf },
      })
      if (existingCpf) {
        throw new AppError('Ja existe um associado com este CPF', 400, 'DUPLICATE_CPF')
      }
    }

    if (data.email) {
      const existingEmail = await prisma.contact.findFirst({
        where: { companyId, email: data.email },
      })
      if (existingEmail) {
        throw new AppError('Ja existe um associado com este email', 400, 'DUPLICATE_EMAIL')
      }
    }

    const associado = await prisma.contact.create({
      data: {
        companyId,
        fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        cpf: data.cpf,
        rg: data.rg,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        bairro: data.bairro,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        status: data.status || 'em_adesao',
        dataAdesao: data.dataAdesao ? new Date(data.dataAdesao) : undefined,
        dataCancelamento: data.dataCancelamento ? new Date(data.dataCancelamento) : undefined,
        motivoCancelamento: data.motivoCancelamento,
        hinovaId: data.hinovaId,
        indicadoPor: data.indicadoPor,
        vendedorId: data.vendedorId,
        origem: data.origem,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        tags: data.tags || [],
        customFields: data.customFields || {},
      },
    })

    return associado
  }

  async updateAssociado(id: string, companyId: string, data: UpdateAssociadoDTO) {
    const existing = await prisma.contact.findFirst({
      where: { id, companyId },
    })

    if (!existing) {
      throw new AppError('Associado nao encontrado', 404, 'NOT_FOUND')
    }

    if (data.cpf && data.cpf !== existing.cpf) {
      const cpfExists = await prisma.contact.findFirst({
        where: { companyId, cpf: data.cpf, id: { not: id } },
      })
      if (cpfExists) {
        throw new AppError('Ja existe um associado com este CPF', 400, 'DUPLICATE_CPF')
      }
    }

    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.contact.findFirst({
        where: { companyId, email: data.email, id: { not: id } },
      })
      if (emailExists) {
        throw new AppError('Ja existe um associado com este email', 400, 'DUPLICATE_EMAIL')
      }
    }

    let fullName = existing.fullName
    if (data.firstName !== undefined || data.lastName !== undefined) {
      fullName = [
        data.firstName ?? existing.firstName,
        data.lastName ?? existing.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Sem nome'
    }

    const updateData: any = { ...data, fullName }
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    }
    if (data.dataAdesao !== undefined) {
      updateData.dataAdesao = data.dataAdesao ? new Date(data.dataAdesao) : null
    }
    if (data.dataCancelamento !== undefined) {
      updateData.dataCancelamento = data.dataCancelamento ? new Date(data.dataCancelamento) : null
    }

    const associado = await prisma.contact.update({
      where: { id },
      data: updateData,
    })

    return associado
  }

  async deleteAssociado(id: string, companyId: string) {
    const existing = await prisma.contact.findFirst({
      where: { id, companyId },
    })

    if (!existing) {
      throw new AppError('Associado nao encontrado', 404, 'NOT_FOUND')
    }

    await prisma.contact.delete({ where: { id } })

    return { success: true, message: 'Associado excluido com sucesso' }
  }

  async findByEmailOrPhone(companyId: string, email?: string, phone?: string) {
    if (!email && !phone) {
      throw new AppError('Email ou telefone obrigatorio', 400, 'BAD_REQUEST')
    }

    const where: any = { companyId, OR: [] }
    if (email) where.OR.push({ email })
    if (phone) where.OR.push({ phone })

    return prisma.contact.findMany({ where })
  }

  async getUniqueTags(companyId: string) {
    const records = await prisma.contact.findMany({
      where: { companyId },
      select: { tags: true },
    })

    const allTags = records.flatMap((c) => c.tags)
    return [...new Set(allTags)].sort()
  }

  async getStats(companyId: string) {
    const [total, ativos, inativos, inadimplentes, emAdesao, recentCount, totalVehicles] =
      await Promise.all([
        prisma.contact.count({ where: { companyId } }),
        prisma.contact.count({ where: { companyId, status: 'ativo' } }),
        prisma.contact.count({ where: { companyId, status: 'inativo' } }),
        prisma.contact.count({ where: { companyId, status: 'inadimplente' } }),
        prisma.contact.count({ where: { companyId, status: 'em_adesao' } }),
        prisma.contact.count({
          where: {
            companyId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.vehicle.count({ where: { companyId, ativo: true } }),
      ])

    return {
      total,
      ativos,
      inativos,
      inadimplentes,
      emAdesao,
      recentCount,
      totalVehicles,
    }
  }
}
