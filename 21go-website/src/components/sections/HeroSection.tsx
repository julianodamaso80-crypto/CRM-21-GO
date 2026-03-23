'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { TextReveal } from '@/components/ui/TextReveal'
import { NumberTicker } from '@/components/ui/NumberTicker'
import Link from 'next/link'

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden pt-24 pb-16">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Gold glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9A84C] opacity-30 blur-[80px] animate-[float_6s_ease-in-out_infinite]" />

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp}>
          <BorderBeam>Nao conte com a sorte, conte com a 21Go!</BorderBeam>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          className="mt-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-5xl font-extrabold leading-[1.05] tracking-tight text-transparent font-display md:text-7xl"
        >
          <TextReveal
            text="Protecao Veicular Inteligente para o Rio de Janeiro"
            highlightWord="Inteligente"
            highlightClass="text-[#C9A84C]"
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-[#8888A0] font-body md:text-xl"
        >
          Ate 60% mais barato que seguro. 20+ anos protegendo veiculos no RJ. Sem analise de perfil.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ShimmerButton href="/cotacao" size="lg">
            Cote em 30 Segundos
          </ShimmerButton>
          <Link
            href="/protecao-veicular"
            className="rounded-full border border-white/10 px-7 py-3 text-[#8888A0] transition-all duration-300 hover:border-white/20 hover:text-white"
          >
            Ver Planos
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
        >
          {[
            { target: 20, suffix: '+', label: 'Anos de Mercado' },
            { target: 98, suffix: '%', label: 'Satisfacao' },
            { target: 24, suffix: '/7', label: 'Assistencia' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <NumberTicker
                target={stat.target}
                suffix={stat.suffix}
                className="font-display text-4xl font-extrabold text-[#C9A84C]"
              />
              <span className="mt-1 text-sm text-[#555570]">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 animate-bounce text-[#555570]" />
      </motion.div>
    </section>
  )
}
