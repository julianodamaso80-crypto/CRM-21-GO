import { useState } from 'react'
import { Loader2, Plus, Stethoscope, Trash2, ToggleLeft, ToggleRight, Pencil, Clock, DollarSign } from 'lucide-react'
import { useDoctors, useSpecialties, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '../../hooks/useDoctors'
import type { Doctor, CreateDoctorRequest, DoctorSpecialty } from '../../../../shared/types'

export function DoctorsPage() {
  const { data: doctors, isLoading } = useDoctors()
  const { data: specialties } = useSpecialties()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)

  const activeCount = doctors?.filter((d) => d.isActive).length || 0

  const openCreate = () => { setEditingDoc(null); setDrawerOpen(true) }
  const openEdit = (d: Doctor) => { setEditingDoc(d); setDrawerOpen(true) }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Medicos</h1>
          <p className="text-sm text-gray-400 mt-1">Equipe medica da clinica ({activeCount} ativos)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">
          <Plus size={16} /> Novo Medico
        </button>
      </div>

      {isLoading && <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>}

      {!isLoading && doctors?.length === 0 && (
        <div className="text-center p-12">
          <Stethoscope className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum medico cadastrado</h3>
          <p className="text-gray-400 mt-1">Cadastre os medicos da sua clinica</p>
        </div>
      )}

      {!isLoading && doctors && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} specialties={specialties || {}} onEdit={openEdit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {drawerOpen && <DoctorDrawer doctor={editingDoc} specialties={specialties || {}} onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && <DeleteModal doctor={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  )
}

function DoctorCard({ doctor, specialties, onEdit, onDelete }: {
  doctor: Doctor; specialties: Record<string, string>; onEdit: (d: Doctor) => void; onDelete: (d: Doctor) => void
}) {
  const updateMutation = useUpdateDoctor()
  const toggleActive = () => updateMutation.mutate({ id: doctor.id, data: { isActive: !doctor.isActive } })
  const formatCurrency = (v?: number) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'

  return (
    <div className={`bg-dark-800 border rounded-lg p-5 ${doctor.isActive ? 'border-dark-700' : 'border-dark-700 opacity-60'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-500/15 flex items-center justify-center text-primary-200 font-bold text-sm">
            {doctor.firstName[0]}{doctor.lastName[0]}
          </div>
          <div>
            <h3 className="font-medium text-white">{doctor.fullName}</h3>
            <p className="text-sm text-primary-400">{specialties[doctor.specialty] || doctor.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleActive} title={doctor.isActive ? 'Desativar' : 'Ativar'} className="p-1.5 rounded hover:bg-dark-700">
            {doctor.isActive ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} className="text-gray-500" />}
          </button>
          <button onClick={() => onEdit(doctor)} className="p-1.5 rounded hover:bg-dark-700 text-gray-400"><Pencil size={14} /></button>
          <button onClick={() => onDelete(doctor)} className="p-1.5 rounded hover:bg-dark-700 text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-gray-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Stethoscope size={14} /> CRM: {doctor.crm}/{doctor.crmState}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1"><Clock size={14} /> Consulta: {doctor.consultationDuration} min</span>
          <span className="flex items-center gap-1"><DollarSign size={14} /> {formatCurrency(doctor.consultationPrice)}</span>
        </div>
        {doctor.email && <p className="text-xs text-gray-500 truncate">{doctor.email}</p>}
      </div>
      {!doctor.isActive && <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-dark-700 text-gray-400">Inativo</span>}
    </div>
  )
}

function DoctorDrawer({ doctor, specialties, onClose }: { doctor: Doctor | null; specialties: Record<string, string>; onClose: () => void }) {
  const createMutation = useCreateDoctor()
  const updateMutation = useUpdateDoctor()
  const isEdit = !!doctor

  const [form, setForm] = useState<CreateDoctorRequest>({
    firstName: doctor?.firstName || '',
    lastName: doctor?.lastName || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    crm: doctor?.crm || '',
    crmState: doctor?.crmState || 'SP',
    specialty: doctor?.specialty || 'clinico_geral',
    consultationDuration: doctor?.consultationDuration || 30,
    consultationPrice: doctor?.consultationPrice || undefined,
    bio: doctor?.bio || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      updateMutation.mutate({ id: doctor.id, data: form }, { onSuccess: onClose })
    } else {
      createMutation.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const inputClass = 'w-full border border-dark-600 rounded-lg px-3 py-2 text-sm bg-dark-800 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none'

  const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Editar Medico' : 'Novo Medico'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
              <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sobrenome *</label>
              <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CRM *</label>
              <input type="text" required value={form.crm} onChange={(e) => setForm({ ...form, crm: e.target.value })} className={inputClass} placeholder="123456" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">UF do CRM *</label>
              <select value={form.crmState} onChange={(e) => setForm({ ...form, crmState: e.target.value })} className={inputClass}>
                {UF_LIST.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Especialidade *</label>
            <select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value as DoctorSpecialty })} className={inputClass}>
              {Object.entries(specialties).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duracao Consulta (min)</label>
              <input type="number" min={5} value={form.consultationDuration} onChange={(e) => setForm({ ...form, consultationDuration: parseInt(e.target.value) || 30 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor Consulta (R$)</label>
              <input type="number" min={0} step={0.01} value={form.consultationPrice || ''} onChange={(e) => setForm({ ...form, consultationPrice: parseFloat(e.target.value) || undefined })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bio / Descricao</label>
            <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputClass} placeholder="Breve descricao profissional..." />
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isPending}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Salvar' : 'Cadastrar Medico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const deleteMutation = useDeleteDoctor()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-white">Remover medico</h3>
        <p className="text-sm text-gray-400 mt-2">Tem certeza que deseja remover <strong>{doctor.fullName}</strong>?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Cancelar</button>
          <button onClick={() => deleteMutation.mutate(doctor.id, { onSuccess: onClose })} disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
            {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />} Remover
          </button>
        </div>
      </div>
    </div>
  )
}
