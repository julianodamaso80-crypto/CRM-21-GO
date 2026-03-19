# Frontend Integration Guide - Socket.io

Guia completo de integração do Socket.io no frontend React.

## Instalação

```bash
cd frontend
npm install socket.io-client
```

## 1. Criar Context do Socket (Recomendado)

**Arquivo: `frontend/src/contexts/SocketContext.tsx`**

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/auth-store'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socket?.disconnect()
      setSocket(null)
      setIsConnected(false)
      return
    }

    // Criar conexão Socket.io
    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    // Event listeners
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    // Cleanup
    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [token, isAuthenticated])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}
```

## 2. Adicionar Provider no App

**Arquivo: `frontend/src/main.tsx`**

```typescript
import { SocketProvider } from './contexts/SocketContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
```

## 3. Uso em Componentes

### Exemplo 1: Inbox (Chat Real-time)

**Arquivo: `frontend/src/pages/inbox/ConversationView.tsx`**

```typescript
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '../../contexts/SocketContext'
import { toast } from 'sonner'

export function ConversationView({ conversationId }: { conversationId: string }) {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !conversationId) return

    // Entrar na room da conversa
    socket.emit('join_room', { room: `conversation:${conversationId}` }, (response) => {
      if (response.success) {
        console.log('Joined conversation room:', response.room)
      }
    })

    // Escutar nova mensagem
    const handleNewMessage = (data: any) => {
      console.log('Nova mensagem recebida:', data)

      // Invalidar queries para refetch
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      })

      // Toast (opcional)
      if (data.message.direction === 'inbound') {
        toast.info(`Nova mensagem de ${data.contact.fullName}`)
      }
    }

    // Escutar indicador de digitação
    const handleTyping = (data: any) => {
      if (data.isTyping) {
        console.log('Usuário digitando...', data.user || data.contact)
        // Mostrar "..." na UI
      }
    }

    // Registrar listeners
    socket.on('inbox:new_message', handleNewMessage)
    socket.on('inbox:typing', handleTyping)

    // Cleanup
    return () => {
      socket.off('inbox:new_message', handleNewMessage)
      socket.off('inbox:typing', handleTyping)
      socket.emit('leave_room', { room: `conversation:${conversationId}` })
    }
  }, [socket, conversationId, queryClient])

  return <div>Conversation UI...</div>
}
```

### Exemplo 2: Typing Indicator (Indicador de Digitação)

```typescript
import { useEffect, useRef } from 'react'
import { useSocket } from '../../contexts/SocketContext'

export function MessageInput({ conversationId }: { conversationId: string }) {
  const { socket } = useSocket()
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = () => {
    if (!socket) return

    // Emitir evento de typing
    socket.emit('typing', { conversationId })

    // Limpar timeout anterior
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    // Emitir stop_typing após 2s de inatividade
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId })
    }, 2000)
  }

  return (
    <input
      type="text"
      onChange={handleTyping}
      onBlur={() => socket?.emit('stop_typing', { conversationId })}
      placeholder="Digite uma mensagem..."
    />
  )
}
```

### Exemplo 3: Kanban Real-time

**Arquivo: `frontend/src/pages/deals/KanbanBoard.tsx`**

```typescript
import { useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function KanbanBoard({ pipeId }: { pipeId: string }) {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket || !pipeId) return

    // Entrar na room do pipe
    socket.emit('join_room', { room: `pipe:${pipeId}` })

    // Card movido
    const handleCardMoved = (data: any) => {
      console.log('Card movido:', data)

      // Invalidar query do Kanban
      queryClient.invalidateQueries({ queryKey: ['kanban', pipeId] })

      // Toast
      toast.info(
        `${data.card.title} movido para ${data.toPhaseName} por ${data.movedBy.firstName}`
      )
    }

    // Card criado
    const handleCardCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['kanban', pipeId] })
      toast.success(`Novo card: ${data.card.title}`)
    }

    // Card atualizado
    const handleCardUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['kanban', pipeId] })
    }

    // Card deletado
    const handleCardDeleted = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['kanban', pipeId] })
      toast.info('Card removido')
    }

    socket.on('deal:moved', handleCardMoved)
    socket.on('deal:created', handleCardCreated)
    socket.on('deal:updated', handleCardUpdated)
    socket.on('deal:deleted', handleCardDeleted)

    return () => {
      socket.off('deal:moved', handleCardMoved)
      socket.off('deal:created', handleCardCreated)
      socket.off('deal:updated', handleCardUpdated)
      socket.off('deal:deleted', handleCardDeleted)
      socket.emit('leave_room', { room: `pipe:${pipeId}` })
    }
  }, [socket, pipeId, queryClient])

  return <div>Kanban UI...</div>
}
```

### Exemplo 4: Dashboard Real-time

**Arquivo: `frontend/src/pages/dashboard/DashboardPage.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useSocket } from '../../contexts/SocketContext'

