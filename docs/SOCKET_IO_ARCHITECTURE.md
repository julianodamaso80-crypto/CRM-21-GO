# Socket.io Architecture - CRM Frontend

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Application                            │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                          App.tsx                               │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │          QueryClientProvider (TanStack Query)           │ │ │
│  │  │                                                          │ │ │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │ │
│  │  │  │              BrowserRouter                         │ │ │ │
│  │  │  │                                                    │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │      SocketProvider                          │ │ │ │ │
│  │  │  │  │  - Manages WebSocket connection              │ │ │ │ │
│  │  │  │  │  - JWT authentication                        │ │ │ │ │
│  │  │  │  │  - Auto-reconnect                            │ │ │ │ │
│  │  │  │  │  - Room management                           │ │ │ │ │
│  │  │  │  │                                              │ │ │ │ │
│  │  │  │  │  ┌────────────────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │    NotificationProvider                │ │ │ │ │ │
│  │  │  │  │  │  - Listens: notification:new           │ │ │ │ │ │
│  │  │  │  │  │  - Shows toast notifications          │ │ │ │ │ │
│  │  │  │  │  │  - Manages notification state         │ │ │ │ │ │
│  │  │  │  │  │  - Unread count tracking              │ │ │ │ │ │
│  │  │  │  │  │                                        │ │ │ │ │ │
│  │  │  │  │  │  ┌──────────────────────────────────┐ │ │ │ │ │ │
│  │  │  │  │  │  │         Router                   │ │ │ │ │ │ │
│  │  │  │  │  │  │  - Routes to pages               │ │ │ │ │ │ │
│  │  │  │  │  │  │                                  │ │ │ │ │ │ │
│  │  │  │  │  │  │  Pages:                          │ │ │ │ │ │ │
│  │  │  │  │  │  │  - DashboardPage                 │ │ │ │ │ │ │
│  │  │  │  │  │  │  - ContactsPage                  │ │ │ │ │ │ │
│  │  │  │  │  │  │  - DealsPage (Kanban)            │ │ │ │ │ │ │
│  │  │  │  │  │  │  - InboxPage (Chat)              │ │ │ │ │ │ │
│  │  │  │  │  │  │                                  │ │ │ │ │ │ │
│  │  │  │  │  │  └──────────────────────────────────┘ │ │ │ │ │ │
│  │  │  │  │  │                                        │ │ │ │ │ │
│  │  │  │  │  └────────────────────────────────────────┘ │ │ │ │ │
│  │  │  │  │                                              │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────────┘ │ │ │ │
│  │  │  │                                                    │ │ │ │
│  │  │  └────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                          │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

                              │
                              │ WebSocket (Socket.io)
                              │ Auth: JWT Token
                              ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       Backend Socket.io Server                        │
│                       (localhost:3333)                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Connection Handler                                             ││
│  │  - Verify JWT token                                             ││
│  │  - Store socket with userId                                     ││
│  │  - Auto-join: company:{companyId}                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Event Emitters (when data changes)                            ││
│  │  - deal:created, deal:updated, deal:moved                      ││
│  │  - inbox:new_message, inbox:message_read                       ││
│  │  - contact:created, contact:updated                            ││
│  │  - notification:new                                            ││
│  │  - typing:start, typing:stop                                   ││
│  │  - user:online, user:offline                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  Room Management                                                ││
│  │  - Company rooms: company:{companyId}                          ││
│  │  - Conversation rooms: conversation:{conversationId}           ││
│  │  - Pipeline rooms: pipeline:{pipelineId}                       ││
│  │  - User rooms: user:{userId}                                   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
└── QueryClientProvider
    └── BrowserRouter
        └── SocketProvider ────────────┐
            └── NotificationProvider ──┤
                └── Router             │
                    └── Pages          │
                                       │
                                       │
┌──────────────────────────────────────┘
│
│ Provides to all children:
│
├── useSocket()
│   ├── socket: Socket | null
│   ├── connectionStatus: 'connected' | 'connecting' | 'disconnected'
│   ├── emit(event, data)
│   ├── joinRoom(room)
│   └── leaveRoom(room)
│
└── useNotifications()
    ├── notifications: Notification[]
    ├── unreadCount: number
    ├── markAsRead(id)
    ├── markAllAsRead()
    └── clearNotifications()
