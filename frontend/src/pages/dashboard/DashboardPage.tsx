import { Link } from 'react-router-dom'
import {
  Users, Car, Loader2, ArrowRight, TrendingUp,
  ShieldCheck, Target, MessageSquare, Bot, Zap,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboardStats } from '../../hooks/useDashboard'

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Erro ao carregar dados do dashboard.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Visao geral da 21Go Protecao Veicular</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <KpiCard
          icon={<Users className="w-5 h-5 text-gold-400" />}
          label="Associados"
          value={stats.contacts.total}
          sub={`${stats.contacts.ativos || 0} ativos`}
          bgColor="bg-gold-500/10"
          link="/associados"
        />
        <KpiCard
          icon={<Car className="w-5 h-5 text-accent-blue" />}
          label="Veiculos"
          value={stats.ai?.totalAgents || 0}
          sub="protegidos"
          bgColor="bg-accent-blue/10"
          link="/vehicles"
        />
        <KpiCard
          icon={<Target className="w-5 h-5 text-accent-emerald" />}
          label="Leads"
          value={stats.pipes?.totalCards || 0}
          sub="no funil"
          bgColor="bg-accent-emerald/10"
          link="/leads"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5 text-accent-amber" />}
          label="Pipes"
          value={stats.pipes?.total || 0}
          sub={`${stats.pipes?.doneCards || 0} cards concluidos`}
          bgColor="bg-accent-amber/10"
          link="/pipes"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Acesso Rapido</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink icon={<Users size={18} />} label="Associados" to="/associados" color="text-gold-400 bg-gold-500/10" />
            <QuickLink icon={<Car size={18} />} label="Veiculos" to="/vehicles" color="text-accent-blue bg-accent-blue/10" />
            <QuickLink icon={<Target size={18} />} label="Leads" to="/leads" color="text-accent-emerald bg-accent-emerald/10" />
            <QuickLink icon={<ShieldCheck size={18} />} label="NPS" to="/nps" color="text-accent-purple bg-accent-purple/10" />
            <QuickLink icon={<MessageSquare size={18} />} label="Inbox" to="/inbox" color="text-accent-rose bg-accent-rose/10" />
            <QuickLink icon={<Bot size={18} />} label="IA & Agentes" to="/ai" color="text-accent-cyan bg-accent-cyan/10" />
            <QuickLink icon={<TrendingUp size={18} />} label="Analytics" to="/analytics" color="text-accent-amber bg-accent-amber/10" />
            <QuickLink icon={<Zap size={18} />} label="Automacoes" to="/automations" color="text-yellow-400 bg-yellow-500/10" />
          </div>
        </div>

        {/* Phase Distribution Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Pipeline de Vendas</h3>
            <Link to="/pipes" className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
              Ver pipes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.phaseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.phaseDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="phaseName" tick={{ fontSize: 11, fill: '#757598' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#757598' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(201, 168, 76, 0.15)',
                    backgroundColor: 'rgba(20, 20, 34, 0.95)',
                    color: '#F9FAFB',
                    fontSize: 13,
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Bar dataKey="cards" name="Cards" radius={[6, 6, 0, 0]}>
                  {stats.phaseDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">
              Nenhum dado de pipeline
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// -- Sub-components --

function KpiCard({
  icon, label, value, sub, bgColor, link,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub: string
  bgColor: string
  link?: string
}) {
  const content = (
    <div className="stat-card">
      <div className="flex items-center gap-3">
        <div className={`stat-icon ${bgColor}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-xl font-display font-bold text-white">{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{sub}</p>
    </div>
  )

  if (link) return <Link to={link}>{content}</Link>
  return content
}

function QuickLink({ icon, label, to, color }: {
  icon: React.ReactNode
  label: string
  to: string
  color: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 rounded-xl border border-dark-700/40 hover:border-gold-500/15 hover:bg-dark-700/30 transition-all duration-200 group"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} transition-transform duration-200 group-hover:scale-105`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </Link>
  )
}
