import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Wand2, Loader2, MoreVertical, Trash2, LayoutGrid } from 'lucide-react'
import { usePipes, useCreatePipe, useDeletePipe } from '../../hooks/usePipes'

export function PipesListPage() {
  const navigate = useNavigate()
  const { data: pipes, isLoading } = usePipes()
  const createPipe = useCreatePipe()
  const deletePipe = useDeletePipe()
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    createPipe.mutate({ name: newName.trim() }, {
      onSuccess: (pipe) => {
        setShowNewForm(false)
        setNewName('')
        navigate(`/pipes/${pipe.id}/kanban`)
      },
    })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipes</h1>
          <p className="text-gray-400">Gerencie seus processos e pipelines</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/pipes/new-ai"
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Wand2 className="w-4 h-4" />
            Criar com IA
          </Link>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-400"
          >
            <Plus className="w-4 h-4" />
            Novo Pipe
          </button>
        </div>
      </div>

      {/* New Pipe Form */}
      {showNewForm && (
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do pipe..."
              className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || createPipe.isPending}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50"
            >
              {createPipe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewName('') }}
              className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!pipes || pipes.length === 0) && (
        <div className="text-center p-12 bg-dark-800 rounded-lg border border-dark-700">
          <LayoutGrid className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum pipe ainda</h3>
          <p className="text-gray-400 mb-4">Crie seu primeiro pipe manualmente ou com IA</p>
          <div className="flex justify-center gap-2">
            <Link
              to="/pipes/new-ai"
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Wand2 className="w-4 h-4" />
              Criar com IA
            </Link>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-400"
            >
              <Plus className="w-4 h-4" />
              Novo Pipe
            </button>
          </div>
        </div>
      )}

      {/* Pipes Grid */}
      {pipes && pipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipes.map((pipe) => (
            <div
              key={pipe.id}
              className="bg-dark-800 rounded-lg border border-dark-700 p-5 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/pipes/${pipe.id}/kanban`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg" style={{ backgroundColor: pipe.color }}>
                    {pipe.icon || pipe.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{pipe.name}</h3>
                    {pipe.description && (
                      <p className="text-sm text-gray-400 line-clamp-1">{pipe.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === pipe.id ? null : pipe.id) }}
                  className="p-1 text-gray-500 hover:text-gray-400 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen === pipe.id && (
                  <div className="absolute right-4 top-12 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-10 py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePipe.mutate(pipe.id)
                        setMenuOpen(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      Arquivar
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-4 text-sm text-gray-400">
                <span>{pipe._count?.phases ?? 0} fases</span>
                <span>{pipe._count?.cards ?? 0} cards</span>
                <span>{pipe._count?.fieldDefinitions ?? 0} campos</span>
              </div>
              {pipe.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {pipe.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-dark-700 text-gray-400 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
