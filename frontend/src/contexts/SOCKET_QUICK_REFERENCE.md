# Socket.io Quick Reference

## Import Statements

```tsx
// Main hooks
import { useSocket } from '../contexts'
import { useNotifications } from '../contexts'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useTypingIndicator } from '../hooks/useTypingIndicator'

// Components
import { NotificationBell } from '../components/NotificationBell'
import { SocketStatusIndicator } from '../components/SocketStatusIndicator'
```

## useSocket()

```tsx
const { socket, connectionStatus, emit, joinRoom, leaveRoom } = useSocket()

// Connection status
connectionStatus // 'connected' | 'connecting' | 'disconnected'

// Emit event
emit('custom:event', { data: 'value' })

// Join room
joinRoom('pipeline:123')

// Leave room
leaveRoom('pipeline:123')

// Access raw socket
socket?.on('event', callback)
```

## useSocketEvent()

```tsx
// Listen to any event
useSocketEvent('deal:updated', (data) => {
  console.log('Deal updated:', data)
  queryClient.invalidateQueries({ queryKey: ['deals', data.dealId] })
})

// Auto-cleanup on unmount
// No need to manually remove listener
```

## useNotifications()

```tsx
const {
  notifications,     // Notification[]
  unreadCount,       // number
  markAsRead,        // (id: string) => void
  markAllAsRead,     // () => void
  clearNotifications // () => void
} = useNotifications()

// Use in component
<div>
  <span>Unread: {unreadCount}</span>
  {notifications.map(n => (
    <div key={n.id} onClick={() => markAsRead(n.id)}>
      {n.title}
    </div>
  ))}
</div>
```

## useTypingIndicator()

```tsx
const {
  emitTyping,        // (conversationId: string) => void
  typingUsers,       // TypingUser[]
  isAnyoneTyping     // boolean
} = useTypingIndicator(conversationId, {
  debounceMs: 1000,  // optional
  onTyping: (users) => console.log(users) // optional
})

// In textarea onChange
<textarea
  onChange={(e) => {
    setValue(e.target.value)
    if (e.target.value.trim()) {
      emitTyping(conversationId)
    }
  }}
/>

// Show indicator
{isAnyoneTyping && (
  <div>{typingUsers.map(u => u.userName).join(', ')} digitando...</div>
)}
```

## Common Patterns

### Pattern 1: Real-time List

```tsx
function DealsPage() {
  const queryClient = useQueryClient()

  useSocketEvent('deal:created', () => {
    queryClient.invalidateQueries({ queryKey: ['deals'] })
  })

  useSocketEvent('deal:updated', (data) => {
    queryClient.invalidateQueries({ queryKey: ['deals', data.dealId] })
  })

  return <DealsList />
}
```

### Pattern 2: Room-based Events

```tsx
function PipelinePage({ pipelineId }) {
  const { joinRoom, leaveRoom } = useSocket()

  useEffect(() => {
    joinRoom(`pipeline:${pipelineId}`)
    return () => leaveRoom(`pipeline:${pipelineId}`)
  }, [pipelineId, joinRoom, leaveRoom])

  useSocketEvent('deal:moved', (data) => {
    if (data.pipelineId === pipelineId) {
      // Handle move
    }
  })

  return <KanbanBoard />
}
```

### Pattern 3: Toast on Event

```tsx
function DashboardPage() {
  useSocketEvent('deal:created', (data) => {
    toast.success('Novo negócio criado', {
      description: data.dealTitle
    })
    queryClient.invalidateQueries({ queryKey: ['deals'] })
  })

  return <Dashboard />
}
```

### Pattern 4: Update State

```tsx
function ActivityFeed() {
  const [activities, setActivities] = useState([])

  useSocketEvent('activity:new', (data) => {
    setActivities(prev => [data, ...prev])
  })

  return activities.map(a => <ActivityItem key={a.id} {...a} />)
}
```

### Pattern 5: Conditional Emit

```tsx
function MessageInput({ conversationId }) {
  const { emit } = useSocket()
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      emit('message:send', { conversationId, content: message })
      setMessage('')
    }
  }

  return (
    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
    />
  )
}
```

## Components

### NotificationBell

```tsx
// Add to header
import { NotificationBell } from '../components/NotificationBell'

<header>
  <NotificationBell />
</header>
```

### SocketStatusIndicator

```tsx
// Show in dev mode
import { SocketStatusIndicator } from '../components/SocketStatusIndicator'

{import.meta.env.DEV && <SocketStatusIndicator />}
```

## Events to Listen For

