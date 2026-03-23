'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { fadeInUp } from '@/lib/motion'
import { ShimmerButton } from '@/components/ui/ShimmerButton'

const faqItems = [
  {
    question: 'O que e protecao veicular?',
    answer:
      'Protecao veicular e um sistema cooperativo (mutualismo) em que todos os associados contribuem mensalmente para um fundo comum. Quando alguem sofre um sinistro, o fundo cobre a indenizacao. Diferente do seguro tradicional, nao ha analise de perfil e os custos sao muito menores.',
  },
  {
    question: 'Protecao veicular e legal?',
    answer:
      'Sim, 100% legal no Brasil. Amparada pelo artigo 5 da Constituicao Federal (liberdade de associacao) e pelo Codigo Civil. A 21Go atua ha mais de 20 anos no Rio de Janeiro com total transparencia e registro na SUSEP.',
  },
  {
    question: 'Quanto custa a protecao?',
    answer:
      'O valor depende do modelo e ano do seu veiculo (tabela FIPE). Nossos planos comecam em R$119/mes para o Basico, R$189/mes para o Completo e R$259/mes para o Premium. Faca uma cotacao gratuita em 30 segundos para saber o valor exato.',
  },
  {
    question: 'Como funciona em caso de sinistro?',
    answer:
      'Em caso de sinistro, voce entra em contato pelo WhatsApp ou app. Abrimos o processo imediatamente, direcionamos para a oficina credenciada e acompanhamos tudo ate a resolucao. Para roubo/furto, a indenizacao e baseada na tabela FIPE. Prazo medio de 15 a 30 dias.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim! Nao existe fidelidade ou multa de cancelamento. Voce pode cancelar sua protecao a qualquer momento, sem burocracia. Basta entrar em contato com nosso atendimento.',
  },
  {
    question: 'Aceita carro antigo ou financiado?',
    answer:
      'Sim para ambos. Diferente das seguradoras tradicionais, nao recusamos veiculos por ano ou situacao financeira. Carros antigos, financiados e ate com restricao sao aceitos normalmente.',
  },
  {
    question: 'O que e o programa Indique e Ganhe?',
    answer:
      'Nosso programa Member Get Member: a cada amigo que voce indica e que fecha a adesao, voce ganha 10% de desconto na sua mensalidade. O desconto e acumulativo — com 10 indicacoes, sua protecao fica 100% gratuita.',
  },
]

export function HomeFAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section ref={ref} className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left sticky */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
              DUVIDAS
            </span>
            <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
              Perguntas frequentes
            </h2>
            <p className="mt-4 text-[#8888A0]">
              Nao encontrou o que procura? Fale diretamente com a gente pelo WhatsApp.
            </p>
            <div className="mt-8">
              <ShimmerButton
                href="https://wa.me/5521999999999"
                className="!bg-gradient-to-r !from-green-600 !to-green-500"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Falar no WhatsApp
              </ShimmerButton>
            </div>
          </motion.div>

          {/* Right accordion */}
          <div className="lg:col-span-3">
            {faqItems.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/[0.06]"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between py-5 text-left"
                  >
                    <span className="font-display text-base font-semibold text-[#F0F0F5] pr-4">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[#555570] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm leading-relaxed text-[#8888A0]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
