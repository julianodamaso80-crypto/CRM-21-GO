'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

const plans = [
  {
    name: 'Básico',
    desc: 'Proteção essencial contra roubo e furto',
    popular: false,
    delay: 0,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistência 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisão', included: false },
      { text: 'Incêndio', included: false },
      { text: 'Carro Reserva', included: false },
      { text: 'Terceiros R$100K', included: false },
      { text: 'Vidros e Faróis', included: false },
    ],
  },
  {
    name: 'Completo',
    desc: 'A proteção mais escolhida pelos cariocas',
    popular: true,
    delay: 0.1,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistência 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisão', included: true },
      { text: 'Incêndio', included: true },
      { text: 'Carro Reserva 7 dias', included: true },
      { text: 'Terceiros R$100K', included: false },
      { text: 'Vidros e Faróis', included: false },
    ],
  },
  {
    name: 'Premium',
    desc: 'Cobertura total com todos os benefícios',
    popular: false,
    delay: 0.2,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistência 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisão', included: true },
      { text: 'Incêndio', included: true },
      { text: 'Carro Reserva 15 dias', included: true },
      { text: 'Terceiros R$100K', included: true },
      { text: 'Vidros e Faróis', included: true },
    ],
  },
]

export function PlansSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="planos" className="bg-white py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-7xl px-6"
      >
        <motion.div variants={fadeInUp} className="text-center mb-14">
          <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#1B4DA1]">
            Proteção sob medida para seu veículo
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            Escolha o plano ideal. Todos incluem assistência 24h e guincho em todo o Brasil.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              transition={{ delay: plan.delay }}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? 'border-[#E07620]/50 shadow-xl scale-[1.04] bg-white md:-mt-4'
                  : 'border-[#E2E8F0] bg-white hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Glow behind popular card */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-2xl -z-10 animate-glow-pulse opacity-60"
                  style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(224,118,32,0.15) 0%, transparent 70%)' }}
                />
              )}

              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E07620] to-[#C9A84C] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
                  Mais escolhido
                </span>
              )}

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-[var(--font-outfit)] text-xl font-bold text-[#0A1E3D]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{plan.desc}</p>
                </div>
                {plan.popular && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E07620]/10 flex items-center justify-center">
                    <span className="text-[#E07620] text-sm">★</span>
                  </div>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    {f.included ? (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#10B981]" />
                      </span>
                    ) : (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                        <X className="h-3 w-3 text-[#CBD5E1]" />
                      </span>
                    )}
                    <span className={`text-sm ${f.included ? 'text-[#0A1E3D]' : 'text-[#CBD5E1]'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cotacao"
                className={`mt-8 block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-[#E07620] text-white hover:bg-[#C46218] shadow-md hover:shadow-[0_4px_16px_rgba(224,118,32,0.4)]'
                    : 'bg-[#F0F4FA] text-[#1B4DA1] hover:bg-[#E2E8F0]'
                }`}
              >
                Solicitar Cotação
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
