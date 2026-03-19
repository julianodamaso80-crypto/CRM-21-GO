import { useState } from 'react'
import { Wand2, Loader2, Check, ChevronRight, ArrowLeft } from 'lucide-react'
import { usePipeSuggest } from '../../hooks/useAI'
import { useCreatePipeFromSuggest } from '../../hooks/usePipes'
import type { PipeSuggestResponse, SuggestedPhase, SuggestedField } from '../../../../shared/types'
import { Link, useNavigate } from 'react-router-dom'

const TEMPLATES = [
  { value: 'sales', label: 'Vendas' },
  { value: 'support', label: 'Suporte' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'recruitment', label: 'Recrutamento' },
  { value: 'custom', label: 'Personalizado' },
] as const

export function PipeBuilderPage() {
  const navigate = useNavigate()
  const pipeSuggest = usePipeSuggest()
  const createFromSuggest = useCreatePipeFromSuggest()
  const [promptText, setPromptText] = useState('')
  const [templateType, setTemplateType] = useState<string>('custom')
  const [suggestion, setSuggestion] = useState<PipeSuggestResponse | null>(null)

  const handleGenerate = () => {
    if (!promptText.trim() || promptText.trim().length < 10) return
    pipeSuggest.mutate(
      { promptText, templateType: templateType as any },
      { onSuccess: (data) => setSuggestion(data) }
    )
  }

  const handleReset = () => {
    setSuggestion(null)
    setPromptText('')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ai" className="text-gray-500 hover:text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Pipe Builder com IA</h1>
          <p className="text-sm text-gray-400">Descreva o processo e a IA gera a estrutura do pipe</p>
        </div>
      </div>

      {!suggestion ? (
        /* === Form === */
        <div className="card p-6">
          {/* Template */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Processo</label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTemplateType(t.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${
                    templateType === t.value
                      ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                      : 'border-dark-600 text-gray-400 hover:bg-dark-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descreva o processo que voce quer criar
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={5}
              placeholder="Ex: Preciso de um pipeline de vendas para protecao veicular. O processo comeca com prospecção, depois qualificação, cotação FIPE, vistoria e fechamento. Quero campos para valor estimado, plano e placa do veiculo."
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{promptText.length} caracteres (minimo 10)</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={promptText.trim().length < 10 || pipeSuggest.isPending}
            className="flex items-center gap-2 px-4 py-2 btn-primary disabled:opacity-50"
          >
            {pipeSuggest.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Gerar Pipe com IA
              </>
            )}
          </button>
        </div>
      ) : (
        /* === Preview === */
        <div className="space-y-4">
          {/* Pipe Info */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white font-display">{suggestion.pipeName}</h2>
                <p className="text-sm text-gray-400">{suggestion.pipeDescription}</p>
              </div>
              <div className="flex gap-2">
                {suggestion.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-dark-700 text-gray-400 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phases */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Fases ({suggestion.phases.length})</h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {suggestion.phases.map((phase: SuggestedPhase, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-shrink-0 border border-dark-700 rounded-lg p-3 min-w-[160px]" style={{ borderLeftColor: phase.color, borderLeftWidth: '4px' }}>
                    <p className="font-medium text-sm text-white">{phase.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{phase.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{phase.probability}%</span>
                      {phase.isWon && <span className="text-xs px-1.5 py-0.5 bg-green-500/15 text-green-400 rounded">Ganho</span>}
                      {phase.isLost && <span className="text-xs px-1.5 py-0.5 bg-red-500/15 text-red-400 rounded">Perdido</span>}
                    </div>
                  </div>
                  {i < suggestion.phases.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Campos ({suggestion.fields.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestion.fields.map((field: SuggestedField, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{field.label}</p>
                    <p className="text-xs text-gray-400">
                      {field.type} {field.required && '(obrigatorio)'}
                      {field.options && ` - ${field.options.join(', ')}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!suggestion) return
                createFromSuggest.mutate({
                  pipeName: suggestion.pipeName,
                  pipeDescription: suggestion.pipeDescription,
                  phases: suggestion.phases,
                  fields: suggestion.fields,
                  tags: suggestion.tags,
                }, {
                  onSuccess: (pipe) => {
                    navigate(`/pipes/${pipe.id}/kanban`)
                  },
                })
              }}
              disabled={createFromSuggest.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {createFromSuggest.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</>
              ) : (
                <><Check className="w-4 h-4" /> Criar Pipe</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700"
            >
              Gerar Novo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
