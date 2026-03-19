import { useState } from 'react'
import {
  Plus, Search, Loader2, Car, X, Edit3, Trash2,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react'
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '../../hooks/useVehicles'
import { useContacts } from '../../hooks/useContacts'
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest, VehiclePlano, VehicleTipo, VehicleCombustivel, VistoriaStatus } from '../../../../shared/types'

const PLANO_CONFIG: Record<VehiclePlano, { label: string; cls: string }> = {
  basico: { label: 'Basico', cls: 'bg-gray-500/10 text-gray-400' },
  completo: { label: 'Completo', cls: 'bg-accent-blue/10 text-accent-blue' },
  premium: { label: 'Premium', cls: 'bg-accent-amber/10 text-accent-amber' },
}

const VISTORIA_CONFIG: Record<VistoriaStatus, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'bg-accent-amber/10 text-accent-amber' },
  agendada: { label: 'Agendada', cls: 'bg-accent-blue/10 text-accent-blue' },
  aprovada: { label: 'Aprovada', cls: 'bg-accent-emerald/10 text-accent-emerald' },
  reprovada: { label: 'Reprovada', cls: 'bg-accent-rose/10 text-accent-rose' },
}

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [planoFilter, setPlanoFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useVehicles({ search, plano: planoFilter || undefined })
  const deleteMutation = useDeleteVehicle()

  const vehicles = data?.data || []

  const openCreate = () => { setEditingVehicle(null); setDrawerOpen(true) }
  const openEdit = (v: Vehicle) => { setEditingVehicle(v); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditingVehicle(null) }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
    }
  }

  const formatCurrency = (value?: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalAtivos = vehicles.filter((v) => v.ativo).length
  const totalInativos = vehicles.filter((v) => !v.ativo).length
  const vistoriaPendente = vehicles.filter((v) => v.vistoriaStatus === 'pendente').length

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Veiculos</h1>
          <p className="text-sm text-gray-400 mt-1">Gestao da frota de veiculos protegidos</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Novo Veiculo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-emerald/10 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Ativos</p>
            <p className="text-xl font-bold text-white">{totalAtivos}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-500/10 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Inativos</p>
            <p className="text-xl font-bold text-white">{totalInativos}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-amber/10 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent-amber" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Vistoria Pendente</p>
            <p className="text-xl font-bold text-white">{vistoriaPendente}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por placa, marca, modelo ou associado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>
        <select
          value={planoFilter}
          onChange={(e) => setPlanoFilter(e.target.value)}
          className="input"
        >
          <option value="">Todos os planos</option>
          <option value="basico">Basico</option>
          <option value="completo">Completo</option>
          <option value="premium">Premium</option>
        </select>
        {(search || planoFilter) && (
          <button onClick={() => { setSearch(''); setPlanoFilter('') }} className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1">
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">Nenhum veiculo encontrado</h3>
          <p className="text-sm text-gray-400 mt-1">Cadastre o primeiro veiculo protegido</p>
          <button onClick={openCreate} className="btn-primary mt-4 text-sm">
            Cadastrar Veiculo
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700/40">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Veiculo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Placa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Associado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mensalidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vistoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/40">
                {vehicles.map((vehicle) => {
                  const planoCfg = vehicle.plano ? PLANO_CONFIG[vehicle.plano] : null
                  const vistoriaCfg = VISTORIA_CONFIG[vehicle.vistoriaStatus]
                  return (
                    <tr key={vehicle.id} className="hover:bg-dark-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gold-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Car className="w-4 h-4 text-gold-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{vehicle.marca} {vehicle.modelo}</p>
                            <p className="text-xs text-gray-500">{vehicle.anoFabricacao}/{vehicle.anoModelo}{vehicle.cor ? ` • ${vehicle.cor}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-200 bg-dark-700 px-2 py-0.5 rounded">
                          {vehicle.placa}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-200">{vehicle.associado?.fullName || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {planoCfg ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planoCfg.cls}`}>
                            {planoCfg.label}
                          </span>
                        ) : <span className="text-gray-600">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatCurrency(vehicle.valorMensal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${vistoriaCfg.cls}`}>
                          {vistoriaCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${vehicle.ativo ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-dark-700 text-gray-500'}`}>
                          {vehicle.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(vehicle)} className="p-1.5 text-gray-500 hover:text-primary-400 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(vehicle.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicle Drawer */}
      {drawerOpen && <VehicleDrawer vehicle={editingVehicle} onClose={closeDrawer} />}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteId(null)} />
          <div className="relative bg-dark-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white">Remover Veiculo</h3>
            <p className="text-sm text-gray-400 mt-2">Tem certeza? Esta acao nao pode ser desfeita.</p>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Cancelar</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Vehicle Drawer ──

function VehicleDrawer({ vehicle, onClose }: { vehicle: Vehicle | null; onClose: () => void }) {
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()
  const { data: contactsData } = useContacts({ limit: 200 })
  const contacts = contactsData?.data || []

  const [associadoId, setAssociadoId] = useState(vehicle?.associadoId || '')
  const [placa, setPlaca] = useState(vehicle?.placa || '')
  const [marca, setMarca] = useState(vehicle?.marca || '')
  const [modelo, setModelo] = useState(vehicle?.modelo || '')
  const [anoFabricacao, setAnoFabricacao] = useState(vehicle?.anoFabricacao ? String(vehicle.anoFabricacao) : '')
  const [anoModelo, setAnoModelo] = useState(vehicle?.anoModelo ? String(vehicle.anoModelo) : '')
  const [cor, setCor] = useState(vehicle?.cor || '')
  const [tipo, setTipo] = useState<VehicleTipo>(vehicle?.tipo || 'carro')
  const [combustivel, setCombustivel] = useState<VehicleCombustivel | ''>(vehicle?.combustivel || '')
  const [plano, setPlano] = useState<VehiclePlano>(vehicle?.plano || 'basico')
  const [valorMensal, setValorMensal] = useState(vehicle?.valorMensal ? String(vehicle.valorMensal) : '')
  const [temRastreador, setTemRastreador] = useState(vehicle?.temRastreador || false)
  const [renavam, setRenavam] = useState(vehicle?.renavam || '')
  const [chassi, setChassi] = useState(vehicle?.chassi || '')

  const isEditing = !!vehicle
  const isPending = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!placa.trim() || !marca.trim() || !modelo.trim()) return

    const payload = {
      associadoId,
      placa: placa.trim().toUpperCase(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      anoFabricacao: parseInt(anoFabricacao) || new Date().getFullYear(),
      anoModelo: parseInt(anoModelo) || new Date().getFullYear(),
      cor: cor || undefined,
      tipo,
      combustivel: (combustivel as VehicleCombustivel) || undefined,
      plano,
      valorMensal: valorMensal ? parseFloat(valorMensal) : undefined,
      temRastreador,
      renavam: renavam || undefined,
      chassi: chassi || undefined,
    }

    if (isEditing) {
      updateMutation.mutate({ id: vehicle.id, data: payload as UpdateVehicleRequest }, { onSuccess: onClose })
    } else {
      createMutation.mutate(payload as CreateVehicleRequest, { onSuccess: onClose })
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-primary-500'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-800 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-white">{isEditing ? 'Editar Veiculo' : 'Novo Veiculo'}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-400 rounded"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Associado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Associado *</label>
            <select value={associadoId} onChange={(e) => setAssociadoId(e.target.value)} required className={inputClass}>
              <option value="">Selecione o associado</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName}{c.cpf ? ` (${c.cpf})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Placa *</label>
            <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              required placeholder="ABC1D23" maxLength={8} className={inputClass} />
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Marca *</label>
              <input type="text" value={marca} onChange={(e) => setMarca(e.target.value)} required placeholder="Honda" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Modelo *</label>
              <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} required placeholder="Civic" className={inputClass} />
            </div>
          </div>

          {/* Anos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ano Fabricacao</label>
              <input type="number" value={anoFabricacao} onChange={(e) => setAnoFabricacao(e.target.value)} min="1990" max="2030" placeholder="2022" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Ano Modelo</label>
              <input type="number" value={anoModelo} onChange={(e) => setAnoModelo(e.target.value)} min="1990" max="2030" placeholder="2023" className={inputClass} />
            </div>
          </div>

          {/* Cor e Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Cor</label>
              <input type="text" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Prata" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as VehicleTipo)} className={inputClass}>
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
                <option value="caminhonete">Caminhonete</option>
                <option value="van">Van</option>
                <option value="caminhao">Caminhao</option>
              </select>
            </div>
          </div>

          {/* Combustivel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Combustivel</label>
            <select value={combustivel} onChange={(e) => setCombustivel(e.target.value as VehicleCombustivel | '')} className={inputClass}>
              <option value="">Selecione</option>
              <option value="flex">Flex</option>
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
              <option value="diesel">Diesel</option>
              <option value="eletrico">Eletrico</option>
              <option value="hibrido">Hibrido</option>
            </select>
          </div>

          {/* Plano e Mensalidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Plano *</label>
              <select value={plano} onChange={(e) => setPlano(e.target.value as VehiclePlano)} className={inputClass}>
                <option value="basico">Basico</option>
                <option value="completo">Completo</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mensalidade (R$)</label>
              <input type="number" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} step="0.01" placeholder="0.00" className={inputClass} />
            </div>
          </div>

          {/* Renavam e Chassi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">RENAVAM</label>
              <input type="text" value={renavam} onChange={(e) => setRenavam(e.target.value)} placeholder="12345678901" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Chassi</label>
              <input type="text" value={chassi} onChange={(e) => setChassi(e.target.value.toUpperCase())} placeholder="9BWZZZ377VT004251" maxLength={17} className={inputClass} />
            </div>
          </div>

          {/* Rastreador */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="temRastreador" checked={temRastreador} onChange={(e) => setTemRastreador(e.target.checked)}
              className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500" />
            <label htmlFor="temRastreador" className="text-sm text-gray-300">Possui rastreador instalado</label>
          </div>

          {/* Acoes */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-300 border border-dark-600 rounded-lg hover:bg-dark-700">Cancelar</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50">
              {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar Veiculo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
