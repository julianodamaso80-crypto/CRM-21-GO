'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'

const faqs = [
  { q: 'O que e protecao veicular?', a: 'Protecao veicular e um sistema cooperativo (mutualismo) onde associados dividem os custos de sinistros. Diferente do seguro tradicional, nao ha analise de perfil e o custo e significativamente menor.' },
  { q: 'Qual a diferenca entre protecao veicular e seguro?', a: 'O seguro e oferecido por seguradoras com analise de perfil e precos altos. A protecao veicular funciona por mutualismo — todos contribuem para um fundo comum, o que reduz o custo em ate 60%.' },
  { q: 'Como funciona o mutualismo?', a: 'Todos os associados contribuem mensalmente para um fundo comum. Quando alguem sofre um sinistro, o fundo cobre. Quanto mais associados, menor o custo para cada um.' },
  { q: 'Quanto custa a protecao veicular na 21Go?', a: 'Os planos comecam a partir de R$89/mes para o Basico. O valor exato depende do veiculo (tabela FIPE) e do plano escolhido. Faca uma cotacao gratuita em 30 segundos.' },
  { q: 'Como aciono o guincho?', a: 'Basta ligar para nossa central 24h ou usar o app. O guincho atende em todo o Brasil com cobertura de ate 200km inclusos em todos os planos.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Nao existe fidelidade nem multa por cancelamento. Voce pode cancelar quando quiser, sem burocracia.' },
  { q: 'A 21Go aceita carros antigos?', a: 'Sim! Diferente das seguradoras que recusam veiculos acima de 10 anos, a 21Go protege qualquer carro, qualquer ano, sem analise de perfil.' },
  { q: 'O que e a 21Go?', a: 'A 21Go e uma associacao de protecao veicular com mais de 20 anos de mercado no Rio de Janeiro. Funcionamos por mutualismo, oferecendo protecao completa a precos justos com tecnologia e atendimento humano.' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFBFC] transition-colors"
      >
        <span className="text-sm font-semibold text-[#0A1E3D] pr-4">{q}</span>
        <ChevronDown className={`h-5 w-5 text-[#64748B] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function HomeFAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#F0F4FA] py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-3xl px-6"
      >
        <motion.div variants={fadeInUp} className="text-center mb-14">
          <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-lg text-[#64748B]">Tire suas duvidas sobre protecao veicular</p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
