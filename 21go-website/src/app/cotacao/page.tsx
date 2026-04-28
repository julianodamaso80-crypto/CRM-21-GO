'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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
  Tag,
  Car,
  Search,
} from 'lucide-react'
import {
  type PlanId,
  type QuotePlan,
  type PlanInfo,
  PLAN_INFO,
  formatPrice,
  getApplicablePlans,
} from '@/data/pricing'
import { shouldBlockQuote } from '@/data/vehicle-exclusions'
import ElectricBorder from '@/components/ui/ElectricBorder'

/* ─── Types ─── */
interface FormData {
  nome: string
  whatsapp: string
  email: string
  placa: string
  leilao: 'nao' | 'leilao' | 'remarcado'
  carroApp: 'nao' | 'sim'
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

interface FipeItem {
  code: string
  name: string
}

/* ─── Faixas FIPE para fallback manual ─── */
const FIPE_RANGES = [
  { label: 'Até R$ 20.000', value: 17500 },
  { label: 'R$ 20 a 30 mil', value: 25000 },
  { label: 'R$ 30 a 40 mil', value: 35000 },
  { label: 'R$ 40 a 50 mil', value: 45000 },
  { label: 'R$ 50 a 60 mil', value: 55000 },
  { label: 'R$ 60 a 70 mil', value: 65000 },
  { label: 'R$ 70 a 80 mil', value: 75000 },
  { label: 'R$ 80 a 100 mil', value: 90000 },
  { label: 'R$ 100 a 130 mil', value: 115000 },
  { label: 'R$ 130 a 150 mil', value: 140000 },
  { label: 'Acima de R$ 150 mil', value: 175000 },
]

const VEHICLE_TYPES = [
  { label: 'Carro', value: 'carro' },
  { label: 'SUV / Pick-up', value: 'suv' },
  { label: 'Moto até 400cc', value: 'moto-400' },
  { label: 'Moto 450-1000cc', value: 'moto-1000' },
]

/* ─── API Config ─── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-21-go-production.up.railway.app'

/* ─── Masks ─── */
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Extrai apenas dígitos do telefone — formato 55XXXXXXXXXXX para WhatsApp */
function cleanPhone(v: string): string {
  const digits = v.replace(/\D/g, '')
  // Se já começa com 55, retorna direto
  if (digits.startsWith('55') && digits.length === 13) return digits
  // Senão, adiciona 55
  return `55${digits}`
}

/** Valida WhatsApp: DDD (11-99) + 9 dígitos começando com 9 */
function isValidWhatsApp(v: string): string | null {
  const digits = v.replace(/\D/g, '')
  if (digits.length < 11) return 'WhatsApp incompleto — precisa de DDD + 9 dígitos'
  const ddd = parseInt(digits.slice(0, 2))
  if (ddd < 11 || ddd > 99) return 'DDD inválido'
  if (digits[2] !== '9') return 'Celular deve começar com 9 depois do DDD'
  if (digits.length !== 11) return 'WhatsApp incompleto — precisa de DDD + 9 dígitos'
  return null // válido
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

  // Excluded vehicle state
  const [excluded, setExcluded] = useState(false)

  // Adesivo toggle
  const [stickerAccepted, setStickerAccepted] = useState(true)

  // Fallback manual state
  const [showFallback, setShowFallback] = useState(false)
  const [fallbackType, setFallbackType] = useState('carro')
  const [fallbackFipe, setFallbackFipe] = useState(0)

  // Fluxo "não tenho a placa" — busca FIPE por marca/modelo/ano
  const [searchMode, setSearchMode] = useState<'placa' | 'modelo'>('placa')
  const [fipeKind, setFipeKind] = useState<'carros' | 'motos'>('carros')
  const [fipeMarcas, setFipeMarcas] = useState<FipeItem[]>([])
  const [fipeModelos, setFipeModelos] = useState<FipeItem[]>([])
  const [fipeAnos, setFipeAnos] = useState<FipeItem[]>([])
  const [fipeMarcaCode, setFipeMarcaCode] = useState('')
  const [fipeModeloCode, setFipeModeloCode] = useState('')
  const [fipeAnoCode, setFipeAnoCode] = useState('')
  const [fipeLoadingMarcas, setFipeLoadingMarcas] = useState(false)
  const [fipeLoadingModelos, setFipeLoadingModelos] = useState(false)
  const [fipeLoadingAnos, setFipeLoadingAnos] = useState(false)

  const [form, setForm] = useState<FormData>({
    nome: '',
    whatsapp: '',
    email: '',
    placa: '',
    leilao: 'nao',
    carroApp: 'nao',
  })

  const set = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'placa') setApiError('')
  }, [])

  // Lead tracking (backend CRM cuida de follow-up + PDF + Bull queue)
  const [leadId, setLeadId] = useState<string | null>(null)
  const whatsappClicked = useRef(false)

  // Helper: notify WhatsApp click to API (legado + backend/CRM com envio imediato de PDF)
  const notifyWhatsAppClick = useCallback(() => {
    whatsappClicked.current = true
    // Tracking legado (in-memory no Next — mantido por compat)
    fetch('/api/whatsapp-clicked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, whatsapp: form.whatsapp }),
    }).catch(() => {})
    // Backend CRM: cancela follow-up agendado e dispara envio imediato do PDF
    if (leadId) {
      fetch(`${API_BASE}/api/vehicle/lead/${leadId}/whatsapp-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {})
    }
  }, [leadId, form.whatsapp])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nome.trim()) e.nome = 'Informe seu nome'
    const whatsErr = isValidWhatsApp(form.whatsapp)
    if (whatsErr) e.whatsapp = whatsErr
    if (searchMode === 'placa') {
      if (form.placa.length < 7) e.placa = 'Placa incompleta'
    } else {
      if (!fipeMarcaCode) e.fipeMarca = 'Escolha a marca'
      if (!fipeModeloCode) e.fipeModelo = 'Escolha o modelo'
      if (!fipeAnoCode) e.fipeAno = 'Escolha o ano'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function fetchVehicle(placa: string): Promise<any> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    try {
      const res = await fetch(
        `${API_BASE}/api/vehicle/plate/${placa}`,
        { signal: controller.signal },
      )
      clearTimeout(timeout)
      return await res.json()
    } catch {
      clearTimeout(timeout)
      throw new Error('network')
    }
  }

  /* ─── FIPE Lookup (sem placa) ─── */
  async function fetchFipe<T>(path: string): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    try {
      const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal })
      clearTimeout(timeout)
      return await res.json()
    } catch {
      clearTimeout(timeout)
      throw new Error('network')
    }
  }

  // Carrega marcas quando entra no modo "modelo" ou troca tipo (carro/moto)
  useEffect(() => {
    if (searchMode !== 'modelo') return
    let cancelled = false
    setFipeLoadingMarcas(true)
    setApiError('')
    fetchFipe<{ success: boolean; data?: FipeItem[]; error?: string }>(
      `/api/vehicle/fipe/marcas?tipo=${fipeKind}`,
    )
      .then(res => {
        if (cancelled) return
        if (res.success && res.data) setFipeMarcas(res.data)
        else setApiError(res.error || 'Não foi possível carregar as marcas')
      })
      .catch(() => {
        if (!cancelled) setApiError('Falha de rede ao buscar marcas')
      })
      .finally(() => {
        if (!cancelled) setFipeLoadingMarcas(false)
      })
    return () => { cancelled = true }
  }, [searchMode, fipeKind])

  // Carrega modelos quando marca é selecionada
  useEffect(() => {
    if (!fipeMarcaCode) { setFipeModelos([]); return }
    let cancelled = false
    setFipeLoadingModelos(true)
    fetchFipe<{ success: boolean; data?: FipeItem[]; error?: string }>(
      `/api/vehicle/fipe/modelos?tipo=${fipeKind}&marca=${encodeURIComponent(fipeMarcaCode)}`,
    )
      .then(res => {
        if (cancelled) return
        if (res.success && res.data) setFipeModelos(res.data)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFipeLoadingModelos(false) })
    return () => { cancelled = true }
  }, [fipeMarcaCode, fipeKind])

  // Carrega anos quando modelo é selecionado
  useEffect(() => {
    if (!fipeModeloCode || !fipeMarcaCode) { setFipeAnos([]); return }
    let cancelled = false
    setFipeLoadingAnos(true)
    fetchFipe<{ success: boolean; data?: FipeItem[]; error?: string }>(
      `/api/vehicle/fipe/anos?tipo=${fipeKind}&marca=${encodeURIComponent(fipeMarcaCode)}&modelo=${encodeURIComponent(fipeModeloCode)}`,
    )
      .then(res => {
        if (cancelled) return
        if (res.success && res.data) setFipeAnos(res.data)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setFipeLoadingAnos(false) })
    return () => { cancelled = true }
  }, [fipeModeloCode, fipeMarcaCode, fipeKind])

  function switchToPlaca() {
    setSearchMode('placa')
    setApiError('')
    setShowFallback(false)
  }

  function switchToModelo() {
    setSearchMode('modelo')
    setApiError('')
    setShowFallback(false)
    setErrors(prev => ({ ...prev, placa: '' }))
    // Reset encadeamento
    setFipeMarcaCode('')
    setFipeModeloCode('')
    setFipeAnoCode('')
    setFipeModelos([])
    setFipeAnos([])
  }

  /** Cotação via fallback manual (sem API) */
  function handleFallbackQuote() {
    if (!fallbackFipe) return

    const isMoto400 = fallbackType === 'moto-400'
    const isMoto1000 = fallbackType === 'moto-1000'
    const isSuv = fallbackType === 'suv'

    const localPlans = getApplicablePlans(
      fallbackFipe,
      isMoto400 || isMoto1000 ? 'MOTOCICLETA' : isSuv ? 'CAMINHONETE' : 'AUTOMOVEL',
      undefined,
      isMoto400 ? 300 : isMoto1000 ? 600 : undefined,
      isSuv ? 'compass' : undefined,  // trigger SUV detection
    )

    if (localPlans.length === 0) {
      setApiError('Não encontramos planos para essa faixa de valor. Fale com um consultor.')
      return
    }

    const isLeilao = form.leilao !== 'nao'
    const finalPlans = isLeilao
      ? localPlans.map(p => ({ ...p, monthly: Math.round(p.monthly * 0.8 * 100) / 100 }))
      : localPlans

    const fipeLabel = FIPE_RANGES.find(r => r.value === fallbackFipe)?.label || ''
    const typeLabel = VEHICLE_TYPES.find(t => t.value === fallbackType)?.label || ''

    setVehicle({
      marca: typeLabel,
      modelo: '(informado manualmente)',
      ano: '',
      cor: '',
      fipeValue: fallbackFipe,
      fipeCode: '',
      categoria: fallbackType,
    })
    setPlans(finalPlans)
    const popularIdx = finalPlans.findIndex(p => p.popular)
    setSelectedPlanIdx(popularIdx >= 0 ? popularIdx : 0)
    setShowFallback(false)
    setStep(2)

    const defaultPlan = finalPlans[popularIdx >= 0 ? popularIdx : 0]
    trackCotacaoCompleta({
      marca: typeLabel,
      modelo: '(manual)',
      ano: '',
      plano: defaultPlan.name,
      valorMensal: defaultPlan.monthly,
      valorFipe: fallbackFipe,
      email: form.email || undefined,
      phone: form.whatsapp || undefined,
    })

    // Salvar lead (não bloqueia)
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
        marca: typeLabel,
        modelo: '(manual)',
        ano: '',
        valorFipe: fallbackFipe,
        plano: defaultPlan.name,
        valorMensal: defaultPlan.monthly,
        ...tracking.utms,
        gclid: tracking.clickIds.gclid,
        fbclid: tracking.clickIds.fbclid,
        fbp: tracking.clickIds._fbp,
        fbc: tracking.clickIds._fbc,
      }),
    }).then(r => r.json()).then(data => {
      if (data.leadId) setLeadId(data.leadId)
    }).catch(() => {})
  }

  /** Cotação via FIPE (sem placa) — marca/modelo/ano */
  async function handleFipeQuote() {
    trackCotacaoInicio()
    setLoading(true)
    setApiError('')
    try {
      const data = await fetchFipe<any>(
        `/api/vehicle/fipe/preco?tipo=${fipeKind}&marca=${encodeURIComponent(fipeMarcaCode)}&modelo=${encodeURIComponent(fipeModeloCode)}&ano=${encodeURIComponent(fipeAnoCode)}`,
      )
      if (!data.success || !data.vehicle) {
        setApiError(data.error || 'Não foi possível consultar a FIPE. Tente novamente.')
        return
      }

      const v = data.vehicle
      setVehicle(v)

      if (shouldBlockQuote(v.marca, v.modelo, v.ano)) {
        setExcluded(true)
        setStep(2)
        return
      }

      // Calcula planos localmente pela tabela real
      const localPlans = getApplicablePlans(
        v.fipeValue,
        v.categoria,
        v.combustivel,
        undefined,
        v.modelo,
      )

      if (localPlans.length === 0) {
        setApiError('Não encontramos planos para esse veículo. Fale com um consultor.')
        return
      }

      const isLeilao = form.leilao !== 'nao'
      const finalPlans = isLeilao
        ? localPlans.map(p => ({ ...p, monthly: Math.round(p.monthly * 0.8 * 100) / 100 }))
        : localPlans

      setPlans(finalPlans)
      const popularIdx = finalPlans.findIndex(p => p.popular)
      setSelectedPlanIdx(popularIdx >= 0 ? popularIdx : 0)
      setStep(2)

      const defaultPlan = finalPlans[popularIdx >= 0 ? popularIdx : 0]
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

      // Salva lead (não bloqueia)
      const tracking = getTrackingData()
      fetch(`${API_BASE}/api/vehicle/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          whatsapp: form.whatsapp,
          email: form.email || undefined,
          placa: '',
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
      }).then(r => r.json()).then(d => {
        if (d.leadId) setLeadId(d.leadId)
      }).catch(() => {})
    } catch {
      setApiError('Falha ao consultar a tabela FIPE. Tente novamente ou use a busca por placa.')
    } finally {
      setLoading(false)
    }
  }

  async function next() {
    if (!validate()) return

    // Modo "sem placa" — vai direto pro FIPE
    if (searchMode === 'modelo') {
      await handleFipeQuote()
      return
    }

    trackCotacaoInicio()
    setLoading(true)
    setApiError('')

    try {
      const data = await fetchVehicle(form.placa)

      if (data.success) {
        const v = data.vehicle
        setVehicle(v)

        // Verifica se o veiculo esta na lista de exclusao
        if (shouldBlockQuote(v.marca, v.modelo, v.ano)) {
          setExcluded(true)
          setStep(2)
          // Salvar lead como excluido
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
              plano: 'EXCLUIDO',
              valorMensal: 0,
              ...tracking.utms,
              gclid: tracking.clickIds.gclid,
              fbclid: tracking.clickIds.fbclid,
              fbp: tracking.clickIds._fbp,
              fbc: tracking.clickIds._fbc,
            }),
          }).catch(() => {})
          return
        }

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
        }).then(r => r.json()).then(data => {
          if (data.leadId) setLeadId(data.leadId)
        }).catch(() => {})
      } else {
        // API retornou erro — mostra fallback manual
        setShowFallback(true)
        setApiError('')
      }
    } catch {
      // Timeout ou erro de rede — mostra fallback manual
      setShowFallback(true)
      setApiError('')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = plans[selectedPlanIdx] || null
  const planInfo = selectedPlan ? PLAN_INFO[selectedPlan.id as PlanId] : null
  const price = selectedPlan?.monthly || 0
  const priceFormatted = formatPrice(price)
  const isManualQuote = vehicle?.modelo === '(informado manualmente)'
  const vehicleLabel = vehicle
    ? isManualQuote
      ? `${vehicle.marca} — Valor estimado`
      : `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`
    : ''
  const fipeFormatted = vehicle ? vehicle.fipeValue.toLocaleString('pt-BR') : '0'

  // Lógica de pagamento: 1º = taxa ativação, 2º = mensalidade com desconto 5%
  const taxaAtivacao = 399
  const today = new Date()
  const dayOfMonth = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  let dueDate: Date
  if (dayOfMonth <= 15) {
    // Fechou até dia 15 → vence dia 10 do próximo mês
    dueDate = new Date(currentYear, currentMonth + 1, 10)
  } else {
    // Fechou do dia 16 pra frente → vence dia 20 do mês seguinte
    dueDate = new Date(currentYear, currentMonth + 1, 20)
  }
  const dueDateFormatted = `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`
  const discountPrice = Math.round(price * 0.95 * 100) / 100
  const discountFormatted = formatPrice(discountPrice)

  // Desconto adesivo no vidro traseiro (não se aplica a motos)
  const fipeValue = vehicle?.fipeValue || 0
  const planId = selectedPlan?.id || ''
  const isMoto = planId === 'moto-400' || planId === 'moto-1000'
  const isVipOrPremium = planId === 'vip' || planId === 'premium' || planId === 'suv' || planId === 'especial'
  const stickerPct = fipeValue > 35000 && isVipOrPremium ? 15 : 10
  const stickerPrice = Math.round(price * (1 - stickerPct / 100) * 100) / 100
  const stickerPriceFormatted = formatPrice(stickerPrice)
  // Adesivo + pontualidade combinados (não se substituem)
  const stickerPlusEarlyPrice = Math.round(stickerPrice * 0.95 * 100) / 100
  const stickerPlusEarlyFormatted = formatPrice(stickerPlusEarlyPrice)

  return (
    <div className="min-h-screen bg-[#F7F8FC] relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #375191 1px, transparent 0)`,
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
                            ? 'bg-[#F7963D] text-white shadow-md shadow-[#F7963D]/20'
                            : active
                              ? 'bg-[#10B981] text-white'
                              : 'bg-[#E2E8F0] text-[#94A3B8]'
                        }`}>
                          {active && !current ? <Check className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={`text-sm font-medium ${current ? 'text-[#121A33]' : 'text-[#94A3B8]'}`}>
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
                <h1 className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[#121A33] mb-2">
                  Simulação Grátis
                </h1>
                <p className="text-[#64748B]">Preencha seus dados e descubra o valor em segundos.</p>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-5 sm:p-8 md:p-10">
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
                  {searchMode === 'placa' ? (
                    <div>
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
                      <button
                        type="button"
                        onClick={switchToModelo}
                        disabled={loading}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#375191]/25 bg-[#375191]/5 px-4 py-2.5 text-sm font-semibold text-[#375191] hover:border-[#375191]/50 hover:bg-[#375191]/10 transition-all disabled:opacity-50"
                      >
                        <Search className="w-4 h-4" />
                        Não tenho a placa — <span className="underline underline-offset-2 decoration-[#375191]/40">buscar por modelo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-2xl border-2 border-[#D1DFFA] bg-[#F7F8FC]/60 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-[#121A33]">Buscar pelo modelo</label>
                        <button
                          type="button"
                          onClick={switchToPlaca}
                          disabled={loading}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#375191] hover:text-[#3D72DE] transition-colors disabled:opacity-50"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Tenho a placa
                        </button>
                      </div>

                      {/* Carro / Moto */}
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-2">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                          {([
                            { value: 'carros', label: 'Carro / SUV' },
                            { value: 'motos', label: 'Moto' },
                          ] as const).map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={loading}
                              onClick={() => {
                                setFipeKind(opt.value)
                                setFipeMarcaCode('')
                                setFipeModeloCode('')
                                setFipeAnoCode('')
                              }}
                              className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                                fipeKind === opt.value
                                  ? 'border-[#375191] bg-[#375191]/10 text-[#375191]'
                                  : 'border-[#D1DFFA] bg-white text-[#64748B] hover:border-[#375191]/40'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <FipeSelect
                        label="Marca"
                        value={fipeMarcaCode}
                        options={fipeMarcas}
                        loading={fipeLoadingMarcas}
                        disabled={loading || fipeLoadingMarcas}
                        error={errors.fipeMarca}
                        placeholder={fipeLoadingMarcas ? 'Carregando marcas...' : 'Selecione a marca'}
                        onChange={code => {
                          setFipeMarcaCode(code)
                          setFipeModeloCode('')
                          setFipeAnoCode('')
                          setErrors(prev => ({ ...prev, fipeMarca: '' }))
                        }}
                      />

                      <FipeSelect
                        label="Modelo"
                        value={fipeModeloCode}
                        options={fipeModelos}
                        loading={fipeLoadingModelos}
                        disabled={loading || !fipeMarcaCode || fipeLoadingModelos}
                        error={errors.fipeModelo}
                        placeholder={
                          !fipeMarcaCode
                            ? 'Escolha a marca primeiro'
                            : fipeLoadingModelos
                              ? 'Carregando modelos...'
                              : 'Selecione o modelo'
                        }
                        onChange={code => {
                          setFipeModeloCode(code)
                          setFipeAnoCode('')
                          setErrors(prev => ({ ...prev, fipeModelo: '' }))
                        }}
                      />

                      <FipeSelect
                        label="Ano"
                        value={fipeAnoCode}
                        options={fipeAnos}
                        loading={fipeLoadingAnos}
                        disabled={loading || !fipeModeloCode || fipeLoadingAnos}
                        error={errors.fipeAno}
                        placeholder={
                          !fipeModeloCode
                            ? 'Escolha o modelo primeiro'
                            : fipeLoadingAnos
                              ? 'Carregando anos...'
                              : 'Selecione o ano'
                        }
                        onChange={code => {
                          setFipeAnoCode(code)
                          setErrors(prev => ({ ...prev, fipeAno: '' }))
                        }}
                      />

                      <p className="text-[11px] text-[#94A3B8] leading-snug pt-1">
                        Valor estimado pela tabela FIPE. O consultor confirma o valor final com a placa real.
                      </p>
                    </div>
                  )}

                  {/* Leilão / Remarcado */}
                  <div>
                    <label className="block text-sm font-semibold text-[#121A33] mb-2">Veículo de leilão ou remarcado?</label>
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
                          className={`py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                            form.leilao === opt.value
                              ? 'border-[#375191] bg-[#375191]/10 text-[#375191] shadow-sm'
                              : 'border-[#D1DFFA] bg-[#F7F8FC] text-[#64748B] hover:border-[#375191]/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {form.leilao !== 'nao' && (
                      <p className="mt-2 text-xs text-[#F7963D] font-medium">
                        Indenização: 80% da tabela FIPE
                      </p>
                    )}
                  </div>

                  {/* Carro de aplicativo */}
                  <div>
                    <label className="block text-sm font-semibold text-[#121A33] mb-2">É carro de aplicativo (Uber, 99, etc.)?</label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: 'nao', label: 'Não' },
                        { value: 'sim', label: 'Sim' },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={loading}
                          onClick={() => set('carroApp', opt.value)}
                          className={`py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                            form.carroApp === opt.value
                              ? 'border-[#375191] bg-[#375191]/10 text-[#375191] shadow-sm'
                              : 'border-[#D1DFFA] bg-[#F7F8FC] text-[#64748B] hover:border-[#375191]/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {form.carroApp === 'sim' && (
                      <p className="mt-2 text-xs text-[#F7963D] font-medium">
                        Rastreador obrigatório · +R$ 100,00 na adesão · +R$ 20,00/mês na mensalidade
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
                        <a href="https://wa.me/5521979034169?text=Olá! Preciso de ajuda com uma simulação." target="_blank" rel="noopener noreferrer" className="underline font-medium">
                          fale no WhatsApp
                        </a>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback Manual — aparece quando API falha */}
                {showFallback && (
                  <div className="mt-6 p-6 rounded-2xl bg-[#FFFBF5] border-2 border-[#F7963D]/20">
                    <div className="flex items-start gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-[#F7963D]/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#F7963D]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#121A33] text-sm">Consulta automática indisponível</p>
                        <p className="text-[#64748B] text-xs mt-0.5">Selecione seu tipo de veículo e faixa de valor para receber a simulação agora mesmo.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Tipo de veículo */}
                      <div>
                        <label className="block text-sm font-semibold text-[#121A33] mb-2">Tipo do veículo</label>
                        <div className="grid grid-cols-2 gap-2">
                          {VEHICLE_TYPES.map(t => (
                            <button key={t.value} type="button" onClick={() => { setFallbackType(t.value); setFallbackFipe(0) }}
                              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                                fallbackType === t.value
                                  ? 'border-[#F7963D] bg-[#F7963D]/10 text-[#F7963D] shadow-sm'
                                  : 'border-[#D1DFFA] bg-white text-[#64748B] hover:border-[#F7963D]/40'
                              }`}>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Faixa FIPE */}
                      <div>
                        <label className="block text-sm font-semibold text-[#121A33] mb-2">Valor aproximado do veículo (FIPE)</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {FIPE_RANGES.map(r => (
                            <button key={r.value} type="button" onClick={() => setFallbackFipe(r.value)}
                              className={`py-2.5 px-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                                fallbackFipe === r.value
                                  ? 'border-[#F7963D] bg-[#F7963D]/10 text-[#F7963D] shadow-sm'
                                  : 'border-[#D1DFFA] bg-white text-[#64748B] hover:border-[#F7963D]/40'
                              }`}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <button onClick={handleFallbackQuote} disabled={!fallbackFipe}
                        className="group inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#F7963D] to-[#F9A95E] text-white font-bold text-sm rounded-full shadow-lg shadow-[#F7963D]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                        <Sparkles className="w-4 h-4" />
                        Ver Simulação Estimada
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <p className="text-center text-[10px] text-[#94A3B8] mt-3">
                      Valores estimados. O consultor confirmará o valor exato pelo WhatsApp.
                    </p>
                  </div>
                )}

                {!showFallback && (
                <div className="flex justify-center mt-10">
                  <button onClick={next} disabled={loading}
                    className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#F7963D] to-[#F9A95E] text-white font-bold text-base rounded-full shadow-lg shadow-[#F7963D]/20 hover:shadow-xl hover:shadow-[#F7963D]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Consultando veículo...
                      </>
                    ) : (
                      <>
                        Ver Simulação
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[#94A3B8]">
                  <Lock className="w-3.5 h-3.5" />
                  Seus dados estão seguros. Sem spam.
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#375191]" />
                  <span>Cadastrada na SUSEP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F7963D]" />
                  <span>20+ anos de mercado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Sem análise de perfil</span>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Veículo Excluído ── */}
          {step === 2 && excluded && vehicle && (
            <div className="max-w-lg mx-auto pt-28">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-6 sm:p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFF7ED] mb-6">
                  <AlertCircle className="w-8 h-8 text-[#F7963D]" />
                </div>

                <h2 className="font-[var(--font-display)] text-xl md:text-2xl font-bold text-[#121A33] mb-3">
                  Cotação sob consulta
                </h2>

                <p className="text-[#64748B] text-sm mb-2">
                  Identificamos seu veículo:
                </p>
                <p className="font-semibold text-[#121A33] text-base mb-4">
                  {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                </p>

                <p className="text-[#64748B] text-sm mb-8 leading-relaxed">
                  Para esse modelo, não conseguimos calcular o valor automaticamente.
                  <br />
                  Fale com nosso consultor para receber uma cotação personalizada!
                </p>

                <a
                  href={`https://wa.me/5521979034169?text=${encodeURIComponent(`Olá! Fiz uma simulação no site mas meu veículo precisa de cotação especial.\nNome: ${form.nome}\nWhatsApp: ${form.whatsapp}\nPlaca: ${form.placa}\nVeículo: ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}\nPode me ajudar?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackWhatsAppClick('cotacao_excluido')
                    if (typeof window !== 'undefined' && (window as any).dataLayer) {
                      (window as any).dataLayer.push({
                        event: 'whatsapp_click',
                        tipo: 'veiculo_excluido',
                        veiculo: `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano}`,
                      })
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-[#25D366] to-[#20BD5A] text-white font-bold text-base rounded-full shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mb-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar com Consultor no WhatsApp
                </a>

                <div className="flex items-center justify-center gap-2 text-xs text-[#94A3B8] mb-6">
                  <Lock className="w-3.5 h-3.5" />
                  Atendimento rápido e sem compromisso
                </div>

                <button
                  onClick={() => {
                    setStep(1)
                    setExcluded(false)
                    setVehicle(null)
                    setPlans([])
                    setForm({ nome: '', whatsapp: '', email: '', placa: '', leilao: 'nao' })
                  }}
                  className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#121A33] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Nova simulação
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Resultado ── */}
          {step === 2 && !excluded && vehicle && plans.length > 0 && selectedPlan && (
            <div className="max-w-5xl mx-auto pt-28">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#10B981]/10 mb-4">
                  <ShieldCheck className="w-7 h-7 text-[#10B981]" />
                </div>
                <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[#121A33] mb-2">
                  {form.nome.split(' ')[0]}, sua simulação está pronta!
                </h2>
                <p className="text-[#64748B]">
                  {vehicleLabel}
                  {vehicle.cor ? ` — ${vehicle.cor}` : ''}
                  {' — '}FIPE: R$ {fipeFormatted}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
                {/* Coberturas */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-4 sm:p-6 md:p-8">
                  {/* Plan tabs */}
                  <div className={`flex gap-1 bg-[#F0F4FA] rounded-2xl p-1.5 mb-6 sm:mb-8 ${plans.length > 4 ? 'flex-wrap' : ''}`}>
                    {plans.map((plan, idx) => (
                      <button key={plan.id} onClick={() => setSelectedPlanIdx(idx)}
                        className={`relative flex-1 min-w-[70px] sm:min-w-[100px] py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                          selectedPlanIdx === idx
                            ? 'bg-white text-[#121A33] shadow-md'
                            : 'text-[#64748B] hover:text-[#121A33]'
                        }`}>
                        {plan.name}
                        {plan.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#F7963D] bg-[#F7963D]/10 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                            Mais escolhido
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Coberturas toggle */}
                  <button onClick={() => setShowCoberturas(!showCoberturas)}
                    className="flex items-center justify-between w-full mb-5 text-[#121A33] font-semibold text-sm">
                    Benefícios incluídos
                    {showCoberturas ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                  </button>

                  {showCoberturas && planInfo && (
                    <ul className="space-y-3.5">
                      {planInfo.features.map(c => (
                        <li key={c.text} className="flex items-center gap-3">
                          {c.included
                            ? <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-[#10B981]" /></div>
                            : <div className="w-6 h-6 rounded-full bg-[#F0F4FA] flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5 text-[#CBD5E1]" /></div>}
                          <span className={`text-sm ${c.included ? 'text-[#121A33] font-medium' : 'text-[#CBD5E1] line-through'}`}>{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Preço / CTA */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-black/[0.04] border border-[#E8ECF4] p-4 sm:p-6 md:p-8 h-fit lg:sticky lg:top-28">
                  <div className="text-center mb-6">
                    <p className="text-sm text-[#64748B] mb-1">Plano {selectedPlan.name}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-[#64748B] font-medium">R$</span>
                      <span className="font-[var(--font-display)] text-5xl font-bold text-[#121A33] leading-none">{priceFormatted}</span>
                      <span className="text-lg text-[#64748B] font-medium">/mês</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E8ECF4] pt-4 mb-6 space-y-4 text-sm">
                    {/* 1º PAGAMENTO — Ativação do plano */}
                    <div className="bg-[#FFF7ED] border border-[#F7963D]/20 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#121A33]">1º pagamento</span>
                        <span className="font-extrabold text-[#F7963D] text-xl">R$ {formatPrice(taxaAtivacao)}</span>
                      </div>
                      <p className="text-xs text-[#F7963D] font-semibold mt-1">Ativação do plano — pagamento único</p>
                    </div>

                    {/* 2º PAGAMENTO — Mensalidade com desconto */}
                    <div className="bg-[#F0FDF4] border border-[#10B981]/20 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#121A33]">2º pagamento</span>
                        <span className="text-xs text-[#64748B]">vencimento até {dueDateFormatted}</span>
                      </div>
                      <div className="flex items-baseline justify-end gap-2 mt-1">
                        <span className="text-sm text-[#94A3B8] line-through">R$ {priceFormatted}</span>
                        <span className="font-extrabold text-[#10B981] text-2xl">R$ {discountFormatted}</span>
                      </div>
                      <p className="text-xs text-[#10B981] font-semibold mt-1.5 text-right">5% de desconto pagando antes do vencimento</p>
                    </div>

                    {/* Mensalidade regular — destaque */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#121A33]">Mensalidade regular</span>
                        <span className="font-extrabold text-[#121A33] text-2xl">R$ {priceFormatted}<span className="text-sm font-medium text-[#64748B]">/mês</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Desconto Adesivo — com ElectricBorder (não aparece para motos) */}
                  {!isMoto && (
                  <div className="mb-6">
                    <ElectricBorder color="#F7963D" speed={0.6} chaos={0.08} borderRadius={20}>
                      <div className="bg-white rounded-[20px] p-4 sm:p-5">
                        {/* Header com toggle */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 rounded-xl bg-[#F7963D]/10 flex items-center justify-center flex-shrink-0">
                            <Car className="w-5 h-5 text-[#F7963D]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-[#121A33] text-sm leading-tight">Desconto Adesivo 21Go</p>
                            <p className="text-[10px] text-[#64748B]">Adesivo no vidro traseiro</p>
                          </div>
                          <span className="bg-[#F7963D] text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm shadow-[#F7963D]/20">
                            -{stickerPct}%
                          </span>
                        </div>

                        {/* Toggle aceitar/recusar */}
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => setStickerAccepted(true)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                              stickerAccepted
                                ? 'bg-[#F7963D] text-white shadow-md shadow-[#F7963D]/20'
                                : 'bg-[#F7F8FC] text-[#94A3B8] border border-[#E2E8F0] hover:border-[#F7963D]/40'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 inline mr-1" />
                            Quero o desconto
                          </button>
                          <button
                            onClick={() => setStickerAccepted(false)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                              !stickerAccepted
                                ? 'bg-[#64748B] text-white shadow-md'
                                : 'bg-[#F7F8FC] text-[#94A3B8] border border-[#E2E8F0] hover:border-[#64748B]/40'
                            }`}
                          >
                            <X className="w-3.5 h-3.5 inline mr-1" />
                            Sem adesivo
                          </button>
                        </div>

                        {/* Valores — aparece se aceitou */}
                        {stickerAccepted ? (
                          <div className="bg-[#FFF7ED] rounded-xl p-3.5 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#64748B] font-medium">Com adesivo</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs text-[#94A3B8] line-through">R$ {priceFormatted}</span>
                                <span className="font-extrabold text-[#F7963D] text-xl">R$ {stickerPriceFormatted}</span>
                              </div>
                            </div>
                            <div className="h-px bg-[#F7963D]/10" />
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-[#10B981]" />
                                <span className="text-xs text-[#64748B] font-medium">Adesivo + em dia</span>
                              </div>
                              <span className="font-extrabold text-[#10B981] text-xl">R$ {stickerPlusEarlyFormatted}</span>
                            </div>
                            <p className="text-[10px] text-[#94A3B8] text-center pt-1">
                              Descontos acumuláveis: adesivo ({stickerPct}%) + pontualidade (5%)
                            </p>
                          </div>
                        ) : (
                          <div className="bg-[#F7F8FC] rounded-xl p-3.5 text-center">
                            <p className="text-xs text-[#94A3B8]">
                              Você pode ativar o desconto a qualquer momento!
                            </p>
                          </div>
                        )}
                      </div>
                    </ElectricBorder>
                  </div>
                  )}

                  <a href={`https://wa.me/5521979034169?text=${encodeURIComponent(`Olá! Fiz uma simulação no site.\nNome: ${form.nome}\nWhatsApp: ${form.whatsapp}${form.email ? `\nE-mail: ${form.email}` : ''}\nPlaca: ${form.placa}${form.leilao !== 'nao' ? `\nOrigem: ${form.leilao === 'leilao' ? 'Leilão' : 'Remarcado'}` : ''}\nVeículo: ${vehicleLabel}\nFIPE: R$ ${fipeFormatted}\nPlano: ${selectedPlan.name}\nMensalidade: R$ ${priceFormatted}/mês\nAdesão: R$ ${formatPrice(taxaAtivacao)}\nQuero contratar!`)}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppClick('cotacao_resultado', { plano: selectedPlan.name, valor: price })
                      notifyWhatsAppClick()
                      // GTM event
                      if (typeof window !== 'undefined' && (window as any).dataLayer) {
                        (window as any).dataLayer.push({
                          event: 'whatsapp_click',
                          plano: selectedPlan.name,
                          valor: price,
                          veiculo: vehicleLabel,
                        })
                      }
                    }}
                    className="flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-[#F7963D] to-[#F9A95E] text-white font-bold text-base rounded-full shadow-lg shadow-[#F7963D]/20 hover:shadow-xl hover:shadow-[#F7963D]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mb-4">
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
                  className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#121A33] transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Editar dados
                </button>
                <button onClick={() => { setStep(1); setForm({ nome: '', whatsapp: '', email: '', placa: '', leilao: 'nao' }); setVehicle(null); setPlans([]); setShowFallback(false); setFallbackFipe(0); setExcluded(false); setSearchMode('placa'); setFipeMarcaCode(''); setFipeModeloCode(''); setFipeAnoCode(''); whatsappClicked.current = false }}
                  className="text-sm text-[#375191] hover:text-[#3D72DE] transition-colors">
                  Nova simulação
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
      <label htmlFor={name} className="block text-sm font-semibold text-[#121A33] mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
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
          className={`w-full ${icon ? 'pl-12' : 'px-5'} pr-5 py-4 rounded-2xl border-2 text-[#121A33] text-[15px] font-medium placeholder:text-[#94A3B8] bg-[#F7F8FC] focus:outline-none focus:border-[#375191] focus:bg-white focus:shadow-[0_0_0_3px_rgba(55,81,145,0.1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-[#EF4444] bg-[#FEF2F2] shadow-[0_0_0_3px_rgba(239,68,68,0.08)]' : 'border-[#D1DFFA] hover:border-[#375191]/40'
          } ${mono ? 'font-mono tracking-[0.15em] text-lg' : ''}`}
        />
      </div>
      {error && <p className="mt-1.5 ml-4 text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  )
}

/* ─── Select FIPE (com busca nativa do browser) ─── */
function FipeSelect({
  label, value, options, onChange, placeholder, disabled, loading, error,
}: {
  label: string
  value: string
  options: FipeItem[]
  onChange: (code: string) => void
  placeholder: string
  disabled?: boolean
  loading?: boolean
  error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#64748B] mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl border-2 bg-white text-[#121A33] text-[14px] font-medium focus:outline-none focus:border-[#375191] focus:shadow-[0_0_0_3px_rgba(55,81,145,0.1)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
            error ? 'border-[#EF4444]' : 'border-[#D1DFFA] hover:border-[#375191]/40'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.name}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading
            ? <Loader2 className="w-4 h-4 text-[#94A3B8] animate-spin" />
            : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
        </div>
      </div>
      {error && <p className="mt-1.5 ml-1 text-xs text-[#EF4444] font-medium">{error}</p>}
    </div>
  )
}
