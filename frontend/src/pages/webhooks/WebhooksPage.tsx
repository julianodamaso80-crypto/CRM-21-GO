import { useState } from 'react'
import { Loader2, Plus, Webhook, Trash2, ToggleLeft, ToggleRight, Pencil, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react'
import { useWebhooks, useWebhookEvents, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from '../../hooks/useWebhooks'
import type { Webhook as WebhookType, CreateWebhookRequest } from '../../../../shared/types'

export function WebhooksPage() {
  const { data: webhooks, isLoading } = useWebhooks()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WebhookType | null>(null)

  const openCreate = () => {
    setEditingWebhook(null)
    setDrawerOpen(true)
  }

  const openEdit = (wh: WebhookType) => {
    setEditingWebhook(wh)
    setDrawerOpen(true)
  }

  return (
    <div className="p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Webhooks</h1>
          <p className="text-sm text-gray-400 mt-1">Gerencie webhooks de entrada e saida para integrar com servicos externos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 btn-primary">
          <Plus size={16} />
          Novo Webhook
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      )}

      {!isLoading && webhooks?.length === 0 && (
        <div className="text-center p-12">
          <Webhook className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum webhook</h3>
          <p className="text-gray-400 mt-1">Crie um webhook para integrar com servicos externos</p>
        </div>
      )}

      {!isLoading && webhooks && webhooks.length > 0 && (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <WebhookCard key={wh.id} webhook={wh} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {drawerOpen && (
        <WebhookDrawer webhook={editingWebhook} onClose={() => setDrawerOpen(false)} />
      )}

      {deleteTarget && (
        <DeleteModal webhook={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}

// --------------- Webhook Card ---------------

function WebhookCard({ webhook, onEdit, onDelete }: {
  webhook: WebhookType
  onEdit: (wh: WebhookType) => void
  onDelete: (wh: WebhookType) => void
}) {
  const updateMutation = useUpdateWebhook()

  const toggleActive = () => {
    updateMutation.mutate({ id: webhook.id, data: { isActive: !webhook.isActive } })
  }

  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`bg-dark-800 border rounded-lg p-4 ${webhook.isActive ? 'border-dark-700' : 'border-dark-700 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 p-2 rounded-lg ${webhook.type === 'outgoing' ? 'bg-blue-500/15 text-blue-400' : 'bg-green-500/15 text-green-400'}`}>
            {webhook.type === 'outgoing' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white truncate">{webhook.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${webhook.type === 'outgoing' ? 'bg-blue-500/15 text-blue-400' : 'bg-green-500/15 text-green-400'}`}>
                {webhook.type === 'outgoing' ? 'Saida' : 'Entrada'}
              </span>
              {!webhook.isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-400 font-medium">Inativo</span>
              )}
            </div>
            {webhook.description && (
              <p className="text-sm text-gray-400 mt-0.5 truncate">{webhook.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {webhook.event && <span>Evento: <span className="text-gray-400 font-mono">{webhook.event}</span></span>}
              {webhook.url && <span className="truncate max-w-xs">URL: <span className="text-gray-400 font-mono">{webhook.url}</span></span>}
              {webhook.type === 'incoming' && webhook.secret && <SecretCopy secret={webhook.secret} />}
              <span>Chamadas: <span className="text-gray-400">{webhook.totalCalls}</span></span>
              {webhook.lastCalledAt && <span>Ultima: {formatDate(webhook.lastCalledAt)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button onClick={toggleActive} title={webhook.isActive ? 'Desativar' : 'Ativar'} className="p-1.5 rounded hover:bg-dark-700">
            {webhook.isActive
              ? <ToggleRight size={20} className="text-green-500" />
              : <ToggleLeft size={20} className="text-gray-500" />
            }
          </button>
          <button onClick={() => onEdit(webhook)} title="Editar" className="p-1.5 rounded hover:bg-dark-700 text-gray-400">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(webhook)} title="Excluir" className="p-1.5 rounded hover:bg-dark-700 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --------------- Secret Copy ---------------

function SecretCopy({ secret }: { secret: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <span className="flex items-center gap-1">
      Secret: <span className="font-mono text-gray-400">{secret.slice(0, 8)}...</span>
      <button onClick={copy} className="text-gray-500 hover:text-gray-400">
        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      </button>
    </span>
  )
}

// --------------- Drawer ---------------

function WebhookDrawer({ webhook, onClose }: { webhook: WebhookType | null; onClose: () => void }) {
  const { data: events } = useWebhookEvents()
  const createMutation = useCreateWebhook()
  const updateMutation = useUpdateWebhook()

  const isEdit = !!webhook

  const [form, setForm] = useState<CreateWebhookRequest>({
    name: webhook?.name || '',
    description: webhook?.description || '',
    type: webhook?.type || 'outgoing',
    url: webhook?.url || '',
    method: webhook?.method || 'POST',
    event: webhook?.event || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      updateMutation.mutate({ id: webhook.id, data: form }, { onSuccess: onClose })
    } else {
      createMutation.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Editar Webhook' : 'Novo Webhook'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descricao</label>
            <input type="text" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo *</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setForm({ ...form, type: 'outgoing' })}
                className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${form.type === 'outgoing' ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'border-dark-600 text-gray-400 hover:bg-dark-700'}`}>
                <ArrowUpRight size={16} /> Saida
              </button>
              <button type="button" onClick={() => setForm({ ...form, type: 'incoming' })}
                className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 ${form.type === 'incoming' ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'border-dark-600 text-gray-400 hover:bg-dark-700'}`}>
                <ArrowDownLeft size={16} /> Entrada
              </button>
            </div>
          </div>

          {/* Event */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Evento</label>
            <select value={form.event || ''} onChange={(e) => setForm({ ...form, event: e.target.value })}
              className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
              <option value="">Selecione um evento</option>
              {events?.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          {/* URL (only for outgoing) */}
          {form.type === 'outgoing' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL *</label>
                <input type="url" required value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Metodo HTTP</label>
                <select value={form.method || 'POST'} onChange={(e) => setForm({ ...form, method: e.target.value as 'GET' | 'POST' | 'PUT' })}
                  className="w-full bg-dark-800 border border-dark-600 text-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none">
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
            </>
          )}

          {/* Incoming info */}
          {form.type === 'incoming' && (
            <div className="bg-green-500/15 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">
              Webhooks de entrada geram automaticamente uma URL e um secret para autenticacao.
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={isPending}
              className="w-full px-4 py-2 btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --------------- Delete Modal ---------------

function DeleteModal({ webhook, onClose }: { webhook: WebhookType; onClose: () => void }) {
  const deleteMutation = useDeleteWebhook()
  const handleDelete = () => {
    deleteMutation.mutate(webhook.id, { onSuccess: onClose })
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-white">Excluir webhook</h3>
        <p className="text-sm text-gray-400 mt-2">
          Tem certeza que deseja excluir <strong>{webhook.name}</strong>? Esta acao nao pode ser desfeita.
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
