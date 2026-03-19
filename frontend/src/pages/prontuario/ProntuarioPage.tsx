import { useState } from 'react'
import {
  Loader2, Plus, FileText, Heart, Thermometer, Scale, Ruler, Droplets, Activity,
  Stethoscope, Pill, ClipboardList, AlertCircle, Paperclip, ChevronDown, ChevronUp,
  Calendar, User, Search,
} from 'lucide-react'
import { useMedicalRecords, useCreateMedicalRecord } from '../../hooks/useMedicalRecords'
import { useDoctors } from '../../hooks/useDoctors'
import type { MedicalRecord, CreateMedicalRecordRequest, ConsultationType } from '../../../../shared/types'

const TYPE_LABELS: Record<ConsultationType, string> = {
  anamnesis: 'Anamnese',
  follow_up: 'Acompanhamento',
  exam_result: 'Resultado de Exame',
  prescription: 'Prescricao',
  referral: 'Encaminhamento',
  procedure_note: 'Nota de Procedimento',
  evolution: 'Evolucao',
}

const TYPE_ICONS: Record<ConsultationType, typeof FileText> = {
  anamnesis: ClipboardList,
  follow_up: Activity,
  exam_result: FileText,
  prescription: Pill,
  referral: Stethoscope,
  procedure_note: Heart,
  evolution: FileText,
}

const TYPE_COLORS: Record<ConsultationType, string> = {
  anamnesis: 'bg-blue-500/15 text-blue-400',
  follow_up: 'bg-teal-500/15 text-teal-400',
  exam_result: 'bg-purple-500/15 text-purple-400',
  prescription: 'bg-green-500/15 text-green-400',
  referral: 'bg-orange-500/15 text-orange-400',
  procedure_note: 'bg-red-500/15 text-red-400',
  evolution: 'bg-dark-700 text-gray-300',
}

