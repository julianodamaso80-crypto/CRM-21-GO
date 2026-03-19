import { useState, useMemo } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Plus, Loader2,
  User, Stethoscope, Check, X, AlertTriangle, Eye,
} from 'lucide-react'
import { useAppointments, useAppointmentStats, useCreateAppointment, useUpdateAppointment } from '../../hooks/useAppointments'
import { useDoctors } from '../../hooks/useDoctors'
import { useConvenios } from '../../hooks/useConvenios'
import type { Appointment, CreateAppointmentRequest, AppointmentType, AppointmentStatus } from '../../../../shared/types'

type ViewMode = 'day' | 'week'

const TYPE_LABELS: Record<AppointmentType, string> = {
  first_visit: 'Primeira Consulta',
  return: 'Retorno',
  exam: 'Exame',
  procedure: 'Procedimento',
  consultation: 'Consulta',
  emergency: 'Emergencia',
}

const TYPE_COLORS: Record<AppointmentType, string> = {
  first_visit: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  return: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  exam: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  procedure: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  consultation: 'bg-green-500/15 text-green-400 border-green-500/30',
  emergency: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  waiting: 'Em espera',
  in_progress: 'Em atendimento',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'Nao compareceu',
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'text-blue-400',
  confirmed: 'text-green-400',
  waiting: 'text-yellow-400',
  in_progress: 'text-primary-400',
  completed: 'text-gray-400',
  cancelled: 'text-red-400',
  no_show: 'text-orange-400',
}

function formatDateLabel(date: Date): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function getWeekDays(date: Date): Date[] {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay() + 1)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

