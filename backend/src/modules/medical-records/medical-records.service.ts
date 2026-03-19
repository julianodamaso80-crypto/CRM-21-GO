import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateMedicalRecordDTO {
  patientId: string
  doctorId: string
  appointmentId?: string
  type: string
  date: string
  chiefComplaint?: string
  anamnesis?: string
  physicalExam?: string
  diagnosis?: string
  diagnosisCid?: string
  prescription?: string
  procedures?: string
  notes?: string
  referral?: string
  referralSpecialty?: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygenSaturation?: number
  }
  isConfidential?: boolean
}

export interface UpdateMedicalRecordDTO extends Partial<CreateMedicalRecordDTO> {}

export interface ListMedicalRecordsQuery {
  patientId?: string
  doctorId?: string
  type?: string
}

export class MedicalRecordsService {
  /**
   * Lista prontuários com filtros
   */
  async listRecords(companyId: string, query: ListMedicalRecordsQuery) {
    const where: any = {
      companyId,
    }

    if (query.patientId) {
      where.patientId = query.patientId
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId
    }

    if (query.type) {
      where.type = query.type
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return { data: records }
  }

  /**
   * Busca prontuário por ID
   */
  async getRecordById(id: string, companyId: string) {
    const record = await prisma.medicalRecord.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
        attachments: true,
      },
    })

    if (!record) {
      throw new AppError('Medical record not found', 404, 'NOT_FOUND')
    }

    return record
  }

  /**
   * Cria novo prontuário
   */
  async createRecord(companyId: string, data: CreateMedicalRecordDTO) {
    const record = await prisma.medicalRecord.create({
      data: {
        companyId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        type: data.type,
        date: new Date(data.date),
        chiefComplaint: data.chiefComplaint,
        anamnesis: data.anamnesis,
        physicalExam: data.physicalExam,
        diagnosis: data.diagnosis,
        diagnosisCid: data.diagnosisCid,
        prescription: data.prescription,
        procedures: data.procedures,
        notes: data.notes,
        referral: data.referral,
        referralSpecialty: data.referralSpecialty,
        vitalSigns: data.vitalSigns ? JSON.parse(JSON.stringify(data.vitalSigns)) : undefined,
        isConfidential: data.isConfidential ?? false,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    return record
  }

  /**
   * Atualiza prontuário existente
   */
  async updateRecord(id: string, companyId: string, data: UpdateMedicalRecordDTO) {
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingRecord) {
      throw new AppError('Medical record not found', 404, 'NOT_FOUND')
    }

    const updateData: any = { ...data }

    if (data.date) {
      updateData.date = new Date(data.date)
    }

    if (data.vitalSigns) {
      updateData.vitalSigns = JSON.parse(JSON.stringify(data.vitalSigns))
    }

    const record = await prisma.medicalRecord.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialty: true,
            crm: true,
          },
        },
      },
    })

    return record
  }

  /**
   * Deleta prontuário
   */
  async deleteRecord(id: string, companyId: string) {
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingRecord) {
      throw new AppError('Medical record not found', 404, 'NOT_FOUND')
    }

    await prisma.medicalRecord.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Retorna tipos de prontuário disponíveis
   */
  async getTypes() {
    return {
      anamnesis: 'Anamnese',
      follow_up: 'Acompanhamento',
      exam_result: 'Resultado de Exame',
      prescription: 'Prescrição',
      referral: 'Encaminhamento',
      procedure_note: 'Nota de Procedimento',
      evolution: 'Evolução',
    }
  }

  /**
   * Retorna timeline completa do paciente (prontuários + consultas)
   */
  async getPatientTimeline(patientId: string, companyId: string) {
    const [records, appointments] = await Promise.all([
      prisma.medicalRecord.findMany({
        where: {
          patientId,
          companyId,
        },
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              crm: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.appointment.findMany({
        where: {
          patientId,
          companyId,
        },
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              crm: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
    ])

    return { records, appointments }
  }
}
