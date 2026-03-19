import { useState } from 'react'
import {
  Plus, Loader2, Search, Filter, Calendar, User, Tag,
  ArrowRight, ArrowLeft, ChevronDown, X, ClipboardList,
} from 'lucide-react'
import { useProjects, useCreateProject, useUpdateProject } from '../../hooks/useProjects'
import type { Project, CreateProjectRequest } from '../../services/projects.service'

const COLUMNS = [
  { key: 'backlog', label: 'Backlog', color: 'text-gray-400', dot: 'bg-gray-400' },
  { key: 'todo', label: 'A Fazer', color: 'text-accent-blue', dot: 'bg-accent-blue' },
  { key: 'doing', label: 'Em Progresso', color: 'text-accent-amber', dot: 'bg-accent-amber' },
  { key: 'review', label: 'Em Revisao', color: 'text-accent-purple', dot: 'bg-accent-purple' },
  { key: 'done', label: 'Concluido', color: 'text-accent-emerald', dot: 'bg-accent-emerald' },
] as const

const PRIORITY_CONFIG = {
  alta: { label: 'Alta', class: 'bg-red-500/12 text-red-400 border-red-500/15' },
  media: { label: 'Media', class: 'bg-amber-500/12 text-amber-400 border-amber-500/15' },
  baixa: { label: 'Baixa', class: 'bg-blue-500/12 text-blue-400 border-blue-500/15' },
}

const TAG_COLORS: Record<string, string> = {
  IA: 'bg-purple-500/12 text-purple-400 border-purple-500/15',
  backend: 'bg-accent-blue/12 text-accent-blue border-accent-blue/15',
  frontend: 'bg-accent-emerald/12 text-accent-emerald border-accent-emerald/15',
  design: 'bg-pink-500/12 text-pink-400 border-pink-500/15',
  cleanup: 'bg-orange-500/12 text-orange-400 border-orange-500/15',
  FIPE: 'bg-cyan-500/12 text-cyan-400 border-cyan-500/15',
  SEO: 'bg-lime-500/12 text-lime-400 border-lime-500/15',
  integracao: 'bg-indigo-500/12 text-indigo-400 border-indigo-500/15',
  mobile: 'bg-rose-500/12 text-rose-400 border-rose-500/15',
}

