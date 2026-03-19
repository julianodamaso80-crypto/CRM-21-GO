# Socket.io Real-time Implementation

## Overview

This directory contains the Socket.io real-time communication implementation for the CRM frontend application. It provides real-time updates for notifications, chat messages, deal updates, and other collaborative features.

## Architecture

### Core Components

1. **SocketContext** (`SocketContext.tsx`)
   - Manages WebSocket connection to backend
   - Handles authentication with JWT tokens
   - Auto-reconnection logic
   - Room management (join/leave)
   - Connection status tracking

2. **NotificationProvider** (`NotificationProvider.tsx`)
   - Listens for real-time notifications
   - Shows toast notifications
   - Manages notification state
   - Unread count tracking
   - Mark as read functionality

### Custom Hooks

1. **useSocket** - Access socket instance and connection state
2. **useNotifications** - Access notifications and notification actions
3. **useSocketEvent** - Generic hook for listening to Socket.io events
4. **useTypingIndicator** - Typing indicator with auto-debounce

## Setup

The providers are already integrated in `App.tsx`:

```tsx
<QueryClientProvider client={queryClient}>
  <BrowserRouter>
    <SocketProvider>
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </SocketProvider>
  </BrowserRouter>
</QueryClientProvider>
```

**Important:** `SocketProvider` is inside `BrowserRouter` but doesn't need to be inside `QueryClientProvider`. However, `NotificationProvider` should be inside `SocketProvider` as it depends on the socket connection.

## Usage Examples

### 1. Using Socket Connection

```tsx
import { useSocket } from '../contexts'

function MyComponent() {
  const { socket, connectionStatus, emit, joinRoom, leaveRoom } = useSocket()

  // Emit an event
  const handleAction = () => {
    emit('custom:event', { data: 'value' })
  }

  // Join a room
  useEffect(() => {
    joinRoom('room:123')
    return () => leaveRoom('room:123')
  }, [])

  return <div>Status: {connectionStatus}</div>
}
```

### 2. Listening to Events

```tsx
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useQueryClient } from '@tanstack/react-query'

function InboxPage() {
  const queryClient = useQueryClient()

  // Listen for new messages
  useSocketEvent('inbox:new_message', (data) => {
    console.log('New message:', data)
    queryClient.invalidateQueries({ queryKey: ['messages'] })
  })

  return <div>Inbox</div>
}
```

### 3. Using Notifications

```tsx
import { useNotifications } from '../contexts'

function NotificationBadge() {
  const { notifications, unreadCount, markAsRead } = useNotifications()

  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  )
}
```

### 4. Typing Indicator

```tsx
import { useTypingIndicator } from '../hooks/useTypingIndicator'

function ChatInput({ conversationId }) {
  const [message, setMessage] = useState('')
  const { emitTyping, typingUsers, isAnyoneTyping } = useTypingIndicator(conversationId)

  const handleChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      emitTyping(conversationId)
    }
  }

  return (
    <>
      <input value={message} onChange={handleChange} />
      {isAnyoneTyping && (
        <div>{typingUsers.map(u => u.userName).join(', ')} está digitando...</div>
      )}
    </>
  )
}
```

## Common Events

### Backend → Frontend (Listeners)

| Event | Description | Payload |
|-------|-------------|---------|
| `notification:new` | New notification received | `{ id, title, message, type, createdAt, data }` |
| `inbox:new_message` | New chat message | `{ conversationId, messageId, content, senderName }` |
| `inbox:message_read` | Message marked as read | `{ conversationId, messageId }` |
| `deal:created` | New deal created | `{ dealId, dealTitle, stageId }` |
| `deal:updated` | Deal updated | `{ dealId, changes }` |
| `deal:moved` | Deal moved to new stage | `{ dealId, dealTitle, newStageId, newStageName }` |
| `typing:start` | User started typing | `{ conversationId, userId, userName }` |
| `typing:stop` | User stopped typing | `{ conversationId, userId }` |
| `user:online` | User came online | `{ userId, userName }` |
| `user:offline` | User went offline | `{ userId }` |
| `activity:new` | New activity logged | `{ activityId, action, resourceType, userName }` |

### Frontend → Backend (Emitters)

