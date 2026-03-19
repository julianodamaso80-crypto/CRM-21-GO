import { useState } from 'react'
import { FileText, Calculator, Car, Check, Send } from 'lucide-react'
import { api } from '../../lib/api'

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const PLANO_DETAILS: Record<string, { label: string; cor: string; coberturas: string[] }> = {
  basico: {
    label: 'Basico',
    cor: 'border-gray-500/30 bg-gray-500/5',
    coberturas: ['Roubo/furto', 'Assistencia 24h (guincho 200km)'],
  },
  completo: {
    label: 'Completo',
    cor: 'border-blue-500/30 bg-blue-500/5',
    coberturas: ['Roubo/furto', 'Colisao', 'Incendio', 'Assistencia 24h (guincho 400km)', 'Carro reserva 7 dias'],
  },
  premium: {
    label: 'Premium',
    cor: 'border-gold-500/30 bg-gold-500/5',
    coberturas: ['Tudo do Completo', 'Terceiros ate R$100K', 'Vidros', 'Carro reserva 15 dias', 'App rastreamento'],
  },
}

export function CotacoesPage() {
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [ano, setAno] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marca || !modelo || !ano) return
    setLoading(true)
    try {
      const res = await api.post('/cotacao/calcular', { marca, modelo, ano: parseInt(ano), plano: 'completo' })
      setResultado(res.data)
    } catch {
      setResultado(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Cotacao FIPE</h1>
        <p className="mt-2 text-gray-400">Calcule o valor da protecao com base na tabela FIPE</p>
      </div>

      {/* Form */}
      <div className="card mb-8">
        <form onSubmit={handleCalcular} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Marca</label>
            <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Hyundai" className="input" required />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">Modelo</label>
            <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="HB20" className="input" required />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-300 mb-1">Ano</label>
            <input type="number" value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2023" className="input" required min={2000} max={2026} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 h-[42px]">
            <Calculator className="w-4 h-4" />
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </form>
      </div>

      {/* Results */}
      {resultado && (
        <div className="space-y-6 animate-fade-in-up">
          {/* FIPE Value */}
          <div className="card text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Car className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-gray-400">{resultado.marca} {resultado.modelo} {resultado.ano}</span>
            </div>
            <p className="text-sm text-gray-400">Valor FIPE</p>
            <p className="text-4xl font-display font-bold text-gold-400 mt-1">{fmt(resultado.valorFipe)}</p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resultado.planos?.map((plano: any) => {
              const details = PLANO_DETAILS[plano.plano]
              const isSelecionado = plano.plano === resultado.selecionado?.plano
              return (
                <div
                  key={plano.plano}
                  className={`card relative ${details.cor} ${isSelecionado ? 'ring-2 ring-gold-500/50' : ''}`}
                >
                  {isSelecionado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-dark-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Recomendado
                    </div>
                  )}
                  <div className="text-center pt-4 pb-3 border-b border-dark-700/30">
                    <h3 className="text-lg font-display font-bold text-white">{details.label}</h3>
                    <p className="text-xs text-gray-400 mt-1">Taxa: {(plano.taxa * 100).toFixed(1)}%</p>
                  </div>
                  <div className="py-4 text-center">
                    <p className="text-3xl font-display font-bold text-white">{fmt(plano.valorMensal)}</p>
                    <p className="text-xs text-gray-400">/mes</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Menos de {fmt(plano.valorMensal / 30)}/dia
                    </p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-dark-700/30">
                    {details.coberturas.map((c) => (
                      <div key={c} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{c}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    isSelecionado
                      ? 'bg-gold-500 text-dark-900 hover:bg-gold-400'
                      : 'bg-dark-700/50 text-gray-300 hover:bg-dark-600/50'
                  }`}>
                    <Send className="w-4 h-4" />
                    Enviar Cotacao
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!resultado && !loading && (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">Calcule uma cotacao</h3>
          <p className="text-gray-400">Informe marca, modelo e ano para ver os valores dos 3 planos</p>
        </div>
      )}
    </div>
  )
}
