'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Lock, Flame, Layers, Clock, Users } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const coverages = [
  {
    icon: ShieldCheck,
    title: 'Colisao',
    description: 'Cobertura total em caso de colisao, seja parcial ou perda total. Reparos na rede credenciada sem dor de cabeca.',
    span: 'md:col-span-2',
  },
  {
    icon: Lock,
    title: 'Roubo e Furto',
    description: 'Protecao contra roubo e furto com reembolso baseado na tabela FIPE. Processo rapido e descomplicado.',
    span: 'md:col-span-1',
  },
  {
    icon: Flame,
    title: 'Incendio',
    description: 'Cobertura completa em caso de incendio, incluindo causas eletricas e mecanicas do veiculo.',
    span: 'md:col-span-1',
  },
  {
    icon: Layers,
    title: 'Vidros e Farois',
    description: 'Troca de para-brisa, vidros laterais, traseiro e farois sem franquia. Pecas originais garantidas.',
    span: 'md:col-span-2',
  },
  {
    icon: Clock,
    title: 'Assistencia 24h',
    description: 'Guincho ate 200km, chaveiro, troca de pneu, pane seca e eletrica. Disponivel 24 horas por dia, 7 dias por semana.',
    span: 'md:col-span-2',
  },
  {
    icon: Users,
    title: 'Terceiros R$100K',
    description: 'Cobertura de danos materiais e corporais causados a terceiros ate R$100 mil. Tranquilidade total no transito.',
    span: 'md:col-span-1',
  },
]

export function ProblemSolution() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
            COBERTURAS
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
            Protecao completa para seu veiculo
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#8888A0]">
            Coberturas pensadas para a realidade do Rio de Janeiro. Do basico ao premium, voce escolhe o que faz sentido.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {coverages.map((item) => (
            <motion.div key={item.title} variants={fadeInUp} className={item.span}>
              <SpotlightCard className="h-full p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                  <item.icon className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#F0F0F5]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8888A0]">
                  {item.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
