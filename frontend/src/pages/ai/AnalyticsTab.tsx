import { Clock, MessageSquare, Zap, Loader2 } from 'lucide-react'
import { useAIStats, useAIRecentQueries } from '../../hooks/useAI'

export function AnalyticsTab() {
  const { data: stats, isLoading: statsLoading } = useAIStats()
  const { data: recentQueries, isLoading: queriesLoading } = useAIRecentQueries(20)

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Analytics de IA</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <p className="text-2xl font-bold text-white">{stats?.totalQueries ?? 0}</p>
              )}
              <p className="text-sm text-gray-400">Total de Queries</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/15 text-green-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <p className="text-2xl font-bold text-white">{stats?.avgResponseTime ?? 0}ms</p>
              )}
              <p className="text-sm text-gray-400">Tempo Medio de Resposta</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  {stats?.totalDocuments ?? 0}
                </p>
              )}
              <p className="text-sm text-gray-400">Documentos Processados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Queries Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-700">
          <h3 className="font-medium text-white">Queries Recentes</h3>
        </div>

        {queriesLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : !recentQueries || recentQueries.length === 0 ? (
          <div className="text-center p-8">
            <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Nenhuma query realizada ainda</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pergunta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Resposta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Modelo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Latencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentQueries.map((log: any) => (
                <tr key={log.id} className="hover:bg-dark-700">
                  <td className="px-4 py-3 text-sm text-white max-w-[200px] truncate">
                    {log.query}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-[300px] truncate">
                    {log.response}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-dark-700 text-gray-300 rounded">
                      {log.model || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {log.latencyMs ? `${log.latencyMs}ms` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {log.createdAt ? new Date(log.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    }) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
