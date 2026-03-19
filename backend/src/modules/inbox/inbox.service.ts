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
  /**
   * Lista conversas com filtros opcionais
   */
  async listConversations(companyId: string, query: ListConversationsQuery) {
    const where: any = {
      companyId,
    }

    // Filtro por status
    if (query.status) {
      where.status = query.status
    }

    // Filtro por tipo de canal (via relação)
    if (query.channelType) {
      where.channel = {
        type: query.channelType,
      }
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        channel: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    return conversations
  }

  /**
   * Busca conversa por ID
   */
  async getConversationById(id: string, companyId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        channel: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        contact: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!conversation) {
      throw AppError.notFound('Conversation not found')
    }

    return conversation
  }

  /**
   * Busca mensagens de uma conversa
   */
  async getMessages(conversationId: string, companyId: string) {
    // Verificar se a conversa existe e pertence à empresa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        companyId,
      },
    })

    if (!conversation) {
      throw AppError.notFound('Conversation not found')
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return messages
  }

  /**
   * Envia uma mensagem em uma conversa
   */
  async sendMessage(
    conversationId: string,
    companyId: string,
    userId: string,
    data: SendMessageDTO
  ) {
    // Verificar se a conversa existe e pertence à empresa
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        companyId,
      },
    })

    if (!conversation) {
      throw AppError.notFound('Conversation not found')
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        conversationId,
        direction: 'outbound',
        senderId: userId,
        content: data.content,
        contentType: data.contentType || 'text',
        isFromBot: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Atualizar lastMessageAt da conversa
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    })

    return message
  }

  /**
   * Atualiza o status de uma conversa
   */
  async updateConversationStatus(id: string, companyId: string, status: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!conversation) {
      throw AppError.notFound('Conversation not found')
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { status },
    })

    return updated
  }

  /**
   * Marca conversa como lida
   */
  async markAsRead(id: string, companyId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        companyId,
      },
    })

    if (!conversation) {
      throw AppError.notFound('Conversation not found')
    }

    // Atualizar conversa como lida
    await prisma.conversation.update({
      where: { id },
      data: { isUnread: false },
    })

    // Marcar todas as mensagens não lidas como lidas
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { success: true, message: 'Conversation marked as read' }
  }
}
