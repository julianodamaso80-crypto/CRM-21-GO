'use client'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Calculator, Camera, Zap, ShieldCheck } from 'lucide-react'
import { fadeInUp } from '@/lib/motion'

const steps = [
  {
    number: '1',
    title: 'Faca sua Cotacao',
    description: 'Preencha os dados do veiculo e receba o valor na hora. Sem burocracia, sem enrolacao.',
    time: 'Online em 2 minutos',
    icon: Calculator,
  },
  {
    number: '2',
    title: 'Vistoria Digital',
    description: 'Tire fotos do veiculo pelo app. Sem precisar ir a nenhum lugar, sem sair de casa.',
    time: 'Pelo app, sem sair de casa',
    icon: Camera,
  },
  {
    number: '3',
    title: 'Ativacao',
    description: 'Apos a analise das fotos e pagamento, seu veiculo ja esta protegido rapidamente.',
    time: 'Em ate 24 horas',
    icon: Zap,
  },
  {
    number: '4',
    title: 'Protegido!',
    description: 'Cobertura completa ativa. Assistencia 24h, guincho, e tudo que voce contratou.',
    time: 'Cobertura completa ativa',
    icon: ShieldCheck,
  },
]

export function HowItWorks() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const lineScaleY = useTransform(scrollYProgress, [0.1, 0.9], [0, 1])

  return (
    <section ref={sectionRef} className="relative py-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-20 text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
          COMO FUNCIONA
        </span>
        <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
          4 passos para sua protecao
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[#8888A0]">
          Simples, rapido e 100% digital. Do orcamento a ativacao sem complicacao.
        </p>
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Vertical animated line */}
        <div className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 md:block">
          <div className="h-full w-[2px] bg-white/[0.06]" />
          <motion.div
            className="absolute left-0 top-0 w-[2px] origin-top bg-[#C9A84C]"
            style={{ scaleY: lineScaleY, height: '100%' }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                transition={{ delay: i * 0.15 }}
                className={`relative flex flex-col items-center gap-6 md:flex-row ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Text side */}
                <div className={`flex-1 ${isLeft ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                  <h3 className="font-display text-xl font-bold text-[#F0F0F5]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8888A0]">
                    {step.description}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-[#C9A84C]/10 px-3 py-1 text-xs font-medium text-[#C9A84C]">
                    {step.time}
                  </span>
                </div>

                {/* Circle */}
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#C9A84C] bg-[#0A0A0F]">
                  <step.icon className="h-5 w-5 text-[#C9A84C]" />
                </div>

                {/* Empty side for alignment */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
