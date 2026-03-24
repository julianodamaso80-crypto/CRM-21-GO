'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Lock, Flame, Truck, Clock, Car } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const coverages = [
  { icon: ShieldCheck, title: 'Colisão', desc: 'Cobertura parcial e total para batidas e acidentes' },
  { icon: Lock, title: 'Roubo e Furto', desc: 'Reembolso pela tabela FIPE em caso de perda total' },
  { icon: Flame, title: 'Incêndio', desc: 'Proteção contra incêndio e eventos da natureza' },
  { icon: Truck, title: 'Guincho 200km', desc: 'Reboque gratuito em todo o território nacional' },
  { icon: Car, title: 'Carro Reserva', desc: 'Veículo substituto por até 15 dias nos planos superiores' },
  { icon: Clock, title: 'Assistência 24h', desc: 'Chaveiro, pneu, pane seca e elétrica a qualquer hora' },
]

export function ProblemSolution() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#F0F4FA] py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-7xl px-6"
      >
        <motion.div variants={fadeInUp} className="text-center mb-14">
          <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#1B4DA1]">
            Proteção completa para seu veículo
          </h2>
          <p className="mt-4 text-lg text-[#64748B] max-w-2xl mx-auto">
            Coberturas pensadas pra realidade do Rio de Janeiro. Tudo que você precisa em um único plano.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverages.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              transition={{ delay: i * 0.07 }}
              className="group bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#1B4DA1]/20 transition-all duration-300 cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1B4DA1]/5 flex items-center justify-center mb-4 group-hover:bg-[#1B4DA1]/10 group-hover:scale-110 transition-all duration-300">
                <item.icon className="h-6 w-6 text-[#1B4DA1]" />
              </div>
              <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-[#0A1E3D]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
