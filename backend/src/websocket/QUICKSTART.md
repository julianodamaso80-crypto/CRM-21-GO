# Socket.io Real-time - Quick Start Guide

Guia rápido para começar a usar Socket.io no projeto CRM IA Enterprise.

## Arquitetura Implementada

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  SocketContext → useSocket() hook                 │  │
│  │  - Conexão automática com JWT                     │  │
│  │  - Reconexão automática                           │  │
│  │  - Listeners em componentes                       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ WebSocket (Socket.io)
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 BACKEND (Fastify)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  socketService                                    │  │
│  │  - Autenticação JWT no handshake                  │  │
│  │  - Rooms automáticas (company, user, dashboard)  │  │
│  │  - Event handlers (typing, join_room, etc)       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Services (contacts, inbox, pipes, appointments)  │  │
│  │  - Emitem eventos após operações CRUD             │  │
│  │  - socketService.emitToCompany()                  │  │
│  │  - socketService.emitToUser()                     │  │
│  │  - socketService.emitToRoom()                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Já Implementado ✅

### Backend

1. ✅ **socket.types.ts** - Tipos TypeScript completos (server/client events)
2. ✅ **socket.service.ts** - Serviço principal com autenticação JWT
3. ✅ **Integração no server.ts** - Socket.io inicializado após fastify.listen()
4. ✅ **Autenticação JWT** - Middleware que valida token no handshake
5. ✅ **Rooms automáticas** - User, company, dashboard, inbox, appointments
6. ✅ **Event handlers** - join_room, leave_room, typing, message_read
7. ✅ **Métodos públicos** - emitToCompany, emitToUser, emitToRoom

### Eventos Suportados

- `inbox:new_message` - Nova mensagem no chat
- `inbox:message_read` - Mensagem lida
- `inbox:typing` - Indicador de digitação
- `inbox:conversation_assigned` - Conversa atribuída
- `notification:new` - Nova notificação
- `dashboard:stats_update` - Atualização de estatísticas
- `deal:moved` - Card movido no Kanban
- `deal:created` - Card criado
- `deal:updated` - Card atualizado
- `deal:deleted` - Card deletado
- `appointment:created` - Consulta criada
- `appointment:updated` - Consulta atualizada
- `appointment:deleted` - Consulta cancelada
- `appointment:reminder` - Lembrete de consulta
- `user:online` - Usuário conectou
- `user:offline` - Usuário desconectou
- `company:broadcast` - Broadcast para empresa

## Como Usar

### No Backend (Emitir Eventos)

```typescript
import { socketService } from '../websocket'

// Exemplo 1: Notificar toda empresa
socketService.emitToCompany(companyId, 'notification:new', {
  id: crypto.randomUUID(),
  type: 'success',
  title: 'Novo lead',
  message: 'Novo lead capturado via WhatsApp',
  companyId,
  createdAt: new Date().toISOString(),
})

// Exemplo 2: Notificar usuário específico
socketService.emitToUser(userId, 'notification:new', {
  id: crypto.randomUUID(),
  type: 'info',
  title: 'Tarefa atribuída',
  message: 'Nova tarefa foi atribuída a você',
  link: '/tasks/123',
  userId,
  companyId,
  createdAt: new Date().toISOString(),
})

// Exemplo 3: Emitir para room específica (conversa)
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

### No Frontend (Escutar Eventos)

#### 1. Criar SocketContext (fazer uma vez)

```typescript
// frontend/src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth-store'

const SocketContext = createContext<{ socket: Socket | null }>({ socket: null })

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token])

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
```

#### 2. Adicionar no App

```typescript
// frontend/src/main.tsx
import { SocketProvider } from './contexts/SocketContext'

<SocketProvider>
  <App />