export function DashboardPage() {
  const { socket } = useSocket()
  const [stats, setStats] = useState({
    contacts: 0,
    leads: 0,
    deals: 0,
    revenue: 0,
  })

  useEffect(() => {
    if (!socket) return

    // Escutar atualizações de stats
    const handleStatsUpdate = (data: any) => {
      console.log('Stats atualizadas:', data.stats)
      setStats((prev) => ({ ...prev, ...data.stats }))
    }

    socket.on('dashboard:stats_update', handleStatsUpdate)

    return () => {
      socket.off('dashboard:stats_update', handleStatsUpdate)
    }
  }, [socket])

  return (
    <div>
      <div>Contatos: {stats.contacts}</div>
      <div>Leads: {stats.leads}</div>
      <div>Deals: {stats.deals}</div>
      <div>Receita: R$ {stats.revenue}</div>
    </div>
  )
}
```

### Exemplo 5: Notificações Globais

**Arquivo: `frontend/src/components/NotificationListener.tsx`**

```typescript
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export function NotificationListener() {
  const { socket } = useSocket()
  const navigate = useNavigate()

  useEffect(() => {
    if (!socket) return

    const handleNotification = (data: any) => {
      console.log('Nova notificação:', data)

      // Mostrar toast baseado no tipo
      const toastFn = {
        info: toast.info,
        success: toast.success,
        warning: toast.warning,
        error: toast.error,
      }[data.type] || toast.info

      toastFn(data.message, {
        description: data.title,
        action: data.link
          ? {
              label: data.actionLabel || 'Ver',
              onClick: () => navigate(data.link),
            }
          : undefined,
      })
    }

    socket.on('notification:new', handleNotification)

    return () => {
      socket.off('notification:new', handleNotification)
    }
  }, [socket, navigate])

  return null // Componente invisível
}

// Adicionar no AppLayout.tsx
<NotificationListener />
```

### Exemplo 6: Presença de Usuários Online

```typescript
import { useEffect, useState } from 'react'
import { useSocket } from '../../contexts/SocketContext'