export function ProntuarioPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<Array<{ id: string; fullName: string }>>([])
  const [showPatients, setShowPatients] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [filterType, setFilterType] = useState<string>('')

  const queryParams = selectedPatientId ? { patientId: selectedPatientId, ...(filterType ? { type: filterType } : {}) } : undefined
  const { data: records, isLoading } = useMedicalRecords(queryParams)
  const { data: doctors } = useDoctors()

  const searchPatients = async (q: string) => {
    setPatientSearch(q)
    if (q.length < 2) { setPatients([]); setShowPatients(false); return }
    try {
      const { api } = await import('../../lib/api')
      const res = await api.get('/contacts', { params: { search: q } })
      setPatients((res.data.data || res.data).map((c: any) => ({ id: c.id, fullName: c.fullName })))
      setShowPatients(true)
    } catch {
      setPatients([])
    }
  }

  const selectPatient = (p: { id: string; fullName: string }) => {
    setSelectedPatientId(p.id)
    setPatientSearch(p.fullName)
    setShowPatients(false)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prontuario</h1>
          <p className="text-sm text-gray-400 mt-1">Registros medicos e historico de consultas</p>
        </div>
        {selectedPatientId && (
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">
            <Plus size={16} /> Novo Registro
          </button>
        )}
      </div>

      {/* Patient Search */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => searchPatients(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              placeholder="Buscar paciente pelo nome..."
            />
            {showPatients && patients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {patients.map((p) => (
                  <button
                    key={p.id} type="button"
                    onClick={() => selectPatient(p)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-dark-700 border-b border-dark-700 last:border-0 flex items-center gap-2"
                  >
                    <User size={14} className="text-gray-500" />
                    {p.fullName}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPatientId && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!selectedPatientId && (
        <div className="text-center p-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Selecione um paciente</h3>
          <p className="text-gray-400 mt-1">Busque um paciente para ver seu historico medico</p>
        </div>
      )}

      {selectedPatientId && isLoading && (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>
      )}

      {selectedPatientId && !isLoading && records && records.length === 0 && (
        <div className="text-center p-12">
          <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum registro</h3>
          <p className="text-gray-400 mt-1">Crie o primeiro registro medico deste paciente</p>
        </div>
      )}

      {selectedPatientId && !isLoading && records && records.length > 0 && (
        <div className="space-y-3">
          {records.map((rec) => (
            <RecordCard
              key={rec.id}
              record={rec}
              expanded={selectedRecord?.id === rec.id}
              onToggle={() => setSelectedRecord(selectedRecord?.id === rec.id ? null : rec)}
            />
          ))}
        </div>
      )}

      {drawerOpen && (
        <NewRecordDrawer
          patientId={selectedPatientId}
          patientName={patientSearch}
          doctors={doctors?.filter((d) => d.isActive) || []}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Record Card ─────────────────────────────────────────

function RecordCard({ record, expanded, onToggle }: {
  record: MedicalRecord
  expanded: boolean
  onToggle: () => void
}) {
  const Icon = TYPE_ICONS[record.type] || FileText

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4 hover:bg-dark-700 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${TYPE_COLORS[record.type]}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[record.type]}`}>
                  {TYPE_LABELS[record.type]}
                </span>
                {record.isConfidential && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Confidencial</span>
                )}
              </div>
              <p className="text-sm font-medium text-white mt-1 truncate">
                {record.chiefComplaint || record.diagnosis || record.notes || 'Registro medico'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
            <div className="text-right text-xs text-gray-400">
              <div className="flex items-center gap-1"><Calendar size={12} />{new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-1 mt-0.5"><Stethoscope size={12} />{record.doctor.fullName}</div>
            </div>
            {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dark-700 p-4 space-y-4">
          {/* Vital Signs */}
          {record.vitalSigns && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Sinais Vitais</h4>
              <div className="grid grid-cols-3 gap-2">
                {record.vitalSigns.bloodPressure && (
                  <div className="flex items-center gap-2 p-2 bg-red-500/15 rounded-lg">
                    <Heart size={14} className="text-red-500" />
                    <div><p className="text-[10px] text-gray-400">PA</p><p className="text-xs font-medium">{record.vitalSigns.bloodPressure} mmHg</p></div>
                  </div>
                )}
                {record.vitalSigns.heartRate && (
                  <div className="flex items-center gap-2 p-2 bg-pink-500/15 rounded-lg">
                    <Activity size={14} className="text-pink-500" />
                    <div><p className="text-[10px] text-gray-400">FC</p><p className="text-xs font-medium">{record.vitalSigns.heartRate} bpm</p></div>
                  </div>
                )}
                {record.vitalSigns.temperature && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/15 rounded-lg">
                    <Thermometer size={14} className="text-yellow-600" />
                    <div><p className="text-[10px] text-gray-400">Temp</p><p className="text-xs font-medium">{record.vitalSigns.temperature}°C</p></div>
                  </div>
                )}
                {record.vitalSigns.weight && (
                  <div className="flex items-center gap-2 p-2 bg-blue-500/15 rounded-lg">
                    <Scale size={14} className="text-blue-500" />
                    <div><p className="text-[10px] text-gray-400">Peso</p><p className="text-xs font-medium">{record.vitalSigns.weight} kg</p></div>
                  </div>
                )}
                {record.vitalSigns.height && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-500/15 rounded-lg">
                    <Ruler size={14} className="text-indigo-500" />
                    <div><p className="text-[10px] text-gray-400">Altura</p><p className="text-xs font-medium">{record.vitalSigns.height} cm</p></div>
                  </div>
                )}
                {record.vitalSigns.oxygenSaturation && (
                  <div className="flex items-center gap-2 p-2 bg-primary-500/15 rounded-lg">
                    <Droplets size={14} className="text-teal-500" />
                    <div><p className="text-[10px] text-gray-400">SpO2</p><p className="text-xs font-medium">{record.vitalSigns.oxygenSaturation}%</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content sections */}
          {record.chiefComplaint && <Section title="Queixa Principal" icon={AlertCircle} color="text-red-500">{record.chiefComplaint}</Section>}
          {record.anamnesis && <Section title="Anamnese" icon={ClipboardList} color="text-blue-500">{record.anamnesis}</Section>}
          {record.physicalExam && <Section title="Exame Fisico" icon={Stethoscope} color="text-teal-500">{record.physicalExam}</Section>}
          {record.diagnosis && (
            <Section title="Diagnostico" icon={FileText} color="text-purple-500">
              {record.diagnosis}
              {record.diagnosisCid && <span className="ml-2 text-xs bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded">CID: {record.diagnosisCid}</span>}
            </Section>
          )}
          {record.prescription && <Section title="Prescricao" icon={Pill} color="text-green-500">{record.prescription}</Section>}
          {record.procedures && <Section title="Procedimentos" icon={Heart} color="text-orange-500">{record.procedures}</Section>}
          {record.notes && <Section title="Observacoes" icon={FileText} color="text-gray-400">{record.notes}</Section>}
          {record.referral && (
            <Section title="Encaminhamento" icon={Stethoscope} color="text-orange-500">
              {record.referral} {record.referralSpecialty && `(${record.referralSpecialty})`}
            </Section>
          )}

          {/* Attachments */}
          {record.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Anexos</h4>
              <div className="space-y-1">
                {record.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 p-2 bg-dark-900 rounded text-sm">
                    <Paperclip size={14} className="text-gray-500" />
                    <span className="text-gray-300">{att.fileName}</span>
                    <span className="text-xs text-gray-500">({(att.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, color, children }: {
  title: string
  icon: typeof FileText
  color: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase mb-1">
        <Icon size={12} className={color} />{title}
      </h4>
      <div className="text-sm text-gray-100 whitespace-pre-line bg-dark-900 rounded-lg p-3">{children}</div>
    </div>
  )
}

// ─── New Record Drawer ───────────────────────────────────

function NewRecordDrawer({ patientId, patientName, doctors, onClose }: {
  patientId: string
  patientName: string
  doctors: Array<{ id: string; fullName: string }>
  onClose: () => void
}) {
  const createMutation = useCreateMedicalRecord()

  const [form, setForm] = useState<CreateMedicalRecordRequest>({
    patientId,
    doctorId: '',
    type: 'evolution',
    date: new Date().toISOString().split('T')[0],
  })

  const [showVitals, setShowVitals] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.doctorId) return
    createMutation.mutate(form, { onSuccess: onClose })
  }

  const updateField = (field: string, value: any) => setForm({ ...form, [field]: value })
  const updateVital = (field: string, value: any) => {
    setForm({ ...form, vitalSigns: { ...form.vitalSigns, [field]: value } })
  }

  const inputClass = 'w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Novo Registro Medico</h2>
            <p className="text-sm text-gray-400">Paciente: {patientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Header fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Medico *</label>
              <select value={form.doctorId} onChange={(e) => updateField('doctorId', e.target.value)} className={inputClass} required>
                <option value="">Selecione</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo *</label>
              <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className={inputClass}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data *</label>
              <input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} className={inputClass} required />
            </div>
          </div>

          {/* Vital Signs Toggle */}
          <button
            type="button"
            onClick={() => setShowVitals(!showVitals)}
            className="flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-200"
          >
            <Activity size={16} />
            Sinais Vitais
            {showVitals ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showVitals && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-dark-900 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">PA (mmHg)</label>
                <input type="text" placeholder="120/80" value={form.vitalSigns?.bloodPressure || ''} onChange={(e) => updateVital('bloodPressure', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">FC (bpm)</label>
                <input type="number" placeholder="72" value={form.vitalSigns?.heartRate || ''} onChange={(e) => updateVital('heartRate', e.target.value ? parseInt(e.target.value) : undefined)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Temp (°C)</label>
                <input type="number" step="0.1" placeholder="36.5" value={form.vitalSigns?.temperature || ''} onChange={(e) => updateVital('temperature', e.target.value ? parseFloat(e.target.value) : undefined)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Peso (kg)</label>
                <input type="number" step="0.1" placeholder="70" value={form.vitalSigns?.weight || ''} onChange={(e) => updateVital('weight', e.target.value ? parseFloat(e.target.value) : undefined)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Altura (cm)</label>
                <input type="number" placeholder="175" value={form.vitalSigns?.height || ''} onChange={(e) => updateVital('height', e.target.value ? parseInt(e.target.value) : undefined)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">SpO2 (%)</label>
                <input type="number" placeholder="98" value={form.vitalSigns?.oxygenSaturation || ''} onChange={(e) => updateVital('oxygenSaturation', e.target.value ? parseInt(e.target.value) : undefined)} className={inputClass} />
              </div>
            </div>
          )}

          {/* Clinical fields */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Queixa Principal</label>
            <input type="text" value={form.chiefComplaint || ''} onChange={(e) => updateField('chiefComplaint', e.target.value)} className={inputClass} placeholder="Motivo da consulta" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Anamnese</label>
            <textarea value={form.anamnesis || ''} onChange={(e) => updateField('anamnesis', e.target.value)} rows={4} className={inputClass} placeholder="Historia clinica, queixas, sintomas..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Exame Fisico</label>
            <textarea value={form.physicalExam || ''} onChange={(e) => updateField('physicalExam', e.target.value)} rows={3} className={inputClass} placeholder="Achados do exame fisico..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Diagnostico</label>
              <input type="text" value={form.diagnosis || ''} onChange={(e) => updateField('diagnosis', e.target.value)} className={inputClass} placeholder="Diagnostico" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CID</label>
              <input type="text" value={form.diagnosisCid || ''} onChange={(e) => updateField('diagnosisCid', e.target.value)} className={inputClass} placeholder="Ex: J06.9" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Prescricao</label>
            <textarea value={form.prescription || ''} onChange={(e) => updateField('prescription', e.target.value)} rows={3} className={inputClass} placeholder="Medicamentos, posologia..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Procedimentos Realizados</label>
            <textarea value={form.procedures || ''} onChange={(e) => updateField('procedures', e.target.value)} rows={2} className={inputClass} placeholder="Procedimentos executados..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observacoes</label>
            <textarea value={form.notes || ''} onChange={(e) => updateField('notes', e.target.value)} rows={2} className={inputClass} placeholder="Observacoes gerais..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Encaminhamento</label>
              <input type="text" value={form.referral || ''} onChange={(e) => updateField('referral', e.target.value)} className={inputClass} placeholder="Ex: Nutricionista" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Especialidade do Encaminhamento</label>
              <input type="text" value={form.referralSpecialty || ''} onChange={(e) => updateField('referralSpecialty', e.target.value)} className={inputClass} placeholder="Ex: nutricao" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confidential"
              checked={form.isConfidential || false}
              onChange={(e) => updateField('isConfidential', e.target.checked)}
              className="rounded border-dark-600 text-primary-500 focus:ring-teal-500"
            />
            <label htmlFor="confidential" className="text-sm text-gray-300">Marcar como confidencial</label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.doctorId}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
