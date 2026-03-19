import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogIn, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-blue/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-sm w-full relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-gold flex items-center justify-center shadow-glow-gold-lg mb-5">
            <span className="text-dark-900 font-display font-bold text-2xl">21</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">21Go CRM</h1>
          <p className="text-sm text-gray-400 mt-2">Plataforma de gestao inteligente</p>
        </div>

        {/* Form Card */}
        <div className="card-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="seu@email.com"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
