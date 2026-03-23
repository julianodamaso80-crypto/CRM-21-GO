'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'
import { fadeInUp } from '@/lib/motion'

const testimonials = [
  { name: 'Carlos M.', initials: 'CM', vehicle: 'Honda Civic 2020', quote: 'Sinistro resolvido em 12 dias. Recebi o valor FIPE completo.' },
  { name: 'Ana P.', initials: 'AP', vehicle: 'Hyundai HB20 2022', quote: 'Pago R$139/mes. No seguro era R$380. Mesma cobertura.' },
  { name: 'Roberto S.', initials: 'RS', vehicle: 'Toyota Hilux 2021', quote: 'Guincho chegou em 40 minutos. Atendimento nota 10.' },
  { name: 'Fernanda L.', initials: 'FL', vehicle: 'Jeep Renegade 2023', quote: 'Indiquei 5 amigos, ja tenho 50% de desconto.' },
  { name: 'Marcos T.', initials: 'MT', vehicle: 'Chevrolet Onix 2022', quote: 'Adesao em 48h, sem burocracia nenhuma.' },
  { name: 'Patricia R.', initials: 'PR', vehicle: 'VW Polo 2021', quote: 'Melhor custo-beneficio que ja encontrei no RJ.' },
  { name: 'Diego A.', initials: 'DA', vehicle: 'Fiat Argo 2023', quote: 'Carro reserva em 2 horas apos o sinistro.' },
  { name: 'Luciana B.', initials: 'LB', vehicle: 'Nissan Kicks 2022', quote: '20 anos de mercado me deu confianca pra assinar.' },
]

const row1 = testimonials.slice(0, 4)
const row2 = testimonials.slice(4, 8)

function TestimonialCard({ t }: { t: typeof testimonials[number] }) {
  return (
    <div className="w-[350px] flex-shrink-0 rounded-2xl border border-white/[0.06] bg-[#141420] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#9E8540]">
          <span className="text-xs font-bold text-[#0A0A0F]">{t.initials}</span>
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-[#F0F0F5]">{t.name}</p>
          <p className="text-xs text-[#555570]">{t.vehicle}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#8888A0]">
        &ldquo;{t.quote}&rdquo;
      </p>
    </div>
  )
}

export function SocialProof() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
          DEPOIMENTOS
        </span>
        <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
          O que nossos associados dizem
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[#8888A0]">
          Milhares de cariocas ja protegem seus veiculos com a 21Go.
        </p>
      </motion.div>

      {/* Marquee rows */}
      <div className="relative">
        {/* Fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#0A0A0F] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#0A0A0F] to-transparent" />

        {/* Row 1 */}
        <div className="group mb-4">
          <div className="flex gap-4 animate-[scroll_40s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...row1, ...row1].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        {/* Row 2 - reverse */}
        <div className="group">
          <div className="flex gap-4 animate-[scroll_40s_linear_infinite_reverse] group-hover:[animation-play-state:paused]">
            {[...row2, ...row2].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
