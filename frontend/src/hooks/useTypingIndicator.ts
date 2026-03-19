import { useCallback, useRef, useEffect, useState } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useSocketEvent } from './useSocketEvent'

interface TypingUser {
  userId: string
  userName: string
}

interface UseTypingIndicatorOptions {
  debounceMs?: number
  onTyping?: (users: TypingUser[]) => void
}

interface UseTypingIndicatorReturn {
  emitTyping: (conversationId: string) => void
  typingUsers: TypingUser[]
  isAnyoneTyping: boolean
}

/**
 * Hook for managing typing indicators in conversations
 *
 * @param conversationId - The conversation ID to track typing for
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { emitTyping, typingUsers, isAnyoneTyping } = useTypingIndicator('conv-123', {
 *   debounceMs: 1000,
 *   onTyping: (users) => console.log('Users typing:', users)
 * })
 *
 * // In textarea onChange:
 * const handleChange = (e) => {
 *   setValue(e.target.value)
 *   emitTyping('conv-123')
 * }
 * ```
 */
export function useTypingIndicator(
  conversationId: string | null,
  options: UseTypingIndicatorOptions = {}
): UseTypingIndicatorReturn {
  const { debounceMs = 1000, onTyping } = options
  const { emit } = useSocket()
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastEmitRef = useRef<number>(0)

  // Emit typing event with debounce
  const emitTyping = useCallback((convId: string) => {
    const now = Date.now()
    const timeSinceLastEmit = now - lastEmitRef.current

    // Only emit if enough time has passed since last emit
    if (timeSinceLastEmit >= debounceMs) {
      emit('typing', { conversationId: convId })
      lastEmitRef.current = now

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Auto-stop typing after debounce period
      timeoutRef.current = setTimeout(() => {
        emit('typing:stop', { conversationId: convId })
      }, debounceMs)
    }
  }, [emit, debounceMs])

  // Listen for typing events from other users
  useSocketEvent('typing:start', (data) => {
    if (data.conversationId === conversationId) {
      setTypingUsers(prev => {
        // Don't add if already in list
        if (prev.some(u => u.userId === data.userId)) {
          return prev
        }
        return [...prev, { userId: data.userId, userName: data.userName }]
      })
    }
  })

  // Listen for typing stop events
  useSocketEvent('typing:stop', (data) => {
    if (data.conversationId === conversationId) {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    }
  })

  // Auto-remove typing users after timeout (in case stop event is missed)
  useEffect(() => {
    if (typingUsers.length === 0) {
      return
    }

    const timeout = setTimeout(() => {
      setTypingUsers([])
    }, debounceMs + 2000) // Extra 2s buffer

    return () => clearTimeout(timeout)
  }, [typingUsers, debounceMs])

  // Call onTyping callback when typing users change
  useEffect(() => {
    if (onTyping) {
      onTyping(typingUsers)
    }
  }, [typingUsers, onTyping])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    emitTyping,
    typingUsers,
    isAnyoneTyping: typingUsers.length > 0,
  }
}
