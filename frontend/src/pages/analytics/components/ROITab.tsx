import { Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAnalyticsROI } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters } from '../../../../../shared/types'

interface ROITabProps {
  filters: AnalyticsFilters
}

export function ROITab({ filters }: ROITabProps) {
  const { data, isLoading } = useAnalyticsROI(filters)

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

  const platformChartData = data.byPlatform.map((p) => ({
    name: p.platform,
    Investido: p.spend,
    Receita: p.revenue,
    roi: p.roi,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Investido</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(data.totalSpend)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Receita</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Lucro Liquido</p>
          <p className="text-2xl font-bold text-primary-400">{formatCurrency(data.totalRevenue - data.totalSpend)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">ROI Geral</p>
          <p className={`text-2xl font-bold ${data.overallROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {data.overallROI.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Platform Comparison Chart */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Investido vs Receita por Plataforma</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={platformChartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1E293B', color: '#E2E8F0' }}
              formatter={(value: number) => [formatCurrency(value)]}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Investido" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="Receita" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Detail */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">Metricas por Plataforma</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plataforma</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Investido</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Conversoes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Receita</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">ROI</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">CPL</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">CPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.byPlatform.map((p) => (
                <tr key={p.platform} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm font-medium text-white">{p.platform}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">{formatCurrency(p.spend)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{p.leads}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{p.conversions}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{formatCurrency(p.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.roi >= 1000 ? 'bg-emerald-500/15 text-emerald-400' :
                      p.roi >= 500 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {p.roi.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(p.cpl)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(p.cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign ROI Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">ROI por Campanha (ordenado por ROI)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campanha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plataforma</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Investido</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Leads</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Conversoes</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Receita</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {[...data.byCampaign].sort((a, b) => b.roi - a.roi).map((c) => (
                <tr key={c.campaign} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-[200px] truncate" title={c.campaign}>
                    {c.campaign}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c.platform}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">{formatCurrency(c.spend)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{c.leads}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{c.conversions}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{formatCurrency(c.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      c.roi >= 1000 ? 'bg-emerald-500/15 text-emerald-400' :
                      c.roi >= 500 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {c.roi.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
