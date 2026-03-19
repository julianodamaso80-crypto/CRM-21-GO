import { useState } from 'react'
import { Loader2, Plus, ShieldCheck, Trash2, ToggleLeft, ToggleRight, Pencil, Users, Globe, Phone } from 'lucide-react'
import { useConvenios, useCreateConvenio, useUpdateConvenio, useDeleteConvenio } from '../../hooks/useConvenios'
import type { Convenio, CreateConvenioRequest } from '../../../../shared/types'

export function ConveniosPage() {
  const { data: convenios, isLoading } = useConvenios()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingConv, setEditingConv] = useState<Convenio | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Convenio | null>(null)

  const activeCount = convenios?.filter((c) => c.isActive).length || 0
  const totalPatients = convenios?.reduce((sum, c) => sum + c.patientCount, 0) || 0

  const openCreate = () => { setEditingConv(null); setDrawerOpen(true) }
  const openEdit = (c: Convenio) => { setEditingConv(c); setDrawerOpen(true) }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Convenios</h1>
          <p className="text-sm text-gray-400 mt-1">Planos de saude e convenios aceitos pela clinica</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">
          <Plus size={16} /> Novo Convenio
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Convenios</p>
          <p className="text-2xl font-bold text-white">{convenios?.length || 0}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Ativos</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Pacientes vinculados</p>
          <p className="text-2xl font-bold text-primary-400">{totalPatients}</p>
        </div>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>}

      {!isLoading && convenios?.length === 0 && (
        <div className="text-center p-12">
          <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum convenio cadastrado</h3>
          <p className="text-gray-400 mt-1">Cadastre os convenios aceitos pela clinica</p>
        </div>
      )}

      {!isLoading && convenios && convenios.length > 0 && (
        <div className="space-y-3">
          {convenios.map((conv) => (
            <ConvenioCard key={conv.id} convenio={conv} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {drawerOpen && <ConvenioDrawer convenio={editingConv} onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && <DeleteModal convenio={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}

function ConvenioCard({ convenio, onEdit, onDelete }: {
  convenio: Convenio; onEdit: (c: Convenio) => void; onDelete: (c: Convenio) => void
}) {
  const updateMutation = useUpdateConvenio()
  const toggleActive = () => updateMutation.mutate({ id: convenio.id, data: { isActive: !convenio.isActive } })

  return (
    <div className={`bg-dark-800 border rounded-lg p-4 ${convenio.isActive ? 'border-dark-700' : 'border-dark-700 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 p-2 rounded-lg ${convenio.isActive ? 'bg-primary-500/15 text-primary-400' : 'bg-dark-900 text-gray-500'}`}>
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{convenio.name}</h3>
              {convenio.code && <span className="text-xs text-gray-400 font-mono">#{convenio.code}</span>}
              {!convenio.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-400 font-medium">Inativo</span>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Users size={12} /> {convenio.patientCount} pacientes</span>
              {convenio.phone && <span className="flex items-center gap-1"><Phone size={12} /> {convenio.phone}</span>}
              {convenio.website && <span className="flex items-center gap-1"><Globe size={12} /> {convenio.website}</span>}
              {convenio.contactPerson && <span>Contato: {convenio.contactPerson}</span>}
            </div>
            {convenio.notes && <p className="text-xs text-gray-500 mt-1 truncate">{convenio.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button onClick={toggleActive} className="p-1.5 rounded hover:bg-dark-700">
            {convenio.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-500" />}
          </button>
          <button onClick={() => onEdit(convenio)} className="p-1.5 rounded hover:bg-dark-700 text-gray-400"><Pencil size={16} /></button>
          <button onClick={() => onDelete(convenio)} className="p-1.5 rounded hover:bg-dark-700 text-red-500"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  )
}

function ConvenioDrawer({ convenio, onClose }: { convenio: Convenio | null; onClose: () => void }) {
  const createMutation = useCreateConvenio()
  const updateMutation = useUpdateConvenio()
  const isEdit = !!convenio

  const [form, setForm] = useState<CreateConvenioRequest>({
    name: convenio?.name || '',
    code: convenio?.code || '',
    phone: convenio?.phone || '',
    email: convenio?.email || '',
    website: convenio?.website || '',
    contactPerson: convenio?.contactPerson || '',
    notes: convenio?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      updateMutation.mutate({ id: convenio.id, data: form }, { onSuccess: onClose })
    } else {
      createMutation.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const inputClass = 'w-full border border-dark-600 rounded-lg px-3 py-2 text-sm bg-dark-800 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Editar Convenio' : 'Novo Convenio'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Unimed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Codigo</label>
              <input type="text" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} placeholder="001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
              <input type="url" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Pessoa de Contato</label>
              <input type="text" value={form.contactPerson || ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Observacoes</label>
              <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isPending}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Salvar' : 'Cadastrar Convenio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ convenio, onClose }: { convenio: Convenio; onClose: () => void }) {
  const deleteMutation = useDeleteConvenio()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-white">Remover convenio</h3>
        <p className="text-sm text-gray-400 mt-2">Tem certeza que deseja remover <strong>{convenio.name}</strong>?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Cancelar</button>
          <button onClick={() => deleteMutation.mutate(convenio.id, { onSuccess: onClose })} disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
            {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />} Remover
          </button>
        </div>
      </div>
    </div>
  )
}
