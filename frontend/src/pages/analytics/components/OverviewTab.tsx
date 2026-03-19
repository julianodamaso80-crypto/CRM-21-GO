import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Timer,
  Zap,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAnalyticsOverview, useAnalyticsTrends } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters } from '../../../../../shared/types'

interface OverviewTabProps {
  filters: AnalyticsFilters
}

export function OverviewTab({ filters }: OverviewTabProps) {
  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview(filters)
  const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends({ ...filters, granularity: 'day' })

  if (loadingOverview) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  if (!overview) return null

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          label="Total de Leads"
          value={overview.totalLeads.toLocaleString('pt-BR')}
          sub={`+${overview.newLeadsThisPeriod} no periodo`}
          growth={overview.leadsGrowth}
          bgColor="bg-blue-500/15"
        />
        <KpiCard
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          label="Taxa de Conversao"
          value={`${overview.conversionRate}%`}
          sub={`${overview.totalConversions} conversoes`}
          bgColor="bg-emerald-500/15"
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5 text-gold-400" />}
          label="Receita Total"
          value={formatCurrency(overview.totalRevenue)}
          sub={`Ticket medio: ${formatCurrency(overview.avgDealValue)}`}
          growth={overview.revenueGrowth}
          bgColor="bg-gold-500/10"
        />
        <KpiCard
          icon={<DollarSign className="w-5 h-5 text-red-400" />}
          label="Custo por Lead"
          value={formatCurrency(overview.costPerLead)}
          sub="Media entre canais pagos"
          bgColor="bg-red-500/15"
        />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          label="Velocidade de Leads"
          value={`${overview.leadVelocity}/dia`}
          sub="Media de novos leads por dia"
          bgColor="bg-amber-500/15"
        />
        <KpiCard
          icon={<Timer className="w-5 h-5 text-purple-400" />}
          label="Tempo de Conversao"
          value={`${overview.avgTimeToConvert} dias`}
          sub="Lead ate fechamento"
          bgColor="bg-purple-500/15"
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          label="Top Origem"
          value={overview.topSource}
          sub="Maior volume de leads"
          bgColor="bg-cyan-500/15"
        />
        <KpiCard
          icon={<Megaphone className="w-5 h-5 text-pink-400" />}
          label="Top Campanha"
          value={overview.topCampaign.length > 25 ? overview.topCampaign.substring(0, 25) + '...' : overview.topCampaign}
          sub="Melhor performance"
          bgColor="bg-pink-500/15"
        />
      </div>

      {/* Trend Chart */}
      {!loadingTrends && trends && (
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Tendencia de Leads e Conversoes (90 dias)</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full font-medium ${
                trends.summary.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {trends.summary.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trends.summary.trendPercentage}%
              </span>
              <span className="text-gray-500">{trends.summary.avgPerDay} leads/dia</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval={6} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={formatDate}
                contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
                formatter={(value: number, name: string) => {
                  if (name === 'Receita') return [formatCurrency(value), name]
                  return [value, name]
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#3B82F6" fill="url(#gradLeads)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversions" name="Conversoes" stroke="#10B981" fill="url(#gradConversions)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  growth,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  growth?: number
  bgColor: string
}) {
  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>{icon}</div>
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
        </div>
        {growth !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
            growth >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {growth >= 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">{sub}</p>
    </div>
  )
}