function isToday(date: Date): boolean {
  return toDateStr(date) === toDateStr(new Date())
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7h-17h

export function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [filterDoctor, setFilterDoctor] = useState<string>('')

  const { data: doctors } = useDoctors()
  const { data: stats, isLoading: statsLoading } = useAppointmentStats()

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const dateRange = viewMode === 'week'
    ? { dateFrom: toDateStr(weekDays[0]), dateTo: toDateStr(weekDays[6]) }
    : { date: toDateStr(currentDate) }

  const queryParams = { ...dateRange, ...(filterDoctor ? { doctorId: filterDoctor } : {}) }
  const { data: appointments, isLoading } = useAppointments(queryParams)

  const navigate = (delta: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + (viewMode === 'week' ? delta * 7 : delta))
    setCurrentDate(d)
  }

  const goToday = () => setCurrentDate(new Date())

  const openNewAppointment = () => {
    setSelectedAppointment(null)
    setDrawerOpen(true)
  }

  const openDetail = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setDetailOpen(true)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-sm text-gray-400 mt-1">Agendamento de consultas e procedimentos</p>
        </div>
        <button onClick={openNewAppointment} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">
          <Plus size={16} /> Nova Consulta
        </button>
      </div>

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Hoje</p>
            <p className="text-2xl font-bold text-primary-400">{stats.today}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Esta semana</p>
            <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Este mes</p>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">Cancelamentos</p>
            <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-dark-700"><ChevronLeft size={18} /></button>
            <button onClick={goToday} className="px-3 py-1 text-sm font-medium text-primary-400 border border-primary-500/30 rounded hover:bg-primary-500/15">Hoje</button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded hover:bg-dark-700"><ChevronRight size={18} /></button>
            <span className="ml-2 text-lg font-semibold text-white">
              {viewMode === 'week'
                ? `${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${weekDays[6].toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`
                : formatDateLabel(currentDate) + ` ${currentDate.getFullYear()}`
              }
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="text-sm border border-dark-600 rounded-lg px-3 py-1.5 bg-dark-800 text-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">Todos os medicos</option>
              {doctors?.filter((d) => d.isActive).map((d) => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
            <div className="flex bg-dark-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm rounded-md ${viewMode === 'day' ? 'bg-dark-800 shadow text-primary-200 font-medium' : 'text-gray-400'}`}
              >Dia</button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded-md ${viewMode === 'week' ? 'bg-dark-800 shadow text-primary-200 font-medium' : 'text-gray-400'}`}
              >Semana</button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {isLoading && <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-400 animate-spin" /></div>}

        {!isLoading && viewMode === 'week' && (
          <WeekView days={weekDays} appointments={appointments || []} onSelect={openDetail} />
        )}

        {!isLoading && viewMode === 'day' && (
          <DayView date={currentDate} appointments={appointments || []} onSelect={openDetail} />
        )}
      </div>

      {drawerOpen && (
        <AppointmentDrawer
          onClose={() => setDrawerOpen(false)}
          doctors={doctors || []}
        />
      )}

      {detailOpen && selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => { setDetailOpen(false); setSelectedAppointment(null) }}
        />
      )}
    </div>
  )
}

// --- Week View ---

function WeekView({ days, appointments, onSelect }: {
  days: Date[]
  appointments: Appointment[]
  onSelect: (a: Appointment) => void
}) {
  const getAppointmentsForDay = (date: Date) =>
    appointments
      .filter((a) => a.date === toDateStr(date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="grid grid-cols-7 divide-x divide-dark-700">
      {days.map((day) => {
        const dayApts = getAppointmentsForDay(day)
        const dayIsToday = isToday(day)
        return (
          <div key={toDateStr(day)} className="min-h-[500px]">
            <div className={`text-center py-2 border-b border-dark-700 ${dayIsToday ? 'bg-primary-500/15' : ''}`}>
              <p className={`text-xs uppercase ${dayIsToday ? 'text-primary-400 font-bold' : 'text-gray-400'}`}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][day.getDay()]}
              </p>
              <p className={`text-lg font-semibold ${dayIsToday ? 'text-primary-200' : 'text-white'}`}>
                {day.getDate()}
              </p>
            </div>
            <div className="p-1 space-y-1">
              {dayApts.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onSelect(apt)}
                  className={`w-full text-left p-1.5 rounded border text-xs cursor-pointer hover:shadow transition-shadow ${
                    apt.status === 'cancelled' ? 'opacity-50 line-through' : ''
                  } ${TYPE_COLORS[apt.type] || 'bg-dark-700 text-gray-300 border-dark-600'}`}
                >
                  <p className="font-medium truncate">{apt.startTime} - {apt.patient.fullName}</p>
                  <p className="text-[10px] opacity-80 truncate">{apt.doctor.fullName}</p>
                </button>
              ))}
              {dayApts.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">—</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Day View ---

function DayView({ date, appointments, onSelect }: {
  date: Date
  appointments: Appointment[]
  onSelect: (a: Appointment) => void
}) {
  const dayApts = appointments
    .filter((a) => a.date === toDateStr(date))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const getAptsForHour = (hour: number) =>
    dayApts.filter((a) => {
      const h = parseInt(a.startTime.split(':')[0])
      return h === hour
    })

  return (
    <div className="divide-y divide-dark-700">
      {HOURS.map((hour) => {
        const hourApts = getAptsForHour(hour)
        return (
          <div key={hour} className="flex min-h-[72px]">
            <div className="w-16 py-2 text-right pr-3 text-xs text-gray-500 font-medium flex-shrink-0">
              {String(hour).padStart(2, '0')}:00
            </div>
            <div className="flex-1 p-1 space-y-1 border-l border-dark-700">
              {hourApts.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onSelect(apt)}
                  className={`w-full text-left p-2 rounded border cursor-pointer hover:shadow transition-shadow ${
                    apt.status === 'cancelled' ? 'opacity-50' : ''
                  } ${TYPE_COLORS[apt.type] || 'bg-dark-700 text-gray-300 border-dark-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock size={12} className="flex-shrink-0" />
                      <span className="text-xs font-medium">{apt.startTime} - {apt.endTime}</span>
                      <span className="text-xs font-medium truncate">{apt.patient.fullName}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${STATUS_COLORS[apt.status]}`}>
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80">
                    <span className="flex items-center gap-1"><Stethoscope size={10} />{apt.doctor.fullName}</span>
                    <span>{TYPE_LABELS[apt.type]}</span>
                    {apt.room && <span>| {apt.room}</span>}
                    {apt.convenioName && <span>| {apt.convenioName}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Appointment Drawer (New) ---

function AppointmentDrawer({ onClose, doctors }: {
  onClose: () => void
  doctors: Array<{ id: string; fullName: string; consultationDuration: number; consultationPrice?: number; isActive: boolean }>
}) {
  const createMutation = useCreateAppointment()
  const { data: convenios } = useConvenios()

  const [form, setForm] = useState<CreateAppointmentRequest>({
    patientId: '',
    doctorId: '',
    type: 'consultation',
    date: toDateStr(new Date()),
    startTime: '09:00',
    duration: 30,
    notes: '',
    room: '',
  })

  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<Array<{ id: string; fullName: string; convenioId?: string }>>([])
  const [showPatients, setShowPatients] = useState(false)

  const searchPatients = async (q: string) => {
    setPatientSearch(q)
    if (q.length < 2) { setPatients([]); setShowPatients(false); return }
    try {
      const { api } = await import('../../lib/api')
      const res = await api.get('/contacts', { params: { search: q } })
      setPatients((res.data.data || res.data).map((c: any) => ({ id: c.id, fullName: c.fullName, convenioId: c.convenioId })))
      setShowPatients(true)
    } catch {
      setPatients([])
    }
  }

  const selectPatient = (p: { id: string; fullName: string; convenioId?: string }) => {
    setForm({ ...form, patientId: p.id, convenioId: p.convenioId })
    setPatientSearch(p.fullName)
    setShowPatients(false)
  }

  const handleDoctorChange = (doctorId: string) => {
    const doc = doctors.find((d) => d.id === doctorId)
    setForm({
      ...form,
      doctorId,
      duration: doc?.consultationDuration || 30,
      price: doc?.consultationPrice,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.patientId || !form.doctorId) return
    createMutation.mutate(form, { onSuccess: onClose })
  }

  const inputClass = 'w-full border border-dark-600 rounded-lg px-3 py-2 text-sm bg-dark-800 text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl flex flex-col">
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Agendar Consulta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Patient search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Paciente *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => searchPatients(e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="Buscar paciente..."
                required
              />
            </div>
            {showPatients && patients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {patients.map((p) => (
                  <button
                    key={p.id} type="button"
                    onClick={() => selectPatient(p)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary-500/15 border-b border-dark-700 last:border-0"
                  >
                    {p.fullName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Medico *</label>
            <select
              value={form.doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Selecione o medico</option>
              {doctors.filter((d) => d.isActive).map((d) => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}
              className={inputClass}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Horario *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duracao (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })}
                className={inputClass}
                min={5} max={240} step={5}
              />
            </div>
          </div>

          {/* Convenio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Convenio</label>
            <select
              value={form.convenioId || ''}
              onChange={(e) => setForm({ ...form, convenioId: e.target.value || undefined })}
              className={inputClass}
            >
              <option value="">Particular</option>
              {convenios?.filter((c) => c.isActive).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price + Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
              <input
                type="number"
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                className={inputClass}
                min={0} step={0.01}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sala</label>
              <input
                type="text"
                value={form.room || ''}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                className={inputClass}
                placeholder="Sala 1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observacoes</label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || !form.patientId || !form.doctorId}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Agendar Consulta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- Appointment Detail Modal ---

function AppointmentDetail({ appointment, onClose }: {
  appointment: Appointment
  onClose: () => void
}) {
  const updateMutation = useUpdateAppointment()

  const changeStatus = (status: AppointmentStatus, cancellationReason?: string) => {
    updateMutation.mutate(
      { id: appointment.id, data: { status, cancellationReason } },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-dark-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Detalhes da Consulta</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-400 text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-3">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[appointment.type]}`}>
              {TYPE_LABELS[appointment.type]}
            </span>
            <span className={`text-sm font-medium ${STATUS_COLORS[appointment.status]}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
          </div>

          {/* Patient */}
          <div className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
            <User size={18} className="text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">{appointment.patient.fullName}</p>
              {appointment.patient.phone && <p className="text-xs text-gray-400">{appointment.patient.phone}</p>}
              {appointment.convenioName && (
                <p className="text-xs text-gray-400">{appointment.convenioName} - {appointment.patient.convenioNumber}</p>
              )}
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
            <Stethoscope size={18} className="text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-white">{appointment.doctor.fullName}</p>
              <p className="text-xs text-gray-400">CRM {appointment.doctor.crm}</p>
            </div>
          </div>

          {/* Date + Time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span>{new Date(appointment.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span>{appointment.startTime} - {appointment.endTime} ({appointment.duration}min)</span>
            </div>
          </div>

          {/* Room + Price */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {appointment.room && <span>Sala: {appointment.room}</span>}
            {appointment.price && (
              <span>Valor: R$ {appointment.price.toFixed(2)} {appointment.isPaid ? '(pago)' : '(pendente)'}</span>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 rounded-lg">
              <p className="text-xs font-medium text-yellow-400 mb-1">Observacoes</p>
              <p className="text-sm text-yellow-300">{appointment.notes}</p>
            </div>
          )}

          {appointment.cancellationReason && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
              <p className="text-xs font-medium text-red-400 mb-1">Motivo do cancelamento</p>
              <p className="text-sm text-red-300">{appointment.cancellationReason}</p>
            </div>
          )}

          {/* Actions */}
          {!['completed', 'cancelled', 'no_show'].includes(appointment.status) && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-dark-700">
              {appointment.status === 'scheduled' && (
                <button
                  onClick={() => changeStatus('confirmed')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 border border-green-500/30"
                >
                  <Check size={14} /> Confirmar
                </button>
              )}
              {['scheduled', 'confirmed'].includes(appointment.status) && (
                <button
                  onClick={() => changeStatus('waiting')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500/15 text-yellow-400 rounded-lg hover:bg-yellow-500/25 border border-yellow-500/30"
                >
                  <Eye size={14} /> Em espera
                </button>
              )}
              {['waiting'].includes(appointment.status) && (
                <button
                  onClick={() => changeStatus('in_progress')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-500/15 text-primary-400 rounded-lg hover:bg-primary-500/25 border border-primary-500/30"
                >
                  <Stethoscope size={14} /> Iniciar
                </button>
              )}
              {['in_progress'].includes(appointment.status) && (
                <button
                  onClick={() => changeStatus('completed')}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500/15 text-green-400 rounded-lg hover:bg-green-500/25 border border-green-500/30"
                >
                  <Check size={14} /> Concluir
                </button>
              )}
              <button
                onClick={() => changeStatus('cancelled', 'Cancelado pela clinica')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 border border-red-500/30"
              >
                <X size={14} /> Cancelar
              </button>
              <button
                onClick={() => changeStatus('no_show')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500/15 text-orange-400 rounded-lg hover:bg-orange-500/25 border border-orange-500/30"
              >
                <AlertTriangle size={14} /> Nao compareceu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
