import { useEffect, useRef } from 'react'
import { useSocket } from '../contexts/SocketContext'

type SocketEventCallback = (data: any) => void

/**
 * Generic hook for listening to Socket.io events
 *
 * @param event - The event name to listen to
 * @param callback - Callback function to execute when event is received
 *
 * @example
 * ```tsx
 * useSocketEvent('inbox:new_message', (data) => {
 *   console.log('New message:', data)
 *   // Invalidate queries, update state, etc.
 * })
 * ```
 */
export function useSocketEvent(event: string, callback: SocketEventCallback): void {
  const { socket, connectionStatus } = useSocket()
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!socket || connectionStatus !== 'connected') {
      return
    }

    const handler = (data: any) => {
      callbackRef.current(data)
    }

    socket.on(event, handler)

    // Cleanup listener on unmount or when event/socket changes
    return () => {
      socket.off(event, handler)
    }
  }, [socket, connectionStatus, event])
}
