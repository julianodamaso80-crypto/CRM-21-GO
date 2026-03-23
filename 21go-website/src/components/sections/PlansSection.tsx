'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

const plans = [
  {
    name: 'Basico',
    price: '89',
    popular: false,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistencia 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisao', included: false },
      { text: 'Incendio', included: false },
      { text: 'Carro Reserva', included: false },
      { text: 'Terceiros R$100K', included: false },
      { text: 'Vidros e Farois', included: false },
    ],
  },
  {
    name: 'Completo',
    price: '189',
    popular: true,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistencia 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisao', included: true },
      { text: 'Incendio', included: true },
      { text: 'Carro Reserva 7 dias', included: true },
      { text: 'Terceiros R$100K', included: false },
      { text: 'Vidros e Farois', included: false },
    ],
  },
  {
    name: 'Premium',
    price: '259',
    popular: false,
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Assistencia 24h', included: true },
      { text: 'Guincho 200km', included: true },
      { text: 'Colisao', included: true },
      { text: 'Incendio', included: true },
      { text: 'Carro Reserva 15 dias', included: true },
      { text: 'Terceiros R$100K', included: true },
      { text: 'Vidros e Farois', included: true },
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
          <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]">
            Protecao sob medida para seu veiculo
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            Escolha o plano ideal. Todos incluem assistencia 24h e guincho em todo o Brasil.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? 'border-[#E07620] shadow-md scale-[1.02] bg-white'
                  : 'border-[#E2E8F0] bg-white hover:-translate-y-1'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E07620] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  Mais escolhido
                </span>
              )}

              <h3 className="font-[var(--font-outfit)] text-xl font-bold text-[#0A1E3D]">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm text-[#64748B]">a partir de</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm text-[#64748B]">R$</span>
                <span className="font-[var(--font-outfit)] text-4xl font-bold text-[#0A1E3D]">{plan.price}</span>
                <span className="text-sm text-[#64748B]">/mes</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="h-4 w-4 text-[#10B981] flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-[#CBD5E1] flex-shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? 'text-[#0A1E3D]' : 'text-[#CBD5E1]'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cotacao"
                className={`mt-8 block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  plan.popular
                    ? 'bg-[#E07620] text-white hover:bg-[#C46218] shadow-sm'
                    : 'bg-[#F0F4FA] text-[#1B4DA1] hover:bg-[#E2E8F0]'
                }`}
              >
                Cotar este plano
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
