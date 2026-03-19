import { useState } from 'react'
import {
  Plus,
  Search,
  Loader2,
  UserCircle2,
  Trash2,
  Edit3,
  TrendingUp,
  Target,
  DollarSign,
  X,
} from 'lucide-react'
import { useLeads, useLeadStats, useCreateLead, useUpdateLead, useDeleteLead } from '../../hooks/useLeads'
import { useContacts } from '../../hooks/useContacts'
import type { Lead, CreateLeadRequest, UpdateLeadRequest, LeadStatus, LeadSource } from '../../../../shared/types'

const STATUS_MAP: Record<LeadStatus, { label: string; cls: string }> = {
  new: { label: 'Novo', cls: 'bg-blue-500/15 text-blue-400' },
  contacted: { label: 'Contatado', cls: 'bg-amber-500/15 text-amber-400' },
  qualified: { label: 'Qualificado', cls: 'bg-emerald-500/15 text-emerald-400' },
  unqualified: { label: 'Desqualificado', cls: 'bg-dark-700 text-gray-400' },
}

const SOURCE_MAP: Record<LeadSource, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  referral: 'Indicacao',
  manual: 'Manual',
  facebook: 'Facebook',
  google: 'Google',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  email: 'Email',
  organic: 'Organico',
  other: 'Outro',
}

export function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useLeads({ search, status: statusFilter || undefined, source: sourceFilter || undefined })
  const { data: stats } = useLeadStats()
  const deleteMutation = useDeleteLead()

  const leads = data?.data || []

  const openCreate = () => { setEditingLead(null); setDrawerOpen(true) }
  const openEdit = (lead: Lead) => { setEditingLead(lead); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditingLead(null) }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
    }
  }

  const formatCurrency = (value?: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie suas oportunidades de negocio</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 text-sm">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<UserCircle2 className="w-5 h-5 text-blue-400" />} label="Total de Leads" value={stats.total} bg="bg-blue-500/15" />
          <StatCard icon={<Target className="w-5 h-5 text-emerald-400" />} label="Qualificados" value={stats.byStatus.qualified || 0} bg="bg-emerald-500/15" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="Taxa de Conversao" value={`${stats.conversionRate}%`} bg="bg-purple-500/15" />
          <StatCard icon={<DollarSign className="w-5 h-5 text-amber-400" />} label="Valor Estimado" value={formatCurrency(stats.totalEstimatedValue)} bg="bg-amber-500/15" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por titulo, contato ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="new">Novo</option>
          <option value="contacted">Contatado</option>
          <option value="qualified">Qualificado</option>
          <option value="unqualified">Desqualificado</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas as origens</option>
          <option value="website">Website</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="referral">Indicacao</option>
          <option value="manual">Manual</option>
        </select>
        {(statusFilter || sourceFilter) && (
          <button onClick={() => { setStatusFilter(''); setSourceFilter('') }} className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1">
            <X className="w-3 h-3" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16">
          <UserCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">Nenhum lead encontrado</h3>
          <p className="text-sm text-gray-400 mt-1">Crie o primeiro lead para comecar</p>
          <button onClick={openCreate} className="mt-4 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-400">
            Criar Lead
          </button>
        </div>
      ) : (
        <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Origem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-dark-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{lead.title}</p>
                        {lead.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{lead.description}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-100">{lead.contact?.fullName || lead.contact?.firstName || '-'}</p>
                        <p className="text-xs text-gray-500">{lead.contact?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {SOURCE_MAP[lead.source] || lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={lead.score} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {formatCurrency(lead.estimatedValue)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(lead)} className="p-1.5 text-gray-500 hover:text-primary-400 rounded">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(lead.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Drawer */}
      {drawerOpen && <LeadDrawer lead={editingLead} onClose={closeDrawer} />}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative bg-dark-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white">Excluir Lead</h3>
            <p className="text-sm text-gray-400 mt-2">Tem certeza que deseja excluir este lead? Esta acao nao pode ser desfeita.</p>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-dark-700 text-gray-400' }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-gray-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{score}</span>
    </div>
  )
}

// ── Lead Drawer (Create/Edit) ──

function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const createMutation = useCreateLead()
  const updateMutation = useUpdateLead()
  const { data: contactsData } = useContacts({ limit: 100 })
  const contacts = contactsData?.data || []

  const [title, setTitle] = useState(lead?.title || '')
  const [description, setDescription] = useState(lead?.description || '')
  const [contactId, setContactId] = useState(lead?.contactId || '')
  const [source, setSource] = useState<LeadSource>(lead?.source || 'manual')
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new')
  const [score, setScore] = useState(String(lead?.score || 0))
  const [estimatedValue, setEstimatedValue] = useState(lead?.estimatedValue ? String(lead.estimatedValue) : '')
  const [tags, setTags] = useState(lead?.tags?.join(', ') || '')

  const isEditing = !!lead
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || (!isEditing && !contactId)) return

    if (isEditing) {
      const data: UpdateLeadRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        score: parseInt(score) || 0,
        source,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }
      updateMutation.mutate({ id: lead.id, data }, { onSuccess: onClose })
    } else {
      const data: CreateLeadRequest = {
        contactId,
        title: title.trim(),
        description: description.trim() || undefined,
        source,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      }
      createMutation.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-800 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">{isEditing ? 'Editar Lead' : 'Novo Lead'}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-400 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contact */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contato *</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione um contato</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName || `${c.firstName} ${c.lastName}`} — {c.email}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Titulo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Tubos para projeto X"
              className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descricao</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes sobre este lead..."
              className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Source + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Origem</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
              >
                <option value="manual">Manual</option>
                <option value="website">Website</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Indicacao</option>
              </select>
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="unqualified">Desqualificado</option>
                </select>
              </div>
            )}
          </div>

          {/* Score + Value */}
          <div className="grid grid-cols-2 gap-4">
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Score (0-100)</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            <div className={isEditing ? '' : 'col-span-2'}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor Estimado (R$)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vendas, tubos, urgente (separadas por virgula)"
              className="w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50">
              {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
