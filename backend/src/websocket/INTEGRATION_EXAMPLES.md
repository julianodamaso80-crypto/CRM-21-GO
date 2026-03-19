# Socket.io Integration Examples - Backend Services

Exemplos práticos de como integrar o Socket.io nos services existentes do backend.

## 1. Inbox Service (Mensagens)

**Arquivo: `backend/src/modules/inbox/inbox.service.ts`**

```typescript
import { socketService, SocketRooms } from '../../websocket'

class InboxService {
  async sendMessage(userId: string, companyId: string, conversationId: string, content: string) {
    // 1. Salvar mensagem no banco
    const message = await prisma.message.create({
      data: {
        conversationId,
        direction: 'outbound',
        senderId: userId,
        content,
        contentType: 'text',
        isFromBot: false,
        isRead: false,
      },
    })

    // 2. Buscar dados relacionados
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        channel: true,
      },
    })

    // 3. Emitir evento Socket.io
    try {
      socketService.emitToRoom(
        SocketRooms.conversation(conversationId),
        'inbox:new_message',
        {
          conversationId,
          message: {
            id: message.id,
            conversationId: message.conversationId,
            direction: message.direction,
            senderId: message.senderId,
            content: message.content,
            contentType: message.contentType,
            isFromBot: message.isFromBot,
            isRead: message.isRead,
            createdAt: message.createdAt.toISOString(),
          },
          contact: {
            id: conversation.contact.id,
            fullName: conversation.contact.fullName,
            avatar: conversation.contact.avatar,
          },
          channel: {
            type: conversation.channel.type,
            name: conversation.channel.name,
          },
        }
      )
    } catch (error) {
      logger.error({ error, conversationId }, 'Failed to emit inbox:new_message')
    }

    return message
  }

  async assignConversation(conversationId: string, assignedToId: string, assignedById: string) {
    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { assignedToId },
      include: {
        assignedTo: true,
      },
    })

    const assignedBy = await prisma.user.findUnique({
      where: { id: assignedById },
    })

    // Emitir evento
    socketService.emitToRoom(
      SocketRooms.conversation(conversationId),
      'inbox:conversation_assigned',
      {
        conversationId,
        assignedTo: {
          id: conversation.assignedTo.id,
          firstName: conversation.assignedTo.firstName,
          lastName: conversation.assignedTo.lastName,
          avatar: conversation.assignedTo.avatar,
        },
        assignedBy: {
          id: assignedBy.id,
          firstName: assignedBy.firstName,
          lastName: assignedBy.lastName,
        },
        timestamp: new Date().toISOString(),
      }
    )

    return conversation
  }
}
```

## 2. Pipes Service (Kanban)

**Arquivo: `backend/src/modules/pipes/pipes.service.ts`**

```typescript
import { socketService, SocketRooms } from '../../websocket'

class PipesService {
  async moveCard(cardId: string, phaseId: string, userId: string) {
    // 1. Buscar card atual
    const currentCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: { currentPhase: true },
    })

    const fromPhase = currentCard.currentPhase

    // 2. Atualizar card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { currentPhaseId: phaseId },
      include: {
        currentPhase: true,
        createdBy: true,
        assignedTo: true,
      },
    })

    // 3. Registrar no activity log
    await prisma.cardActivityLog.create({
      data: {
        cardId,
        type: 'phase_changed',
        createdById: userId,
        payloadJson: {
          fromPhaseId: fromPhase.id,
          fromPhaseName: fromPhase.name,
          toPhaseId: updatedCard.currentPhaseId,
          toPhaseName: updatedCard.currentPhase.name,
        },
      },
    })

    // 4. Buscar dados do usuário que moveu
    const movedBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    // 5. Emitir evento Socket.io
    try {
      socketService.emitToRoom(
        SocketRooms.pipe(updatedCard.pipeId),
        'deal:moved',
        {
          cardId: updatedCard.id,
          card: {
            id: updatedCard.id,
            title: updatedCard.title,
            status: updatedCard.status,
            currentPhaseId: updatedCard.currentPhaseId,
          },
          fromPhaseId: fromPhase.id,
          fromPhaseName: fromPhase.name,
          toPhaseId: updatedCard.currentPhaseId,
          toPhaseName: updatedCard.currentPhase.name,
          movedBy: {
            id: movedBy.id,
            firstName: movedBy.firstName,
            lastName: movedBy.lastName,
          },
          timestamp: new Date().toISOString(),
        }
      )

      // Atualizar stats do dashboard
      socketService.emitToCompany(updatedCard.companyId, 'dashboard:stats_update', {
        companyId: updatedCard.companyId,
        stats: {},
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error({ error, cardId }, 'Failed to emit deal:moved')
    }

    return updatedCard
  }

  async createCard(pipeId: string, phaseId: string, data: any, userId: string) {
    const card = await prisma.card.create({
      data: {
        ...data,
        pipeId,
        currentPhaseId: phaseId,
        createdById: userId,
        companyId: data.companyId,
      },
      include: {
        currentPhase: true,
        createdBy: true,
      },
    })

    // Emitir evento
    socketService.emitToRoom(
      SocketRooms.pipe(pipeId),
      'deal:created',
      {
        card: {
          id: card.id,
          companyId: card.companyId,
          pipeId: card.pipeId,
          currentPhaseId: card.currentPhaseId,
          title: card.title,
          description: card.description,
          status: card.status,
          createdAt: card.createdAt.toISOString(),
        },
        createdBy: {
          id: card.createdBy.id,
          firstName: card.createdBy.firstName,
          lastName: card.createdBy.lastName,
        },
        timestamp: new Date().toISOString(),
      }
    )

    return card
  }

  async updateCard(cardId: string, data: any, userId: string) {
    const card = await prisma.card.update({
      where: { id: cardId },
      data,
    })

    const updatedBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    socketService.emitToRoom(
      SocketRooms.pipe(card.pipeId),
      'deal:updated',
      {
        cardId: card.id,
        card: {
          id: card.id,
          title: card.title,
          description: card.description,
          status: card.status,
        },
        updatedFields: Object.keys(data),
        updatedBy: {
          id: updatedBy.id,
          firstName: updatedBy.firstName,
          lastName: updatedBy.lastName,
        },
        timestamp: new Date().toISOString(),
      }
    )

    return card
  }

  async deleteCard(cardId: string, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    })

    await prisma.card.delete({
      where: { id: cardId },
    })

    const deletedBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    socketService.emitToRoom(
      SocketRooms.pipe(card.pipeId),
      'deal:deleted',
      {
        cardId: card.id,
        pipeId: card.pipeId,
        deletedBy: {
          id: deletedBy.id,
          firstName: deletedBy.firstName,
          lastName: deletedBy.lastName,
        },
        timestamp: new Date().toISOString(),
      }
    )
  }
}
```

