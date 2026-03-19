import { useState, useEffect } from 'react'
import { Gift, Users, TrendingUp, CheckCircle2, Clock, Loader2, Plus, Copy, Share2 } from 'lucide-react'
import { api } from '../../lib/api'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'bg-amber-500/15 text-amber-400' },
  lead_criado: { label: 'Lead Criado', cls: 'bg-blue-500/15 text-blue-400' },
  em_negociacao: { label: 'Em Negociacao', cls: 'bg-purple-500/15 text-purple-400' },
  convertido: { label: 'Convertido', cls: 'bg-emerald-500/15 text-emerald-400' },
  expirado: { label: 'Expirado', cls: 'bg-gray-500/15 text-gray-500' },
}

const GAMIFICACAO = [
  { nivel: 'Bronze', min: 1, max: 2, icon: '🥉', desconto: '10-20%', cls: 'from-amber-700/20 to-amber-800/10 border-amber-600/20' },
  { nivel: 'Prata', min: 3, max: 5, icon: '🥈', desconto: '30-50%', cls: 'from-gray-400/20 to-gray-500/10 border-gray-400/20' },
  { nivel: 'Ouro', min: 6, max: 9, icon: '🏆', desconto: '60-90%', cls: 'from-gold-500/20 to-gold-600/10 border-gold-500/20' },
  { nivel: 'Diamante', min: 10, max: 999, icon: '💎', desconto: '100%', cls: 'from-cyan-400/20 to-cyan-500/10 border-cyan-400/20' },
]

const getNivel = (total: number) => GAMIFICACAO.find(g => total >= g.min && total <= g.max) || GAMIFICACAO[0]

export function IndicacoesPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const linkIndicacao = 'https://21go.org/indique?ref=joao-silva-123'

  useEffect(() => {
    Promise.all([
      api.get('/indicacoes'),
      api.get('/indicacoes/stats'),
    ]).then(([res, statsRes]) => {
      setData(res.data)
      setStats(statsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkIndicacao)
    toast.success('Link copiado!')
  }

  const totalConvertidas = data?.data?.filter((i: any) => i.status === 'convertido').length || 0
  const nivel = getNivel(totalConvertidas)

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Indicacoes (MGM)</h1>
            <p className="mt-2 text-gray-400">Member Get Member — indique e ganhe desconto</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Indicacao
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 stagger-children">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="stat-icon bg-gold-500/10"><Gift className="w-5 h-5 text-gold-400" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Convertidas</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.convertidas}</p>
                </div>
                <div className="stat-icon bg-accent-emerald/10"><CheckCircle2 className="w-5 h-5 text-accent-emerald" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pendentes</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.pendentes}</p>
                </div>
                <div className="stat-icon bg-amber-500/10"><Clock className="w-5 h-5 text-amber-400" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Taxa Conversao</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.taxaConversao}%</p>
                </div>
                <div className="stat-icon bg-accent-blue/10"><TrendingUp className="w-5 h-5 text-accent-blue" /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Indicacoes list */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="card p-12 flex justify-center"><Loader2 className="w-8 h-8 text-gold-400 animate-spin" /></div>
          ) : data?.data?.length === 0 ? (
            <div className="card p-12 text-center">
              <Gift className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white">Nenhuma indicacao</h3>
              <p className="text-gray-400">Compartilhe seu link para comecar a indicar</p>
            </div>
          ) : (
            <div className="table-container">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-700/40">
                  <thead className="table-header">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Indicador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Indicado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Desconto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="bg-dark-800/60 divide-y divide-dark-700/40">
                    {data?.data?.map((ind: any) => {
                      const stCfg = STATUS_CONFIG[ind.status] || { label: ind.status, cls: 'bg-dark-700 text-gray-400' }
                      return (
                        <tr key={ind.id} className="table-row hover:bg-dark-700/30">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {ind.indicador?.fullName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{ind.indicadoNome}</div>
                            <div className="text-xs text-gray-400">{ind.indicadoTelefone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stCfg.cls}`}>{stCfg.label}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {ind.descontoAplicado ? `${ind.descontoAplicado}%` : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(ind.dataIndicacao).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Gamification + Link */}
        <div className="space-y-4">
          {/* Current Level */}
          <div className={`card bg-gradient-to-br ${nivel.cls} text-center py-6`}>
            <div className="text-4xl mb-2">{nivel.icon}</div>
            <h3 className="text-lg font-display font-bold text-white">{nivel.nivel}</h3>
            <p className="text-sm text-gray-400 mt-1">{totalConvertidas} indicacoes convertidas</p>
            <p className="text-xs text-gray-500 mt-1">Desconto acumulado: {totalConvertidas * 10}%</p>
          </div>

          {/* Gamification Levels */}
          <div className="card">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Niveis de Indicacao</h4>
            <div className="space-y-2">
              {GAMIFICACAO.map((g) => (
                <div key={g.nivel} className={`flex items-center gap-3 p-2 rounded-lg ${totalConvertidas >= g.min ? 'bg-dark-700/40' : 'opacity-50'}`}>
                  <span className="text-lg">{g.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{g.nivel}</p>
                    <p className="text-[11px] text-gray-400">{g.min}-{g.max === 999 ? '+' : g.max} indicacoes = {g.desconto} desconto</p>
                  </div>
                  {totalConvertidas >= g.min && totalConvertidas <= g.max && (
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div className="card">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Link de Indicacao</h4>
            <div className="flex gap-2">
              <input value={linkIndicacao} readOnly className="input text-xs flex-1 font-mono" />
              <button onClick={handleCopyLink} className="btn-secondary p-2" title="Copiar link">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <button className="btn-primary w-full mt-3 flex items-center justify-center gap-2 text-sm">
              <Share2 className="w-4 h-4" />
              Compartilhar via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
