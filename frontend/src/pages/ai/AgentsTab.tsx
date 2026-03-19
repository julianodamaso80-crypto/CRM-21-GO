import { useState } from 'react'
import { Plus, Bot, Trash2, Settings, Loader2, Power } from 'lucide-react'
import { useAIAgents, useCreateAgent, useUpdateAgent, useDeleteAgent, useKnowledgeBases } from '../../hooks/useAI'
import type { AIAgent, CreateAgentRequest } from '../../../../shared/types'

const MODELS = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
  google: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
}

export function AgentsTab() {
  const { data: agents, isLoading } = useAIAgents()
  const { data: knowledgeBases } = useKnowledgeBases()
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null)
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '',
    type: 'internal',
    knowledgeBaseId: '',
    allowedScopes: [],
    canCreateLeads: false,
    canUpdateLeads: false,
    canCreateDeals: false,
    canTransferToHuman: true,
  })

  const openCreateForm = () => {
    setEditingAgent(null)
    setFormData({
      name: '', description: '', provider: 'openai', model: 'gpt-4o-mini',
      temperature: 0.7, maxTokens: 1000, systemPrompt: '', type: 'internal',
      knowledgeBaseId: '', allowedScopes: [], canCreateLeads: false,
      canUpdateLeads: false, canCreateDeals: false, canTransferToHuman: true,
    })
    setShowForm(true)
  }

  const openEditForm = (agent: AIAgent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description || '',
      provider: agent.provider,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt,
      type: agent.type,
      knowledgeBaseId: agent.knowledgeBaseId || '',
      allowedScopes: agent.allowedScopes,
      canCreateLeads: agent.canCreateLeads,
      canUpdateLeads: agent.canUpdateLeads,
      canCreateDeals: agent.canCreateDeals,
      canTransferToHuman: agent.canTransferToHuman,
    })
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) return
    const payload = {
      ...formData,
      knowledgeBaseId: formData.knowledgeBaseId || undefined,
    }
    if (editingAgent) {
      updateAgent.mutate({ id: editingAgent.id, data: payload }, {
        onSuccess: () => setShowForm(false),
      })
    } else {
      createAgent.mutate(payload as CreateAgentRequest, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agente?')) {
      deleteAgent.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Agentes de IA</h2>
        <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400">
          <Plus className="w-4 h-4" /> Novo Agente
        </button>
      </div>

      {/* Agent Form (Drawer/Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowForm(false)} />
          <div className="ml-auto w-full max-w-2xl bg-dark-800 h-full overflow-y-auto relative z-10 shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">{editingAgent ? 'Editar Agente' : 'Novo Agente'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-400 text-2xl">&times;</button>
              </div>

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Assistente de Vendas" className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg" />
                </div>

                {/* Descricao */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descricao</label>
                  <input type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Breve descricao do agente" className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg" />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.type === 'internal'} onChange={() => setFormData({ ...formData, type: 'internal' })} />
                      <span className="text-sm text-gray-300">Interno (equipe)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.type === 'customer_facing'} onChange={() => setFormData({ ...formData, type: 'customer_facing' })} />
                      <span className="text-sm text-gray-300">Atendimento (cliente)</span>
                    </label>
                  </div>
                </div>

                {/* Provider + Model */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Provider</label>
                    <select value={formData.provider} onChange={(e) => {
                      const provider = e.target.value as 'openai' | 'anthropic' | 'google'
                      setFormData({ ...formData, provider, model: MODELS[provider][0] })
                    }} className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg">
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Modelo</label>
                    <select value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg">
                      {MODELS[formData.provider as keyof typeof MODELS]?.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Temperature + MaxTokens */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Temperatura ({formData.temperature})
                    </label>
                    <input type="range" min="0" max="1" step="0.1" value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Tokens</label>
                    <input type="number" value={formData.maxTokens} onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 1000 })}
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg" />
                  </div>
                </div>

                {/* Knowledge Base */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Base de Conhecimento</label>
                  <select value={formData.knowledgeBaseId || ''} onChange={(e) => setFormData({ ...formData, knowledgeBaseId: e.target.value })}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg">
                    <option value="">Nenhuma (sem RAG)</option>
                    {knowledgeBases?.map((kb: any) => (
                      <option key={kb.id} value={kb.id}>{kb.name} ({kb.documentCount} docs)</option>
                    ))}
                  </select>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">System Prompt</label>
                  <textarea value={formData.systemPrompt} onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    rows={6} placeholder="Instrucoes para o agente... Ex: Voce e um assistente de vendas especializado em tubos de aco."
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg resize-none" />
                </div>

                {/* Permissoes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Permissoes</label>
                  <div className="space-y-2">
                    {[
                      { key: 'canCreateLeads', label: 'Pode criar leads' },
                      { key: 'canUpdateLeads', label: 'Pode atualizar leads' },
                      { key: 'canCreateDeals', label: 'Pode criar deals' },
                      { key: 'canTransferToHuman', label: 'Pode transferir para humano' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2">
                        <input type="checkbox" checked={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />
                        <span className="text-sm text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button onClick={handleSubmit}
                    disabled={!formData.name.trim() || !formData.systemPrompt.trim() || createAgent.isPending || updateAgent.isPending}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50">
                    {(createAgent.isPending || updateAgent.isPending) ? 'Salvando...' : editingAgent ? 'Atualizar' : 'Criar Agente'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agents List */}
      {(!agents || agents.length === 0) ? (
        <div className="text-center p-12 bg-dark-800 rounded-lg border border-dark-700">
          <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhum agente</h3>
          <p className="text-gray-400 mt-1">Crie seu primeiro agente de IA para comecar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent: AIAgent) => (
            <div key={agent.id} className={`bg-dark-800 rounded-lg border p-4 ${
              agent.squad === '21go-squad' ? 'border-primary-500/30' : 'border-dark-700'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {agent.icon ? (
                    <span className="text-xl">{agent.icon}</span>
                  ) : (
                    <Bot className="w-5 h-5 text-primary-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    {agent.tier === 0 && (
                      <span className="text-[10px] uppercase tracking-wider text-primary-400 font-semibold">Orquestrador</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {agent.squad === '21go-squad' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary-500/15 text-primary-400 rounded-full font-medium mr-1">
                      21Go Squad
                    </span>
                  )}
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    agent.isActive ? 'bg-green-500/15 text-green-400' : 'bg-dark-700 text-gray-400'
                  }`}>
                    <Power className="w-3 h-3" />
                    {agent.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {agent.description && <p className="text-sm text-gray-400 mb-3">{agent.description}</p>}

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-blue-500/15 text-blue-400 rounded">{agent.provider}</span>
                <span className="text-xs px-2 py-1 bg-purple-500/15 text-purple-400 rounded">{agent.model}</span>
                <span className="text-xs px-2 py-1 bg-dark-700 text-gray-400 rounded">
                  {agent.type === 'internal' ? 'Interno' : 'Atendimento'}
                </span>
              </div>

              {agent.allowedRoles && agent.allowedRoles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider mr-1">Acesso:</span>
                  {agent.allowedRoles.map((role: string) => (
                    <span key={role} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      role === 'admin' ? 'bg-red-500/15 text-red-400' :
                      role === 'gestor' ? 'bg-amber-500/15 text-amber-400' :
                      role === 'vendedor' ? 'bg-emerald-500/15 text-emerald-400' :
                      role === 'operacao' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-dark-700 text-gray-400'
                    }`}>
                      {role}
                    </span>
                  ))}
                </div>
              )}

              {agent.knowledgeBase && (
                <p className="text-xs text-gray-400 mb-3">
                  KB: <span className="font-medium">{(agent.knowledgeBase as any).name}</span>
                </p>
              )}

              <div className="flex gap-2 pt-2 border-t border-dark-700">
                <button onClick={() => openEditForm(agent)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-400">
                  <Settings className="w-3.5 h-3.5" /> Configurar
                </button>
                <button onClick={() => handleDelete(agent.id)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
