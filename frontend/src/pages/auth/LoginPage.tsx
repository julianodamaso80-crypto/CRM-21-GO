import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'
import { authService } from '../../services/auth.service'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setError('')
    setLoading(true)

    try {
      const response = await authService.login({ email: email.trim(), password })
      setAuth(response.user, response.token, response.refreshToken)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou senha invalidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">CRM IA</h1>
          <p className="text-sm text-gray-400 mt-1">Entre na sua conta</p>
        </div>

        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@crm.com"
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          admin@crm.com / Admin123!
        </p>
      </div>
    </div>
  )
}
