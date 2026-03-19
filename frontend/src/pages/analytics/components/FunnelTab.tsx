import { AlertTriangle, Loader2 } from 'lucide-react'
import { useAnalyticsFunnel } from '../../../hooks/useAnalytics'
import type { AnalyticsFilters } from '../../../../../shared/types'

interface FunnelTabProps {
  filters: AnalyticsFilters
}

export function FunnelTab({ filters }: FunnelTabProps) {
  const { data, isLoading } = useAnalyticsFunnel(filters)

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

  const maxEntered = data.stages[0]?.entered || 1

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Conversao Geral</p>
          <p className="text-2xl font-bold text-emerald-400">{data.overallConversion}%</p>
          <p className="text-xs text-gray-500 mt-1">Do primeiro ao ultimo estagio</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Maior Gargalo</p>
          <p className="text-2xl font-bold text-red-400">{data.biggestDropoff}</p>
          <p className="text-xs text-gray-500 mt-1">Fase com maior perda de leads</p>
        </div>
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 text-center">
          <p className="text-xs text-gray-400">Ciclo Medio</p>
          <p className="text-2xl font-bold text-purple-400">{data.avgCycleTime} dias</p>
          <p className="text-xs text-gray-500 mt-1">Tempo total do funil</p>
        </div>
      </div>

      {/* Visual Funnel */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-6">Funil de Conversao</h3>
        <div className="space-y-2">
          {data.stages.map((stage, index) => {
            const widthPercent = Math.max((stage.entered / maxEntered) * 100, 8)
            const dropoff = index < data.stages.length - 1 ? stage.dropped : 0
            const dropoffPercent = index < data.stages.length - 1 ? ((stage.dropped / stage.entered) * 100).toFixed(1) : null
            const isBiggestDropoff = stage.name === data.biggestDropoff

            return (
              <div key={stage.id}>
                {/* Funnel Bar */}
                <div className="flex items-center gap-4">
                  <div className="w-28 text-right">
                    <p className="text-sm font-medium text-gray-300">{stage.name}</p>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div
                        className="h-11 rounded-lg flex items-center px-4 transition-all duration-500"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: stage.color,
                          minWidth: 120,
                        }}
                      >
                        <span className="text-white text-sm font-bold">{stage.entered}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-semibold text-gray-300">{stage.conversionRate}%</span>
                  </div>
                </div>

                {/* Drop-off indicator between stages */}
                {dropoffPercent && (
                  <div className="flex items-center gap-4 py-1">
                    <div className="w-28" />
                    <div className="flex-1 flex items-center gap-2 pl-4">
                      <div className="w-px h-4 bg-dark-700" />
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isBiggestDropoff ? 'bg-red-500/15 text-red-400' : 'bg-dark-700 text-gray-400'
                      }`}>
                        {isBiggestDropoff && <AlertTriangle className="w-3 h-3" />}
                        -{dropoff} ({dropoffPercent}% drop-off)
                      </span>
                    </div>
                    <div className="w-24" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-700">
          <h3 className="text-sm font-semibold text-gray-300">Detalhamento do Funil</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Fase</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Entraram</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Passaram</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Perdidos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Conversao</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tempo Medio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {data.stages.map((stage) => {
                const isBiggest = stage.name === data.biggestDropoff
                return (
                  <tr key={stage.id} className={isBiggest ? 'bg-red-500/10' : 'hover:bg-dark-700'}>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        {stage.name}
                        {isBiggest && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded font-medium">
                            Gargalo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300">{stage.entered}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{stage.exited}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-400">{stage.dropped}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        stage.conversionRate >= 70 ? 'bg-emerald-500/15 text-emerald-400' :
                        stage.conversionRate >= 60 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {stage.conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-400">{stage.avgTimeInStage}d</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(stage.value)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
