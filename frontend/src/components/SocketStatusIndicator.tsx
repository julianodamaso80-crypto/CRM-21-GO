import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useSocket } from '../contexts'

/**
 * Socket Connection Status Indicator
 *
 * Displays the current Socket.io connection status.
 * Useful for debugging or showing in development mode.
 *
 * @example
 * ```tsx
 * // Show only in development
 * {import.meta.env.DEV && <SocketStatusIndicator />}
 * ```
 */
export function SocketStatusIndicator() {
  const { connectionStatus } = useSocket()

  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Conectado',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    connecting: {
      icon: Loader2,
      text: 'Conectando...',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      animate: true,
    },
    disconnected: {
      icon: WifiOff,
      text: 'Desconectado',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  }

  const config = statusConfig[connectionStatus]
  const Icon = config.icon
  const animate = 'animate' in config ? config.animate : false

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon
        className={`w-4 h-4 ${config.color} ${animate ? 'animate-spin' : ''}`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  )
}
