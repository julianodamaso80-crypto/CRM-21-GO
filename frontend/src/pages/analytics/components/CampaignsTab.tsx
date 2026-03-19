import { useState } from 'react'
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { useAnalyticsCampaigns } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters, CampaignAnalytics } from '../../../../../shared/types'

type SortKey = keyof Pick<CampaignAnalytics, 'leads' | 'converted' | 'revenue' | 'spend' | 'roi' | 'cpl' | 'cpa'>

interface CampaignsTabProps {
  filters: AnalyticsFilters
}

export function CampaignsTab({ filters }: CampaignsTabProps) {
  const { data, isLoading } = useAnalyticsCampaigns(filters)
  const [sortKey, setSortKey] = useState<SortKey>('roi')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...data.data].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    return (a[sortKey] - b[sortKey]) * mul
  })

  const totals = data.data.reduce(
    (acc, c) => ({
      leads: acc.leads + c.leads,
      converted: acc.converted + c.converted,
      revenue: acc.revenue + c.revenue,
      spend: acc.spend + c.spend,
    }),
    { leads: 0, converted: 0, revenue: 0, spend: 0 }
  )

  const PLATFORM_COLORS: Record<string, string> = {
    'Google Ads': '#4285F4',
    'Meta Ads': '#1877F2',
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Campanhas</p>
          <p className="text-2xl font-bold text-white">{data.data.length}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Investido</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totals.spend)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Total Receita</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.revenue)}</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">ROI Geral</p>
          <p className="text-2xl font-bold text-primary-400">
            {totals.spend > 0 ? `${(((totals.revenue - totals.spend) / totals.spend) * 100).toFixed(0)}%` : '-'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">Performance por Campanha</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Campanha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plataforma</th>
                <SortHeader label="Leads" sortKey="leads" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="Convers." sortKey="converted" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="Receita" sortKey="revenue" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="Gasto" sortKey="spend" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="ROI" sortKey="roi" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="CPL" sortKey="cpl" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
                <SortHeader label="CPA" sortKey="cpa" currentKey={sortKey} direction={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {sorted.map((c) => (
                <tr key={c.campaign} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm font-medium text-white max-w-[220px] truncate" title={c.campaign}>
                    {c.campaign}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: PLATFORM_COLORS[c.platform] || '#94A3B8' }}
                    >
                      {c.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{c.leads}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-300">
                    {c.converted}
                    <span className="text-gray-500 ml-1 text-xs">({c.conversionRate}%)</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{formatCurrency(c.revenue)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">{formatCurrency(c.spend)}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                      c.roi >= 1000 ? 'bg-emerald-500/15 text-emerald-400' :
                      c.roi >= 500 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {c.roi.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(c.cpl)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(c.cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  direction: 'asc' | 'desc'
  onSort: (key: SortKey) => void
}) {
  const isActive = currentKey === sortKey
  return (
    <th
      className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase cursor-pointer hover:text-gray-300 select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center justify-end gap-1">
        {label}
        {isActive ? (
          <span className="text-primary-400 text-[10px]">{direction === 'asc' ? '▲' : '▼'}</span>
        ) : (
          <ArrowUpDown className="w-3 h-3 text-dark-600" />
        )}
      </div>
    </th>
  )
}
