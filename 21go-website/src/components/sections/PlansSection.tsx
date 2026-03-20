'use client'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Check, X } from 'lucide-react'

interface PlanFeature {
  name: string
  basico: boolean
  completo: boolean
  premium: boolean
}

const features: PlanFeature[] = [
  { name: 'Roubo/Furto', basico: true, completo: true, premium: true },
  { name: 'Assistencia 24h', basico: true, completo: true, premium: true },
  { name: 'Guincho 200km', basico: true, completo: true, premium: true },
  { name: 'Colisao', basico: false, completo: true, premium: true },
  { name: 'Incendio', basico: false, completo: true, premium: true },
  { name: 'Carro Reserva', basico: false, completo: true, premium: true },
  { name: 'Terceiros R$100K', basico: false, completo: false, premium: true },
  { name: 'Vidros', basico: false, completo: false, premium: true },
  { name: 'Rastreamento', basico: false, completo: false, premium: true },
]

interface Plan {
  name: string
  key: 'basico' | 'completo' | 'premium'
  price: string
  description: string
  highlighted: boolean
}

const plans: Plan[] = [
  {
    name: 'Basico',
    key: 'basico',
    price: '89',
    description: 'Protecao essencial contra roubo e furto',
    highlighted: false,
  },
  {
    name: 'Completo',
    key: 'completo',
    price: '149',
    description: 'A protecao mais escolhida pelos cariocas',
    highlighted: true,
  },
  {
    name: 'Premium',
    key: 'premium',
    price: '219',
    description: 'Cobertura total com rastreamento incluso',
    highlighted: false,
  },
]

export function PlansSection() {
  return (
    <section className="py-24 relative" id="planos">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Planos"
          title="Escolha o plano ideal para voce"
          subtitle="Todos os planos incluem assistencia 24h e guincho. Sem analise de perfil, sem burocracia."
        />

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-dark-700/80 border-orange-500/40 shadow-[0_0_40px_-12px_rgba(224,118,32,0.15)] scale-[1.02]'
                  : 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600/50'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="orange">Mais Popular</Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="font-body text-sm text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-gray-400">a partir de</span>
                </div>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-sm text-gray-400">R$</span>
                  <span className="text-5xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-400">/mes</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {features.map((feature) => {
                  const included = feature[plan.key]
                  return (
                    <div key={feature.name} className="flex items-center gap-3">
                      {included ? (
                        <Check className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 shrink-0" />
                      )}
                      <span
                        className={`font-body text-sm ${
                          included ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  )
                })}
              </div>

              <Button
                variant={plan.highlighted ? 'cta' : 'primary'}
                href="/cotacao"
                className="w-full justify-center"
              >
                Quero este plano
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 font-body mt-8">
          * Valores calculados com base na tabela FIPE. Valor final depende do veiculo.
        </p>
      </div>
    </section>
  )
}