</SocketProvider>
```

#### 3. Usar em Componentes

```typescript
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function InboxPage() {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    // Listener para novas mensagens
    const handleNewMessage = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.info(`Nova mensagem de ${data.contact.fullName}`)
    }

    socket.on('inbox:new_message', handleNewMessage)

    // Cleanup
    return () => {
      socket.off('inbox:new_message', handleNewMessage)
    }
  }, [socket, queryClient])

  return <div>Inbox UI</div>
}
```

## Próximos Passos

### Backend

1. **Integrar em Services Existentes**
   - Veja `INTEGRATION_EXAMPLES.md` para exemplos práticos
   - Adicione `socketService.emitTo...()` após operações CRUD importantes

2. **Adicionar em inbox.service.ts**
   ```typescript
   import { socketService, SocketRooms } from '../../websocket'

   async sendMessage(...) {
     // ... salvar no banco

     socketService.emitToRoom(
       SocketRooms.conversation(conversationId),
       'inbox:new_message',
       { ... }
     )
   }
   ```

3. **Adicionar em pipes.service.ts** (Kanban)
   ```typescript
   async moveCard(...) {
     // ... atualizar no banco

     socketService.emitToRoom(
       SocketRooms.pipe(pipeId),
       'deal:moved',
       { ... }
     )
   }
   ```

4. **Adicionar em appointments.service.ts**
   ```typescript
   async create(...) {
     // ... criar no banco

     socketService.emitToCompany(companyId, 'appointment:created', { ... })
   }
   ```

### Frontend

1. **Criar SocketContext** (copiar de `FRONTEND_INTEGRATION.md`)

2. **Adicionar em Inbox/Chat**
   - Escutar `inbox:new_message`
   - Emitir `typing` ao digitar
   - Invalidar queries do TanStack Query

3. **Adicionar no Kanban**
   - Escutar `deal:moved`, `deal:created`, `deal:updated`, `deal:deleted`
   - Atualizar UI em tempo real

4. **Adicionar no Dashboard**
   - Escutar `dashboard:stats_update`
   - Atualizar números em tempo real

5. **Adicionar Notificações Globais**
   - Escutar `notification:new`
   - Mostrar toasts com Sonner

6. **Adicionar no Calendário**
   - Escutar `appointment:created`, `appointment:updated`, `appointment:deleted`
   - Atualizar calendário em tempo real

## Testar

### Teste Manual Rápido

1. **Iniciar servidor**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verificar logs**
   ```
   ✅ Socket.io initialized successfully
   🔌 WebSocket: Connected and ready
   ```

3. **No frontend, conectar via DevTools**
   ```javascript
   const { io } = require('socket.io-client')

   const socket = io('http://localhost:3333', {
     auth: { token: 'SEU_TOKEN_JWT' }
   })

   socket.on('connect', () => console.log('Connected!'))
   socket.on('notification:new', (data) => console.log('Notification:', data))
   ```

4. **Emitir evento de teste no backend**
   ```typescript
   // Em qualquer controller/service
   socketService.emitToCompany('company-id', 'notification:new', {
     id: crypto.randomUUID(),
     type: 'info',
     title: 'Teste',
     message: 'Socket.io funcionando!',
     companyId: 'company-id',
     createdAt: new Date().toISOString(),
   })
   ```

### Teste com Cliente Real

Veja `socket.test.example.ts` para testes de integração completos.

## Debugging

### Backend

```typescript
// Ver conexões ativas
const count = await socketService.getConnectionsCount()
console.log(`${count} sockets conectados`)

// Ver usuários online
const users = await socketService.getOnlineUsers(companyId)
console.log('Online:', users)
```

### Frontend

```javascript
// Habilitar logs detalhados
localStorage.debug = 'socket.io-client:socket'

// Ver rooms do socket
console.log(socket.rooms) // Set { 'socket-id', 'company:123', 'user:456' }
```

## Documentação Completa

- `README.md` - Visão geral e documentação técnica
- `FRONTEND_INTEGRATION.md` - Guia completo de integração no frontend
- `INTEGRATION_EXAMPLES.md` - Exemplos práticos para cada service
- `socket.usage.example.ts` - Exemplos de código backend
- `socket.test.example.ts` - Testes de integração

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor (Pino logger)
2. Verifique o console do navegador (erros de conexão)
3. Use Socket.io DevTools (extensão Chrome)
4. Veja exemplos nos arquivos de documentação

## Checklist de Implementação

### Backend
- [x] Socket.io instalado e configurado
- [x] Autenticação JWT implementada
- [x] Tipos TypeScript definidos
- [x] Event handlers básicos (typing, join_room, etc)
- [x] Métodos públicos (emitToCompany, emitToUser, emitToRoom)
- [ ] Integrar em inbox.service.ts
- [ ] Integrar em pipes.service.ts
- [ ] Integrar em appointments.service.ts
- [ ] Integrar em contacts.service.ts

### Frontend
- [ ] Instalar socket.io-client
- [ ] Criar SocketContext
- [ ] Adicionar SocketProvider no App
- [ ] Implementar em InboxPage
- [ ] Implementar no KanbanBoard
- [ ] Implementar no Dashboard
- [ ] Adicionar NotificationListener global
- [ ] Adicionar ConnectionStatus indicator

## Performance Tips

1. **Não abuse de eventos** - Apenas emita quando necessário
2. **Use rooms** - Evite broadcast para todos
3. **Debounce typing** - Não emita a cada keystroke
4. **Cleanup listeners** - Sempre remova listeners no useEffect return
5. **Redis Adapter** - Para escalar horizontalmente (próximo passo)

## Segurança

- ✅ JWT obrigatório para conexão
- ✅ Validação de token no handshake
- ✅ Isolamento por empresa (rooms)
- ✅ CORS configurado
- ✅ Rate limiting no handshake inicial

---

**Pronto para uso!** Socket.io está totalmente configurado e pronto para ser integrado nos módulos do projeto.
