'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Gift, Users, Trophy } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

const tiers = [
  { count: '1', discount: '10%', icon: Users },
  { count: '5', discount: '50%', icon: Users },
  { count: '10', discount: 'GRATIS', icon: Trophy },
]

export function MGMBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-gradient-to-b from-[#0A1E3D] via-[#11336D] to-[#1B4DA1] py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-5xl px-6 text-center"
      >
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Gift className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-sm font-medium text-white/90">Programa Indique & Ganhe</span>
          </div>
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="font-[var(--font-outfit)] text-3xl md:text-4xl lg:text-5xl font-bold text-white"
        >
          Indique amigos e ganhe ate{' '}
          <span className="text-[#E07620]">100% de desconto</span>
        </motion.h2>

        <motion.p variants={fadeInUp} className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
          Cada indicacao que vira associado te da 10% de desconto. Acumulativo. 10 indicacoes = protecao gratuita.
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {tiers.map((tier) => (
            <div key={tier.count} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                <tier.icon className="h-7 w-7 text-[#C9A84C]" />
              </div>
              <span className="text-sm text-white/60">{tier.count} {tier.count === '1' ? 'indicacao' : 'indicacoes'}</span>
              <span className="font-[var(--font-outfit)] text-xl font-bold text-white mt-1">{tier.discount}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-10">
          <Link
            href="/indique"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-[#E07620] text-white text-base font-semibold hover:bg-[#C46218] transition-all duration-200 shadow-lg shadow-[#E07620]/25"
          >
            Comece a indicar
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