export function OnlineUsers() {
  const { socket } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    if (!socket) return

    const handleUserOnline = (data: any) => {
      console.log('Usuário online:', data.userId)
      setOnlineUsers((prev) => [...new Set([...prev, data.userId])])
    }

    const handleUserOffline = (data: any) => {
      console.log('Usuário offline:', data.userId)
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId))
    }

    socket.on('user:online', handleUserOnline)
    socket.on('user:offline', handleUserOffline)

    return () => {
      socket.off('user:online', handleUserOnline)
      socket.off('user:offline', handleUserOffline)
    }
  }, [socket])

  return (
    <div>
      <h3>Usuários Online ({onlineUsers.length})</h3>
      {/* Renderizar lista */}
    </div>
  )
}
```

### Exemplo 7: Appointments (Calendário Real-time)

```typescript
import { useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function AppointmentsCalendar() {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleAppointmentCreated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success(
        `Nova consulta agendada: ${data.appointment.patient.fullName}`
      )
    }

    const handleAppointmentUpdated = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.info('Consulta atualizada')
    }

    const handleAppointmentDeleted = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.warning('Consulta cancelada')
    }

    const handleAppointmentReminder = (data: any) => {
      toast.info(
        `Lembrete: Consulta com ${data.appointment.patient.fullName} em ${data.reminderType}`
      )
    }

    socket.on('appointment:created', handleAppointmentCreated)
    socket.on('appointment:updated', handleAppointmentUpdated)
    socket.on('appointment:deleted', handleAppointmentDeleted)
    socket.on('appointment:reminder', handleAppointmentReminder)

    return () => {
      socket.off('appointment:created', handleAppointmentCreated)
      socket.off('appointment:updated', handleAppointmentUpdated)
      socket.off('appointment:deleted', handleAppointmentDeleted)
      socket.off('appointment:reminder', handleAppointmentReminder)
    }
  }, [socket, queryClient])

  return <div>Calendar UI...</div>
}
```

## 4. Hook Customizado Reutilizável

**Arquivo: `frontend/src/hooks/useSocketEvent.ts`**

```typescript
import { useEffect } from 'react'
import { useSocket } from '../contexts/SocketContext'

export function useSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: any[] = []
) {
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(event, handler)

    return () => {
      socket.off(event, handler)
    }
  }, [socket, event, ...deps])
}

// Uso:
function MyComponent() {
  useSocketEvent('inbox:new_message', (data) => {
    console.log('Nova mensagem:', data)
  })
}
```

## 5. Indicador de Status da Conexão

```typescript
import { useSocket } from '../contexts/SocketContext'
import { Wifi, WifiOff } from 'lucide-react'

export function ConnectionStatus() {
  const { isConnected } = useSocket()

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600">Offline</span>
        </>
      )}
    </div>
  )
}
```

## 6. Best Practices

### ✅ DO

- Use `useEffect` para registrar listeners
- Sempre faça cleanup (return) para remover listeners
- Use `useQueryClient.invalidateQueries` para refetch dados
- Mostre feedback visual (toasts) para eventos importantes
- Entre em rooms específicas quando necessário

### ❌ DON'T

- Não crie múltiplas conexões Socket.io
- Não esqueça de remover listeners no cleanup
- Não emita eventos em excesso (debounce typing)
- Não confie apenas no Socket.io (sempre tenha fallback HTTP)
- Não exponha dados sensíveis nos eventos

## 7. Debugging

### Console Logs

```typescript
// Habilitar logs detalhados do Socket.io
localStorage.debug = 'socket.io-client:socket'
```

### DevTools

Instale a extensão Socket.io DevTools no Chrome para monitorar eventos em tempo real.

## 8. Performance

### Lazy Loading

Só conecte ao Socket.io quando necessário:

```typescript
// Conectar apenas em páginas que usam real-time
function InboxPage() {
  const { socket } = useSocket()

  // socket será null até o usuário entrar nesta página
}
```

### Debouncing

Para eventos frequentes (typing):

```typescript
import { useDebouncedCallback } from 'use-debounce'

const emitTyping = useDebouncedCallback(() => {
  socket?.emit('typing', { conversationId })
}, 300)
```

## 9. Testes

```typescript
// Mock do Socket.io para testes
jest.mock('../contexts/SocketContext', () => ({
  useSocket: () => ({
    socket: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isConnected: true,
  }),
}))
```

## Resumo

1. ✅ Criar `SocketContext` com autenticação JWT
2. ✅ Adicionar `SocketProvider` no App
3. ✅ Usar `useSocket()` em componentes
4. ✅ Registrar listeners no `useEffect`
5. ✅ Sempre fazer cleanup
6. ✅ Invalidar queries do TanStack Query
7. ✅ Mostrar toasts para feedback
8. ✅ Entrar/sair de rooms dinamicamente
