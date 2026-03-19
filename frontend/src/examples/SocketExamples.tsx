/**
 * Socket.io Usage Examples
 *
 * This file demonstrates how to use the Socket.io real-time features
 * in different scenarios throughout the CRM application.
 */

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSocket } from '../contexts/SocketContext'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useTypingIndicator } from '../hooks/useTypingIndicator'

// ============================================================================
// Example 1: Real-time Inbox Messages
// ============================================================================

export function InboxExample() {
  const queryClient = useQueryClient()

  // Listen for new messages and invalidate the messages query
  useSocketEvent('inbox:new_message', (data) => {
    console.log('New message received:', data)

    // Invalidate queries to refetch
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] })

    // Show toast notification
    toast.success('Nova mensagem', {
      description: `${data.senderName}: ${data.content}`,
    })
  })

  // Listen for message read events
  useSocketEvent('inbox:message_read', (data) => {
    console.log('Message read:', data)
    queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] })
  })

  return <div>Inbox with real-time updates</div>
}

// ============================================================================
// Example 2: Typing Indicator in Chat
// ============================================================================

export function ChatWithTypingIndicator({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState('')

  const { emitTyping, typingUsers, isAnyoneTyping } = useTypingIndicator(conversationId, {
    debounceMs: 1000,
  })

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      emitTyping(conversationId)
    }
  }

  return (
    <div>
      <textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Digite sua mensagem..."
      />

      {isAnyoneTyping && (
        <div className="text-sm text-gray-500">
          {typingUsers.map(u => u.userName).join(', ')}{' '}
          {typingUsers.length === 1 ? 'está digitando...' : 'estão digitando...'}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 3: Real-time Deal Updates (Kanban)
// ============================================================================

export function KanbanDealUpdates() {
  const queryClient = useQueryClient()

  // Listen for deal moved events
  useSocketEvent('deal:moved', (data) => {
    console.log('Deal moved:', data)

    // Invalidate pipeline/stages queries
    queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    queryClient.invalidateQueries({ queryKey: ['stages'] })
    queryClient.invalidateQueries({ queryKey: ['deals'] })

    toast.info('Negócio movido', {
      description: `${data.dealTitle} foi movido para ${data.newStageName}`,
    })
  })

  // Listen for new deal created
  useSocketEvent('deal:created', (data) => {
    console.log('New deal:', data)
    queryClient.invalidateQueries({ queryKey: ['deals'] })
    toast.success('Novo negócio criado', {
      description: data.dealTitle,
    })
  })

  // Listen for deal updated
  useSocketEvent('deal:updated', (data) => {
    console.log('Deal updated:', data)
    queryClient.invalidateQueries({ queryKey: ['deals', data.dealId] })
  })

  return <div>Kanban board with real-time updates</div>
}

// ============================================================================
// Example 4: Join/Leave Specific Rooms
// ============================================================================

export function ConversationRoom({ conversationId }: { conversationId: string }) {
  const { joinRoom, leaveRoom } = useSocket()

  useEffect(() => {
    // Join conversation room when component mounts
    joinRoom(`conversation:${conversationId}`)

    // Leave room when component unmounts
    return () => {
      leaveRoom(`conversation:${conversationId}`)
    }
  }, [conversationId, joinRoom, leaveRoom])

  return <div>Joined conversation room</div>
}

// ============================================================================
// Example 5: Emit Custom Events
// ============================================================================

export function EmitEventExample() {
  const { emit } = useSocket()

  const handleMarkAsRead = (messageId: string) => {
    // Emit message read event
    emit('message_read', { messageId })
  }

  const handleStartTyping = (conversationId: string) => {
    // Emit typing event
    emit('typing', { conversationId })
  }

  const handleJoinVideoCall = (callId: string) => {
    // Emit custom event
    emit('call:join', { callId })
  }

  return (
    <div>
      <button onClick={() => handleMarkAsRead('msg-123')}>Mark as Read</button>
      <button onClick={() => handleStartTyping('conv-456')}>Start Typing</button>
      <button onClick={() => handleJoinVideoCall('call-789')}>Join Call</button>
    </div>
  )
}

// ============================================================================
// Example 6: Real-time Activity Feed
// ============================================================================

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])

  // Listen for new activities
  useSocketEvent('activity:new', (data) => {
    console.log('New activity:', data)
    setActivities(prev => [data, ...prev])
  })

  return (
    <div>
      <h3>Activity Feed</h3>
      {activities.map((activity, index) => (
        <div key={index}>
          {activity.userName} {activity.action} {activity.resourceType}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// Example 7: Real-time Dashboard Stats
// ============================================================================

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalDeals: 0,
    totalRevenue: 0,
    activeUsers: 0,
  })

  // Listen for stats updates
  useSocketEvent('stats:updated', (data) => {
    console.log('Stats updated:', data)
    setStats(data)
  })

  return (
    <div>
      <div>Total Deals: {stats.totalDeals}</div>
      <div>Total Revenue: ${stats.totalRevenue}</div>
      <div>Active Users: {stats.activeUsers}</div>
    </div>
  )
}

// ============================================================================
// Example 8: Presence (Online/Offline Status)
// ============================================================================

export function UserPresence({ userId }: { userId: string }) {
  const [isOnline, setIsOnline] = useState(false)

  useSocketEvent('user:online', (data) => {
    if (data.userId === userId) {
      setIsOnline(true)
    }
  })

  useSocketEvent('user:offline', (data) => {
    if (data.userId === userId) {
      setIsOnline(false)
    }
  })

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  )
}

// ============================================================================
// Example 9: Real-time Form Collaboration
// ============================================================================

export function CollaborativeForm({ formId }: { formId: string }) {
  const { emit, joinRoom, leaveRoom } = useSocket()
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    joinRoom(`form:${formId}`)

    return () => {
      leaveRoom(`form:${formId}`)
    }
  }, [formId, joinRoom, leaveRoom])

  useSocketEvent('form:user_joined', (data) => {
    if (data.formId === formId) {
      setActiveUsers(prev => [...prev, data.userName])
    }
  })

  useSocketEvent('form:user_left', (data) => {
    if (data.formId === formId) {
      setActiveUsers(prev => prev.filter(u => u !== data.userName))
    }
  })

  useSocketEvent('form:field_updated', (data) => {
    if (data.formId === formId) {
      toast.info(`${data.userName} atualizou ${data.fieldName}`)
    }
  })

  const handleFieldChange = (fieldName: string, value: any) => {
    emit('form:update_field', { formId, fieldName, value })
  }

  return (
    <div>
      <div>
        Usuários ativos: {activeUsers.join(', ')}
      </div>
      <div>
        <input
          onChange={(e) => handleFieldChange('exampleField', e.target.value)}
          placeholder="Example field"
        />
      </div>
    </div>
  )
}
