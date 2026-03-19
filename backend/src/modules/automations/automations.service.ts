import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateAutomationDTO {
  name: string
  description?: string
  trigger: Record<string, any>
  conditions?: Record<string, any>[]
  actions: Record<string, any>[]
}

export interface UpdateAutomationDTO extends Partial<CreateAutomationDTO> {
  isActive?: boolean
}

export class AutomationsService {
  /**
   * Lista automações da empresa
   */
  async listAutomations(companyId: string) {
    const automations = await prisma.automation.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })

    return automations
  }

  /**
   * Busca automação por ID
   */
  async getAutomationById(id: string, companyId: string) {
    const automation = await prisma.automation.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!automation) {
      throw AppError.notFound('Automation not found')
    }

    return automation
  }

  /**
   * Cria nova automação
   */
  async createAutomation(companyId: string, userId: string, data: CreateAutomationDTO) {
    const automation = await prisma.automation.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        conditions: data.conditions || [],
        actions: data.actions,
        createdById: userId,
      },
    })

    return automation
  }

  /**
   * Atualiza automação existente
   */
  async updateAutomation(id: string, companyId: string, data: UpdateAutomationDTO) {
    const existing = await prisma.automation.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existing) {
      throw AppError.notFound('Automation not found')
    }

    const automation = await prisma.automation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.trigger !== undefined && { trigger: data.trigger }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
        ...(data.actions !== undefined && { actions: data.actions }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return automation
  }

  /**
   * Deleta automação
   */
  async deleteAutomation(id: string, companyId: string) {
    const existing = await prisma.automation.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!existing) {
      throw AppError.notFound('Automation not found')
    }

    await prisma.automation.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Retorna lista de triggers disponíveis
   */
  getTriggers() {
    return [
      {
        type: 'card',
        label: 'Cards',
        events: ['card.created', 'card.moved', 'card.completed'],
      },
      {
        type: 'lead',
        label: 'Leads',
        events: ['lead.created', 'lead.status_changed', 'lead.qualified'],
      },
      {
        type: 'appointment',
        label: 'Consultas',
        events: [
          'appointment.created',
          'appointment.confirmed',
          'appointment.completed',
          'appointment.cancelled',
          'appointment.no_show',
        ],
      },
      {
        type: 'contact',
        label: 'Contatos',
        events: ['contact.created', 'contact.updated'],
      },
      {
        type: 'nps',
        label: 'NPS',
        events: ['nps.received', 'nps.detractor_alert'],
      },
    ]
  }

  /**
   * Retorna lista de ações disponíveis
   */
  getActions() {
    return [
      { type: 'send_email', label: 'Enviar Email' },
      { type: 'send_whatsapp', label: 'Enviar WhatsApp' },
      { type: 'send_sms', label: 'Enviar SMS' },
      { type: 'create_task', label: 'Criar Tarefa' },
      { type: 'move_card', label: 'Mover Card' },
      { type: 'assign_user', label: 'Atribuir Responsável' },
      { type: 'webhook', label: 'Chamar Webhook' },
      { type: 'notify', label: 'Notificar Equipe' },
    ]
  }
}
