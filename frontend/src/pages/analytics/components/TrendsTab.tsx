import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
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
import { useAnalyticsTrends } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters, AnalyticsPeriod } from '../../../../../shared/types'

interface TrendsTabProps {
  filters: AnalyticsFilters
}

export function TrendsTab({ filters }: TrendsTabProps) {
  const [granularity, setGranularity] = useState<AnalyticsPeriod>('day')
  const { data, isLoading } = useAnalyticsTrends({ ...filters, granularity })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const totalLeads = data.data.reduce((s, d) => s + d.leads, 0)
  const totalConversions = data.data.reduce((s, d) => s + d.conversions, 0)
  const totalRevenue = data.data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Summary + Granularity Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-dark-800 rounded-lg border border-dark-700 px-4 py-2">
            <span className="text-xs text-gray-400">Media/dia: </span>
            <span className="text-sm font-bold text-white">{data.summary.avgPerDay} leads</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
            data.summary.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' :
            data.summary.trend === 'down' ? 'bg-red-500/15 text-red-400' :
            'bg-dark-700 text-gray-400'
          }`}>
            {data.summary.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            Tendencia {data.summary.trend === 'up' ? 'de alta' : data.summary.trend === 'down' ? 'de queda' : 'estavel'} ({data.summary.trendPercentage}%)
          </div>
        </div>
        <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
          {(['day', 'week', 'month'] as AnalyticsPeriod[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                granularity === g ? 'bg-dark-800 text-gold-300 shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {g === 'day' ? 'Dia' : g === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Leads (periodo)</p>
          <p className="text-2xl font-bold text-blue-400">{totalLeads.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Conversoes</p>
          <p className="text-2xl font-bold text-emerald-400">{totalConversions.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Receita Total</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Leads & Conversions Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Leads e Conversoes ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradTrendLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradTrendConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval={granularity === 'day' ? 6 : 0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="leads" name="Leads" stroke="#3B82F6" fill="url(#gradTrendLeads)" strokeWidth={2} />
            <Area type="monotone" dataKey="conversions" name="Conversoes" stroke="#10B981" fill="url(#gradTrendConv)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Receita ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradTrendRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval={granularity === 'day' ? 6 : 0} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
            />
            <Area type="monotone" dataKey="revenue" name="Receita" stroke="#0D9488" fill="url(#gradTrendRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Velocidade de Leads (media movel)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="gradVelocity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} interval={granularity === 'day' ? 6 : 0} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
            />
            <Area type="monotone" dataKey="velocity" name="Velocidade" stroke="#F59E0B" fill="url(#gradVelocity)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