```

## Custom Hooks

```
useSocketEvent(eventName, callback)
├── Subscribes to Socket.io event
├── Auto-cleanup on unmount
├── Stable callback reference
└── Only active when socket is connected

useTypingIndicator(conversationId, options)
├── emitTyping(conversationId) - debounced
├── typingUsers: TypingUser[]
├── isAnyoneTyping: boolean
└── Auto-cleanup on timeout
```

## Data Flow

### 1. Notification Flow

```
Backend Event                Frontend Reception
─────────────                ──────────────────

User A creates deal    ──┐
                         │
Backend emits:           │
notification:new ────────┼──▶ NotificationProvider listens
{                        │    ├── Adds to notifications state
  id: '123',             │    ├── Shows toast (Sonner)
  title: 'New Deal',     │    └── Updates unreadCount
  message: '...',        │
  type: 'success'        │
}                        │
                         │
                         └──▶ NotificationBell component
                              └── Shows badge with count
```

### 2. Real-time Update Flow

```
User Action              Backend                  Other Clients
───────────              ───────                  ─────────────

User A moves deal    ──▶ API: PUT /deals/:id ──▶ Database updated
                                                       │
                                                       ▼
                                         Socket.io emits to room:
                                         io.to('pipeline:123')
                                           .emit('deal:moved', data)
                                                       │
                                                       ▼
                         ┌─────────────────────────────┘
                         │
User B (listening) ◀─────┘
useSocketEvent('deal:moved', (data) => {
  queryClient.invalidateQueries(['deals'])
})
                         │
                         ▼
                    React Query refetches
                         │
                         ▼
                    UI updates with new data
```

### 3. Typing Indicator Flow

```
User A types                 Backend                    User B
────────────                 ───────                    ──────

onChange event
      │
      ▼
emitTyping(convId) ──▶ emit('typing', { convId })
(debounced 1s)                │
                              ▼
                    Broadcast to room:
                    io.to('conversation:123')
                      .emit('typing:start', {
                        userId, userName
                      })
                              │
                              └──────────────────▶ useTypingIndicator
                                                   ├── Updates typingUsers
                                                   └── Shows indicator

After 1s of no typing:
emit('typing:stop') ──▶ io.to('conversation:123')
                           .emit('typing:stop')
                                                   └──▶ Removes from list
```

## Connection Lifecycle

```
1. User Logs In
   └── authStore.setAuth(user, token)
       └── SocketProvider detects isAuthenticated=true
           └── Creates socket connection
               ├── Auth: { token: jwt }
               └── Auto-reconnect enabled

2. Connection Established
   └── socket.on('connect')
       ├── Set connectionStatus='connected'
       ├── Auto-join: company:{companyId}
       └── Ready to emit/receive events

3. User Navigates to Page
   └── Component mounts
       ├── useSocketEvent registers listeners
       └── joinRoom('pipeline:123')

4. User Leaves Page
   └── Component unmounts
       ├── useSocketEvent cleanup (removes listeners)
       └── leaveRoom('pipeline:123')

5. Connection Lost
   └── socket.on('disconnect')
       ├── Set connectionStatus='disconnected'
       └── Auto-reconnect attempts (max 5)
           ├── Attempt 1: wait 1s
           ├── Attempt 2: wait 2s
           ├── Attempt 3: wait 4s
           ├── Attempt 4: wait 5s
           └── Attempt 5: wait 5s

6. Reconnected
   └── socket.on('reconnect')
       ├── Set connectionStatus='connected'
       └── Re-join all rooms
           └── company:{companyId}

7. User Logs Out
   └── authStore.clearAuth()
       └── SocketProvider detects isAuthenticated=false
           └── socket.disconnect()
               └── Set connectionStatus='disconnected'
```

## Room Strategy

```
Room Type                Who Joins                     Events
─────────                ─────────                     ──────

company:{companyId}      All users (auto)              - Company-wide notifications
                                                       - User online/offline
                                                       - Global announcements

conversation:{id}        Users viewing conversation    - New messages
                                                       - Typing indicators
                                                       - Message read

