'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, ShieldCheck, ShieldPlus, ArrowRight, Check } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import Link from 'next/link'

interface Plan {
  name: string
  icon: typeof Shield
  description: string
  features: string[]
  highlighted: boolean
}

const plans: Plan[] = [
  {
    name: 'Basico',
    icon: Shield,
    description: 'Para quem quer protecao contra roubo e furto com assistencia completa.',
    features: ['Roubo e Furto', 'Assistencia 24h', 'Guincho 200km'],
    highlighted: false,
  },
  {
    name: 'Completo',
    icon: ShieldCheck,
    description: 'O mais escolhido. Cobertura ampla para o dia a dia no transito do RJ.',
    features: ['Tudo do Basico', 'Colisao', 'Incendio', 'Carro Reserva 7 dias'],
    highlighted: true,
  },
  {
    name: 'Premium',
    icon: ShieldPlus,
    description: 'Protecao total. Para quem nao abre mao de nada.',
    features: [
      'Tudo do Completo',
      'Terceiros ate R$100K',
      'Vidros e retrovisores',
      'Carro Reserva 15 dias',
      'Rastreamento incluso',
    ],
    highlighted: false,
  },
]

export function PlansSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28" id="planos">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#3D72DE]">
            PLANOS
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Protecao sob medida para seu veiculo
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-[#9D9DB5]">
            O valor depende do seu carro. Faca uma cotacao em 30 segundos e descubra quanto fica.
          </p>
        </motion.div>

        {/* Plans grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeInUp}>
              <div
                className={`relative rounded-2xl border p-8 transition-all duration-200 ${
                  plan.highlighted
                    ? 'border-[#1B4DA1]/50 bg-gradient-to-b from-[#1A1F35] to-[#111827] shadow-[0_0_40px_rgba(27,77,161,0.1)]'
                    : 'border-[#3D3D5C]/50 bg-[#1A1F35]/50 hover:border-[#55557A]/50'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="inline-block rounded-full bg-[#1B4DA1]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6B96EB]">
                      Mais Escolhido
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    plan.highlighted
                      ? 'bg-[#1B4DA1]/15 text-[#3D72DE]'
                      : 'bg-[#2A2A42] text-[#9D9DB5]'
                  }`}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">
                    {plan.name}
                  </h3>
                </div>

                <p className="text-sm font-body text-[#9D9DB5] leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={`h-4 w-4 flex-shrink-0 ${
                        plan.highlighted ? 'text-[#3D72DE]' : 'text-[#55557A]'
                      }`} />
                      <span className="text-sm font-body text-[#C5C5D2]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  {plan.highlighted ? (
                    <ShimmerButton href="/cotacao" className="w-full justify-center">
                      Cotar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </ShimmerButton>
                  ) : (
                    <Link
                      href="/cotacao"
                      className="flex w-full items-center justify-center rounded-lg border border-[#3D3D5C] bg-[#2A2A42] px-7 py-3 text-sm font-semibold text-[#C5C5D2] transition-all duration-200 hover:border-[#55557A] hover:text-white"
                    >
                      Cotar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-sm font-body text-[#757598]">
          Valor calculado com base na tabela FIPE do seu veiculo + taxa administrativa de R$35.
        </p>
      </div>
    </section>
  )
}
