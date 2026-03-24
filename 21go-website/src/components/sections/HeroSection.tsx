'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Clock, Users, MessageCircle, ChevronDown } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { NumberTicker } from '@/components/ui/NumberTicker'
import Link from 'next/link'

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section
      ref={ref}
      className="relative min-h-[95vh] overflow-hidden pt-24 pb-24 bg-gradient-to-b from-[#0A1E3D] via-[#0D2653] to-[#1B4DA1]"
    >
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/grid-pattern.svg)',
          backgroundRepeat: 'repeat',
          opacity: 0.04,
        }}
      />

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#E07620]/20 blur-[120px]" />
        <div className="animate-float-slower absolute bottom-0 -left-32 w-[700px] h-[700px] rounded-full bg-[#1B4DA1]/30 blur-[150px]" />
        <div className="animate-pulse-slow absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#C9A84C]/10 blur-[100px]" />

        {/* Geometric accents */}
        <div className="absolute top-1/4 left-[15%] w-32 h-32 border border-white/[0.05] rounded-2xl rotate-12" />
        <div className="absolute bottom-1/3 right-[12%] w-20 h-20 border border-white/[0.04] rounded-full" />
        <div className="absolute top-1/2 right-[20%] w-16 h-16 border border-[#C9A84C]/10 rounded-xl rotate-45" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeInUp}>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-white/90">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            <ShieldCheck className="h-4 w-4 text-[#C9A84C]" />
            20+ anos protegendo cariocas
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={fadeInUp}
          className="mt-8 font-[var(--font-outfit)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white"
        >
          Proteção Veicular no RJ —{' '}
          <span className="block mt-3">
            Seu Carro Protegido por{' '}
            <span className="text-gradient-orange">Menos de R$3/dia</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70 md:text-xl leading-relaxed"
        >
          Sem análise de perfil. Sem burocracia. Cotação em 30 segundos.
          Até 60% mais barato que seguro tradicional.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/cotacao"
            className="shimmer-btn relative inline-flex items-center px-9 py-4 rounded-xl bg-[#E07620] text-white text-base font-semibold transition-all duration-300 animate-glow-pulse hover:bg-[#C46218] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(224,118,32,0.5)]"
          >
            Fazer Cotação Grátis
          </Link>
          <a
            href="https://wa.me/5521965700021"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl border border-white/20 bg-white/[0.07] backdrop-blur-sm text-white text-base font-semibold hover:bg-white/[0.12] hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" />
            Fale no WhatsApp
          </a>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 grid grid-cols-3 gap-8 md:gap-20"
        >
          {[
            { target: 20, suffix: '+', label: 'Anos de Mercado', icon: ShieldCheck },
            { target: 98, suffix: '%', label: 'Aprovação', icon: Users },
            { target: 24, suffix: '/7', label: 'Assistência', icon: Clock },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon className="mb-2 h-5 w-5 text-[#C9A84C]" />
              <NumberTicker
                target={stat.target}
                suffix={stat.suffix}
                duration={1800 + i * 200}
                className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-white"
              />
              <span className="mt-1 text-sm text-white/60">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40 tracking-widest uppercase">Explorar</span>
          <div className="relative w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-scroll-dot" />
          </div>
          <ChevronDown className="h-4 w-4 text-white/30 animate-bounce-slow" />
        </motion.div>
      </motion.div>
    </section>
  )
}