pipeline:{pipelineId}    Users viewing pipeline        - Deal created/updated/moved
                                                       - Stage changes

form:{formId}            Users editing form            - Field updates
                                                       - User joined/left

user:{userId}            Individual user (auto)        - Direct notifications
                                                       - Personal events
```

## Event Naming Convention

```
Category:Action          Example                       Direction
───────────────          ───────                       ─────────

resource:created         deal:created                  Backend → Frontend
resource:updated         contact:updated               Backend → Frontend
resource:deleted         lead:deleted                  Backend → Frontend
resource:moved           deal:moved                    Backend → Frontend

feature:event            inbox:new_message             Backend → Frontend
feature:action           inbox:message_read            Backend → Frontend

action:state             typing:start                  Backend → Frontend
action:state             typing:stop                   Backend → Frontend

user:status              user:online                   Backend → Frontend
user:status              user:offline                  Backend → Frontend

category:new             notification:new              Backend → Frontend
category:update          stats:updated                 Backend → Frontend

Client → Backend:
action                   typing                        Frontend → Backend
action                   message_read                  Frontend → Backend
join_room                join_room                     Frontend → Backend
leave_room               leave_room                    Frontend → Backend
```

## State Management Integration

```
TanStack Query (Server State)     ←──────┐
├── Queries                               │
│   ├── ['contacts']                      │
│   ├── ['deals']                         │
│   └── ['messages', convId]              │
└── Mutations                             │ Invalidate on
    ├── createDeal()                      │ Socket events
    ├── updateContact()                   │
    └── sendMessage()                     │
                                          │
Socket.io Events                 ─────────┘
├── deal:created        → invalidateQueries(['deals'])
├── contact:updated     → invalidateQueries(['contacts', id])
└── inbox:new_message   → invalidateQueries(['messages', convId])


Zustand (Client State)
├── authStore
│   ├── user
│   ├── token ──────────┐
│   └── isAuthenticated │
│                       │
└── (Socket reads) ◀────┘


React Context (Real-time State)
├── SocketContext
│   ├── socket
│   ├── connectionStatus
│   └── helpers (emit, joinRoom, leaveRoom)
│
└── NotificationContext
    ├── notifications (in-memory)
    └── unreadCount
```

## Performance Optimizations

1. **Debouncing**
   - Typing events: 1000ms
   - Prevents event spam

2. **Selective Invalidation**
   ```tsx
   // Good
   queryClient.invalidateQueries({ queryKey: ['deals', dealId] })

   // Bad
   queryClient.invalidateQueries()
   ```

3. **Room Management**
   - Only join rooms when needed
   - Leave rooms on unmount
   - Auto-join only company room

4. **Listener Cleanup**
   - Auto-cleanup on unmount
   - Prevents memory leaks
   - No duplicate listeners

5. **Reconnection Limits**
   - Max 5 attempts
   - Exponential backoff
   - Prevents infinite loops

## Security

1. **Authentication**
   - JWT token in auth handshake
   - Server validates token
   - Socket associated with userId

2. **Authorization**
   - Backend checks permissions
   - Room-based access control
   - Company-level isolation

3. **Data Validation**
   - Backend validates all events
   - Frontend validates received data
   - Type safety with TypeScript

## Monitoring

```
Development Mode (import.meta.env.DEV):
├── [Socket.io] Connection established
├── [Socket.io] Joined room: company:123
├── [Socket.io] Event received: deal:created {...}
├── [Socket.io] Emitting event: typing {...}
├── [Notifications] New notification received {...}
└── [Notifications] Marked notification as read: 123

Production Mode:
└── (All logs disabled)
```

## Error Handling

```
Connection Errors
├── connect_error
│   └── Log error, set status='disconnected'
├── reconnect_error
│   └── Log error, continue attempts
└── reconnect_failed
    └── Log error, stop attempts

Event Errors
├── Try-catch in event handlers
├── Log error to console (dev)
└── Continue execution (don't crash app)
```

This architecture ensures:
- ✅ Real-time updates across all users
- ✅ Automatic reconnection
- ✅ Type safety
- ✅ Performance optimization
- ✅ Security
- ✅ Developer experience
