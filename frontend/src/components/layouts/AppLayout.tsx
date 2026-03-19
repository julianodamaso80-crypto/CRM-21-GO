import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, MessageSquare, UserCircle2, Brain,
  LayoutGrid, LogOut, Webhook, Zap, CreditCard, BarChart3,
  SmilePlus, Car, FileText, AlertTriangle, Gift, Link2,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
        ? 'bg-primary-500/15 text-primary-200 font-medium'
        : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
    }`

  return (
    <div className="flex h-screen bg-dark-900">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h1 className="text-lg font-bold text-white">21Go CRM</h1>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link to="/" className={linkClass('/')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider pt-4 pb-1 px-3">Associados</p>
          <Link to="/associados" className={linkClass('/associados')}>
            <Users size={20} />
            <span>Associados</span>
          </Link>
          <Link to="/vehicles" className={linkClass('/vehicles')}>
            <Car size={20} />
            <span>Veiculos</span>
          </Link>
          <Link to="/nps" className={linkClass('/nps')}>
            <SmilePlus size={20} />
            <span>Satisfacao (NPS)</span>
          </Link>
          <Link to="/indicacoes" className={linkClass('/indicacoes')}>
            <Gift size={20} />
            <span>Indicacoes (MGM)</span>
          </Link>

          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider pt-4 pb-1 px-3">Comercial</p>
          <Link to="/leads" className={linkClass('/leads')}>
            <UserCircle2 size={20} />
            <span>Leads</span>
          </Link>
          <Link to="/cotacoes" className={linkClass('/cotacoes')}>
            <FileText size={20} />
            <span>Cotacoes</span>
          </Link>
          <Link to="/sinistros" className={linkClass('/sinistros')}>
            <AlertTriangle size={20} />
            <span>Sinistros</span>
          </Link>
          <Link to="/pipes" className={linkClass('/pipes')}>
            <LayoutGrid size={20} />
            <span>Funil de Vendas</span>
          </Link>
          <Link to="/analytics" className={linkClass('/analytics')}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>

          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider pt-4 pb-1 px-3">Comunicacao</p>
          <Link to="/inbox" className={linkClass('/inbox')}>
            <MessageSquare size={20} />
            <span>Inbox</span>
          </Link>

          <p className="text-xs font-semibold text-dark-500 uppercase tracking-wider pt-4 pb-1 px-3">Ferramentas</p>
          <Link to="/ai" className={linkClass('/ai')}>
            <Brain size={20} />
            <span>IA & Treinamento</span>
          </Link>
          <Link to="/automations" className={linkClass('/automations')}>
            <Zap size={20} />
            <span>Automacoes</span>
          </Link>
          <Link to="/webhooks" className={linkClass('/webhooks')}>
            <Webhook size={20} />
            <span>Webhooks</span>
          </Link>
          <Link to="/hinova" className={linkClass('/hinova')}>
            <Link2 size={20} />
            <span>Hinova (SGA)</span>
          </Link>

          <div className="border-t border-dark-700 mt-3 pt-3">
            <Link to="/billing" className={linkClass('/billing')}>
              <CreditCard size={20} />
              <span>Financeiro</span>
            </Link>
          </div>
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-3 border-t border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-medium text-primary-200 flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Sair" className="p-1.5 text-gray-500 hover:text-red-400 rounded">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
