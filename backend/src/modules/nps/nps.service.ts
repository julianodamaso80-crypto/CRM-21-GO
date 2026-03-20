import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateNPSSurveyDTO {
  associadoId: string
  score: number
  comment?: string
  channel: string
  tipo?: string
}

export interface ListNPSQuery {
  associadoId?: string
  category?: string
  answered?: string
}

export class NPSService {
  private calculateCategory(score: number): string {
    if (score >= 9) return 'promoter'
    if (score >= 7) return 'passive'
    return 'detractor'
  }

  async listSurveys(companyId: string, query: ListNPSQuery) {
    const where: any = { companyId }

    if (query.associadoId) {
      where.associadoId = query.associadoId
    }

    if (query.answered === 'true') {
      where.respondidoEm = { not: null }
    } else if (query.answered === 'false') {
      where.respondidoEm = null
    }

    const surveys = await prisma.npsSurvey.findMany({
      where,
      include: {
        associado: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return surveys.map(s => ({
      ...s,
      category: this.calculateCategory(s.score),
      patient: s.associado ? { id: s.associado.id, fullName: s.associado.nome } : null,
      contact: s.associado ? { id: s.associado.id, fullName: s.associado.nome } : null,
    }))
  }

  async createSurvey(companyId: string, data: CreateNPSSurveyDTO) {
    const survey = await prisma.npsSurvey.create({
      data: {
        companyId,
        associadoId: data.associadoId,
        score: data.score,
        comment: data.comment,
        channel: data.channel,
        tipo: data.tipo || 'periodico',
        respondidoEm: new Date(),
      },
    })

    // Update associado NPS cache
    await prisma.associado.update({
      where: { id: data.associadoId },
      data: {
        npsScore: data.score,
        ultimoNps: new Date(),
      },
    })

    return {
      ...survey,
      category: this.calculateCategory(survey.score),
    }
  }

  async getStats(companyId: string) {
    const surveys = await prisma.npsSurvey.findMany({
      where: { companyId },
      select: { score: true },
    })

    const total = surveys.length
    if (total === 0) {
      return {
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        npsScore: 0,
        averageScore: 0,
        responseRate: 0,
      }
    }

    let promoters = 0
    let passives = 0
    let detractors = 0
    let scoreSum = 0

    for (const s of surveys) {
      scoreSum += s.score
      const cat = this.calculateCategory(s.score)
      if (cat === 'promoter') promoters++
      else if (cat === 'passive') passives++
      else detractors++
    }

    const npsScore = Math.round(((promoters - detractors) / total) * 100)
    const averageScore = Math.round((scoreSum / total) * 10) / 10

    return {
      total,
      promoters,
      passives,
      detractors,
      npsScore,
      averageScore,
      responseRate: 100,
    }
  }
}
