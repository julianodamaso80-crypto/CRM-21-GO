import { useState } from 'react'
import { Brain, Database, Bot, MessageSquare, BarChart3, Loader2, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAIStats } from '../../hooks/useAI'
import { KnowledgeBaseTab } from './KnowledgeBaseTab'
import { AgentsTab } from './AgentsTab'
import { ChatTestTab } from './ChatTestTab'
import { AnalyticsTab } from './AnalyticsTab'

type TabId = 'knowledge' | 'agents' | 'chat' | 'analytics'

const tabs: { id: TabId; label: string; icon: typeof Brain }[] = [
  { id: 'knowledge', label: 'Base de Conhecimento', icon: Database },
  { id: 'agents', label: 'Agentes', icon: Bot },
  { id: 'chat', label: 'Chat / Teste', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export function AITrainingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('knowledge')
  const { data: stats, isLoading: statsLoading } = useAIStats()

  const statCards = [
    { label: 'Bases de Conhecimento', value: stats?.totalKnowledgeBases ?? 0, icon: Database, color: 'text-blue-400 bg-blue-500/15' },
    { label: 'Documentos', value: stats?.totalDocuments ?? 0, icon: Brain, color: 'text-purple-400 bg-purple-500/15' },
    { label: 'Agentes', value: stats?.totalAgents ?? 0, icon: Bot, color: 'text-green-400 bg-green-500/15' },
    { label: 'Queries Realizadas', value: stats?.totalQueries ?? 0, icon: MessageSquare, color: 'text-orange-400 bg-orange-500/15' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary-400" />
          IA & Treinamento
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-gray-400">
            Gerencie bases de conhecimento, configure agentes e teste o chat com RAG
          </p>
          <Link
            to="/pipes/new-ai"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Pipe Builder
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-dark-800 rounded-lg border border-dark-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                {statsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                ) : (
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                )}
                <p className="text-sm text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-dark-700 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-dark-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'knowledge' && <KnowledgeBaseTab />}
      {activeTab === 'agents' && <AgentsTab />}
      {activeTab === 'chat' && <ChatTestTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  )
}
