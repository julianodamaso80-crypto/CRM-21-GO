'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lock } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Gold glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C] opacity-[0.08] blur-[120px]" />

      {/* Decorative beams */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,200 Q400,100 800,250 T1600,180"
          fill="none"
          stroke="rgba(201,168,76,0.08)"
          strokeWidth="1"
          className="animate-[dash_8s_linear_infinite]"
          strokeDasharray="10 20"
        />
        <path
          d="M0,350 Q300,250 700,400 T1400,300"
          fill="none"
          stroke="rgba(201,168,76,0.06)"
          strokeWidth="1"
          className="animate-[dash_10s_linear_infinite]"
          strokeDasharray="8 16"
        />
        <path
          d="M200,0 Q350,200 200,400 T400,600"
          fill="none"
          stroke="rgba(201,168,76,0.05)"
          strokeWidth="1"
          className="animate-[dash_12s_linear_infinite]"
          strokeDasharray="12 24"
        />
        <path
          d="M1000,0 Q850,150 1000,350 T900,600"
          fill="none"
          stroke="rgba(201,168,76,0.05)"
          strokeWidth="1"
          className="animate-[dash_9s_linear_infinite]"
          strokeDasharray="6 18"
        />
      </svg>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto max-w-2xl px-6 text-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl"
        >
          Proteja seu veiculo agora
        </motion.h2>

        <motion.p variants={fadeInUp} className="mt-4 text-[#8888A0]">
          Cotacao em 30 segundos. Sem burocracia, sem analise de perfil. Junte-se a milhares de cariocas protegidos pela 21Go.
        </motion.p>

        {/* Inline form */}
        <motion.div
          variants={fadeInUp}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <input
            type="text"
            placeholder="Seu nome"
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-[#F0F0F5] placeholder-[#555570] outline-none transition-colors focus:border-[#C9A84C]/30 sm:w-auto"
          />
          <input
            type="tel"
            placeholder="WhatsApp"
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-[#F0F0F5] placeholder-[#555570] outline-none transition-colors focus:border-[#C9A84C]/30 sm:w-auto"
          />
          <ShimmerButton className="w-full sm:w-auto">
            Quero Minha Cotacao
          </ShimmerButton>
        </motion.div>

        {/* Trust line */}
        <motion.div
          variants={fadeInUp}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-[#555570]"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Seus dados estao protegidos. Sem spam.</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