export function ProjectsPage() {
  const { data, isLoading } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const [showForm, setShowForm] = useState(false)
  const [filterPriority, setFilterPriority] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const projects = data?.data || []
  const stats = data?.stats

  const filtered = projects.filter((p) => {
    if (filterPriority && p.priority !== filterPriority) return false
    if (filterTag && !p.tags.includes(filterTag)) return false
    if (filterAssignee && p.assignee !== filterAssignee) return false
    if (searchInput) {
      const s = searchInput.toLowerCase()
      if (!p.title.toLowerCase().includes(s) && !p.description.toLowerCase().includes(s)) return false
    }
    return true
  })

  const getColumnProjects = (status: string) =>
    filtered.filter((p) => p.status === status)

  const handleMoveProject = (project: Project, direction: 'left' | 'right') => {
    const statusOrder = ['backlog', 'todo', 'doing', 'review', 'done']
    const currentIndex = statusOrder.indexOf(project.status)
    const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0 || newIndex >= statusOrder.length) return

    const newStatus = statusOrder[newIndex] as Project['status']
    const newProgress = newStatus === 'done' ? 100 : project.progress

    updateProject.mutate({
      id: project.id,
      data: { status: newStatus, progress: newProgress },
    })
  }

  const handleCreateProject = async (formData: CreateProjectRequest) => {
    await createProject.mutateAsync(formData)
    setShowForm(false)
  }

  const allTags = [...new Set(projects.flatMap((p) => p.tags))]
  const allAssignees = [...new Set(projects.map((p) => p.assignee).filter(Boolean))]
  const hasFilters = filterPriority || filterTag || filterAssignee || searchInput

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Projetos</h1>
          <p className="text-sm text-gray-400 mt-1">
            Acompanhe a evolucao das demandas e entregas
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar tarefas..."
            className="input pl-9 py-2"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input w-auto py-2"
        >
          <option value="">Prioridade</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baixa">Baixa</option>
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="input w-auto py-2"
        >
          <option value="">Tag</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="input w-auto py-2"
        >
          <option value="">Responsavel</option>
          {allAssignees.map((a) => (
            <option key={a} value={a!}>{a}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFilterPriority(''); setFilterTag(''); setFilterAssignee(''); setSearchInput('') }}
            className="btn-ghost text-xs flex items-center gap-1"
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map((col) => {
            const colProjects = getColumnProjects(col.key)
            return (
              <div key={col.key} className="w-[310px] flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                    <span className="text-xs text-gray-500 bg-dark-700/50 px-2 py-0.5 rounded-lg">
                      {stats?.[col.key as keyof typeof stats] || colProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
                  {colProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onMove={handleMoveProject}
                    />
                  ))}
                  {colProjects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <ClipboardList size={24} className="mb-2 opacity-40" />
                      <p className="text-xs">Nenhuma tarefa</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <ProjectFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateProject}
          isSubmitting={createProject.isPending}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// ProjectCard
// ═══════════════════════════════════════

function ProjectCard({
  project,
  onMove,
}: {
  project: Project
  onMove: (project: Project, dir: 'left' | 'right') => void
}) {
  const priority = PRIORITY_CONFIG[project.priority]
  const canMoveLeft = project.status !== 'backlog'
  const canMoveRight = project.status !== 'done'

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'done'

  return (
    <div className="bg-dark-800/60 rounded-2xl border border-dark-700/40 p-4 backdrop-blur-sm hover:border-gold-500/15 hover:shadow-card-hover transition-all duration-200 group">
      {/* Priority + Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className={`badge text-[10px] border ${priority.class}`}>
          {priority.label}
        </span>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className={`badge text-[10px] border ${TAG_COLORS[tag] || 'bg-dark-600/50 text-gray-400 border-dark-500/30'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-white mb-1.5 leading-snug">{project.title}</h4>

      {/* Description (truncated) */}
      {project.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      {project.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">Progresso</span>
            <span className="text-[10px] font-medium text-gray-400">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-gold-500 to-gold-400"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* Assignee */}
          {project.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gold-500/15 border border-gold-500/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-gold-400">
                  {project.assignee[0]}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">{project.assignee}</span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-500 italic">Sem responsavel</span>
          )}
        </div>

        {/* Due Date */}
        {project.dueDate && (
          <div className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Calendar size={11} />
            <span>{new Date(project.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
          </div>
        )}
      </div>

      {/* Move Buttons */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dark-700/30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(project, 'left')}
          disabled={!canMoveLeft}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-dark-700/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft size={12} /> Voltar
        </button>
        <button
          onClick={() => onMove(project, 'right')}
          disabled={!canMoveRight}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-dark-700/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          Avancar <ArrowRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// ProjectFormModal
// ═══════════════════════════════════════

function ProjectFormModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void
  onSubmit: (data: CreateProjectRequest) => Promise<void>
  isSubmitting: boolean
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('backlog')
  const [priority, setPriority] = useState('media')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      assignee: assignee.trim() || null,
      dueDate: dueDate || null,
      progress: 0,
    })
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="flex items-center justify-center min-h-full p-4">
        <div
          className="bg-dark-800 rounded-2xl border border-dark-700/50 shadow-glass-lg w-full max-w-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/30">
            <h2 className="text-lg font-display font-semibold text-white">Nova Tarefa</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/40 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="label">Titulo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Implementar modulo de veiculos"
                className="input"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="label">Descricao</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a tarefa..."
                rows={3}
                className="input resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                  <option value="backlog">Backlog</option>
                  <option value="todo">A Fazer</option>
                  <option value="doing">Em Progresso</option>
                  <option value="review">Em Revisao</option>
                  <option value="done">Concluido</option>
                </select>
              </div>
              <div>
                <label className="label">Prioridade</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Responsavel</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Ex: FlowAI"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Data de Entrega</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Tags (separadas por virgula)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: backend, IA, FIPE"
                className="input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting || !title.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar Tarefa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