## 3. Appointments Service

**Arquivo: `backend/src/modules/appointments/appointments.service.ts`**

```typescript
import { socketService, SocketRooms } from '../../websocket'

class AppointmentsService {
  async create(companyId: string, userId: string, data: any) {
    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    const createdBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    // Emitir evento para toda empresa
    socketService.emitToCompany(companyId, 'appointment:created', {
      appointment: {
        id: appointment.id,
        companyId: appointment.companyId,
        patientId: appointment.patientId,
        patient: {
          id: appointment.patient.id,
          fullName: appointment.patient.fullName,
          phone: appointment.patient.phone,
          email: appointment.patient.email,
        },
        doctorId: appointment.doctorId,
        doctor: {
          id: appointment.doctor.id,
          fullName: appointment.doctor.fullName,
          specialty: appointment.doctor.specialty,
          crm: appointment.doctor.crm,
        },
        type: appointment.type,
        status: appointment.status,
        date: appointment.date.toISOString(),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toISOString(),
      },
      createdBy: {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      },
      timestamp: new Date().toISOString(),
    })

    // Se houver médico, enviar notificação pessoal
    if (appointment.doctorId) {
      socketService.emitToUser(appointment.doctorId, 'notification:new', {
        id: crypto.randomUUID(),
        type: 'info',
        title: 'Nova consulta agendada',
        message: `Consulta com ${appointment.patient.fullName}`,
        link: `/appointments/${appointment.id}`,
        userId: appointment.doctorId,
        companyId,
        createdAt: new Date().toISOString(),
      })
    }

    return appointment
  }

  async update(id: string, userId: string, data: any) {
    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
        doctor: true,
      },
    })

    const updatedBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    socketService.emitToCompany(appointment.companyId, 'appointment:updated', {
      appointmentId: appointment.id,
      appointment: {
        id: appointment.id,
        status: appointment.status,
        date: appointment.date.toISOString(),
        startTime: appointment.startTime,
      },
      updatedFields: Object.keys(data),
      updatedBy: {
        id: updatedBy.id,
        firstName: updatedBy.firstName,
        lastName: updatedBy.lastName,
      },
      timestamp: new Date().toISOString(),
    })

    return appointment
  }

  async delete(id: string, userId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    })

    await prisma.appointment.delete({
      where: { id },
    })

    const deletedBy = await prisma.user.findUnique({
      where: { id: userId },
    })

    socketService.emitToCompany(appointment.companyId, 'appointment:deleted', {
      appointmentId: id,
      deletedBy: {
        id: deletedBy.id,
        firstName: deletedBy.firstName,
        lastName: deletedBy.lastName,
      },
      timestamp: new Date().toISOString(),
    })
  }

  // Enviar lembretes via cron job
  async sendReminders() {
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 60 * 60 * 1000), // Próxima 1h
        },
        status: 'scheduled',
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    for (const appointment of upcomingAppointments) {
      socketService.emitToUser(appointment.patientId, 'appointment:reminder', {
        appointment: {
          id: appointment.id,
          patient: {
            id: appointment.patient.id,
            fullName: appointment.patient.fullName,
          },
          doctor: {
            id: appointment.doctor.id,
            fullName: appointment.doctor.fullName,
          },
          date: appointment.date.toISOString(),
          startTime: appointment.startTime,
        },
        reminderType: '1hour',
        timestamp: new Date().toISOString(),
      })
    }
  }
}
```

