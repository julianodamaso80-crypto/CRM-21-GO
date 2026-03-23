'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { MovingBorder } from '@/components/ui/MovingBorder'
import Link from 'next/link'

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted: boolean
}

const plans: Plan[] = [
  {
    name: 'Basico',
    price: 'R$119',
    description: 'Protecao essencial contra roubo e furto',
    features: ['Roubo/Furto', 'Assistencia 24h', 'Guincho 200km'],
    highlighted: false,
  },
  {
    name: 'Completo',
    price: 'R$189',
    description: 'A protecao mais escolhida pelos cariocas',
    features: ['Roubo/Furto', 'Assistencia 24h', 'Guincho 200km', 'Colisao', 'Incendio', 'Carro Reserva 7d'],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: 'R$259',
    description: 'Cobertura total com rastreamento incluso',
    features: [
      'Roubo/Furto',
      'Assistencia 24h',
      'Guincho 200km',
      'Colisao',
      'Incendio',
      'Terceiros R$100K',
      'Vidros',
      'Carro Reserva 15d',
      'Rastreador',
    ],
    highlighted: false,
  },
]

export function PlansSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 bg-[#0F0F18]/30" id="planos">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
            PLANOS
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
            Escolha o plano ideal para voce
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#8888A0]">
            Todos os planos incluem assistencia 24h e guincho. Sem analise de perfil, sem burocracia.
          </p>
        </motion.div>

        {/* Plans grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center"
        >
          {plans.map((plan) => {
            const card = (
              <div
                className={`rounded-2xl border border-white/[0.06] bg-[#141420] p-8 ${
                  plan.highlighted ? 'scale-[1.03]' : ''
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C9A84C]">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                {/* Plan info */}
                <h3 className="font-display text-xl font-bold text-[#F0F0F5]">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-[#8888A0]">{plan.description}</p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-[#F0F0F5]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#555570]">/mes</span>
                </div>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 flex-shrink-0 text-[#C9A84C]" />
                      <span className="text-sm text-[#8888A0]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  {plan.highlighted ? (
                    <ShimmerButton href="/cotacao" className="w-full justify-center">
                      Quero este plano
                    </ShimmerButton>
                  ) : (
                    <Link
                      href="/cotacao"
                      className="flex w-full items-center justify-center rounded-full border border-white/[0.06] px-7 py-3 text-sm font-semibold text-white/70 transition-all duration-300 hover:border-white/20 hover:text-white"
                    >
                      Quero este plano
                    </Link>
                  )}
                </div>
              </div>
            )

            return (
              <motion.div key={plan.name} variants={fadeInUp}>
                {plan.highlighted ? (
                  <MovingBorder>{card}</MovingBorder>
                ) : (
                  card
                )}
              </motion.div>
            )
          })}
        </motion.div>

        <p className="mt-8 text-center text-sm text-[#555570]">
          * Valores calculados com base na tabela FIPE. Valor final depende do veiculo.
        </p>
      </div>
    </section>
  )
}
