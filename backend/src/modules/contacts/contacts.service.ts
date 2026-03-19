import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateContactDTO {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  jobTitle?: string
  companyName?: string
  whatsapp?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface UpdateContactDTO extends Partial<CreateContactDTO> {}

export interface ListContactsQuery {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName'
  sortOrder?: 'asc' | 'desc'
}

export class ContactsService {
  /**
   * Lista contatos com paginação e filtros
   */
  async listContacts(companyId: string, query: ListContactsQuery) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {
      companyId,
    }

    // Busca por nome, email ou telefone
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ]
    }

    // Filtro por tags
    if (query.tags && query.tags.length > 0) {
      where.tags = {
        hasSome: query.tags,
      }
    }

    // Ordenação
    const orderBy: any = {}
    const sortBy = query.sortBy || 'createdAt'
    const sortOrder = query.sortOrder || 'desc'
    orderBy[sortBy] = sortOrder

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          jobTitle: true,
          companyName: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leads: true,
              deals: true,
              conversations: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data: contacts,
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
   * Busca contato por ID
   */
  async getContactById(id: string, companyId: string) {
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        leads: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        deals: {
          select: {
            id: true,
            title: true,
            value: true,
            status: true,
            stage: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        conversations: {
          select: {
            id: true,
            status: true,
            channel: {
              select: {
                type: true,
                name: true,
              },
            },
            lastMessageAt: true,
            createdAt: true,
          },
          orderBy: {
            lastMessageAt: 'desc',
          },
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
          orderBy: {
            activityDate: 'desc',
          },
          take: 20,
        },
      },
    })

    if (!contact) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND')
    }

    return contact
  }

  /**
   * Cria novo contato
   */
  async createContact(companyId: string, data: CreateContactDTO) {
    // Gerar fullName a partir de firstName e lastName
    const fullName = [data.firstName, data.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Sem nome'

    // Validar email único na empresa (se fornecido)
    if (data.email) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          companyId,
          email: data.email,
        },
      })

      if (existingContact) {
        throw new AppError('A contact with this email already exists', 400, 'DUPLICATE_EMAIL')
      }
    }

    // Validar telefone único na empresa (se fornecido)
    if (data.phone) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          companyId,
          phone: data.phone,
        },
      })

      if (existingContact) {
        throw new AppError('A contact with this phone already exists', 400, 'DUPLICATE_PHONE')
      }
    }

    const contact = await prisma.contact.create({
      data: {
        companyId,
        fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        linkedin: data.linkedin,
        twitter: data.twitter,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        tags: data.tags || [],
        customFields: data.customFields || {},
      },
    })

    return contact
  }

  /**
   * Atualiza contato existente
   */
  async updateContact(
    id: string,
    companyId: string,
    data: UpdateContactDTO
  ) {
    // Verificar se contato existe
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingContact) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND')
    }

    // Validar email único (se mudou)
    if (data.email && data.email !== existingContact.email) {
      const emailExists = await prisma.contact.findFirst({
        where: {
          companyId,
          email: data.email,
          id: { not: id },
        },
      })

      if (emailExists) {
        throw new AppError('A contact with this email already exists', 400, 'DUPLICATE_EMAIL')
      }
    }

    // Validar telefone único (se mudou)
    if (data.phone && data.phone !== existingContact.phone) {
      const phoneExists = await prisma.contact.findFirst({
        where: {
          companyId,
          phone: data.phone,
          id: { not: id },
        },
      })

      if (phoneExists) {
        throw new AppError('A contact with this phone already exists', 400, 'DUPLICATE_PHONE')
      }
    }

    // Atualizar fullName se firstName ou lastName mudaram
    let fullName = existingContact.fullName
    if (data.firstName !== undefined || data.lastName !== undefined) {
      fullName = [
        data.firstName ?? existingContact.firstName,
        data.lastName ?? existingContact.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Sem nome'
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        fullName,
      },
    })

    return contact
  }

  /**
   * Deleta contato (soft delete poderia ser implementado)
   */
  async deleteContact(id: string, companyId: string) {
    // Verificar se contato existe
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingContact) {
      throw new AppError('Contact not found', 404, 'NOT_FOUND')
    }

    // Hard delete por enquanto
    // Para soft delete, adicionaríamos um campo deletedAt no schema
    await prisma.contact.delete({
      where: { id },
    })

    return { success: true, message: 'Contact deleted successfully' }
  }

  /**
   * Busca contatos por email ou telefone (útil para importações e integrações)
   */
  async findByEmailOrPhone(
    companyId: string,
    email?: string,
    phone?: string
  ) {
    if (!email && !phone) {
      throw new AppError('Email or phone is required', 400, 'BAD_REQUEST')
    }

    const where: any = {
      companyId,
      OR: [],
    }

    if (email) {
      where.OR.push({ email })
    }
    if (phone) {
      where.OR.push({ phone })
    }

    const contacts = await prisma.contact.findMany({
      where,
    })

    return contacts
  }

  /**
   * Busca tags únicas dos contatos da empresa
   */
  async getUniqueTags(companyId: string) {
    const contacts = await prisma.contact.findMany({
      where: { companyId },
      select: { tags: true },
    })

    const allTags = contacts.flatMap((c) => c.tags)
    const uniqueTags = [...new Set(allTags)].sort()

    return uniqueTags
  }

  /**
   * Estatísticas de contatos
   */
  async getStats(companyId: string) {
    const [total, withEmail, withPhone, withDeals, recentCount] =
      await Promise.all([
        prisma.contact.count({ where: { companyId } }),
        prisma.contact.count({
          where: { companyId, email: { not: null } },
        }),
        prisma.contact.count({
          where: { companyId, phone: { not: null } },
        }),
        prisma.contact.count({
          where: {
            companyId,
            deals: {
              some: {},
            },
          },
        }),
        prisma.contact.count({
          where: {
            companyId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
            },
          },
        }),
      ])

    return {
      total,
      withEmail,
      withPhone,
      withDeals,
      recentCount,
    }
  }
}
