import { useState, useEffect } from 'react'
import { AlertTriangle, Search, Loader2, Plus, MapPin, Car, Clock, Wrench, CheckCircle2, X } from 'lucide-react'
import { api } from '../../lib/api'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  aberto: { label: 'Aberto', cls: 'bg-red-500/15 text-red-400' },
  analise: { label: 'Em Analise', cls: 'bg-amber-500/15 text-amber-400' },
  aprovado: { label: 'Aprovado', cls: 'bg-blue-500/15 text-blue-400' },
  negado: { label: 'Negado', cls: 'bg-gray-500/15 text-gray-500' },
  oficina: { label: 'Na Oficina', cls: 'bg-orange-500/15 text-orange-400' },
  aguardando_peca: { label: 'Aguardando Peca', cls: 'bg-purple-500/15 text-purple-400' },
  reparo: { label: 'Em Reparo', cls: 'bg-cyan-500/15 text-cyan-400' },
  pronto: { label: 'Pronto', cls: 'bg-emerald-500/15 text-emerald-400' },
  entregue: { label: 'Entregue', cls: 'bg-emerald-500/15 text-emerald-400' },
  encerrado: { label: 'Encerrado', cls: 'bg-gray-500/15 text-gray-400' },
}

const TIPO_CONFIG: Record<string, { label: string; cls: string }> = {
  colisao: { label: 'Colisao', cls: 'bg-orange-500/15 text-orange-400' },
  roubo: { label: 'Roubo', cls: 'bg-red-500/15 text-red-400' },
  furto: { label: 'Furto', cls: 'bg-red-500/15 text-red-400' },
  incendio: { label: 'Incendio', cls: 'bg-amber-500/15 text-amber-400' },
  terceiros: { label: 'Terceiros', cls: 'bg-blue-500/15 text-blue-400' },
}

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function SinistrosPage() {
  const [data, setData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/sinistros', { params: { search: search || undefined, status: statusFilter || undefined } }),
      api.get('/sinistros/stats'),
    ]).then(([res, statsRes]) => {
      setData(res.data)
      setStats(statsRes.data)
    }).finally(() => setLoading(false))
  }, [search, statusFilter])

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Sinistros</h1>
            <p className="mt-2 text-gray-400">Gestao de sinistros — abertura ao encerramento</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Abrir Sinistro
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
                <div className="stat-icon bg-accent-rose/10"><AlertTriangle className="w-5 h-5 text-accent-rose" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Abertos</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.abertos}</p>
                </div>
                <div className="stat-icon bg-amber-500/10"><Clock className="w-5 h-5 text-amber-400" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Encerrados</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{stats.total - stats.abertos}</p>
                </div>
                <div className="stat-icon bg-accent-emerald/10"><CheckCircle2 className="w-5 h-5 text-accent-emerald" /></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Custo Total</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">{fmt(stats.custoTotal)}</p>
                </div>
                <div className="stat-icon bg-accent-blue/10"><Wrench className="w-5 h-5 text-accent-blue" /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por associado, placa ou tipo..."
              className="input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-12 flex justify-center"><Loader2 className="w-8 h-8 text-gold-400 animate-spin" /></div>
      ) : data?.data?.length === 0 ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">Nenhum sinistro encontrado</h3>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700/40">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Associado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Veiculo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Oficina</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Custo Est.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-dark-800/60 divide-y divide-dark-700/40">
                {data?.data?.map((s: any) => {
                  const statusCfg = STATUS_CONFIG[s.status] || { label: s.status, cls: 'bg-dark-700 text-gray-400' }
                  const tipoCfg = TIPO_CONFIG[s.tipo] || { label: s.tipo, cls: 'bg-dark-700 text-gray-400' }
                  return (
                    <tr key={s.id} className="table-row hover:bg-dark-700/30 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{s.associado?.fullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>{s.veiculo?.marca} {s.veiculo?.modelo}</span>
                          <span className="text-xs text-gray-500 font-mono">{s.veiculo?.placa}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoCfg.cls}`}>{tipoCfg.label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {s.oficina?.nome || <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {s.custoEstimado ? fmt(s.custoEstimado) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(s.dataOcorrencia).toLocaleDateString('pt-BR')}
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
  )
}
