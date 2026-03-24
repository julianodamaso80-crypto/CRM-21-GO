'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Clock, Users, Award } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const badges = [
  { icon: ShieldCheck, label: 'Cadastro SUSEP', sublabel: 'Regulamentada' },
  { icon: Award, label: '20+ Anos', sublabel: 'De mercado no RJ' },
  { icon: Users, label: 'Milhares', sublabel: 'De associados ativos' },
  { icon: Clock, label: '24/7', sublabel: 'Assistência em todo Brasil' },
]

export function TrustBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section ref={ref} className="bg-white py-10 border-b border-[#F0F4FA]">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-7xl px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge) => (
            <motion.div
              key={badge.label}
              variants={fadeInUp}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1B4DA1]/5 flex items-center justify-center">
                <badge.icon className="h-5 w-5 text-[#1B4DA1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A1E3D]">{badge.label}</p>
                <p className="text-xs text-[#64748B]">{badge.sublabel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
