'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  Car,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  Check,
  Sparkles,
} from 'lucide-react'

const steps = [
  { number: 1, label: 'Veiculo', icon: Car },
  { number: 2, label: 'Seus Dados', icon: User },
  { number: 3, label: 'Resultado', icon: CheckCircle },
]

interface PlanResult {
  name: string
  price: string
  features: string[]
  highlighted: boolean
}

const planResults: PlanResult[] = [
  {
    name: 'Basico',
    price: '89',
    features: ['Roubo/Furto', 'Assistencia 24h', 'Guincho 200km'],
    highlighted: false,
  },
  {
    name: 'Completo',
    price: '149',
    features: ['Tudo do Basico', 'Colisao', 'Incendio', 'Carro Reserva 7 dias'],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '219',
    features: ['Tudo do Completo', 'Terceiros R$100K', 'Vidros', 'Rastreamento'],
    highlighted: false,
  },
]

export default function CotacaoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    nome: '',
    whatsapp: '',
    email: '',
    cep: '',
  })

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleNext() {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  function handleBack() {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Badge variant="orange" className="mb-4">Sem analise de perfil</Badge>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Cotacao de Protecao Veicular
          </h1>
          <p className="font-body text-lg text-gray-400">
            Descubra o valor para proteger seu veiculo em 30 segundos.
          </p>
        </div>
      </section>

      {/* Progress bar */}
      <section className="py-8">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-dark-800 border-dark-700 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`font-body text-xs mt-2 ${
                      currentStep >= step.number ? 'text-blue-300' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-blue-500' : 'bg-dark-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form content */}
      <section className="pb-24">
        <div className="max-w-2xl mx-auto px-6">
          {/* Step 1: Vehicle */}
          {currentStep === 1 && (
            <Card className="p-8">
              <h2 className="font-display text-xl font-semibold text-white mb-6">
                Informe seu veiculo
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block font-body text-sm text-gray-300 mb-2">
                    Placa do Veiculo
                  </label>
                  <input
                    type="text"
                    name="placa"
                    value={formData.placa}
                    onChange={handleInputChange}
                    placeholder="ABC-1234 ou ABC1D23"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-dark-700/50" />
                  <span className="font-body text-sm text-gray-500">ou informe manualmente</span>
                  <div className="flex-1 h-px bg-dark-700/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-sm text-gray-300 mb-2">Marca</label>
                    <input
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      placeholder="Honda"
                      className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-sm text-gray-300 mb-2">Modelo</label>
                    <input
                      type="text"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleInputChange}
                      placeholder="Civic"
                      className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="w-1/2">
                  <label className="block font-body text-sm text-gray-300 mb-2">Ano</label>
                  <input
                    type="text"
                    name="ano"
                    value={formData.ano}
                    onChange={handleInputChange}
                    placeholder="2020"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button variant="primary" onClick={handleNext}>
                  Proximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Personal data */}
          {currentStep === 2 && (
            <Card className="p-8">
              <h2 className="font-display text-xl font-semibold text-white mb-6">
                Seus dados
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block font-body text-sm text-gray-300 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm text-gray-300 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-body text-sm text-gray-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>

                <div className="w-1/2">
                  <label className="block font-body text-sm text-gray-300 mb-2">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="20000-000"
                    className="w-full px-4 py-3 rounded-xl bg-dark-900/50 border border-dark-700/50 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button variant="cta" onClick={handleNext}>
                  Ver Resultado
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <ShieldCheck className="w-7 h-7 text-green-400" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  Sua cotacao esta pronta!
                </h2>
                <p className="font-body text-sm text-gray-400">
                  Confira os planos disponiveis para o seu veiculo.
                </p>
              </div>

              <div className="grid gap-4">
                {planResults.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all ${
                      plan.highlighted
                        ? 'bg-dark-700/80 border-orange-500/40 shadow-[0_0_30px_-10px_rgba(224,118,32,0.15)]'
                        : 'bg-dark-800/50 border-dark-700/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
                        {plan.highlighted && <Badge variant="orange">Recomendado</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {plan.features.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-1 text-xs font-body text-gray-400"
                          >
                            <Check className="w-3 h-3 text-green-400" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-400">R$</span>
                        <span className="text-3xl font-display font-bold text-white">{plan.price}</span>
                        <span className="text-sm text-gray-400">/mes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center space-y-4">
                <Button
                  variant="cta"
                  size="lg"
                  href="https://wa.me/5521999999999?text=Oi%2C%20fiz%20uma%20cota%C3%A7%C3%A3o%20no%20site%20e%20quero%20fechar!"
                  className="w-full sm:w-auto justify-center text-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Fechar pelo WhatsApp
                </Button>
                <p className="text-sm text-gray-500 font-body">
                  Um consultor vai finalizar sua adesao em minutos.
                </p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="font-body text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Fazer nova cotacao
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
