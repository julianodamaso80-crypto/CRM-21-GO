'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Bot, Clock, ShieldCheck, User } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const features = [
  {
    icon: Bot,
    title: 'IA Especializada',
    description: 'Treinada com mais de 20 anos de conhecimento em protecao veicular no Rio de Janeiro.',
  },
  {
    icon: Clock,
    title: 'Disponivel 24/7',
    description: 'Duvida as 3 da manha? Nosso assistente resolve. Cotacao, sinistro, qualquer coisa.',
  },
  {
    icon: ShieldCheck,
    title: 'Resposta Instantanea',
    description: 'Cotacao em segundos com consulta automatica a tabela FIPE. Sem espera, sem fila.',
  },
]

const chatMessages = [
  { role: 'user' as const, text: 'Oi, quero saber quanto custa proteger meu Civic 2020' },
  { role: 'ai' as const, text: 'Ola! Vou consultar a tabela FIPE do seu Honda Civic 2020. Um momento...' },
  {
    role: 'ai' as const,
    text: 'Pronto! O valor FIPE e R$98.500. Confira os planos:\n\n- Basico: R$119/mes\n- Completo: R$189/mes (mais popular)\n- Premium: R$259/mes\n\nQuer agendar a vistoria agora?',
  },
]

export function AIShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          {/* Left: text + features */}
          <div>
            <motion.div variants={fadeInUp}>
              <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
                TECNOLOGIA
              </span>
              <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
                Atendimento inteligente 24 horas
              </h2>
              <p className="mt-4 max-w-md text-[#8888A0]">
                Nossa IA cuida do seu atendimento enquanto voce descansa. Cotacao, duvidas e sinistros resolvidos na hora.
              </p>
            </motion.div>

            <div className="mt-10 space-y-6">
              {features.map((feature) => (
                <motion.div key={feature.title} variants={fadeInUp} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                    <feature.icon className="h-5 w-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-[#F0F0F5]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#8888A0]">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: chat mockup */}
          <motion.div variants={fadeInUp} className="relative">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[#C9A84C]/5 blur-[60px]" />

            <SpotlightCard className="relative overflow-hidden !rounded-2xl !p-0">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#9E8540]">
                  <Bot className="h-4 w-4 text-[#0A0A0F]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F0F0F5]">21Go Assistente</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-[#555570]">Online agora</span>
                  </div>
                </div>
                <span className="ml-auto rounded-full bg-[#C9A84C]/10 px-2 py-0.5 text-xs font-semibold text-[#C9A84C]">
                  IA
                </span>
              </div>

              {/* Messages */}
              <div className="min-h-[300px] space-y-4 p-6">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex max-w-[85%] items-start gap-2 ${
                        msg.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                          msg.role === 'user' ? 'bg-[#C9A84C]/20' : 'bg-white/[0.06]'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="h-3 w-3 text-[#C9A84C]" />
                        ) : (
                          <Bot className="h-3 w-3 text-[#8888A0]" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[#C9A84C]/10 border border-[#C9A84C]/20'
                            : 'bg-white/[0.04] border border-white/[0.06]'
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm text-[#F0F0F5]/80">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div className="border-t border-white/[0.06] px-6 py-4">
                <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                  <span className="text-sm text-[#555570]">Digite sua mensagem...</span>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