| Event | Description | Payload |
|-------|-------------|---------|
| `join_room` | Join a room | `string` (room name) |
| `leave_room` | Leave a room | `string` (room name) |
| `typing` | Emit typing event | `{ conversationId }` |
| `typing:stop` | Stop typing | `{ conversationId }` |
| `message_read` | Mark message as read | `{ messageId }` |

## Room Conventions

Rooms are used to broadcast events to specific groups of users:

- `company:{companyId}` - All users in a company (auto-joined)
- `conversation:{conversationId}` - Users in a specific conversation
- `pipeline:{pipelineId}` - Users viewing a specific pipeline
- `form:{formId}` - Users collaborating on a form
- `user:{userId}` - Events for a specific user

## Connection Lifecycle

1. **Initialization**
   - Socket connects when user is authenticated
   - JWT token sent in auth handshake
   - Auto-joins company room

2. **Reconnection**
   - Auto-reconnects on connection loss
   - Max 5 attempts with exponential backoff
   - Re-joins all rooms after reconnection

3. **Disconnection**
   - Disconnects on logout
   - Cleanup on component unmount
   - All listeners removed

## Best Practices

### 1. Invalidate Queries on Real-time Updates

Always invalidate TanStack Query caches when receiving real-time updates:

```tsx
useSocketEvent('deal:updated', (data) => {
  queryClient.invalidateQueries({ queryKey: ['deals', data.dealId] })
})
```

### 2. Join/Leave Rooms Properly

Use `useEffect` cleanup to leave rooms:

```tsx
useEffect(() => {
  joinRoom(`pipeline:${pipelineId}`)
  return () => leaveRoom(`pipeline:${pipelineId}`)
}, [pipelineId])
```

### 3. Debounce Event Emissions

Use the `useTypingIndicator` hook instead of emitting manually - it has built-in debouncing.

### 4. Handle Connection States

Show loading/error states based on connection status:

```tsx
const { connectionStatus } = useSocket()

if (connectionStatus === 'disconnected') {
  return <div>Reconectando...</div>
}
```

### 5. Use Stable Callback References

The `useSocketEvent` hook uses `useRef` internally to prevent re-registering listeners. You don't need to wrap callbacks in `useCallback`.

## Debugging

### Enable Debug Logs

Socket logs are enabled in development mode (`import.meta.env.DEV`). Check browser console for:

- `[Socket.io]` - Connection events, emits, receives
- `[Notifications]` - Notification events

### Common Issues

1. **Socket not connecting**
   - Check if user is authenticated
   - Verify `VITE_API_URL` in `.env`
   - Check backend Socket.io server is running

2. **Events not received**
   - Verify room was joined correctly
   - Check event name matches backend
   - Ensure socket is connected (`connectionStatus === 'connected'`)

3. **Duplicate events**
   - Make sure listeners are cleaned up properly
   - Check if component is re-rendering unnecessarily

## Components

### NotificationBell

Pre-built notification dropdown with unread badge:

```tsx
import { NotificationBell } from '../components/NotificationBell'

<NotificationBell />
```

### SocketStatusIndicator

Shows connection status (useful in development):

```tsx
import { SocketStatusIndicator } from '../components/SocketStatusIndicator'

{import.meta.env.DEV && <SocketStatusIndicator />}
```

## Testing

To test Socket.io functionality:

1. Open app in two browser windows
2. Login as different users in same company
3. Perform actions (create deal, send message, etc.)
4. Verify real-time updates appear in both windows
5. Check browser console for event logs

## Performance Considerations

1. **Memory Leaks**
   - All listeners are automatically cleaned up
   - Rooms are left on component unmount
   - Socket disconnects on logout

2. **Reconnection**
   - Max 5 reconnection attempts
   - Exponential backoff (1s, 2s, 4s, 5s, 5s)
   - Auto-rejoin rooms after reconnect

3. **Event Throttling**
   - Typing events debounced to 1s by default
   - Use debouncing for frequent events

## Next Steps

To implement real-time features in a new module:

1. Listen to relevant events with `useSocketEvent`
2. Invalidate TanStack Query caches
3. Show toast notifications if needed
4. Join specific rooms if using room-based events
5. Emit events when user performs actions

See `src/examples/SocketExamples.tsx` for comprehensive usage examples.
