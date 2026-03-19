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
  Plus,
  Search,
  Loader2,
  Users,
  ShieldAlert,
  CalendarClock,
  HeartPulse,
} from 'lucide-react'
import type { CreateContactRequest, ContactWithStats } from '../../../../shared/types'

export function ContactsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactWithStats | null>(null)

  const { data: contactsData, isLoading, error } = useContacts({ page, limit: 20, search })
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Pacientes</h1>
            <p className="mt-2 text-gray-400">Cadastro e gestao de pacientes da clinica</p>
          </div>
          <button onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
            <Plus className="w-5 h-5 mr-2" />
            Novo Paciente
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total de Pacientes</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Com Convenio</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.withConvenio}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/15 rounded-lg flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 text-primary-400" />
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Com Alergias</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.withAllergies}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/15 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-lg border border-dark-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Retorno em 7 dias</p>
                  <p className="text-2xl font-bold text-white mt-1">{stats.pendingReturn}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CalendarClock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyPress={handleSearchKeyPress}
              placeholder="Buscar por nome, CPF, telefone ou convenio..."
              className="w-full pl-10 pr-4 py-2 border border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-800 text-gray-200 placeholder-gray-500" />
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">Buscar</button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-dark-800 rounded-lg border border-red-500/30 p-12 text-center">
          <div className="text-red-400 mb-2">Erro ao carregar pacientes</div>
          <p className="text-gray-400 text-sm">{(error as any)?.response?.data?.message || 'Tente novamente mais tarde'}</p>
        </div>
      ) : contactsData ? (
        <>
          <ContactsTable contacts={contactsData.data} onEdit={handleEdit} onView={handleView} />
          {contactsData.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-300">
                Mostrando <span className="font-medium">{(page - 1) * contactsData.pagination.limit + 1}</span> ate{' '}
                <span className="font-medium">{Math.min(page * contactsData.pagination.limit, contactsData.pagination.total)}</span> de{' '}
                <span className="font-medium">{contactsData.pagination.total}</span> pacientes
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!contactsData.pagination.hasPrev}
                  className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <button onClick={() => setPage((p) => p + 1)} disabled={!contactsData.pagination.hasNext}
                  className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
