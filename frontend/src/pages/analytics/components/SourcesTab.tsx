import { Loader2 } from 'lucide-react'
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
import { useAnalyticsSources } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters } from '../../../../../shared/types'

const SOURCE_COLORS: Record<string, string> = {
  'Google Ads': '#4285F4',
  'Meta Ads (Facebook)': '#1877F2',
  'Organico': '#10B981',
  'WhatsApp': '#25D366',
  'Indicacao': '#F59E0B',
  'Instagram': '#E4405F',
  'Email Marketing': '#6366F1',
}

interface SourcesTabProps {
  filters: AnalyticsFilters
}

export function SourcesTab({ filters }: SourcesTabProps) {
  const { data, isLoading } = useAnalyticsSources(filters)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const chartData = data.data.map((s) => ({
    ...s,
    color: SOURCE_COLORS[s.source] || '#94A3B8',
  }))

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total de Leads</p>
          <p className="text-2xl font-bold text-white">{data.totals.leads}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Convertidos</p>
          <p className="text-2xl font-bold text-emerald-400">{data.totals.converted}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Receita Total</p>
          <p className="text-2xl font-bold text-primary-400">{formatCurrency(data.totals.revenue)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Leads por Origem</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="source" tick={{ fontSize: 12 }} width={95} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
              formatter={(value: number, name: string) => {
                if (name === 'Receita') return [formatCurrency(value), name]
                return [value, name]
              }}
            />
            <Bar dataKey="leads" name="Leads" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">Detalhamento por Origem</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Origem</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Qualif.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Convertidos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Conversao</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Receita</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ticket Medio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tempo Medio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.data.map((source) => (
                <tr key={source.source} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[source.source] || '#94A3B8' }} />
                      {source.source}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{source.leads}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{source.qualified}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{source.converted}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      source.conversionRate >= 30 ? 'bg-emerald-500/15 text-emerald-400' :
                      source.conversionRate >= 20 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {source.conversionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(source.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(source.avgDealValue)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-400">{source.avgTimeToConvert}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
