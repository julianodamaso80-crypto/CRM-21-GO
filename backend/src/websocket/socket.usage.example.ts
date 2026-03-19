// @ts-nocheck
/**
 * SOCKET.IO USAGE EXAMPLES
 *
 * Este arquivo contém exemplos de como usar o socketService em outros módulos
 * do backend para emitir eventos real-time.
 *
 * IMPORTANTE: Este arquivo é apenas para referência e não deve ser importado.
 */

import { socketService, SocketRooms } from './index'

// ============================================================================
// EXEMPLO 1: Emitir nova mensagem no inbox (use no inbox.service.ts)
// ============================================================================

export function emitNewMessage(
  companyId: string,
  conversationId: string,
  message: any,
  contact: any,
  channel: any
) {
  socketService.emitToRoom(
    SocketRooms.conversation(conversationId),
    'inbox:new_message',
    {
      conversationId,
      message,
      contact: {
        id: contact.id,
        fullName: contact.fullName,
        avatar: contact.avatar,
      },
      channel: {
        type: channel.type,
        name: channel.name,
      },
    }
  )

  // Também emitir para todos da empresa (para notificações)
  socketService.emitToCompany(companyId, 'notification:new', {
    id: crypto.randomUUID(),
    type: 'info',
    title: 'Nova mensagem',
    message: `Nova mensagem de ${contact.fullName}`,
    link: `/inbox/conversations/${conversationId}`,
    userId: undefined,
    companyId,
    createdAt: new Date().toISOString(),
  })
}

// ============================================================================
// EXEMPLO 2: Emitir card movido no Kanban (use no pipes.service.ts)
// ============================================================================

export function emitCardMoved(
  pipeId: string,
  card: any,
  fromPhase: any,
  toPhase: any,
  movedBy: any
) {
  socketService.emitToRoom(
    SocketRooms.pipe(pipeId),
    'deal:moved',
    {
      cardId: card.id,
      card: {
        id: card.id,
        title: card.title,
        status: card.status,
      },
      fromPhaseId: fromPhase.id,
      fromPhaseName: fromPhase.name,
      toPhaseId: toPhase.id,
      toPhaseName: toPhase.name,
      movedBy: {
        id: movedBy.id,
        firstName: movedBy.firstName,
        lastName: movedBy.lastName,
      },
      timestamp: new Date().toISOString(),
    }
  )

  // Atualizar estatísticas do dashboard
  socketService.emitToCompany(card.companyId, 'dashboard:stats_update', {
    companyId: card.companyId,
    stats: {
      deals: undefined, // Backend calcularia o valor real
    },
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// EXEMPLO 3: Emitir nova consulta (use no appointments.service.ts)
// ============================================================================

export function emitAppointmentCreated(
  companyId: string,
  appointment: any,
  createdBy: any
) {
  // Emitir para todos da empresa
  socketService.emitToCompany(companyId, 'appointment:created', {
    appointment,
    createdBy: {
      id: createdBy.id,
      firstName: createdBy.firstName,
      lastName: createdBy.lastName,
    },
    timestamp: new Date().toISOString(),
  })

  // Emitir especificamente para a room de appointments (calendário)
  socketService.emitToRoom(
    SocketRooms.appointments(companyId),
    'appointment:created',
    {
      appointment,
      createdBy: {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      },
      timestamp: new Date().toISOString(),
    }
  )

  // Se houver médico atribuído, enviar notificação pessoal
  if (appointment.doctorId) {
    socketService.emitToUser(appointment.doctorId, 'notification:new', {
      id: crypto.randomUUID(),
      type: 'info',
      title: 'Nova consulta',
      message: `Consulta agendada com ${appointment.patient.fullName}`,
      link: `/appointments/${appointment.id}`,
      userId: appointment.doctorId,
      companyId,
      createdAt: new Date().toISOString(),
    })
  }
}

// ============================================================================
// EXEMPLO 4: Atualizar estatísticas do Dashboard (use no dashboard.service.ts)
// ============================================================================

export function emitDashboardStatsUpdate(
  companyId: string,
  stats: {
    contacts?: number
    leads?: number
    deals?: number
    revenue?: number
    appointments?: number
  }
) {
  socketService.emitToRoom(
    SocketRooms.dashboard(companyId),
    'dashboard:stats_update',
    {
      companyId,
      stats,
      timestamp: new Date().toISOString(),
    }
  )
}

// ============================================================================
// EXEMPLO 5: Broadcast para toda empresa (sistema de avisos)
// ============================================================================

export function broadcastToCompany(
  companyId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  socketService.emitToCompany(companyId, 'company:broadcast', {
    companyId,
    type,
    title,
    message,
    data,
    timestamp: new Date().toISOString(),
  })
}

// ============================================================================
// EXEMPLO 6: Verificar usuários online
// ============================================================================

export async function getCompanyOnlineUsers(companyId: string): Promise<string[]> {
  return await socketService.getOnlineUsers(companyId)
}

// ============================================================================
// EXEMPLO 7: Emitir typing indicator (já implementado no socket.service)
// ============================================================================

// Cliente envia:
// socket.emit('typing', { conversationId: '123' })

// Servidor emite automaticamente para outros na conversation:
// 'inbox:typing' com { conversationId, user, isTyping: true }

// ============================================================================
// EXEMPLO 8: Integração completa em um service (Inbox)
// ============================================================================

/**
 * Exemplo de como integrar Socket.io em inbox.service.ts
 */
class InboxServiceExample {
  async sendMessage(
    userId: string,
    companyId: string,
    conversationId: string,
    content: string
  ) {
    // 1. Salvar mensagem no banco
    const message = {
      id: crypto.randomUUID(),
      conversationId,
      direction: 'outbound' as const,
      senderId: userId,
      content,
      contentType: 'text' as const,
      isFromBot: false,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    // await prisma.message.create({ data: message })

    // 2. Buscar dados relacionados
    const conversation = {
      id: conversationId,
      contact: {
        id: 'contact-1',
        fullName: 'João Silva',
        avatar: null,
      },
      channel: {
        type: 'whatsapp' as const,
        name: 'WhatsApp Principal',
      },
    }

    // 3. Emitir evento Socket.io
    socketService.emitToRoom(
      SocketRooms.conversation(conversationId),
      'inbox:new_message',
      {
        conversationId,
        message: message as any,
        contact: conversation.contact,
        channel: conversation.channel,
      }
    )

    // 4. Emitir notificação para usuários atribuídos
    // socketService.emitToUser(assignedUserId, 'notification:new', {...})

    return message
  }
}

// ============================================================================
// PADRÃO RECOMENDADO PARA INTEGRAÇÃO
// ============================================================================

/**
 * 1. Import socketService no início do arquivo:
 *    import { socketService, SocketRooms } from '../websocket'
 *
 * 2. Após criar/atualizar/deletar no banco, emita o evento correspondente
 *
 * 3. Use os helpers SocketRooms para gerar nomes de rooms consistentes
 *
 * 4. Sempre inclua timestamp nos payloads
 *
 * 5. Evite enviar objetos Prisma completos (serialize apenas o necessário)
 *
 * 6. Para eventos críticos, considere try/catch ao emitir
 *    (Socket.io não deve quebrar a lógica principal)
 */

export function exampleWithErrorHandling(companyId: string) {
  try {
    socketService.emitToCompany(companyId, 'notification:new', {
      id: crypto.randomUUID(),
      type: 'success',
      title: 'Operação concluída',
      message: 'A operação foi concluída com sucesso',
      companyId,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    // Log mas não falhe a operação principal
    console.error('Failed to emit socket event:', error)
  }
}
