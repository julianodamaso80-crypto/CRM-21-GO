import { useState } from 'react'
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useContactStats,
} from '../../hooks/useContacts'
import { ContactsTable } from './ContactsTable'
import { ContactDrawer } from './ContactDrawer'
import {
  Plus, Search, Loader2, Users, CheckCircle2, AlertCircle, Car,
} from 'lucide-react'
import type { CreateContactRequest, ContactWithStats } from '../../../../shared/types'

export function ContactsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [origemFilter, setOrigemFilter] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactWithStats | null>(null)

  const { data: contactsData, isLoading, error } = useContacts({
    page,
    limit: 20,
    search,
    status: statusFilter || undefined,
    origem: origemFilter || undefined,
  })
  const { data: stats } = useContactStats()

  const createContact = useCreateContact()
  const updateContact = useUpdateContact()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleCreate = () => {
    setSelectedContact(null)
    setIsDrawerOpen(true)
  }

  const handleEdit = (contact: ContactWithStats) => {
    setSelectedContact(contact)
    setIsDrawerOpen(true)
  }

  const handleView = (contact: ContactWithStats) => {
    handleEdit(contact)
  }

  const handleSubmit = async (data: CreateContactRequest) => {
    if (selectedContact) {
      await updateContact.mutateAsync({ id: selectedContact.id, data })
    } else {
      await createContact.mutateAsync(data)
    }
    setIsDrawerOpen(false)
    setSelectedContact(null)
  }

  const isSubmitting = createContact.isPending || updateContact.isPending

  return (
    <div className="p-6 max-w-7xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Associados</h1>
            <p className="mt-2 text-gray-400">Cadastro e gestao de associados 21Go</p>
          </div>
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Associado
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 stagger-children">
            <StatCard icon={<Users className="w-5 h-5 text-gold-400" />} label="Total" value={stats.total} bg="bg-gold-500/10" />
            <StatCard icon={<CheckCircle2 className="w-5 h-5 text-accent-emerald" />} label="Ativos" value={stats.ativos} bg="bg-accent-emerald/10" />
            <StatCard icon={<AlertCircle className="w-5 h-5 text-accent-rose" />} label="Inadimplentes" value={stats.inadimplentes} bg="bg-accent-rose/10" />
            <StatCard icon={<Car className="w-5 h-5 text-accent-blue" />} label="Veiculos" value={stats.totalVehicles} bg="bg-accent-blue/10" />
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Buscar por nome, CPF ou WhatsApp..."
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input w-auto"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="em_adesao">Em Adesao</option>
            <option value="inadimplente">Inadimplente</option>
            <option value="inativo">Inativo</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select
            value={origemFilter}
            onChange={(e) => { setOrigemFilter(e.target.value); setPage(1) }}
            className="input w-auto"
          >
            <option value="">Todas as origens</option>
            <option value="google_ads">Google Ads</option>
            <option value="meta_ads">Meta Ads</option>
            <option value="instagram">Instagram</option>
            <option value="indicacao">Indicacao</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="direto">Direto</option>
          </select>
          <button onClick={handleSearch} className="btn-primary">
            Buscar
          </button>
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="card p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="card border-red-500/20 p-12 text-center">
          <div className="text-red-400 mb-2">Erro ao carregar associados</div>
          <p className="text-gray-400 text-sm">{(error as any)?.response?.data?.message || 'Tente novamente mais tarde'}</p>
        </div>
      ) : contactsData ? (
        <>
          <ContactsTable contacts={contactsData.data} onEdit={handleEdit} onView={handleView} />
          {contactsData.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Mostrando{' '}
                <span className="font-medium text-gray-200">{(page - 1) * contactsData.pagination.limit + 1}</span> ate{' '}
                <span className="font-medium text-gray-200">{Math.min(page * contactsData.pagination.limit, contactsData.pagination.total)}</span> de{' '}
                <span className="font-medium text-gray-200">{contactsData.pagination.total}</span> associados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!contactsData.pagination.hasPrev}
                  className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!contactsData.pagination.hasNext}
                  className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Proximo
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Drawer */}
      <ContactDrawer
        isOpen={isDrawerOpen}
        contact={selectedContact}
        onClose={() => { setIsDrawerOpen(false); setSelectedContact(null) }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`stat-icon ${bg}`}>{icon}</div>
      </div>
    </div>
  )
}
