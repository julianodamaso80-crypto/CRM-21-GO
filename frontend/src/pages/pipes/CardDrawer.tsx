import { useState } from 'react'
import { X, Loader2, Clock, User, Tag, Paperclip } from 'lucide-react'
import { useCard, useUpdateCardFields } from '../../hooks/usePipes'
import type { CardActivityLog, CardFieldValue, FieldDefinition } from '../../../../shared/types'

interface CardDrawerProps {
  cardId: string
  pipeId: string
  onClose: () => void
}

export function CardDrawer({ cardId, pipeId: _pipeId, onClose }: CardDrawerProps) {
  const { data: card, isLoading } = useCard(cardId)
  const updateFields = useUpdateCardFields()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValue, setFieldValue] = useState<string>('')

  const handleFieldSave = (fieldDefinitionId: string) => {
    updateFields.mutate({
      cardId,
      data: { fields: [{ fieldDefinitionId, value: fieldValue }] },
    })
    setEditingField(null)
    setFieldValue('')
  }

  const getFieldDisplayValue = (fv: CardFieldValue & { fieldDefinition?: FieldDefinition }): string => {
    if (fv.valueJson === null || fv.valueJson === undefined) return '-'
    if (typeof fv.valueJson === 'object') return JSON.stringify(fv.valueJson)
    return String(fv.valueJson)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getActivityDescription = (log: CardActivityLog): string => {
    switch (log.type) {
      case 'created': return 'Card criado'
      case 'phase_changed': {
        const p = log.payloadJson as any
        return `Movido de "${p.fromPhaseName}" para "${p.toPhaseName}"`
      }
      case 'field_updated': return `${(log.payloadJson as any)?.fieldsUpdated || ''} campo(s) atualizado(s)`
      case 'comment': return (log.payloadJson as any)?.text || 'Comentario'
      case 'attachment_added': return `Anexo: ${(log.payloadJson as any)?.fileName || 'arquivo'}`
      case 'assigned': return 'Card atribuido'
      default: return log.type
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-dark-800 shadow-xl overflow-y-auto rounded-l-2xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
          </div>
        ) : card ? (
          <div>
            {/* Header */}
            <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-start justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-white font-display">{card.title}</h2>
                {card.currentPhase && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.currentPhase.color }} />
                    <span className="text-sm text-gray-400">{card.currentPhase.name}</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-400 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            {card.description && (
              <div className="px-6 py-3 border-b border-dark-700">
                <p className="text-sm text-gray-400">{card.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="px-6 py-3 border-b border-dark-700 space-y-2">
              {card.assignedTo && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{(card.assignedTo as any).firstName} {(card.assignedTo as any).lastName}</span>
                </div>
              )}
              {card.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Prazo: {formatDate(card.dueDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400">Status: {card.status}</span>
              </div>
            </div>

            {/* Fields */}
            <div className="px-6 py-4 border-b border-dark-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Campos</h3>
              {card.fieldValues && card.fieldValues.length > 0 ? (
                <div className="space-y-3">
                  {card.fieldValues.map((fv: any) => (
                    <div key={fv.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{fv.fieldDefinition?.label || 'Campo'}</span>
                      {editingField === fv.fieldDefinitionId ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            className="px-2 py-1 text-sm bg-dark-800 border border-dark-600 text-gray-200 rounded w-40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFieldSave(fv.fieldDefinitionId)
                              if (e.key === 'Escape') { setEditingField(null); setFieldValue('') }
                            }}
                          />
                          <button onClick={() => handleFieldSave(fv.fieldDefinitionId)} className="text-xs text-gold-400">OK</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingField(fv.fieldDefinitionId); setFieldValue(getFieldDisplayValue(fv)) }}
                          className="text-sm text-white hover:bg-dark-700 px-2 py-0.5 rounded"
                        >
                          {getFieldDisplayValue(fv) || <span className="text-gray-500">-</span>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum campo preenchido</p>
              )}
            </div>

            {/* Attachments */}
            <div className="px-6 py-4 border-b border-dark-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Anexos
              </h3>
              {card.attachments && card.attachments.length > 0 ? (
                <div className="space-y-2">
                  {card.attachments.map((att: any) => (
                    <div key={att.id} className="flex items-center gap-2 text-sm p-2 bg-dark-900 rounded">
                      <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-300">{att.fileName}</span>
                      {att.aiKnowledgeDocumentId && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-500/15 text-purple-400 rounded">IA</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum anexo</p>
              )}
            </div>

            {/* Activity Log */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Historico</h3>
              {card.activityLogs && card.activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {card.activityLogs.map((log: CardActivityLog) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-300">{getActivityDescription(log)}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem atividades registradas</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Card nao encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
