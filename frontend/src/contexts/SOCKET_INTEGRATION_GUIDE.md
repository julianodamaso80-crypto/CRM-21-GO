# Socket.io Integration Guide

## Quick Start

The Socket.io real-time functionality is now fully integrated into the frontend application. Here's how to use it:

### 1. Socket Connection is Automatic

The `SocketProvider` is already wrapped around your app in `App.tsx`. The socket will:
- Automatically connect when a user logs in
- Automatically disconnect when a user logs out
- Auto-join the company room: `company:{companyId}`
- Auto-reconnect if connection drops

### 2. Use in Components

#### Listen to Real-time Events

```tsx
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useQueryClient } from '@tanstack/react-query'

function DealsPage() {
  const queryClient = useQueryClient()

  // Listen for deal updates
  useSocketEvent('deal:updated', (data) => {
    queryClient.invalidateQueries({ queryKey: ['deals', data.dealId] })
  })

  return <div>Your deals page</div>
}
```

#### Emit Events

```tsx
import { useSocket } from '../contexts'

function MessageInput({ conversationId }) {
  const { emit } = useSocket()

  const handleSendMessage = (content: string) => {
    emit('message:send', { conversationId, content })
  }

  return <input onSubmit={(e) => handleSendMessage(e.target.value)} />
}
```

#### Typing Indicator

```tsx
import { useTypingIndicator } from '../hooks/useTypingIndicator'

function ChatInput({ conversationId }) {
  const [message, setMessage] = useState('')
  const { emitTyping, typingUsers, isAnyoneTyping } = useTypingIndicator(conversationId)

  return (
    <>
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          if (e.target.value.trim()) {
            emitTyping(conversationId)
          }
        }}
      />
      {isAnyoneTyping && (
        <div>{typingUsers.map(u => u.userName).join(', ')} digitando...</div>
      )}
    </>
  )
}
```

#### Notifications

```tsx
import { useNotifications } from '../contexts'

function Header() {
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

Or simply use the pre-built component:

```tsx
import { NotificationBell } from '../components/NotificationBell'

function Header() {
  return (
    <header>
      <NotificationBell />
    </header>
  )
}
```

### 3. Common Patterns

#### Pattern 1: Real-time List Updates

```tsx
function ContactsPage() {
  const queryClient = useQueryClient()

  // Invalidate query when contact is created/updated/deleted
  useSocketEvent('contact:created', () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
  })

  useSocketEvent('contact:updated', (data) => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
    queryClient.invalidateQueries({ queryKey: ['contacts', data.contactId] })
  })

  useSocketEvent('contact:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
  })

  return <div>Contacts list with real-time updates</div>
}
```

#### Pattern 2: Join/Leave Rooms

```tsx
function PipelinePage({ pipelineId }) {
  const { joinRoom, leaveRoom } = useSocket()

  useEffect(() => {
    // Join pipeline room
    joinRoom(`pipeline:${pipelineId}`)

    // Leave when component unmounts
    return () => {
      leaveRoom(`pipeline:${pipelineId}`)
    }
  }, [pipelineId, joinRoom, leaveRoom])

  // Now you'll receive events only for this pipeline
  useSocketEvent('deal:moved', (data) => {
    if (data.pipelineId === pipelineId) {
      // Handle deal moved
    }
  })

  return <div>Pipeline board</div>
}
```

#### Pattern 3: Optimistic Updates + Real-time

```tsx
function DealCard({ deal }) {
  const queryClient = useQueryClient()
  const updateDeal = useMutation({
    mutationFn: (data) => dealsService.update(deal.id, data),
    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['deals', deal.id] })
      const previous = queryClient.getQueryData(['deals', deal.id])
      queryClient.setQueryData(['deals', deal.id], newData)
      return { previous }
    },
    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(['deals', deal.id], context?.previous)
    },
  })

  // Real-time update from other users
  useSocketEvent('deal:updated', (data) => {
    if (data.dealId === deal.id) {
      queryClient.invalidateQueries({ queryKey: ['deals', deal.id] })
    }
  })

  return <div>Deal card</div>
}
```

### 4. Backend Events You Should Listen For

Based on the CRM architecture, here are the key events you'll want to listen for:

#### Deals/Pipeline (Kanban)
- `deal:created` - New deal added
- `deal:updated` - Deal details changed
- `deal:moved` - Deal moved to different stage
- `deal:deleted` - Deal removed

#### Inbox/Messages
- `inbox:new_message` - New message in conversation
- `inbox:message_read` - Message marked as read
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

#### Contacts/Leads
- `contact:created` - New contact added
- `contact:updated` - Contact updated
- `contact:deleted` - Contact removed
- `lead:created` - New lead created
- `lead:updated` - Lead updated
- `lead:converted` - Lead converted to deal

#### Notifications
- `notification:new` - New notification (auto-handled by NotificationProvider)

#### Presence
- `user:online` - User came online
- `user:offline` - User went offline

#### Activities
- `activity:new` - New activity logged

### 5. Add to AppLayout

You can add the notification bell and connection status to your main layout:

```tsx
// In src/components/layouts/AppLayout.tsx
import { NotificationBell } from '../NotificationBell'
import { SocketStatusIndicator } from '../SocketStatusIndicator'

export function AppLayout({ children }) {
  return (
    <div>
      <header>
        {/* Other header items */}
        <NotificationBell />
        {import.meta.env.DEV && <SocketStatusIndicator />}
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### 6. Testing

To test Socket.io functionality:

1. Open the app in two browser windows/tabs
2. Login as different users (or same user in different sessions)
3. Perform an action in one window (e.g., create a deal)
4. Verify the update appears in real-time in the other window
5. Check browser console for `[Socket.io]` logs (DEV mode only)

### 7. Debugging

If events are not being received:

1. Check connection status:
   ```tsx
   const { connectionStatus } = useSocket()
   console.log('Socket status:', connectionStatus)
   ```

2. Verify you're in the right room:
   - Company room is auto-joined: `company:{companyId}`
   - Other rooms must be manually joined with `joinRoom()`

3. Check browser console for Socket.io logs:
   - Connection events
   - Emit events
   - Received events

4. Verify backend is emitting events correctly

### 8. Performance Tips

1. **Don't create too many listeners**: Use `useSocketEvent` at the page/feature level, not in individual list items

2. **Debounce typing events**: The `useTypingIndicator` hook has built-in debouncing

3. **Invalidate queries selectively**: Don't invalidate all queries, target specific ones:
   ```tsx
   // Good
   queryClient.invalidateQueries({ queryKey: ['deals', dealId] })

   // Bad (invalidates everything)
   queryClient.invalidateQueries()
   ```

4. **Leave rooms when done**: Always clean up in useEffect return:
   ```tsx
   useEffect(() => {
     joinRoom('my-room')
     return () => leaveRoom('my-room')
   }, [])
   ```

## Next Steps

1. Add NotificationBell to AppLayout header
2. Implement real-time updates in Inbox/Chat page
3. Add real-time updates to Kanban board (deal moves)
4. Implement typing indicators in conversations
5. Add presence indicators (online/offline) to user avatars
6. Real-time dashboard stats updates

See `SOCKET_README.md` for detailed API documentation and `examples/SocketExamples.tsx` for comprehensive code examples.
