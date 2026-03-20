'use client'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'
import { Bot, User, Zap, Clock, Brain } from 'lucide-react'

const chatMessages = [
  {
    role: 'user' as const,
    text: 'Oi, quero saber quanto custa proteger meu Civic 2020',
  },
  {
    role: 'ai' as const,
    text: 'Ola! Vou consultar a tabela FIPE do seu Honda Civic 2020. Um momento...',
  },
  {
    role: 'ai' as const,
    text: 'Pronto! O valor FIPE e R$98.500. Confira os planos:\n\n- Basico: R$89/mes\n- Completo: R$149/mes (mais popular)\n- Premium: R$219/mes\n\nQuer agendar a vistoria agora?',
  },
]

const features = [
  {
    icon: Clock,
    title: 'Disponivel 24/7',
    description: 'Duvida as 3 da manha? Nosso assistente resolve.',
  },
  {
    icon: Zap,
    title: 'Resposta Instantanea',
    description: 'Cotacao em segundos com consulta automatica a tabela FIPE.',
  },
  {
    icon: Brain,
    title: 'Inteligente de Verdade',
    description: 'Entende o contexto e responde como um consultor especializado.',
  },
]

export function AIShowcase() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Tecnologia"
          title="Atendimento inteligente 24 horas"
          subtitle="Nossa IA cuida do seu atendimento enquanto voce descansa."
        />

        <div className="grid lg:grid-cols-2 gap-12 mt-16 items-center">
          {/* Left: Text + features */}
          <div className="space-y-8">
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="font-body text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat mockup */}
          <div className="relative">
            {/* Glow behind */}
            <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full" />

            <div className="relative rounded-2xl bg-dark-800/80 border border-dark-700/50 overflow-hidden backdrop-blur-sm">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-dark-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-white">21Go Assistente</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-400">Online agora</span>
                  </div>
                </div>
                <Badge variant="blue" className="ml-auto">IA</Badge>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 min-h-[300px]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        msg.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          msg.role === 'user'
                            ? 'bg-orange-500/20'
                            : 'bg-blue-500/20'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-3 h-3 text-orange-400" />
                        ) : (
                          <Bot className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-orange-500/10 border border-orange-500/20'
                            : 'bg-dark-700/80 border border-dark-600/30'
                        }`}
                      >
                        <p className="font-body text-sm text-gray-200 whitespace-pre-line">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div className="px-6 py-4 border-t border-dark-700/50">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-dark-900/50 border border-dark-700/30">
                  <span className="font-body text-sm text-gray-500">
                    Digite sua mensagem...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
