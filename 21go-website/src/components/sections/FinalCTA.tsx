'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, MessageCircle } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-3xl px-6 text-center"
      >
        <motion.div variants={fadeInUp}>
          <ShieldCheck className="mx-auto h-12 w-12 text-[#1B4DA1] mb-6" />
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]"
        >
          Proteja seu veiculo agora
        </motion.h2>

        <motion.p variants={fadeInUp} className="mt-4 text-lg text-[#64748B]">
          Cotacao em 30 segundos, sem compromisso. Comece a proteger seu patrimonio hoje.
        </motion.p>

        <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#10B981] text-white text-base font-semibold hover:bg-[#059669] transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            Fale no WhatsApp
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
