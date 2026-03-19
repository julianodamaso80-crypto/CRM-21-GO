import { useState } from 'react'
import { Loader2, Plus, Zap, Trash2, ToggleLeft, ToggleRight, Pencil, Play, Clock, ArrowRight } from 'lucide-react'
import { useAutomations, useAutomationTriggers, useAutomationActions, useCreateAutomation, useUpdateAutomation, useDeleteAutomation } from '../../hooks/useAutomations'
import type { Automation, CreateAutomationRequest } from '../../../../shared/types'

export function AutomationsPage() {
  const { data: automations, isLoading } = useAutomations()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAuto, setEditingAuto] = useState<Automation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null)

  const activeCount = automations?.filter((a) => a.isActive).length || 0
  const totalExecs = automations?.reduce((sum, a) => sum + a.executionCount, 0) || 0

  const openCreate = () => {
    setEditingAuto(null)
    setDrawerOpen(true)
  }

  const openEdit = (auto: Automation) => {
    setEditingAuto(auto)
    setDrawerOpen(true)
  }

  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Automacoes</h1>
          <p className="text-sm text-gray-400 mt-1">Configure regras automaticas para seus processos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 btn-primary">
          <Plus size={16} />
          Nova Automacao
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{automations?.length || 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-400">Ativas</p>
          <p className="text-2xl font-bold text-accent-emerald">{activeCount}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-400">Execucoes totais</p>
          <p className="text-2xl font-bold text-gold-400">{totalExecs}</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      )}

      {!isLoading && automations?.length === 0 && (
        <div className="text-center p-12">
          <Zap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhuma automacao</h3>
          <p className="text-gray-400 mt-1">Crie automacoes para agilizar seus processos</p>
        </div>
      )}

      {!isLoading && automations && automations.length > 0 && (
        <div className="space-y-3">
          {automations.map((auto) => (
            <AutomationCard key={auto.id} automation={auto} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {drawerOpen && (
        <AutomationDrawer automation={editingAuto} onClose={() => setDrawerOpen(false)} />
      )}

      {deleteTarget && (
        <DeleteModal automation={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}

// --------------- Automation Card ---------------

function AutomationCard({ automation, onEdit, onDelete }: {
  automation: Automation
  onEdit: (a: Automation) => void
  onDelete: (a: Automation) => void
}) {
  const updateMutation = useUpdateAutomation()

  const toggleActive = () => {
    updateMutation.mutate({ id: automation.id, data: { isActive: !automation.isActive } })
  }

  const formatDate = (d?: string) => {
    if (!d) return 'Nunca'
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const triggerLabel = automation.trigger?.event || automation.trigger?.type || 'N/A'
  const actionLabels = automation.actions?.map((a: any) => a.type).join(', ') || 'N/A'

  return (
    <div className={`card p-4 ${automation.isActive ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 p-2 rounded-lg ${automation.isActive ? 'bg-yellow-500/15 text-yellow-400' : 'bg-dark-900 text-gray-500'}`}>
            <Zap size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white truncate">{automation.name}</h3>
              {!automation.isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-400 font-medium">Inativa</span>
              )}
            </div>
            {automation.description && (
              <p className="text-sm text-gray-400 mt-0.5 truncate">{automation.description}</p>
            )}
            {/* Flow: trigger -> conditions -> actions */}
            <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
              <span className="flex items-center gap-1 bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded font-mono">
                <Play size={10} /> {triggerLabel}
              </span>
              {automation.conditions && automation.conditions.length > 0 && (
                <>
                  <ArrowRight size={12} className="text-gray-500" />
                  <span className="bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded">
                    {automation.conditions.length} condicao(oes)
                  </span>
                </>
              )}
              <ArrowRight size={12} className="text-gray-500" />
              <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-mono">
                {actionLabels}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Execucoes: <span className="text-gray-400">{automation.executionCount}</span></span>
              <span className="flex items-center gap-1"><Clock size={10} /> Ultima: {formatDate(automation.lastExecutedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button onClick={toggleActive} title={automation.isActive ? 'Desativar' : 'Ativar'} className="p-1.5 rounded hover:bg-dark-700">
            {automation.isActive
              ? <ToggleRight size={20} className="text-green-500" />
              : <ToggleLeft size={20} className="text-gray-500" />
            }
          </button>
          <button onClick={() => onEdit(automation)} title="Editar" className="p-1.5 rounded hover:bg-dark-700 text-gray-400">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(automation)} title="Excluir" className="p-1.5 rounded hover:bg-dark-700 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --------------- Drawer ---------------

function AutomationDrawer({ automation, onClose }: { automation: Automation | null; onClose: () => void }) {
  const { data: triggers } = useAutomationTriggers()
  const { data: actions } = useAutomationActions()
  const createMutation = useCreateAutomation()
  const updateMutation = useUpdateAutomation()

  const isEdit = !!automation

  const [form, setForm] = useState<CreateAutomationRequest>({
    name: automation?.name || '',
    description: automation?.description || '',
    trigger: automation?.trigger || { type: 'event', event: '' },
    conditions: automation?.conditions || [],
    actions: automation?.actions || [{ type: '', params: {} }],
  })

  const allEvents = triggers?.flatMap((t) => t.events) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      updateMutation.mutate({ id: automation.id, data: form }, { onSuccess: onClose })
    } else {
      createMutation.mutate(form, { onSuccess: onClose })
    }
  }

  const updateAction = (index: number, type: string) => {
    const newActions = [...form.actions]
    newActions[index] = { type, params: {} }
    setForm({ ...form, actions: newActions })
  }

  const addAction = () => {
    setForm({ ...form, actions: [...form.actions, { type: '', params: {} }] })
  }

  const removeAction = (index: number) => {
    if (form.actions.length <= 1) return
    setForm({ ...form, actions: form.actions.filter((_, i) => i !== index) })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Editar Automacao' : 'Nova Automacao'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descricao</label>
            <input type="text" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 outline-none" />
          </div>

          {/* Trigger */}
          <div className="bg-purple-500/15 border border-purple-500/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2"><Play size={14} /> Gatilho (Quando)</h4>
            <select
              value={form.trigger.event || ''}
              onChange={(e) => setForm({ ...form, trigger: { type: 'event', event: e.target.value } })}
              className="w-full border border-purple-500/30 rounded-lg px-3 py-2 text-sm bg-dark-800 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              <option value="">Selecione um evento</option>
              {allEvents.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="bg-blue-500/15 border border-blue-500/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2"><Zap size={14} /> Acoes (Entao)</h4>
            {form.actions.map((action, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={action.type}
                  onChange={(e) => updateAction(idx, e.target.value)}
                  className="flex-1 border border-blue-500/30 rounded-lg px-3 py-2 text-sm bg-dark-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">Selecione uma acao</option>
                  {actions?.map((a) => (
                    <option key={a.type} value={a.type}>{a.label}</option>
                  ))}
                </select>
                {form.actions.length > 1 && (
                  <button type="button" onClick={() => removeAction(idx)} className="p-1.5 text-red-500 hover:bg-red-500/15 rounded">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAction} className="text-sm text-gold-400 hover:text-gold-400 font-medium flex items-center gap-1">
              <Plus size={14} /> Adicionar acao
            </button>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isPending}
              className="w-full px-4 py-2 btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar Automacao'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --------------- Delete Modal ---------------

function DeleteModal({ automation, onClose }: { automation: Automation; onClose: () => void }) {
  const deleteMutation = useDeleteAutomation()
  const handleDelete = () => {
    deleteMutation.mutate(automation.id, { onSuccess: onClose })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-white">Excluir automacao</h3>
        <p className="text-sm text-gray-400 mt-2">
          Tem certeza que deseja excluir <strong>{automation.name}</strong>? Esta acao nao pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Cancelar</button>
          <button onClick={handleDelete} disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
            {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}
