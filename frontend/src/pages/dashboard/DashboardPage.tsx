import { Link } from 'react-router-dom'
import {
  Users,
  Car,
  Loader2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Target,
  MessageSquare,
  Bot,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useDashboardStats } from '../../hooks/useDashboard'

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Visao geral da 21Go Protecao Veicular</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users className="w-5 h-5 text-primary-400" />}
          label="Associados"
          value={stats.contacts.total}
          sub={`${stats.contacts.ativos || 0} ativos`}
          bgColor="bg-primary-500/15"
          link="/associados"
        />
        <KpiCard
          icon={<Car className="w-5 h-5 text-blue-400" />}
          label="Veiculos"
          value={stats.ai?.totalAgents || 0}
          sub="protegidos"
          bgColor="bg-blue-500/15"
          link="/vehicles"
        />
        <KpiCard
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          label="Leads"
          value={stats.pipes?.totalCards || 0}
          sub="no funil"
          bgColor="bg-emerald-500/15"
          link="/leads"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
          label="Pipes"
          value={stats.pipes?.total || 0}
          sub={`${stats.pipes?.doneCards || 0} cards concluidos`}
          bgColor="bg-amber-500/15"
          link="/pipes"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Acesso Rapido</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink icon={<Users size={20} />} label="Associados" to="/associados" color="bg-primary-500/15 text-primary-400" />
            <QuickLink icon={<Car size={20} />} label="Veiculos" to="/vehicles" color="bg-blue-500/15 text-blue-400" />
            <QuickLink icon={<Target size={20} />} label="Leads" to="/leads" color="bg-emerald-500/15 text-emerald-400" />
            <QuickLink icon={<ShieldCheck size={20} />} label="NPS" to="/nps" color="bg-purple-500/15 text-purple-400" />
            <QuickLink icon={<MessageSquare size={20} />} label="Inbox" to="/inbox" color="bg-orange-500/15 text-orange-400" />
            <QuickLink icon={<Bot size={20} />} label="IA & Agentes" to="/ai" color="bg-cyan-500/15 text-cyan-400" />
            <QuickLink icon={<TrendingUp size={20} />} label="Analytics" to="/analytics" color="bg-amber-500/15 text-amber-400" />
            <QuickLink icon={<Zap size={20} />} label="Automacoes" to="/automations" color="bg-yellow-500/15 text-yellow-400" />
          </div>
        </div>

        {/* Phase Distribution Chart */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Pipeline de Vendas</h3>
            <Link to="/pipes" className="text-xs text-primary-400 hover:text-primary-200 flex items-center gap-1">
              Ver pipes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.phaseDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.phaseDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="phaseName" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #374151', backgroundColor: '#1F2937', color: '#F9FAFB', fontSize: 13 }} />
                <Bar dataKey="cards" name="Cards" radius={[4, 4, 0, 0]}>
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
  icon,
  label,
  value,
  sub,
  bgColor,
  link,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub: string
  bgColor: string
  link?: string
}) {
  const content = (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
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
      className="flex items-center gap-3 p-3 rounded-lg border border-dark-700 hover:bg-dark-700 transition-colors"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </Link>
  )
}
