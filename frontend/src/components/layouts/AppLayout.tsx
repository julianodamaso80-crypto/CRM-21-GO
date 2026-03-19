import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, MessageSquare, UserCircle2, Brain,
  LayoutGrid, LogOut, Webhook, Zap, CreditCard, BarChart3,
  SmilePlus, Car, FileText, AlertTriangle, Gift, Link2,
  Search, Bell, ChevronDown, ClipboardList, Settings,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth-store'
import { useState } from 'react'

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Associados',
    items: [
      { path: '/associados', icon: Users, label: 'Associados' },
      { path: '/vehicles', icon: Car, label: 'Veiculos' },
      { path: '/nps', icon: SmilePlus, label: 'Satisfacao (NPS)' },
      { path: '/indicacoes', icon: Gift, label: 'Indicacoes (MGM)' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { path: '/leads', icon: UserCircle2, label: 'Leads' },
      { path: '/cotacoes', icon: FileText, label: 'Cotacoes' },
      { path: '/sinistros', icon: AlertTriangle, label: 'Sinistros' },
      { path: '/pipes', icon: LayoutGrid, label: 'Funil de Vendas' },
      { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    label: 'Comunicacao',
    items: [
      { path: '/inbox', icon: MessageSquare, label: 'Inbox' },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/ai', icon: Brain, label: 'IA & Treinamento' },
      { path: '/automations', icon: Zap, label: 'Automacoes' },
      { path: '/webhooks', icon: Webhook, label: 'Webhooks' },
      { path: '/hinova', icon: Link2, label: 'Hinova (SGA)' },
      { path: '/projects', icon: ClipboardList, label: 'Projetos', roles: ['gestor', 'admin'] },
    ],
  },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [searchFocused, setSearchFocused] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <div className="flex h-screen bg-dark-950">
      {/* ═══ Sidebar ═══ */}
      <aside className="w-[260px] bg-dark-900/80 border-r border-dark-700/40 flex flex-col backdrop-blur-md shadow-sidebar">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-dark-700/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-glow-gold">
              <span className="text-dark-900 font-display font-bold text-sm">21</span>
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-white tracking-tight">21Go</h1>
              <p className="text-[10px] text-gold-500/70 font-medium tracking-widest uppercase">CRM Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-[0.15em] pt-5 pb-2 px-3">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={active ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                  >
                    <Icon size={18} className={active ? 'text-gold-400' : ''} />
                    <span>{item.label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}

          {/* Financeiro separado */}
          <div className="border-t border-dark-700/30 mt-4 pt-4">
            <Link
              to="/billing"
              className={isActive('/billing') ? 'sidebar-link-active' : 'sidebar-link-inactive'}
            >
              <CreditCard size={18} className={isActive('/billing') ? 'text-gold-400' : ''} />
              <span>Financeiro</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-dark-700/30">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-dark-700/30 transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/20 flex items-center justify-center text-xs font-semibold text-gold-400 flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-dark-700/30 bg-dark-900/40 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0">
          {/* Search */}
          <div className={`relative transition-all duration-300 ${searchFocused ? 'w-96' : 'w-72'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-3 py-2 bg-dark-800/40 border border-dark-700/40 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-dark-700/50 px-1.5 py-0.5 rounded-md border border-dark-600/30 font-mono">
              /
            </kbd>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-dark-700/40 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
            </button>
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-dark-700/40 transition-colors">
              <Settings size={18} />
            </button>
            <div className="w-px h-6 bg-dark-700/40 mx-1" />
            <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-dark-700/40 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/20 flex items-center justify-center text-[11px] font-semibold text-gold-400">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="text-sm text-gray-300 font-medium">{user?.firstName}</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
