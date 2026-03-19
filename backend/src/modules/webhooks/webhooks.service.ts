import crypto from 'crypto'
import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateWebhookDTO {
  name: string
  description?: string
  type: string  // incoming, outgoing
  url?: string
  method?: string
  headers?: Record<string, string>
  event?: string
}

export interface UpdateWebhookDTO extends Partial<CreateWebhookDTO> {
  isActive?: boolean
}

export class WebhooksService {
  /**
   * Lista webhooks da empresa
   */
  async listWebhooks(companyId: string) {
    const webhooks = await prisma.webhook.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })

    return webhooks
  }

  /**
   * Busca webhook por ID
   */
  async getWebhookById(id: string, companyId: string) {
    const webhook = await prisma.webhook.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!webhook) {
      throw AppError.notFound('Webhook not found')
    }

    return webhook
  }

  /**
   * Cria novo webhook
   */
  async createWebhook(companyId: string, userId: string, data: CreateWebhookDTO) {
    const webhookData: any = {
      companyId,
      name: data.name,
      description: data.description,
      type: data.type,
      url: data.url,
      method: data.method || 'POST',
      headers: data.headers || {},
      event: data.event,
      createdById: userId,
    }

    // Para incoming webhooks, auto-gerar secret
    if (data.type === 'incoming') {
      webhookData.secret = crypto.randomBytes(32).toString('hex')
    }

    const webhook = await prisma.webhook.create({
      data: webhookData,
    })

    // Para incoming webhooks, gerar URL
    if (data.type === 'incoming') {
      const incomingUrl = `/api/webhooks/incoming/${webhook.id}`
      const updatedWebhook = await prisma.webhook.update({
        where: { id: webhook.id },
        data: { url: incomingUrl },
      })
      return updatedWebhook
    }

    return webhook
  }

  /**
   * Atualiza webhook existente
   */
  async updateWebhook(id: string, companyId: string, data: UpdateWebhookDTO) {
    const existing = await prisma.webhook.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existing) {
      throw AppError.notFound('Webhook not found')
    }

    const webhook = await prisma.webhook.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.method !== undefined && { method: data.method }),
        ...(data.headers !== undefined && { headers: data.headers }),
        ...(data.event !== undefined && { event: data.event }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return webhook
  }

  /**
   * Deleta webhook
   */
  async deleteWebhook(id: string, companyId: string) {
    const existing = await prisma.webhook.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existing) {
      throw AppError.notFound('Webhook not found')
    }

    await prisma.webhook.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Retorna lista de eventos disponíveis para webhooks
   */
  getEvents() {
    return [
      'contact.created',
      'contact.updated',
      'contact.deleted',
      'lead.created',
      'lead.status_changed',
      'deal.created',
      'deal.stage_changed',
      'deal.won',
      'deal.lost',
      'appointment.created',
      'appointment.confirmed',
      'appointment.completed',
      'appointment.cancelled',
      'card.created',
      'card.moved',
      'card.completed',
      'nps.received',
      'message.received',
      'message.sent',
    ]
  }
}
