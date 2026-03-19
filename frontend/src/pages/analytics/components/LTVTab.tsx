import { Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAnalyticsLTV } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters } from '../../../../../shared/types'

const BAR_COLORS = ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1', '#F0FDFA']

interface LTVTabProps {
  filters: AnalyticsFilters
}

export function LTVTab({ filters }: LTVTabProps) {
  const { data, isLoading } = useAnalyticsLTV(filters)

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

  const formatMonth = (m: string) => {
    const [year, month] = m.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month) - 1]}/${year.slice(2)}`
  }

  const chartData = data.ltvBySource.map((item, i) => ({
    ...item,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }))

  // Heatmap color intensity based on revenue
  const maxRevenue = Math.max(
    ...data.cohorts.flatMap((c) => [c.month1Revenue, c.month3Revenue, c.month6Revenue, c.month12Revenue].filter(Boolean))
  )
  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-dark-700 text-gray-500'
    const intensity = value / maxRevenue
    if (intensity > 0.7) return 'bg-teal-600 text-white'
    if (intensity > 0.5) return 'bg-teal-500 text-white'
    if (intensity > 0.3) return 'bg-teal-400/30 text-teal-200'
    if (intensity > 0.15) return 'bg-teal-400/20 text-teal-300'
    return 'bg-teal-400/10 text-teal-400'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">LTV Medio</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(data.avgLTV)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">LTV Mediano</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(data.medianLTV)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Clientes</p>
          <p className="text-2xl font-bold text-white">
            {data.ltvBySource.reduce((s, d) => s + d.customers, 0)}
          </p>
        </div>
      </div>

      {/* LTV by Source Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">LTV Medio por Origem</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 80 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis type="category" dataKey="group" tick={{ fontSize: 12 }} width={130} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
              formatter={(value: number) => [formatCurrency(value), 'LTV Medio']}
            />
            <Bar dataKey="avgLTV" name="LTV Medio" radius={[0, 4, 4, 0]} barSize={24} fill="#0D9488" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LTV by Campaign Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">LTV por Campanha</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campanha</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Clientes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">LTV Medio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Receita Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.ltvByCampaign.map((item) => (
                <tr key={item.group} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm font-medium text-white">{item.group}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{item.customers}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gold-400">{formatCurrency(item.avgLTV)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(item.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Heatmap Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">Analise de Cohort (Receita Acumulada)</h3>
          <p className="text-xs text-gray-500 mt-1">Quanto cada grupo de clientes gera de receita ao longo do tempo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mes</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Clientes</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">1 Mes</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">3 Meses</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">6 Meses</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">12 Meses</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">LTV Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.cohorts.map((cohort) => (
                <tr key={cohort.month}>
                  <td className="px-4 py-3 text-sm font-medium text-white">{formatMonth(cohort.month)}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-300">{cohort.customers}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded text-xs font-medium min-w-[80px] ${getHeatColor(cohort.month1Revenue)}`}>
                      {cohort.month1Revenue > 0 ? formatCurrency(cohort.month1Revenue) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded text-xs font-medium min-w-[80px] ${getHeatColor(cohort.month3Revenue)}`}>
                      {cohort.month3Revenue > 0 ? formatCurrency(cohort.month3Revenue) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded text-xs font-medium min-w-[80px] ${getHeatColor(cohort.month6Revenue)}`}>
                      {cohort.month6Revenue > 0 ? formatCurrency(cohort.month6Revenue) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded text-xs font-medium min-w-[80px] ${getHeatColor(cohort.month12Revenue)}`}>
                      {cohort.month12Revenue > 0 ? formatCurrency(cohort.month12Revenue) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gold-400">{formatCurrency(cohort.currentLTV)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
