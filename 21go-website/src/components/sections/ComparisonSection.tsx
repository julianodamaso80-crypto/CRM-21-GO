'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, X } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const rows = [
  { feature: 'Custo mensal', veicular: 'Ate 60% menor', seguro: 'Valor elevado' },
  { feature: 'Analise de perfil', veicular: false, seguro: true },
  { feature: 'Aceita carros antigos', veicular: true, seguro: false },
  { feature: 'Burocracia', veicular: 'Minima', seguro: 'Alta' },
  { feature: 'Cancelamento', veicular: 'Sem multa', seguro: 'Fidelidade 12 meses' },
  { feature: 'Assistencia 24h', veicular: true, seguro: true },
  { feature: 'Guincho', veicular: '200km incluso', seguro: 'Varia por plano' },
  { feature: 'Cotacao online', veicular: '30 segundos', seguro: 'Dias para analise' },
]

function CellValue({ value, positive }: { value: string | boolean; positive: boolean }) {
  if (typeof value === 'boolean') {
    return positive ? (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981]/10">
        <Check className="h-4 w-4 text-[#10B981]" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EF4444]/10">
        <X className="h-4 w-4 text-[#EF4444]" />
      </span>
    )
  }
  return <span className={`text-sm font-medium ${positive ? 'text-[#0A1E3D]' : 'text-[#64748B]'}`}>{value}</span>
}

export function ComparisonSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-4xl px-6"
      >
        <motion.div variants={fadeInUp} className="text-center mb-14">
          <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]">
            Protecao Veicular vs Seguro Tradicional
          </h2>
          <p className="mt-4 text-lg text-[#64748B]">
            Entenda por que milhares de cariocas estao migrando para a protecao veicular
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
          {/* Header */}
          <div className="grid grid-cols-3 bg-[#F0F4FA]">
            <div className="p-4 text-sm font-semibold text-[#64748B]">Caracteristica</div>
            <div className="p-4 text-center text-sm font-semibold text-[#1B4DA1]">21Go Protecao</div>
            <div className="p-4 text-center text-sm font-semibold text-[#64748B]">Seguradora</div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFC]'} border-t border-[#F0F4FA]`}>
              <div className="p-4 text-sm text-[#0A1E3D] font-medium">{row.feature}</div>
              <div className="p-4 flex items-center justify-center">
                <CellValue value={row.veicular} positive={true} />
              </div>
              <div className="p-4 flex items-center justify-center">
                <CellValue value={row.seguro} positive={false} />
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
