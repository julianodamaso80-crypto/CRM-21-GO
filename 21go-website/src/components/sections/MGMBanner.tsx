'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Award } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'

const tiers = [
  { name: 'Bronze', indicacoes: '1-2', desconto: '10-20%', color: 'from-amber-700 to-amber-600' },
  { name: 'Prata', indicacoes: '3-5', desconto: '30-50%', color: 'from-gray-400 to-gray-300' },
  { name: 'Ouro', indicacoes: '6-8', desconto: '60-80%', color: 'from-[#C9A84C] to-[#E0C060]' },
  { name: 'Diamante', indicacoes: '10+', desconto: '100%', color: 'from-cyan-400 to-blue-400' },
]

export function MGMBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#141420] to-[#0F0F18]"
        >
          <div className="grid gap-10 p-8 md:grid-cols-2 md:p-16">
            {/* Left: text + CTA */}
            <motion.div variants={fadeInUp} className="flex flex-col justify-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
                MEMBER GET MEMBER
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-[#F0F0F5] md:text-4xl lg:text-5xl">
                Indique amigos e ganhe ate{' '}
                <span className="text-[#C9A84C]">100% de desconto</span>
              </h2>
              <p className="mt-4 text-[#8888A0]">
                10% de desconto por indicacao que fechar.{' '}
                <span className="font-semibold text-[#F0F0F5]">Acumula.</span>{' '}
                10 amigos = protecao{' '}
                <span className="font-semibold text-[#C9A84C]">GRATIS</span>.
              </p>
              <div className="mt-8">
                <ShimmerButton href="/indique">
                  Quero Indicar
                </ShimmerButton>
              </div>
            </motion.div>

            {/* Right: tier badges */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-300 hover:bg-white/[0.04]"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${tier.color}`}>
                    <Award className="h-6 w-6 text-[#0A0A0F]" />
                  </div>
                  <p className="mt-3 font-display text-sm font-bold text-[#F0F0F5]">
                    {tier.name}
                  </p>
                  <p className="mt-1 text-xs text-[#555570]">
                    {tier.indicacoes} indicacoes
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-[#C9A84C]">
                    {tier.desconto}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
