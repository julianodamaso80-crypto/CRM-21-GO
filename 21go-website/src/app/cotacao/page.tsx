'use client'

import { useState, useCallback } from 'react'
import { trackCotacaoInicio, trackCotacaoCompleta, trackWhatsAppClick, getTrackingData } from '@/lib/tracking'
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  type PlanId,
  type QuotePlan,
  type PlanInfo,
  PLAN_INFO,
  formatPrice,
  getApplicablePlans,
} from '@/data/pricing'

/* ─── Types ─── */
interface FormData {
  nome: string
  whatsapp: string
  email: string
  placa: string
  leilao: 'nao' | 'leilao' | 'remarcado'
}

interface VehicleData {
  marca: string
  modelo: string
  ano: string
  cor: string
  fipeValue: number
  fipeCode: string
  categoria?: string
  combustivel?: string
}

/* ─── API Config ─── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-21-go-production.up.railway.app'

/* ─── Masks ─── */
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskPlaca(v: string) {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
}

/* ─── Steps ─── */
const STEPS = [
  { num: '01', label: 'Seus Dados' },
  { num: '02', label: 'Resultado' },
]

/* ─── Component ─── */
export default function CotacaoPage() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0)
  const [showCoberturas, setShowCoberturas] = useState(true)

  // API state
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [plans, setPlans] = useState<QuotePlan[]>([])

  const [form, setForm] = useState<FormData>({
    nome: '',
    whatsapp: '',
    email: '',
    placa: '',
    leilao: 'nao',
  })

  const set = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'placa') setApiError('')
  }, [])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Informe seu nome'
    if (form.whatsapp.replace(/\D/g, '').length < 11) e.whatsapp = 'WhatsApp incompleto'
    if (form.placa.length < 7) e.placa = 'Placa incompleta'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /** Tenta buscar veiculo com retry automatico */
  async function fetchVehicle(placa: string, retries = 2): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30000)
        const res = await fetch(
          `${API_BASE}/api/vehicle/plate/${placa}`,
          { signal: controller.signal },
        )
        clearTimeout(timeout)
        const data = await res.json()
        if (data.success) return data
        // Se deu timeout no backend, tenta de novo (pode estar cacheado agora)
        if (attempt < retries && data.error?.includes('demorou')) continue
        return data
      } catch {
        if (attempt === retries) throw new Error('network')
      }
    }
    throw new Error('network')
  }

  async function next() {
    if (!validate()) return

    trackCotacaoInicio()
    setLoading(true)
    setApiError('')

    try {
      const data = await fetchVehicle(form.placa)

      if (data.success) {
        const v = data.vehicle
        setVehicle(v)

        // SEMPRE calcula precos localmente pela tabela real
        const localPlans = getApplicablePlans(
          v.fipeValue,
          v.categoria,
          v.combustivel,
          v.cilindrada,
          v.modelo,
        )

        if (localPlans.length === 0) {
          setApiError('Não encontramos planos para esse veículo. Fale com um consultor.')
          return
        }

        // Leilão ou remarcado: cobra 80% do valor da tabela
        const isLeilao = form.leilao !== 'nao'
        const finalPlans = isLeilao
          ? localPlans.map(p => ({ ...p, monthly: Math.round(p.monthly * 0.8 * 100) / 100 }))
          : localPlans

        setPlans(finalPlans)
        const popularIdx = localPlans.findIndex(p => p.popular)
        setSelectedPlanIdx(popularIdx >= 0 ? popularIdx : 0)
        setStep(2)

        const defaultPlan = localPlans[popularIdx >= 0 ? popularIdx : 0]
        trackCotacaoCompleta({
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano,
          plano: defaultPlan.name,
          valorMensal: defaultPlan.monthly,
          valorFipe: v.fipeValue,
          email: form.email || undefined,
          phone: form.whatsapp || undefined,
        })

        // Salvar lead no banco (não bloqueia a UI)
        const tracking = getTrackingData()
        fetch(`${API_BASE}/api/vehicle/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: form.nome,
            whatsapp: form.whatsapp,
            email: form.email || undefined,
            placa: form.placa,
            leilao: form.leilao,
            marca: v.marca,
            modelo: v.modelo,
            ano: v.ano,
            valorFipe: v.fipeValue,
            plano: defaultPlan.name,
            valorMensal: defaultPlan.monthly,
            ...tracking.utms,
            gclid: tracking.clickIds.gclid,
            fbclid: tracking.clickIds.fbclid,
            fbp: tracking.clickIds._fbp,
            fbc: tracking.clickIds._fbc,
          }),
        }).catch(() => {})
      } else {
        setApiError(data.error || 'Veículo não encontrado.')
      }
    } catch {
      setApiError('Não foi possível consultar o veículo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = plans[selectedPlanIdx] || null
  const planInfo = selectedPlan ? PLAN_INFO[selectedPlan.id as PlanId] : null
  const price = selectedPlan?.monthly || 0
  const priceFormatted = formatPrice(price)
  const vehicleLabel = vehicle ? `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}` : ''
  const fipeFormatted = vehicle ? vehicle.fipeValue.toLocaleString('pt-BR') : '0'
  const firstPayment = formatPrice(price + 299.90)

  return (
    <div className="min-h-screen bg-[#F7F8FC] relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1B4DA1 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10">
        {/* Stepper */}
        {step <= 1 && (
          <div className="pt-28 pb-8">
            <div className="max-w-sm mx-auto px-6">
              <div className="flex items-center justify-center gap-4">
                {STEPS.map((s, i) => {
                  const active = step > i
                  const current = step === i + 1
                  return (
                    <div key={s.num} className="flex items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          current
                            ? 'bg-[#E07620] text-white shadow-md shadow-[#E07620]/20'
                            : active
                              ? 'bg-[#10B981] text-white'
                              : 'bg-[#E2E8F0] text-[#94A3B8]'
                        }`}>
                          {active && !current ? <Check className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={`text-sm font-medium ${current ? 'text-[#0A1E3D]' : 'text-[#94A3B8]'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-12 h-[2px] rounded-full bg-[#E2E8F0]">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            active && !current ? 'w-full bg-[#10B981]' : 'w-0'
                          }`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-20">

          {/* ── STEP 1: Formulário ── */}
          {step === 1 && (
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[#0A1E3D] mb-2">
                  Cotação Grátis
                </h1>
                <p className="text-[#64748B]">Preencha seus dados e descubra o valor em segundos.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-8 md:p-10">
                <div className="space-y-5">
                  <PillInput
                    label="Nome completo"
                    name="nome"
                    value={form.nome}
                    error={errors.nome}
                    onChange={v => set('nome', v)}
                    placeholder="Seu nome completo"
                    disabled={loading}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <PillInput
                      label="WhatsApp"
                      name="whatsapp"
                      value={form.whatsapp}
                      error={errors.whatsapp}
                      onChange={v => set('whatsapp', maskPhone(v))}
                      placeholder="(21) 99999-9999"
                      icon={<MessageCircle className="w-4 h-4 text-[#25D366]" />}
                      disabled={loading}
                    />
                    <PillInput
                      label="E-mail (opcional)"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={v => set('email', v)}
                      placeholder="seu@email.com"
                      icon={<Mail className="w-4 h-4 text-[#94A3B8]" />}
                      disabled={loading}
                    />
                  </div>
                  <PillInput
                    label="Placa do Veículo"
                    name="placa"
                    value={form.placa}
                    error={errors.placa}
                    onChange={v => set('placa', maskPlaca(v))}
                    placeholder="ABC1D23"
                    mono
                    disabled={loading}
                  />

                  {/* Leilão / Remarcado */}
                  <div>
                    <label className="block text-sm font-medium text-[#64748B] mb-2">Veículo de leilão ou remarcado?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: 'nao', label: 'Não' },
                        { value: 'leilao', label: 'Leilão' },
                        { value: 'remarcado', label: 'Remarcado' },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={loading}
                          onClick={() => set('leilao', opt.value)}
                          className={`py-3 rounded-full border-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                            form.leilao === opt.value
                              ? 'border-[#1B4DA1] bg-[#1B4DA1]/5 text-[#1B4DA1]'
                              : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#C1C9D6]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {form.leilao !== 'nao' && (
                      <p className="mt-2 text-xs text-[#E07620] font-medium">
                        Indenização: 80% da tabela FIPE
                      </p>
                    )}
                  </div>
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="mt-5 flex items-start gap-3 p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{apiError}</p>
                      <p className="text-[#DC2626]/70 mt-1">
                        Verifique a placa ou{' '}
                        <a href="https://wa.me/5521965700021?text=Olá! Preciso de ajuda com uma cotação." target="_blank" rel="noopener noreferrer" className="underline font-medium">
                          fale no WhatsApp
                        </a>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-10">
                  <button onClick={next} disabled={loading}
                    className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#E07620] to-[#F08C28] text-white font-bold text-base rounded-full shadow-lg shadow-[#E07620]/20 hover:shadow-xl hover:shadow-[#E07620]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Consultando veículo...
                      </>
                    ) : (
                      <>
                        Ver Cotação
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[#94A3B8]">
                  <Lock className="w-3.5 h-3.5" />
                  Seus dados estão seguros. Sem spam.
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1B4DA1]" />
                  <span>Cadastrada na SUSEP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E07620]" />
                  <span>20+ anos de mercado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Sem análise de perfil</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Resultado ── */}
          {step === 2 && vehicle && plans.length > 0 && selectedPlan && (
            <div className="max-w-5xl mx-auto pt-28">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#10B981]/10 mb-4">
                  <ShieldCheck className="w-7 h-7 text-[#10B981]" />
                </div>
                <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[#0A1E3D] mb-2">
                  {form.nome.split(' ')[0]}, sua cotação está pronta!
                </h2>
                <p className="text-[#64748B]">
                  {vehicleLabel}
                  {vehicle.cor ? ` — ${vehicle.cor}` : ''}
                  {' — '}FIPE: R$ {fipeFormatted}
                </p>
              </div>

              <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                {/* Coberturas */}
                <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-6 md:p-8">
                  {/* Plan tabs */}
                  <div className={`flex gap-1 bg-[#F0F4FA] rounded-2xl p-1.5 mb-8 ${plans.length > 4 ? 'flex-wrap' : ''}`}>
                    {plans.map((plan, idx) => (
                      <button key={plan.id} onClick={() => setSelectedPlanIdx(idx)}
                        className={`relative flex-1 min-w-[100px] py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedPlanIdx === idx
                            ? 'bg-white text-[#0A1E3D] shadow-md'
                            : 'text-[#64748B] hover:text-[#0A1E3D]'
                        }`}>
                        {plan.name}
                        {plan.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#E07620] bg-[#E07620]/10 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                            Mais escolhido
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Coberturas toggle */}
                  <button onClick={() => setShowCoberturas(!showCoberturas)}
                    className="flex items-center justify-between w-full mb-5 text-[#0A1E3D] font-semibold text-sm">
                    Coberturas incluídas
                    {showCoberturas ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                  </button>

                  {showCoberturas && planInfo && (
                    <ul className="space-y-3.5">
                      {planInfo.features.map(c => (
                        <li key={c.text} className="flex items-center gap-3">
                          {c.included
                            ? <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-[#10B981]" /></div>
                            : <div className="w-6 h-6 rounded-full bg-[#F0F4FA] flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5 text-[#CBD5E1]" /></div>}
                          <span className={`text-sm ${c.included ? 'text-[#0A1E3D] font-medium' : 'text-[#CBD5E1] line-through'}`}>{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Preço / CTA */}
                <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-6 md:p-8 h-fit lg:sticky lg:top-28">
                  <div className="text-center mb-6">
                    <p className="text-sm text-[#64748B] mb-1">Plano {selectedPlan.name}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-[#64748B] font-medium">R$</span>
                      <span className="font-[var(--font-display)] text-5xl font-bold text-[#0A1E3D] leading-none">{priceFormatted}</span>
                      <span className="text-lg text-[#64748B] font-medium">/mês</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E8ECF4] pt-4 mb-6 space-y-2.5 text-sm">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Mensalidade</span>
                      <span className="font-medium">R$ {priceFormatted}</span>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Taxa de ativação (única)</span>
                      <span className="font-medium">R$ 299,90</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#0A1E3D] pt-3 border-t border-[#E8ECF4]">
                      <span>1º pagamento</span>
                      <span>R$ {firstPayment}</span>
                    </div>
                  </div>

                  <a href={`https://wa.me/5521965700021?text=${encodeURIComponent(`Olá! Fiz uma cotação no site.\nNome: ${form.nome}\nWhatsApp: ${form.whatsapp}${form.email ? `\nE-mail: ${form.email}` : ''}\nPlaca: ${form.placa}${form.leilao !== 'nao' ? `\nOrigem: ${form.leilao === 'leilao' ? 'Leilão' : 'Remarcado'}` : ''}\nVeículo: ${vehicleLabel}\nFIPE: R$ ${fipeFormatted}\nPlano: ${selectedPlan.name}\nValor: R$ ${priceFormatted}/mês\nQuero contratar!`)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('cotacao_resultado', { plano: selectedPlan.name, valor: price })}
                    className="flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-[#E07620] to-[#F08C28] text-white font-bold text-base rounded-full shadow-lg shadow-[#E07620]/20 hover:shadow-xl hover:shadow-[#E07620]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mb-4">
                    <MessageCircle className="w-5 h-5" />
                    Contratar pelo WhatsApp
                  </a>

                  <div className="flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
                    <Lock className="w-3.5 h-3.5" />
                    SUSEP — LC 213/2025
                  </div>
                </div>
              </div>

              {/* Voltar */}
              <div className="mt-10 flex justify-center gap-6">
                <button onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0A1E3D] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Editar dados
                </button>
                <button onClick={() => { setStep(1); setForm({ nome: '', whatsapp: '', email: '', placa: '', leilao: 'nao' }); setVehicle(null); setPlans([]) }}
                  className="text-sm text-[#1B4DA1] hover:text-[#3D72DE] transition-colors">
                  Nova cotação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Pill Input (estilo Loovi) ─── */
function PillInput({ label, name, value, error, onChange, placeholder, type = 'text', mono, icon, disabled }: {
  label: string; name: string; value: string; error?: string;
  onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean;
  icon?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#64748B] mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          id={name}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-11' : 'px-5'} pr-5 py-4 rounded-full border-2 text-[#0A1E3D] text-[15px] placeholder:text-[#C1C9D6] bg-white focus:outline-none focus:border-[#1B4DA1] focus:shadow-[0_0_0_3px_rgba(27,77,161,0.08)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-[#EF4444] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : 'border-[#E2E8F0] hover:border-[#C1C9D6]'
          } ${mono ? 'font-mono tracking-[0.15em] text-lg' : ''}`}
        />
      </div>
      {error && <p className="mt-1.5 ml-5 text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  )
}
