# Socket.io Real-time - CRM IA Enterprise

Sistema de comunicação real-time usando Socket.io integrado ao Fastify.

## Arquivos

- **socket.types.ts**: Tipos TypeScript para eventos Socket.io (servidor e cliente)
- **socket.service.ts**: Serviço principal do Socket.io com autenticação JWT
- **socket.usage.example.ts**: Exemplos de uso em outros módulos
- **index.ts**: Exports centralizados

## Autenticação

Todos os sockets devem se autenticar via JWT no handshake:

```typescript
// Cliente (frontend)
import { io } from 'socket.io-client'

const socket = io('http://localhost:3333', {
  auth: {
    token: 'seu-jwt-token-aqui'
  }
})
```

O middleware de autenticação valida o token e anexa `userId`, `companyId`, `email`, `roleId` ao socket.

## Rooms Automáticas

Ao conectar, cada socket automaticamente entra nas seguintes rooms:

1. `user:{userId}` - Room pessoal do usuário
2. `company:{companyId}` - Todos da empresa
3. `dashboard:{companyId}` - Estatísticas do dashboard
4. `inbox:{companyId}` - Mensagens/conversas
5. `appointments:{companyId}` - Calendário/consultas

## Rooms Dinâmicas

Além das rooms automáticas, o cliente pode entrar/sair de rooms dinamicamente:

```typescript
// Cliente entra em room de uma conversa específica
socket.emit('join_room', { room: 'conversation:abc-123' }, (response) => {
  console.log(response) // { success: true, room: 'conversation:abc-123' }
})

// Cliente sai da room
socket.emit('leave_room', { room: 'conversation:abc-123' })
```

### Convenções de Nomes de Rooms

Use os helpers em `SocketRooms`:

```typescript
import { SocketRooms } from './socket.types'

SocketRooms.company(companyId)        // company:{companyId}
SocketRooms.user(userId)              // user:{userId}
SocketRooms.conversation(convId)      // conversation:{conversationId}
SocketRooms.pipe(pipeId)              // pipe:{pipeId}
SocketRooms.dashboard(companyId)      // dashboard:{companyId}
SocketRooms.appointments(companyId)   // appointments:{companyId}
SocketRooms.inbox(companyId)          // inbox:{companyId}
```

## Eventos Implementados

### Inbox / Chat

- `inbox:new_message` - Nova mensagem em uma conversa
- `inbox:message_read` - Mensagem lida por alguém
- `inbox:typing` - Indicador de digitação
- `inbox:conversation_assigned` - Conversa atribuída a um usuário

### Notificações

- `notification:new` - Nova notificação para usuário/empresa

### Dashboard

- `dashboard:stats_update` - Atualização de estatísticas em tempo real

### Kanban / Cards

- `deal:moved` - Card movido entre fases
- `deal:created` - Novo card criado
- `deal:updated` - Card atualizado
- `deal:deleted` - Card deletado

### Appointments (Consultas)

- `appointment:created` - Nova consulta agendada
- `appointment:updated` - Consulta atualizada
- `appointment:deleted` - Consulta cancelada
- `appointment:reminder` - Lembrete de consulta

### Presença

- `user:online` - Usuário conectou
- `user:offline` - Usuário desconectou

### Sistema

- `company:broadcast` - Broadcast para toda empresa

## Como Usar no Backend

### Emitir para uma empresa inteira

```typescript
import { socketService } from '../websocket'

socketService.emitToCompany(companyId, 'notification:new', {
  id: crypto.randomUUID(),
  type: 'info',
  title: 'Aviso',
  message: 'Manutenção programada às 22h',
  companyId,
  createdAt: new Date().toISOString(),
})
```

### Emitir para um usuário específico

```typescript
socketService.emitToUser(userId, 'notification:new', {
  id: crypto.randomUUID(),
  type: 'success',
  title: 'Lead convertido!',
  message: 'Seu lead foi convertido em deal',
  link: `/deals/${dealId}`,
  userId,
  companyId,
  createdAt: new Date().toISOString(),
})
```

