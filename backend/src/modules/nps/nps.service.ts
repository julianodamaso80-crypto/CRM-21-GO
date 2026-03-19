import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateNPSSurveyDTO {
  patientId: string
  doctorId?: string
  appointmentId?: string
  score: number
  comment?: string
  channel: string
}

export interface SendNPSBatchDTO {
  patientIds: string[]
  channel: string
}

export interface ListNPSQuery {
  patientId?: string
  doctorId?: string
  category?: string
  answered?: string
}

export class NPSService {
  /**
   * Calcula categoria NPS baseado no score
   */
  private calculateCategory(score: number): string {
    if (score >= 9) return 'promoter'
    if (score >= 7) return 'passive'
    return 'detractor'
  }

  /**
   * Lista pesquisas NPS com filtros
   */
  async listSurveys(companyId: string, query: ListNPSQuery) {
    const where: any = {
      companyId,
    }

    if (query.patientId) {
      where.patientId = query.patientId
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.answered === 'true') {
      where.answeredAt = { not: null }
    } else if (query.answered === 'false') {
      where.answeredAt = null
    }

    const surveys = await prisma.nPSSurvey.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { data: surveys }
  }

  /**
   * Cria nova pesquisa NPS
   */
  async createSurvey(companyId: string, data: CreateNPSSurveyDTO) {
    const category = this.calculateCategory(data.score)

    const survey = await prisma.nPSSurvey.create({
      data: {
        companyId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        score: data.score,
        comment: data.comment,
        channel: data.channel,
        category,
        answeredAt: new Date(),
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
          },
        },
      },
    })

    return survey
  }

  /**
   * Envia pesquisa NPS em lote para múltiplos pacientes
   */
  async sendBatch(companyId: string, data: SendNPSBatchDTO) {
    const surveys = []

    for (const patientId of data.patientIds) {
      const survey = await prisma.nPSSurvey.create({
        data: {
          companyId,
          patientId,
          score: 0,
          channel: data.channel,
          category: 'detractor',
          sentAt: new Date(),
        },
      })
      surveys.push(survey)
    }

    return { sent: surveys.length, surveys }
  }

  /**
   * Deleta pesquisa NPS
   */
  async deleteSurvey(id: string, companyId: string) {
    const existingSurvey = await prisma.nPSSurvey.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existingSurvey) {
      throw new AppError('NPS survey not found', 404, 'NOT_FOUND')
    }

    await prisma.nPSSurvey.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Estatísticas NPS completas
   */
  async getStats(companyId: string) {
    const allSurveys = await prisma.nPSSurvey.findMany({
      where: { companyId },
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
          },
        },
      },
    })

    const total = allSurveys.length
    const answered = allSurveys.filter((s: any) => s.answeredAt !== null)
    const answeredCount = answered.length
    const responseRate = total > 0 ? Math.round((answeredCount / total) * 100) : 0

    const promoters = answered.filter((s: any) => s.category === 'promoter').length
    const passives = answered.filter((s: any) => s.category === 'passive').length
    const detractors = answered.filter((s: any) => s.category === 'detractor').length

    const npsScore = answeredCount > 0
      ? Math.round(((promoters - detractors) / answeredCount) * 100)
      : 0

    const totalScore = answered.reduce((sum: any, s: any) => sum + s.score, 0)
    const avgScore = answeredCount > 0
      ? Math.round((totalScore / answeredCount) * 10) / 10
      : 0

    // NPS por mês (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentAnswered = answered.filter(
      (s: any) => s.answeredAt && new Date(s.answeredAt) >= sixMonthsAgo
    )

    const byMonthMap: Record<string, { promoters: number; detractors: number; total: number }> = {}

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      byMonthMap[key] = { promoters: 0, detractors: 0, total: 0 }
    }

    for (const survey of recentAnswered) {
      if (survey.answeredAt) {
        const date = new Date(survey.answeredAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (byMonthMap[key]) {
          byMonthMap[key].total++
          if (survey.category === 'promoter') byMonthMap[key].promoters++
          if (survey.category === 'detractor') byMonthMap[key].detractors++
        }
      }
    }

    const byMonth = Object.entries(byMonthMap).map(([month, data]) => ({
      month,
      nps: data.total > 0
        ? Math.round(((data.promoters - data.detractors) / data.total) * 100)
        : 0,
      responses: data.total,
    }))

    // NPS por médico
    const byDoctorMap: Record<string, { name: string; promoters: number; detractors: number; total: number }> = {}

    for (const survey of answered) {
      if (survey.doctorId && survey.doctor) {
        if (!byDoctorMap[survey.doctorId]) {
          byDoctorMap[survey.doctorId] = {
            name: survey.doctor.fullName,
            promoters: 0,
            detractors: 0,
            total: 0,
          }
        }
        byDoctorMap[survey.doctorId].total++
        if (survey.category === 'promoter') byDoctorMap[survey.doctorId].promoters++
        if (survey.category === 'detractor') byDoctorMap[survey.doctorId].detractors++
      }
    }

    const byDoctor = Object.entries(byDoctorMap).map(([doctorId, data]) => ({
      doctorId,
      name: data.name,
      nps: data.total > 0
        ? Math.round(((data.promoters - data.detractors) / data.total) * 100)
        : 0,
      responses: data.total,
    }))

    // Comentários recentes (últimos 10 com comentário)
    const recentComments = answered
      .filter((s: any) => s.comment)
      .sort((a: any, b: any) => {
        const dateA = a.answeredAt ? new Date(a.answeredAt).getTime() : 0
        const dateB = b.answeredAt ? new Date(b.answeredAt).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 10)
      .map((s: any) => ({
        id: s.id,
        score: s.score,
        category: s.category,
        comment: s.comment,
        patientName: s.patient?.fullName,
        doctorName: s.doctor?.fullName,
        answeredAt: s.answeredAt,
      }))

    return {
      total,
      answeredCount,
      responseRate,
      promoters,
      passives,
      detractors,
      npsScore,
      avgScore,
      byMonth,
      byDoctor,
      recentComments,
    }
  }
}
