'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ChevronDown, ShieldCheck, Clock, Users } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'
import { NumberTicker } from '@/components/ui/NumberTicker'
import Link from 'next/link'

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden pt-24 pb-16">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(27,77,161,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(27,77,161,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Blue glow — identidade principal */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1B4DA1] opacity-15 blur-[120px]" />

      {/* Orange accent glow — sutil */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-[#E07620] opacity-8 blur-[100px]" />

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
      >
        {/* Badge — slogan oficial */}
        <motion.div variants={fadeInUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1B4DA1]/30 bg-[#1B4DA1]/10 px-5 py-2 text-sm font-medium text-[#6B96EB]">
            <ShieldCheck className="h-4 w-4" />
            Nao conte com a sorte, conte com a 21Go!
          </span>
        </motion.div>

        {/* Title — copy direta, protetora */}
        <motion.h1
          variants={fadeInUp}
          className="mt-8 font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-white md:text-7xl"
        >
          Seu carro protegido por{' '}
          <span className="bg-gradient-to-r from-[#E07620] to-[#F08C28] bg-clip-text text-transparent">
            quem entende
          </span>{' '}
          do Rio
        </motion.h1>

        {/* Subtitle — beneficios claros */}
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-6 max-w-2xl text-lg font-body text-[#C5C5D2] md:text-xl leading-relaxed"
        >
          20+ anos protegendo veiculos no RJ. Ate 60% mais barato que seguro.
          Sem analise de perfil, sem burocracia. Cotacao em 30 segundos.
        </motion.p>

        {/* Buttons */}
        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ShimmerButton href="/cotacao" size="lg">
            Fazer Cotacao Gratis
          </ShimmerButton>
          <Link
            href="/protecao-veicular"
            className="rounded-lg border border-[#3D3D5C] bg-[#1A1F35] px-7 py-3 text-sm font-semibold text-[#C5C5D2] transition-all duration-200 hover:border-[#55557A] hover:text-white"
          >
            Conhecer os Planos
          </Link>
        </motion.div>

        {/* Stats — com icones */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 grid grid-cols-3 gap-8 md:gap-16"
        >
          {[
            { target: 20, suffix: '+', label: 'Anos de Mercado', icon: ShieldCheck },
            { target: 98, suffix: '%', label: 'Satisfacao', icon: Users },
            { target: 24, suffix: '/7', label: 'Assistencia', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon className="mb-2 h-5 w-5 text-[#3D72DE]" />
              <NumberTicker
                target={stat.target}
                suffix={stat.suffix}
                className="font-display text-4xl font-extrabold text-white"
              />
              <span className="mt-1 text-sm font-body text-[#9D9DB5]">{stat.label}</span>
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
        <ChevronDown className="h-6 w-6 animate-bounce text-[#55557A]" />
      </motion.div>
    </section>
  )
}
