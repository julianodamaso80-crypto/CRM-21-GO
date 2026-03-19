import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, FileText, RefreshCw } from 'lucide-react'
import { useAIAgents, useAIQuery, useKnowledgeBases } from '../../hooks/useAI'
import type { AIAgent, KnowledgeBase } from '../../../../shared/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ content: string; source_name: string; source_type: string; relevance_score?: number }>
  latency_ms?: number
}

export function ChatTestTab() {
  const { data: agents } = useAIAgents()
  const { data: knowledgeBases } = useKnowledgeBases()
  const queryMutation = useAIQuery()

  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedAgent = agents?.find((a: AIAgent) => a.id === selectedAgentId)
  const selectedKB = selectedAgent?.knowledgeBaseId
    ? knowledgeBases?.find((kb: KnowledgeBase) => kb.id === selectedAgent.knowledgeBaseId)
    : knowledgeBases?.[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (agents?.length && !selectedAgentId) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  const handleSend = async () => {
    if (!input.trim() || !selectedKB) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    const agentConfig = selectedAgent
      ? {
          provider: selectedAgent.provider,
          model: selectedAgent.model,
          temperature: selectedAgent.temperature,
          maxTokens: selectedAgent.maxTokens,
          systemPrompt: selectedAgent.systemPrompt,
        }
      : undefined

    queryMutation.mutate(
      {
        query: userMessage,
        collectionName: selectedKB.collectionName,
        agentId: selectedAgentId || undefined,
        agent_config: agentConfig,
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: data.answer,
              sources: data.sources,
              latency_ms: data.latency_ms,
            },
          ])
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Erro ao processar sua pergunta. Verifique se o servico de IA esta ativo.' },
          ])
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] min-h-[500px]">
      {/* Chat Config Bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-dark-800/60 rounded-2xl border border-dark-700/40">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Agente</label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full px-3 py-1.5 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm"
          >
            <option value="">Selecionar agente...</option>
            {agents?.map((a: AIAgent) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.provider}/{a.model})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Base de Conhecimento</label>
          <p className="text-sm text-gray-300 py-1.5">
            {selectedKB ? selectedKB.name : 'Nenhuma KB disponivel'}
          </p>
        </div>
        <button onClick={clearChat} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 self-end">
          <RefreshCw className="w-3.5 h-3.5" /> Limpar
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-dark-800/60 rounded-2xl border border-dark-700/40 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Teste seu agente de IA</p>
            <p className="text-sm mt-1">Selecione um agente e faca uma pergunta sobre sua base de conhecimento</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gold-400" />
              </div>
            )}
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-gold-500 text-dark-900'
                  : 'bg-dark-700 text-white'
              }`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-400 font-medium">Fontes:</p>
                  {msg.sources.map((src, j) => (
                    <div key={j} className="flex items-start gap-1 text-xs text-gray-400">
                      <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">{src.source_name}</span>
                        {src.relevance_score && (
                          <span className="text-gray-500 ml-1">({(src.relevance_score * 100).toFixed(0)}%)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {msg.latency_ms && (
                <p className="text-xs text-gray-500 mt-1">{msg.latency_ms}ms</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {queryMutation.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gold-400" />
            </div>
            <div className="bg-dark-700 rounded-lg px-4 py-3">
              <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-3 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedKB ? 'Faca uma pergunta...' : 'Selecione um agente com KB primeiro'}
          disabled={!selectedKB || queryMutation.isPending}
          rows={1}
          className="flex-1 px-4 py-3 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/30 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !selectedKB || queryMutation.isPending}
          className="px-4 py-3 bg-gold-500 text-dark-900 rounded-lg hover:bg-gold-400 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
