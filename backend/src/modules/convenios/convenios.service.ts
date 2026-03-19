import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateConvenioDTO {
  name: string
  code?: string
  phone?: string
  email?: string
  website?: string
  contactPerson?: string
  notes?: string
}

export interface UpdateConvenioDTO extends Partial<CreateConvenioDTO> {
  isActive?: boolean
}

export class ConveniosService {
  async listConvenios(companyId: string) {
    return prisma.convenio.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    })
  }

  async getConvenioById(id: string, companyId: string) {
    const convenio = await prisma.convenio.findFirst({ where: { id, companyId } })
    if (!convenio) throw new AppError('Convenio not found', 404, 'NOT_FOUND')
    return convenio
  }

  async createConvenio(companyId: string, data: CreateConvenioDTO) {
    return prisma.convenio.create({
      data: {
        companyId,
        name: data.name,
        code: data.code,
        phone: data.phone,
        email: data.email,
        website: data.website,
        contactPerson: data.contactPerson,
        notes: data.notes,
      },
    })
  }

  async updateConvenio(id: string, companyId: string, data: UpdateConvenioDTO) {
    const existing = await prisma.convenio.findFirst({ where: { id, companyId } })
    if (!existing) throw new AppError('Convenio not found', 404, 'NOT_FOUND')

    return prisma.convenio.update({
      where: { id },
      data,
    })
  }

  async deleteConvenio(id: string, companyId: string) {
    const existing = await prisma.convenio.findFirst({ where: { id, companyId } })
    if (!existing) throw new AppError('Convenio not found', 404, 'NOT_FOUND')
    await prisma.convenio.delete({ where: { id } })
    return { success: true }
  }
}
