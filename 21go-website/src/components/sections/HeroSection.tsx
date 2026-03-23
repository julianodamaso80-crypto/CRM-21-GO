'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Clock, Users, MessageCircle } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { NumberTicker } from '@/components/ui/NumberTicker'
import Link from 'next/link'

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-[90vh] overflow-hidden pt-24 pb-20 bg-gradient-to-b from-[#0A1E3D] via-[#11336D] to-[#1B4DA1]">
      {/* Geometric shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#E07620]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#1B4DA1]/20 blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/[0.04] rounded-2xl rotate-12" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-white/[0.04] rounded-full" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-white/90">
            <ShieldCheck className="h-4 w-4 text-[#C9A84C]" />
            20+ anos protegendo cariocas
          </span>
        </motion.div>

        {/* H1 — SEO keyword "Protecao Veicular" + "RJ" */}
        <motion.h1
          variants={fadeInUp}
          className="mt-8 font-[var(--font-outfit)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white"
        >
          Protecao Veicular no RJ{' '}
          <span className="block mt-2">
            — Seu Carro Protegido por{' '}
            <span className="text-[#E07620]">Menos de R$3/dia</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70 md:text-xl leading-relaxed"
        >
          Sem analise de perfil. Sem burocracia. Cotacao em 30 segundos.
          Ate 60% mais barato que seguro tradicional.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/cotacao"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-[#E07620] text-white text-base font-semibold hover:bg-[#C46218] transition-all duration-200 shadow-lg shadow-[#E07620]/25 hover:shadow-[#E07620]/40 hover:-translate-y-0.5"
          >
            Fazer Cotacao Gratis
          </Link>
          <a
            href="https://wa.me/5521333321000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white text-base font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            Fale no WhatsApp
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
        >
          {[
            { target: 20, suffix: '+', label: 'Anos de Mercado', icon: ShieldCheck },
            { target: 98, suffix: '%', label: 'Aprovacao', icon: Users },
            { target: 24, suffix: '/7', label: 'Assistencia', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon className="mb-2 h-5 w-5 text-[#C9A84C]" />
              <NumberTicker
                target={stat.target}
                suffix={stat.suffix}
                className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-white"
              />
              <span className="mt-1 text-sm text-white/60">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
