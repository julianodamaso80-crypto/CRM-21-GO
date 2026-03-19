import { useState } from 'react'
import {
  Loader2,
  SmilePlus,
  Frown,
  Meh,
  Smile,
  TrendingUp,
  MessageSquareText,
  Send,
  BarChart3,
  Users,
  Star,
  ChevronDown,
  X,
} from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { useNPSStats, useNPSSurveys, useCreateNPSSurvey } from '../../hooks/useNPS'
import type { NPSSurvey } from '../../../../shared/types'

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  sms: 'SMS',
  in_app: 'App',
  manual: 'Manual',
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Smile }> = {
  promoter: { label: 'Promotor', color: '#10B981', bg: 'bg-green-500/15 text-green-400', icon: Smile },
  passive: { label: 'Neutro', color: '#F59E0B', bg: 'bg-yellow-500/15 text-yellow-400', icon: Meh },
  detractor: { label: 'Detrator', color: '#EF4444', bg: 'bg-red-500/15 text-red-400', icon: Frown },
}

export function NPSPage() {
  const { data: stats, isLoading: statsLoading } = useNPSStats()
  const { data: surveys, isLoading: surveysLoading } = useNPSSurveys()
  const [tab, setTab] = useState<'overview' | 'responses' | 'register'>('overview')
  const [filterCategory, setFilterCategory] = useState<string>('')

  if (statsLoading || surveysLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  const filteredSurveys = surveys?.filter((s) => {
    if (filterCategory && s.category !== filterCategory) return false
    return true
  }) || []

  const answeredSurveys = filteredSurveys.filter((s) => s.answeredAt)

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pesquisa de Satisfacao (NPS)</h1>
          <p className="text-sm text-gray-400 mt-1">Acompanhe a satisfacao dos seus associados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700/50 rounded-2xl p-1 w-fit">
        {[
          { key: 'overview', label: 'Visao Geral', icon: BarChart3 },
          { key: 'responses', label: 'Respostas', icon: MessageSquareText },
          { key: 'register', label: 'Registrar', icon: SmilePlus },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-dark-800 text-gold-400 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && <OverviewTab stats={stats} />}
      {tab === 'responses' && (
        <ResponsesTab
          surveys={answeredSurveys}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />
      )}
      {tab === 'register' && <RegisterTab />}
    </div>
  )
}

// ── Overview Tab ──

function OverviewTab({ stats }: { stats: NonNullable<ReturnType<typeof useNPSStats>['data']> }) {
  const npsColor = stats.npsScore >= 50 ? '#10B981' : stats.npsScore >= 0 ? '#F59E0B' : '#EF4444'
  const npsLabel = stats.npsScore >= 75 ? 'Excelente' : stats.npsScore >= 50 ? 'Muito Bom' : stats.npsScore >= 0 ? 'Razoavel' : 'Critico'

  const pieData = [
    { name: 'Promotores', value: stats.promoters, color: '#10B981' },
    { name: 'Neutros', value: stats.passives, color: '#F59E0B' },
    { name: 'Detratores', value: stats.detractors, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gold-500/10">
              <TrendingUp className="w-4 h-4 text-gold-400" />
            </div>
            <span className="text-xs text-gray-400">NPS Score</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: npsColor }}>{stats.npsScore}</p>
          <p className="text-xs mt-1" style={{ color: npsColor }}>{npsLabel}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent-blue/10">
              <Users className="w-4 h-4 text-accent-blue" />
            </div>
            <span className="text-xs text-gray-400">Total Enviadas</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.answered} respondidas</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent-purple/10">
              <Send className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-xs text-gray-400">Taxa de Resposta</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.responseRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.total - stats.answered} pendentes</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent-amber/10">
              <Star className="w-4 h-4 text-accent-amber" />
            </div>
            <span className="text-xs text-gray-400">Media de Nota</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.avgScore}</p>
          <p className="text-xs text-gray-500 mt-1">de 0 a 10</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent-emerald/10">
              <Smile className="w-4 h-4 text-accent-emerald" />
            </div>
            <span className="text-xs text-gray-400">Promotores</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.promoters}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.answered > 0 ? Math.round((stats.promoters / stats.answered) * 100) : 0}% do total</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Over Time */}
        <div className="card p-5">
          <h3 className="text-sm font-display font-semibold text-gray-300 mb-4">Evolucao do NPS</h3>
          {stats.byMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.byMonth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[-100, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #334155', fontSize: 13, backgroundColor: '#1e293b' }}
                  formatter={(value: number) => [`${value}`, 'NPS']}
                />
                <Line type="monotone" dataKey="nps" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-500 text-sm">Sem dados suficientes</div>
          )}
        </div>

        {/* Distribution Pie */}
        <div className="card p-5">
          <h3 className="text-sm font-display font-semibold text-gray-300 mb-4">Distribuicao de Respostas</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-gray-400">{d.name}</span>
                    <span className="text-sm font-semibold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-500 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Recent Comments */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-display font-semibold text-gray-300 mb-4">Comentarios Recentes</h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {stats.recentComments.length > 0 ? (
              stats.recentComments.map((c) => {
                const cfg = CATEGORY_CONFIG[c.category]
                return (
                  <div key={c.id} className="flex gap-3 p-2 rounded-lg border border-dark-700/40 hover:bg-dark-700/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <span className="text-xs font-bold">{c.score}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-300">{c.associadoName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{c.comment}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Nenhum comentario ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Responses Tab ──

function ResponsesTab({
  surveys,
  filterCategory,
  setFilterCategory,
}: {
  surveys: NPSSurvey[]
  filterCategory: string
  setFilterCategory: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input appearance-none pr-8"
          >
            <option value="">Todas categorias</option>
            <option value="promoter">Promotores (9-10)</option>
            <option value="passive">Neutros (7-8)</option>
            <option value="detractor">Detratores (0-6)</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        {filterCategory && (
          <button onClick={() => setFilterCategory('')} className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1">
            <X size={12} /> Limpar filtro
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">{surveys.length} respostas</span>
      </div>

      {/* Survey List */}
      <div className="card overflow-hidden">
        {surveys.length > 0 ? (
          <div className="divide-y divide-dark-700/40">
            {surveys.map((survey) => {
              const cfg = CATEGORY_CONFIG[survey.category]
              const Icon = cfg.icon
              return (
                <div key={survey.id} className="p-4 hover:bg-dark-700/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">{(survey as any).associadoName || survey.associado?.fullName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg}`}>
                          Nota {survey.score} - {cfg.label}
                        </span>
                        <span className="text-xs text-gray-500">{CHANNEL_LABELS[survey.channel]}</span>
                      </div>
                      {survey.comment && (
                        <p className="text-sm text-gray-400 mt-2 bg-dark-900 rounded-lg p-3 italic">
                          "{survey.comment}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Respondido em {survey.answeredAt ? new Date(survey.answeredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: cfg.color }}
                      >
                        {survey.score}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquareText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhuma resposta encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Register Tab ──

function RegisterTab() {
  const createSurvey = useCreateNPSSurvey()
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [associadoId, setAssociadoId] = useState('1')

  const handleSubmit = () => {
    if (score === null) return
    createSurvey.mutate(
      {
        associadoId,
        score,
        comment: comment || undefined,
        channel: 'manual',
      },
      {
        onSuccess: () => {
          setScore(null)
          setComment('')
        },
      }
    )
  }

  const getScoreColor = (s: number) => {
    if (s >= 9) return 'bg-green-500 text-white'
    if (s >= 7) return 'bg-yellow-400 text-white'
    return 'bg-red-500 text-white'
  }

  const getScoreHoverColor = (s: number) => {
    if (s >= 9) return 'hover:bg-green-500 hover:text-white'
    if (s >= 7) return 'hover:bg-yellow-400 hover:text-white'
    return 'hover:bg-red-500 hover:text-white'
  }

  return (
    <div className="max-w-2xl">
      <div className="card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-white">Registrar Pesquisa Manual</h3>
          <p className="text-sm text-gray-400 mt-1">Registre a avaliacao de um associado manualmente</p>
        </div>

        {/* Associado */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Associado</label>
          <select
            value={associadoId}
            onChange={(e) => setAssociadoId(e.target.value)}
            className="input"
          >
            <option value="1">Joao Silva</option>
            <option value="2">Maria Santos</option>
            <option value="3">Pedro Oliveira</option>
            <option value="4">Ana Costa</option>
            <option value="5">Carlos Ferreira</option>
          </select>
        </div>

        {/* Score */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            De 0 a 10, quanto voce recomendaria a 21Go?
          </label>
          <div className="flex gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  score === i
                    ? getScoreColor(i)
                    : `bg-dark-700 text-gray-400 ${getScoreHoverColor(i)}`
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-red-400">Nada provavel</span>
            <span className="text-xs text-green-500">Muito provavel</span>
          </div>
          {score !== null && (
            <p className="mt-2 text-sm">
              Categoria:{' '}
              <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${CATEGORY_CONFIG[score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'].bg}`}>
                {CATEGORY_CONFIG[score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'].label}
              </span>
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Comentario (opcional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="O que o associado disse..."
            className="input resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={score === null || createSurvey.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {createSurvey.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SmilePlus className="w-4 h-4" />
          )}
          Registrar Avaliacao
        </button>
      </div>
    </div>
  )
}
