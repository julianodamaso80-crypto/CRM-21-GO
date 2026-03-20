import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface CreateAutomationDTO {
  name: string
  trigger: string
  conditions?: any[]
  actions: any[]
}

export interface UpdateAutomationDTO extends Partial<CreateAutomationDTO> {
  isActive?: boolean
}

export class AutomationsService {
  async listAutomations(companyId: string) {
    const automations = await prisma.automacao.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })

    return automations.map(a => ({
      ...a,
      name: a.nome,
      isActive: a.ativa,
    }))
  }

  async getAutomationById(id: string, companyId: string) {
    const automation = await prisma.automacao.findFirst({
      where: { id, companyId },
    })

    if (!automation) {
      throw AppError.notFound('Automation not found')
    }

    return { ...automation, name: automation.nome, isActive: automation.ativa }
  }

  async createAutomation(companyId: string, _userId: string, data: CreateAutomationDTO) {
    const automation = await prisma.automacao.create({
      data: {
        companyId,
        nome: data.name,
        trigger: data.trigger,
        conditions: data.conditions || [],
        actions: data.actions,
        ativa: true,
      },
    })

    return { ...automation, name: automation.nome, isActive: automation.ativa }
  }

  async updateAutomation(id: string, companyId: string, data: UpdateAutomationDTO) {
    const existing = await prisma.automacao.findFirst({
      where: { id, companyId },
    })

    if (!existing) {
      throw AppError.notFound('Automation not found')
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.nome = data.name
    if (data.trigger !== undefined) updateData.trigger = data.trigger
    if (data.conditions !== undefined) updateData.conditions = data.conditions
    if (data.actions !== undefined) updateData.actions = data.actions
    if (data.isActive !== undefined) updateData.ativa = data.isActive

    const automation = await prisma.automacao.update({
      where: { id },
      data: updateData,
    })

    return { ...automation, name: automation.nome, isActive: automation.ativa }
  }

  async deleteAutomation(id: string, companyId: string) {
    const existing = await prisma.automacao.findFirst({
      where: { id, companyId },
    })

    if (!existing) {
      throw AppError.notFound('Automation not found')
    }

    await prisma.automacao.delete({ where: { id } })
    return { success: true }
  }

  getTriggers() {
    return [
      { type: 'lead', label: 'Leads', events: ['lead.created', 'lead.qualificado', 'lead.cotacao_enviada', 'lead.fechado', 'lead.perdido'] },
      { type: 'associado', label: 'Associados', events: ['associado.created', 'associado.status_changed', 'associado.inadimplente'] },
      { type: 'sinistro', label: 'Sinistros', events: ['sinistro.aberto', 'sinistro.status_changed', 'sinistro.encerrado'] },
      { type: 'nps', label: 'NPS', events: ['nps.received', 'nps.detractor_alert'] },
      { type: 'card', label: 'Cards', events: ['card.created', 'card.moved', 'card.completed'] },
      { type: 'indicacao', label: 'Indicacoes', events: ['indicacao.created', 'indicacao.convertida'] },
    ]
  }

  getActions() {
    return [
      { type: 'send_whatsapp', label: 'Enviar WhatsApp' },
      { type: 'send_email', label: 'Enviar Email' },
      { type: 'create_task', label: 'Criar Tarefa' },
      { type: 'assign_user', label: 'Atribuir Responsavel' },
      { type: 'move_card', label: 'Mover Card' },
      { type: 'notify', label: 'Notificar Equipe' },
      { type: 'webhook', label: 'Chamar Webhook' },
    ]
  }
}
