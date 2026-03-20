import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

export interface ListConversationsQuery {
  status?: string
  channelType?: string
}

export interface SendMessageDTO {
  content: string
  contentType?: string
}

export class InboxService {
  async listConversations(companyId: string, query: ListConversationsQuery) {
    const where: any = { companyId }

    if (query.status) {
      where.status = query.status
    }

    if (query.channelType) {
      where.channel = query.channelType
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        associado: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        lead: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, content: true, sender: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Transform to match frontend expectations
    return conversations.map(c => ({
      ...c,
      channel: { type: c.channel, name: c.channel },
      contact: c.associado
        ? { id: c.associado.id, fullName: c.associado.nome, email: c.associado.email, phone: c.associado.telefone, avatar: null }
        : c.lead
          ? { id: c.lead.id, fullName: c.lead.nome, email: c.lead.email, phone: c.lead.telefone, avatar: null }
          : null,
      lastMessage: c.messages[0] || null,
    }))
  }

  async getConversationById(id: string, companyId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, companyId },
      include: {
        associado: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        lead: {
          select: { id: true, nome: true, email: true, telefone: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND')
    }

    return {
      ...conversation,
      channel: { type: conversation.channel, name: conversation.channel },
      contact: conversation.associado
        ? { id: conversation.associado.id, fullName: conversation.associado.nome, email: conversation.associado.email, phone: conversation.associado.telefone, avatar: null }
        : conversation.lead
          ? { id: conversation.lead.id, fullName: conversation.lead.nome, email: conversation.lead.email, phone: conversation.lead.telefone, avatar: null }
          : null,
    }
  }

  async getConversationMessages(id: string, companyId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, companyId },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND')
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        senderUser: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    return messages
  }

  async sendMessage(conversationId: string, companyId: string, userId: string, data: SendMessageDTO) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, companyId },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND')
    }

    const message = await prisma.message.create({
      data: {
        companyId,
        conversationId,
        content: data.content,
        sender: 'vendedor',
        senderId: userId,
      },
      include: {
        senderUser: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    return message
  }

  async assignConversation(id: string, companyId: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, companyId },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND')
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { assignedToId: userId, status: 'assigned' },
    })

    return updated
  }

  async closeConversation(id: string, companyId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, companyId },
    })

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND')
    }

    await prisma.conversation.update({
      where: { id },
      data: { status: 'closed' },
    })

    return { success: true, message: 'Conversation closed' }
  }
}
