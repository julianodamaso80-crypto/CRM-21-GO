import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { useSocket } from './SocketContext'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  data?: any
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const isDev = import.meta.env.DEV

function log(...args: any[]) {
  if (isDev) {
    console.log('[Notifications]', ...args)
  }
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { socket, connectionStatus } = useSocket()

  const unreadCount = notifications.filter(n => !n.read).length

  // Listen for new notifications
  useEffect(() => {
    if (!socket || connectionStatus !== 'connected') {
      return
    }

    const handleNotification = (data: any) => {
      log('New notification received:', data)

      const notification: Notification = {
        id: data.id || crypto.randomUUID(),
        title: data.title || 'Notificação',
        message: data.message || '',
        type: data.type || 'info',
        read: false,
        createdAt: data.createdAt || new Date().toISOString(),
        data: data.data,
      }

      // Add to state
      setNotifications(prev => [notification, ...prev])

      // Show toast
      const toastConfig = {
        description: notification.message,
        icon: <Bell className="w-4 h-4" />,
      }

      switch (notification.type) {
        case 'success':
          toast.success(notification.title, toastConfig)
          break
        case 'warning':
          toast.warning(notification.title, toastConfig)
          break
        case 'error':
          toast.error(notification.title, toastConfig)
          break
        default:
          toast.info(notification.title, toastConfig)
      }
    }

    socket.on('notification:new', handleNotification)

    log('Notification listener registered')

    return () => {
      socket.off('notification:new', handleNotification)
      log('Notification listener removed')
    }
  }, [socket, connectionStatus])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    log('Marked notification as read:', notificationId)
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    log('Marked all notifications as read')
  }, [])

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
    log('Cleared all notifications')
  }, [])

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to access notifications
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
