import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateDoctorDTO {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  crm: string
  crmState: string
  specialty: string
  consultationDuration?: number
  consultationPrice?: number
  bio?: string
}

export interface UpdateDoctorDTO extends Partial<CreateDoctorDTO> {
  isActive?: boolean
}

export class DoctorsService {
  async listDoctors(companyId: string) {
    return prisma.doctor.findMany({
      where: { companyId },
      orderBy: { fullName: 'asc' },
    })
  }

  async getDoctorById(id: string, companyId: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id, companyId } })
    if (!doctor) throw new AppError('Doctor not found', 404, 'NOT_FOUND')
    return doctor
  }

  async createDoctor(companyId: string, data: CreateDoctorDTO) {
    const fullName = `${data.firstName} ${data.lastName}`.trim()
    // Check unique CRM
    const existing = await prisma.doctor.findFirst({
      where: { companyId, crm: data.crm, crmState: data.crmState },
    })
    if (existing) throw new AppError('Doctor with this CRM already exists', 400, 'DUPLICATE_CRM')

    return prisma.doctor.create({
      data: {
        companyId,
        fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        crm: data.crm,
        crmState: data.crmState,
        specialty: data.specialty,
        consultationDuration: data.consultationDuration || 30,
        consultationPrice: data.consultationPrice,
        bio: data.bio,
      },
    })
  }

  async updateDoctor(id: string, companyId: string, data: UpdateDoctorDTO) {
    const existing = await prisma.doctor.findFirst({ where: { id, companyId } })
    if (!existing) throw new AppError('Doctor not found', 404, 'NOT_FOUND')

    let fullName = existing.fullName
    if (data.firstName !== undefined || data.lastName !== undefined) {
      fullName = `${data.firstName ?? existing.firstName} ${data.lastName ?? existing.lastName}`.trim()
    }

    return prisma.doctor.update({
      where: { id },
      data: { ...data, fullName },
    })
  }

  async deleteDoctor(id: string, companyId: string) {
    const existing = await prisma.doctor.findFirst({ where: { id, companyId } })
    if (!existing) throw new AppError('Doctor not found', 404, 'NOT_FOUND')
    await prisma.doctor.delete({ where: { id } })
    return { success: true }
  }

  getSpecialties() {
    return {
      clinico_geral: 'Clínico Geral',
      cardiologia: 'Cardiologia',
      dermatologia: 'Dermatologia',
      ginecologia: 'Ginecologia',
      neurologia: 'Neurologia',
      oftalmologia: 'Oftalmologia',
      ortopedia: 'Ortopedia',
      pediatria: 'Pediatria',
      psiquiatria: 'Psiquiatria',
      urologia: 'Urologia',
      endocrinologia: 'Endocrinologia',
      gastroenterologia: 'Gastroenterologia',
      otorrinolaringologia: 'Otorrinolaringologia',
      cirurgia_geral: 'Cirurgia Geral',
      outro: 'Outro',
    }
  }
}
