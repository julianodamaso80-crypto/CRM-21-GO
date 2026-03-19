import { Link } from 'react-router-dom'
import {
  Users,
  CalendarDays,
  Stethoscope,
  Loader2,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
  CalendarClock,
  HeartPulse,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useAppointmentStats } from '../../hooks/useAppointments'
import type { Appointment } from '../../../../shared/types'

const TYPE_LABELS: Record<string, string> = {
  first_visit: 'Primeira Consulta',
  return: 'Retorno',
  exam: 'Exame',
  procedure: 'Procedimento',
  consultation: 'Consulta',
  emergency: 'Emergencia',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/15 text-blue-400',
  confirmed: 'bg-green-500/15 text-green-400',
  waiting: 'bg-yellow-500/15 text-yellow-400',
  in_progress: 'bg-primary-500/20 text-primary-200',
  completed: 'bg-dark-700 text-gray-400',
  cancelled: 'bg-red-500/15 text-red-400',
  no_show: 'bg-orange-100 text-orange-600',
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  waiting: 'Em espera',
  in_progress: 'Atendendo',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'Falta',
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: aptStats, isLoading: aptLoading } = useAppointmentStats()

  if (isLoading || aptLoading) {
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

  const todayAppointments = aptStats?.upcomingToday || []

  const appointmentsByType = todayAppointments.reduce((acc: Record<string, number>, a: Appointment) => {
    acc[a.type] = (acc[a.type] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(appointmentsByType).map(([type, count]) => ({
    name: TYPE_LABELS[type] || type,
    value: count,
    color: type === 'first_visit' ? '#3B82F6' : type === 'return' ? '#14B8A6' :
           type === 'exam' ? '#8B5CF6' : type === 'procedure' ? '#F97316' :
           type === 'consultation' ? '#10B981' : '#EF4444',
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Visao geral da clinica</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<CalendarDays className="w-5 h-5 text-primary-400" />}
          label="Consultas Hoje"
          value={aptStats?.today || 0}
          sub={`${aptStats?.completedToday || 0} concluidas`}
          bgColor="bg-primary-500/15"
          link="/agenda"
        />
        <KpiCard
          icon={<Users className="w-5 h-5 text-primary-400" />}
          label="Pacientes"
          value={stats.contacts.total}
          sub={`${stats.contacts.withPhone} com telefone`}
          bgColor="bg-blue-500/15"
          link="/patients"
        />
        <KpiCard
          icon={<CalendarClock className="w-5 h-5 text-purple-600" />}
          label="Esta Semana"
          value={aptStats?.thisWeek || 0}
          sub={`${aptStats?.cancelled || 0} cancelamentos`}
          bgColor="bg-purple-500/15"
          link="/agenda"
        />
        <KpiCard
          icon={<HeartPulse className="w-5 h-5 text-red-500" />}
          label="Este Mes"
          value={aptStats?.thisMonth || 0}
          sub={`${aptStats?.noShow || 0} faltas`}
          bgColor="bg-red-500/15"
          link="/agenda"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-dark-800 rounded-lg border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Consultas de Hoje</h3>
            <Link to="/agenda" className="text-xs text-primary-400 hover:text-primary-200 flex items-center gap-1">
              Ver agenda <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.map((apt: Appointment) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg border border-dark-700 hover:bg-dark-700 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-center flex-shrink-0">
                      <p className="text-sm font-bold text-primary-400">{apt.startTime}</p>
                      <p className="text-[10px] text-gray-500">{apt.endTime}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{apt.patient.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Stethoscope size={10} />{apt.doctor.fullName}</span>
                        <span>{TYPE_LABELS[apt.type]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {apt.room && <span className="text-xs text-gray-500">{apt.room}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[apt.status]}`}>
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma consulta hoje</p>
            </div>
          )}
        </div>

        {/* Appointments by Type Pie Chart */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Consultas por Tipo (Hoje)</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-500 text-sm">
              Sem dados para hoje
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Acesso Rapido</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink icon={<CalendarDays size={20} />} label="Agendar Consulta" to="/agenda" color="bg-primary-500/15 text-primary-400" />
            <QuickLink icon={<Users size={20} />} label="Novo Paciente" to="/patients" color="bg-blue-500/15 text-primary-400" />
            <QuickLink icon={<ClipboardList size={20} />} label="Prontuario" to="/prontuario" color="bg-purple-500/15 text-purple-600" />
            <QuickLink icon={<Stethoscope size={20} />} label="Medicos" to="/doctors" color="bg-green-500/15 text-green-600" />
            <QuickLink icon={<ShieldCheck size={20} />} label="Convenios" to="/convenios" color="bg-orange-100 text-orange-600" />
            <QuickLink icon={<AlertTriangle size={20} />} label="Automacoes" to="/automations" color="bg-yellow-500/15 text-yellow-600" />
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.phaseDistribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="phaseName" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="cards" name="Cards" radius={[4, 4, 0, 0]}>
                  {stats.phaseDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
              Nenhum dado de pipeline
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──

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