```tsx
// Deals/Pipeline
'deal:created'
'deal:updated'
'deal:moved'
'deal:deleted'

// Inbox/Messages
'inbox:new_message'
'inbox:message_read'
'typing:start'
'typing:stop'

// Contacts/Leads
'contact:created'
'contact:updated'
'contact:deleted'
'lead:created'
'lead:updated'
'lead:converted'

// Notifications (auto-handled)
'notification:new'

// Presence
'user:online'
'user:offline'

// Activities
'activity:new'

// Stats
'stats:updated'
```

## Events to Emit

```tsx
// Typing
emit('typing', { conversationId })
emit('typing:stop', { conversationId })

// Message read
emit('message_read', { messageId })

// Join/Leave rooms
emit('join_room', 'pipeline:123')
emit('leave_room', 'pipeline:123')
// OR use helpers:
joinRoom('pipeline:123')
leaveRoom('pipeline:123')
```

## Room Naming

```tsx
// Company (auto-joined)
'company:{companyId}'

// Conversations
'conversation:{conversationId}'

// Pipelines
'pipeline:{pipelineId}'

// Forms
'form:{formId}'

// Users
'user:{userId}'
```

## TypeScript Types

```tsx
// Notification type
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  data?: any
}

// Typing user type
interface TypingUser {
  userId: string
  userName: string
}

// Connection status type
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'
```

## Debugging

```tsx
// Check connection
const { connectionStatus } = useSocket()
console.log('Status:', connectionStatus)

// View all events (dev only)
// Socket logs automatically in console with [Socket.io] prefix

// Check notifications
const { notifications } = useNotifications()
console.log('Notifications:', notifications)

// Test emit
const { emit } = useSocket()
emit('test:event', { test: true })
```

## Common Issues

### Socket not connecting
```tsx
// Check auth
const { isAuthenticated, token } = useAuthStore()
console.log('Auth:', isAuthenticated, !!token)

// Check status
const { connectionStatus } = useSocket()
console.log('Status:', connectionStatus)
```

### Events not received
```tsx
// Verify room joined
const { joinRoom } = useSocket()
useEffect(() => {
  joinRoom('my-room')
  console.log('Joined room: my-room')
}, [])

// Check listener
useSocketEvent('my-event', (data) => {
  console.log('Event received:', data)
})
```

### Duplicate events
```tsx
// Make sure cleanup is working
useEffect(() => {
  // DO NOT register listeners here
  // Use useSocketEvent hook instead
}, [])

// CORRECT:
useSocketEvent('event', callback)
```

## Performance Tips

```tsx
// ✅ Good: Selective invalidation
queryClient.invalidateQueries({ queryKey: ['deals', dealId] })

// ❌ Bad: Invalidate everything
queryClient.invalidateQueries()

// ✅ Good: Leave rooms on unmount
useEffect(() => {
  joinRoom('room')
  return () => leaveRoom('room')
}, [])

// ❌ Bad: Never leave
useEffect(() => {
  joinRoom('room')
}, [])

// ✅ Good: Use useSocketEvent
useSocketEvent('event', callback)

// ❌ Bad: Manual registration
useEffect(() => {
  socket?.on('event', callback)
  return () => socket?.off('event', callback)
}, [socket, callback])
```

## Complete Example

```tsx
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useTypingIndicator } from '../hooks/useTypingIndicator'
import { useNotifications } from '../contexts'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ConversationPage({ conversationId }) {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const { joinRoom, leaveRoom } = useSocket()

  // Typing indicator
  const { emitTyping, typingUsers, isAnyoneTyping } = useTypingIndicator(conversationId)

  // Join conversation room
  useEffect(() => {
    joinRoom(`conversation:${conversationId}`)
    return () => leaveRoom(`conversation:${conversationId}`)
  }, [conversationId, joinRoom, leaveRoom])

  // Listen for new messages
  useSocketEvent('inbox:new_message', (data) => {
    if (data.conversationId === conversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      toast.info('Nova mensagem', { description: data.content })
    }
  })

  // Listen for message read
  useSocketEvent('inbox:message_read', (data) => {
    if (data.conversationId === conversationId) {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    }
  })

  const handleMessageChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      emitTyping(conversationId)
    }
  }

  return (
    <div>
      <MessageList conversationId={conversationId} />

      {isAnyoneTyping && (
        <div className="text-sm text-gray-500">
          {typingUsers.map(u => u.userName).join(', ')} digitando...
        </div>
      )}

      <textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Digite sua mensagem..."
      />
    </div>
  )
}
```

## Resources

- Full Documentation: `src/contexts/SOCKET_README.md`
- Integration Guide: `src/contexts/SOCKET_INTEGRATION_GUIDE.md`
- Examples: `src/examples/SocketExamples.tsx`
- Architecture: `docs/SOCKET_IO_ARCHITECTURE.md`