### Emitir para uma room específica

```typescript
import { SocketRooms } from '../websocket'

socketService.emitToRoom(
  SocketRooms.conversation(conversationId),
  'inbox:new_message',
  {
    conversationId,
    message: messageData,
    contact: contactData,
    channel: channelData,
  }
)
```

### Exemplo completo em um service

```typescript
// contacts.service.ts
import { socketService } from '../websocket'

class ContactsService {
  async create(companyId: string, userId: string, data: any) {
    // 1. Criar no banco
    const contact = await prisma.contact.create({ data })

    // 2. Emitir evento real-time
    try {
      socketService.emitToCompany(companyId, 'dashboard:stats_update', {
        companyId,
        stats: { contacts: await this.count(companyId) },
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      // Log mas não falhe a operação
      logger.error({ error }, 'Failed to emit socket event')
    }

    return contact
  }
}
```

## Como Usar no Frontend

### Conectar ao Socket.io

```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3333', {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => {
  console.log('Connected to WebSocket')
})

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket')
})
```

### Escutar eventos

```typescript
// Nova mensagem
socket.on('inbox:new_message', (data) => {
  console.log('Nova mensagem:', data.message)
  // Atualizar UI
})

// Card movido
socket.on('deal:moved', (data) => {
  console.log(`Card ${data.cardId} movido para ${data.toPhaseName}`)
  // Atualizar Kanban
})

// Notificação
socket.on('notification:new', (data) => {
  toast.info(data.message)
})
```

### Emitir eventos do cliente

```typescript
// Entrar em room de conversa
socket.emit('join_room', { room: 'conversation:123' })

// Indicar que está digitando
socket.emit('typing', { conversationId: '123' })

// Parar de digitar
socket.emit('stop_typing', { conversationId: '123' })

// Marcar mensagem como lida
socket.emit('message_read', {
  conversationId: '123',
  messageId: 'msg-456'
})
```

## Integração com React (Hook customizado)

```typescript
// hooks/useSocket.ts
import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    socket = io('http://localhost:3333', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    return () => {
      socket?.disconnect()
    }
  }, [])

  return socket
}

// Uso em componente
function InboxPage() {
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on('inbox:new_message', (data) => {
      // Invalidar query do TanStack Query
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      socket.off('inbox:new_message')
    }
  }, [socket])

  return <div>Inbox</div>
}
```

## Monitoramento

### Verificar conexões ativas

```typescript
const count = await socketService.getConnectionsCount()
console.log(`${count} sockets conectados`)
```

### Ver usuários online de uma empresa

```typescript
const userIds = await socketService.getOnlineUsers(companyId)
console.log('Usuários online:', userIds)
```

## Debugging

### Logs

O Socket.io usa o logger do projeto (Pino). Logs incluem:

- Conexões/desconexões
- Autenticação
- Join/leave rooms
- Eventos emitidos

### DevTools

No frontend, use a extensão Socket.io DevTools:

```typescript
// Habilitar debug
localStorage.debug = 'socket.io-client:socket'
```

## Segurança

1. **JWT obrigatório**: Todos os sockets devem se autenticar
2. **Rooms isoladas por empresa**: Usuários só recebem eventos da própria empresa
3. **Validação de dados**: Sempre validar payloads no cliente
4. **Rate limiting**: Fastify rate-limit se aplica ao handshake inicial
5. **CORS**: Configurado para aceitar apenas origins permitidas

## Performance

- **Transports**: WebSocket preferido, fallback para polling
- **Ping/Pong**: 25s de interval, 60s de timeout
- **Rooms**: Uso eficiente de rooms para evitar broadcast desnecessários
- **Type-safe**: Tipos TypeScript evitam erros de payload

## Próximos Passos

- [ ] Implementar Redis Adapter para escalabilidade horizontal
- [ ] Adicionar namespace `/admin` para eventos administrativos
- [ ] Implementar rate limiting por socket
- [ ] Adicionar compressão de payloads
- [ ] Criar dashboard de monitoramento de sockets