## 4. Dashboard Service (Estatísticas)

**Arquivo: `backend/src/modules/dashboard/dashboard.service.ts`**

```typescript
import { socketService, SocketRooms } from '../../websocket'

class DashboardService {
  async updateStats(companyId: string) {
    // Calcular stats
    const stats = {
      contacts: await prisma.contact.count({ where: { companyId } }),
      leads: await prisma.lead.count({ where: { companyId } }),
      deals: await prisma.card.count({ where: { companyId } }),
      appointments: await prisma.appointment.count({ where: { companyId } }),
    }

    // Emitir para todos na room do dashboard
    socketService.emitToRoom(
      SocketRooms.dashboard(companyId),
      'dashboard:stats_update',
      {
        companyId,
        stats,
        timestamp: new Date().toISOString(),
      }
    )

    return stats
  }

  // Chamar este método após criar/deletar qualquer entidade
  async notifyStatsChange(companyId: string, entity: 'contacts' | 'leads' | 'deals' | 'appointments') {
    const count = await this.getCount(companyId, entity)

    socketService.emitToRoom(
      SocketRooms.dashboard(companyId),
      'dashboard:stats_update',
      {
        companyId,
        stats: {
          [entity]: count,
        },
        timestamp: new Date().toISOString(),
      }
    )
  }

  private async getCount(companyId: string, entity: string): Promise<number> {
    const models = {
      contacts: prisma.contact,
      leads: prisma.lead,
      deals: prisma.card,
      appointments: prisma.appointment,
    }

    return models[entity].count({ where: { companyId } })
  }
}
```

## 5. Contacts Service (Integração Simples)

**Arquivo: `backend/src/modules/contacts/contacts.service.ts`**

```typescript
import { socketService } from '../../websocket'

class ContactsService {
  async create(companyId: string, data: any) {
    const contact = await prisma.contact.create({
      data: {
        ...data,
        companyId,
      },
    })

    // Atualizar stats do dashboard
    try {
      const totalContacts = await prisma.contact.count({ where: { companyId } })

      socketService.emitToCompany(companyId, 'dashboard:stats_update', {
        companyId,
        stats: { contacts: totalContacts },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      logger.error({ error }, 'Failed to emit dashboard stats update')
    }

    return contact
  }

  async delete(id: string, companyId: string) {
    await prisma.contact.delete({
      where: { id, companyId },
    })

    // Atualizar stats
    const totalContacts = await prisma.contact.count({ where: { companyId } })

    socketService.emitToCompany(companyId, 'dashboard:stats_update', {
      companyId,
      stats: { contacts: totalContacts },
      timestamp: new Date().toISOString(),
    })
  }
}
```

## 6. Notificações Globais (Helper)

**Arquivo: `backend/src/utils/notifications.ts`**

```typescript
import { socketService } from '../websocket'

export async function sendNotification(
  companyId: string,
  userId: string | undefined,
  notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    link?: string
    actionLabel?: string
  }
) {
  const payload = {
    id: crypto.randomUUID(),
    ...notification,
    userId,
    companyId,
    createdAt: new Date().toISOString(),
  }

  if (userId) {
    // Notificação para usuário específico
    socketService.emitToUser(userId, 'notification:new', payload)
  } else {
    // Notificação para toda empresa
    socketService.emitToCompany(companyId, 'notification:new', payload)
  }

  // Opcional: Salvar no banco
  // await prisma.notification.create({ data: payload })
}

// Uso em qualquer service:
// await sendNotification(companyId, userId, {
//   type: 'success',
//   title: 'Lead convertido',
//   message: 'Seu lead foi convertido em deal',
//   link: `/deals/${dealId}`,
// })
```

## 7. Broadcast para Empresa

```typescript
export async function broadcastToCompany(
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

// Uso:
// await broadcastToCompany(
//   companyId,
//   'maintenance',
//   'Manutenção Programada',
//   'Sistema em manutenção às 22h'
// )
```

## Resumo de Integração

### Para cada operação importante:

1. ✅ Executar lógica de negócio (criar/atualizar/deletar no banco)
2. ✅ Buscar dados relacionados necessários para o payload
3. ✅ Emitir evento Socket.io usando `socketService`
4. ✅ Tratar erros (não deixar Socket.io quebrar a operação principal)
5. ✅ Atualizar estatísticas do dashboard se relevante

### Escolha o método correto:

- `emitToCompany()` - Todos da empresa (notificações globais)
- `emitToUser()` - Usuário específico (notificações pessoais)
- `emitToRoom()` - Room específica (conversa, pipe, etc)

### Sempre inclua:

- ✅ `timestamp` em todos os payloads
- ✅ Dados mínimos necessários (não enviar objetos Prisma completos)
- ✅ IDs e nomes para facilitar UI
- ✅ Informação de quem executou a ação (createdBy, updatedBy, etc)
