import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateLeadDTO {
  contactId: string
  title: string
  description?: string
  source: string
  medium?: string
  campaign?: string
  assignedToId?: string
  estimatedValue?: number
  tags?: string[]
}

export interface UpdateLeadDTO extends Partial<CreateLeadDTO> {
  status?: string
  score?: number
}

export interface ListLeadsQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class LeadsService {
  /**
   * Lista leads com paginação e filtros
   */
  async listLeads(companyId: string, query: ListLeadsQuery) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {
      companyId,
    }

    // Busca por título
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    // Filtro por status
    if (query.status) {
      where.status = query.status
    }

    // Filtro por source
    if (query.source) {
      where.source = query.source
    }

    // Ordenação
    const orderBy: any = {}
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    orderBy[sortBy] = sortOrder

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          contact: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: leads,
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

  /**
   * Busca lead por ID
   */
  async getLeadById(id: string, companyId: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
            companyName: true,
            jobTitle: true,
          },
        },
      },
    })

    if (!lead) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND')
    }

    return lead
  }

  /**
   * Cria novo lead
   */
  async createLead(companyId: string, data: CreateLeadDTO) {
    const lead = await prisma.lead.create({
      data: {
        companyId,
        contactId: data.contactId,
        title: data.title,
        description: data.description,
        source: data.source,
        medium: data.medium,
        campaign: data.campaign,
        assignedToId: data.assignedToId,
        estimatedValue: data.estimatedValue,
        tags: data.tags || [],
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return lead
  }

  /**
   * Atualiza lead existente
   */
  async updateLead(id: string, companyId: string, data: UpdateLeadDTO) {
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingLead) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND')
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return lead
  }

  /**
   * Deleta lead
   */
  async deleteLead(id: string, companyId: string) {
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingLead) {
      throw new AppError('Lead not found', 404, 'NOT_FOUND')
    }

    await prisma.lead.delete({
      where: { id },
    })

    return { success: true, message: 'Lead deleted' }
  }

  /**
   * Estatísticas de leads
   */
  async getStats(companyId: string) {
    const [
      total,
      statusNew,
      statusContacted,
      statusQualified,
      statusUnqualified,
      sourceGroups,
      estimatedValueResult,
    ] = await Promise.all([
      prisma.lead.count({ where: { companyId } }),
      prisma.lead.count({ where: { companyId, status: 'new' } }),
      prisma.lead.count({ where: { companyId, status: 'contacted' } }),
      prisma.lead.count({ where: { companyId, status: 'qualified' } }),
      prisma.lead.count({ where: { companyId, status: 'unqualified' } }),
      prisma.lead.groupBy({
        by: ['source'],
        where: { companyId },
        _count: { id: true },
      }),
      prisma.lead.aggregate({
        where: { companyId },
        _sum: { estimatedValue: true },
      }),
    ])

    const byStatus = {
      new: statusNew,
      contacted: statusContacted,
      qualified: statusQualified,
      unqualified: statusUnqualified,
    }

    const bySource: Record<string, number> = {}
    for (const group of sourceGroups) {
      if (group.source) {
        bySource[group.source] = group._count.id
      }
    }

    const conversionRate = total > 0 ? (statusQualified / total) * 100 : 0
    const totalEstimatedValue = estimatedValueResult._sum.estimatedValue || 0

    return {
      total,
      byStatus,
      bySource,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalEstimatedValue,
    }
  }
}
