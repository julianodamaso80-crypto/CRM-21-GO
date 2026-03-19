import { useState } from 'react'
import {
  Plus, Database, Trash2, FileText, Globe, Type, Upload, Users, ShoppingCart,
  MessageSquare, ChevronDown, ChevronUp, Loader2, X,
} from 'lucide-react'
import {
  useKnowledgeBases, useCreateKnowledgeBase, useDeleteKnowledgeBase,
  useKnowledgeDocuments, useIngestText, useIngestURL, useIngestCRM,
  useDeleteDocument,
} from '../../hooks/useAI'
import type { KnowledgeBase } from '../../../../shared/types'

export function KnowledgeBaseTab() {
  const { data: knowledgeBases, isLoading } = useKnowledgeBases()
  const createKB = useCreateKnowledgeBase()
  const deleteKB = useDeleteKnowledgeBase()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKBName, setNewKBName] = useState('')
  const [newKBDesc, setNewKBDesc] = useState('')
  const [expandedKBId, setExpandedKBId] = useState<string | null>(null)

  const handleCreateKB = () => {
    if (!newKBName.trim()) return
    createKB.mutate(
      { name: newKBName, description: newKBDesc || undefined },
      {
        onSuccess: () => {
          setNewKBName('')
          setNewKBDesc('')
          setShowCreateForm(false)
        },
      }
    )
  }

  const handleDeleteKB = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta base de conhecimento? Todos os documentos serao perdidos.')) {
      deleteKB.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Bases de Conhecimento</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nova Base
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-dark-800/60 rounded-2xl border border-dark-700/40 p-4 mb-4">
          <h3 className="font-medium text-white mb-3">Criar Base de Conhecimento</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome da base (ex: FAQ de Vendas)"
              value={newKBName}
              onChange={(e) => setNewKBName(e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/30"
            />
            <input
              type="text"
              placeholder="Descricao (opcional)"
              value={newKBDesc}
              onChange={(e) => setNewKBDesc(e.target.value)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500/30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateKB}
                disabled={!newKBName.trim() || createKB.isPending}
                className="btn-primary disabled:opacity-50"
              >
                {createKB.isPending ? 'Criando...' : 'Criar'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Bases List */}
      {(!knowledgeBases || knowledgeBases.length === 0) ? (
        <div className="text-center p-12 bg-dark-800/60 rounded-2xl border border-dark-700/40">
          <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">Nenhuma base de conhecimento</h3>
          <p className="text-gray-400 mt-1">Crie sua primeira base e adicione documentos para treinar a IA</p>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgeBases.map((kb: KnowledgeBase) => (
            <KnowledgeBaseCard
              key={kb.id}
              kb={kb}
              isExpanded={expandedKBId === kb.id}
              onToggle={() => setExpandedKBId(expandedKBId === kb.id ? null : kb.id)}
              onDelete={() => handleDeleteKB(kb.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function KnowledgeBaseCard({
  kb, isExpanded, onToggle, onDelete,
}: {
  kb: KnowledgeBase
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const { data: documents } = useKnowledgeDocuments(isExpanded ? kb.id : '')
  const ingestText = useIngestText()
  const ingestURL = useIngestURL()
  const ingestCRM = useIngestCRM()
  const deleteDoc = useDeleteDocument()

  const [ingestMode, setIngestMode] = useState<'none' | 'text' | 'url' | 'crm'>('none')
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [crmType, setCrmType] = useState('contacts')

  const handleIngestText = () => {
    if (!textContent.trim() || !textName.trim()) return
    ingestText.mutate(
      { collectionName: kb.collectionName, content: textContent, sourceName: textName },
      { onSuccess: () => { setTextName(''); setTextContent(''); setIngestMode('none') } }
    )
  }

  const handleIngestURL = () => {
    if (!urlInput.trim()) return
    ingestURL.mutate(
      { collectionName: kb.collectionName, url: urlInput },
      { onSuccess: () => { setUrlInput(''); setIngestMode('none') } }
    )
  }

  const handleIngestCRM = () => {
    ingestCRM.mutate(
      { collectionName: kb.collectionName, dataType: crmType },
      { onSuccess: () => setIngestMode('none') }
    )
  }

  return (
    <div className="bg-dark-800/60 rounded-2xl border border-dark-700/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-gold-400" />
          <div>
            <h3 className="font-medium text-white">{kb.name}</h3>
            {kb.description && <p className="text-sm text-gray-400">{kb.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{kb.documentCount} docs</span>
            <span>{kb.chunkCount} chunks</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 text-gray-500 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-dark-700/40 p-4">
          {/* Ingest Buttons */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setIngestMode('text')} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700">
              <Type className="w-3.5 h-3.5" /> Texto
            </button>
            <button onClick={() => setIngestMode('url')} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700">
              <Globe className="w-3.5 h-3.5" /> URL
            </button>
            <button onClick={() => setIngestMode('crm')} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700">
              <Upload className="w-3.5 h-3.5" /> Dados CRM
            </button>
          </div>

          {/* Ingest Forms */}
          {ingestMode === 'text' && (
            <div className="bg-dark-900 rounded-lg p-3 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-200">Adicionar Texto</span>
                <button onClick={() => setIngestMode('none')}><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <input
                type="text"
                placeholder="Nome do documento"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm"
              />
              <textarea
                placeholder="Cole o conteudo aqui... (FAQs, artigos, informacoes, etc)"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm resize-none"
              />
              <button
                onClick={handleIngestText}
                disabled={ingestText.isPending || !textContent.trim() || !textName.trim()}
                className="px-3 py-1.5 bg-gold-500 text-dark-900 text-sm font-semibold rounded-xl hover:bg-gold-400 disabled:opacity-50"
              >
                {ingestText.isPending ? 'Processando...' : 'Ingerir Texto'}
              </button>
            </div>
          )}

          {ingestMode === 'url' && (
            <div className="bg-dark-900 rounded-lg p-3 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-200">Importar URL</span>
                <button onClick={() => setIngestMode('none')}><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <input
                type="url"
                placeholder="https://exemplo.com/pagina"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={handleIngestURL}
                disabled={ingestURL.isPending || !urlInput.trim()}
                className="px-3 py-1.5 bg-gold-500 text-dark-900 text-sm font-semibold rounded-xl hover:bg-gold-400 disabled:opacity-50"
              >
                {ingestURL.isPending ? 'Processando...' : 'Importar URL'}
              </button>
            </div>
          )}

          {ingestMode === 'crm' && (
            <div className="bg-dark-900 rounded-lg p-3 mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-200">Importar Dados do CRM</span>
                <button onClick={() => setIngestMode('none')}><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCrmType('contacts')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border ${crmType === 'contacts' ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'border-dark-600 text-gray-300 hover:bg-dark-700'}`}
                >
                  <Users className="w-4 h-4" /> Contatos
                </button>
                <button
                  onClick={() => setCrmType('deals')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border ${crmType === 'deals' ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'border-dark-600 text-gray-300 hover:bg-dark-700'}`}
                >
                  <ShoppingCart className="w-4 h-4" /> Deals
                </button>
                <button
                  onClick={() => setCrmType('conversations')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border ${crmType === 'conversations' ? 'bg-gold-500/10 border-gold-500/30 text-gold-400' : 'border-dark-600 text-gray-300 hover:bg-dark-700'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Conversas
                </button>
              </div>
              <button
                onClick={handleIngestCRM}
                disabled={ingestCRM.isPending}
                className="px-3 py-1.5 bg-gold-500 text-dark-900 text-sm font-semibold rounded-xl hover:bg-gold-400 disabled:opacity-50"
              >
                {ingestCRM.isPending ? 'Importando...' : `Importar ${crmType}`}
              </button>
            </div>
          )}

          {/* Documents List */}
          <h4 className="text-sm font-medium text-gray-300 mb-2">Documentos ({documents?.length ?? 0})</h4>
          {documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-dark-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    {doc.sourceType === 'pdf' && <FileText className="w-4 h-4 text-red-500" />}
                    {doc.sourceType === 'url' && <Globe className="w-4 h-4 text-blue-500" />}
                    {doc.sourceType === 'text' && <Type className="w-4 h-4 text-green-500" />}
                    {doc.sourceType?.startsWith('crm_') && <Upload className="w-4 h-4 text-purple-500" />}
                    {!['pdf', 'url', 'text'].includes(doc.sourceType) && !doc.sourceType?.startsWith('crm_') && <FileText className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm text-white">{doc.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      doc.status === 'completed' ? 'bg-green-500/15 text-green-400' :
                      doc.status === 'processing' ? 'bg-yellow-500/15 text-yellow-400' :
                      doc.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                      'bg-dark-700 text-gray-400'
                    }`}>
                      {doc.status === 'completed' ? 'Processado' :
                       doc.status === 'processing' ? 'Processando' :
                       doc.status === 'failed' ? 'Erro' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{doc.chunkCount} chunks</span>
                    <button
                      onClick={() => {
                        if (window.confirm('Excluir este documento?')) deleteDoc.mutate(doc.id)
                      }}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhum documento adicionado ainda</p>
          )}
        </div>
      )}
    </div>
  )
}
