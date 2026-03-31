import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | 21Go Protecao Veicular',
  description:
    'Tire todas as suas duvidas sobre protecao veicular, planos, sinistros, pagamento e cancelamento na 21Go.',
}

const categories = [
  {
    title: 'Sobre Protecao Veicular',
    items: [
      {
        question: 'O que e protecao veicular?',
        answer:
          'Protecao veicular e um sistema cooperativo (mutualismo) em que todos os associados contribuem mensalmente para um fundo comum. Quando alguem sofre um sinistro — roubo, furto, colisao ou incendio — o fundo cobre a indenizacao. Diferente do seguro tradicional, nao ha analise de perfil e os custos sao muito menores.',
      },
      {
        question: 'Protecao veicular e legal?',
        answer:
          'Sim! A protecao veicular por cooperativas e associacoes e 100% legal no Brasil, amparada pelo artigo 5 da Constituicao Federal (liberdade de associacao) e pelo Codigo Civil. A 21Go atua ha mais de 20 anos no Rio de Janeiro com total transparencia.',
      },
      {
        question: 'Qual a diferenca entre protecao veicular e seguro?',
        answer:
          'O seguro e vendido por seguradoras reguladas pela SUSEP e tem analise de perfil. A protecao veicular funciona por associacao mutua — todos contribuem para um fundo e nao ha restricoes de perfil, idade ou regiao. O resultado e um custo ate 60% menor.',
      },
    ],
  },
  {
    title: 'Planos e Precos',
    items: [
      {
        question: 'Quanto custa a protecao veicular?',
        answer:
          'O valor depende do modelo e ano do seu veiculo (tabela FIPE). Nossos planos comecam a partir de R$89/mes para o Basico, R$149/mes para o Completo e R$219/mes para o Premium. Faca uma cotacao gratuita em 30 segundos para saber o valor exato.',
      },
      {
        question: 'Qual a diferenca entre os planos Basico, Completo e Premium?',
        answer:
          'O Basico cobre roubo/furto e assistencia 24h com guincho 200km. O Completo adiciona colisao, incendio e carro reserva por 7 dias. O Premium inclui tudo do Completo mais cobertura de terceiros ate R$100K, vidros, rastreamento e carro reserva por 15 dias.',
      },
      {
        question: 'Posso trocar de plano depois?',
        answer:
          'Sim! Voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudanca entra em vigor no proximo ciclo de cobranca, sem custos adicionais.',
      },
      {
        question: 'Como e calculada a mensalidade?',
        answer:
          'A formula e: valor FIPE do veiculo x taxa do plano (Basico 1.8%, Completo 2.8%, Premium 3.8%) + taxa administrativa de R$35. Exemplo: carro de R$60.000 no plano Basico = R$60.000 x 1.8% + R$35 = R$1.115/mes.',
      },
    ],
  },
  {
    title: 'Sinistros',
    items: [
      {
        question: 'Como funciona o sinistro?',
        answer:
          'Em caso de sinistro, entre em contato pelo WhatsApp ou app. Abrimos o processo imediatamente, direcionamos para uma oficina credenciada e acompanhamos tudo ate a resolucao. Para roubo/furto com perda total, a indenizacao e baseada na tabela FIPE.',
      },
      {
        question: 'Qual o prazo de resolucao do sinistro?',
        answer:
          'Para reparos (colisao, vidros), o prazo medio e de 7 a 15 dias uteis dependendo da oficina. Para indenizacao por perda total (roubo/furto), o prazo e de 15 a 30 dias apos a entrega de toda documentacao.',
      },
      {
        question: 'Existe carencia para sinistros?',
        answer:
          'Sim. Ha uma carencia de 90 dias para sinistros de roubo/furto e colisao apos a ativacao da protecao. A assistencia 24h (guincho, pane mecanica) esta disponivel imediatamente apos a ativacao.',
      },
    ],
  },
  {
    title: 'Pagamento',
    items: [
      {
        question: 'Quais as formas de pagamento?',
        answer:
          'Aceitamos boleto bancario e PIX. O boleto e gerado automaticamente todo mes e voce tambem pode pagar via PIX com QR Code. Em breve, cartao de credito.',
      },
      {
        question: 'O que acontece se eu atrasar o pagamento?',
        answer:
          'Voce tem 15 dias de tolerancia apos o vencimento. Apos esse prazo, a protecao e suspensa e voce nao tera cobertura ate a regularizacao. Apos 60 dias, a associacao e cancelada automaticamente.',
      },
    ],
  },
  {
    title: 'Cancelamento',
    items: [
      {
        question: 'Posso cancelar quando quiser?',
        answer:
          'Sim! Nao existe fidelidade ou multa de cancelamento. Voce pode cancelar sua protecao a qualquer momento sem burocracia. Basta entrar em contato pelo WhatsApp ou e-mail.',
      },
      {
        question: 'Tem multa de cancelamento?',
        answer:
          'Nao. A 21Go nao cobra multa de cancelamento. Voce paga apenas ate o ultimo mes de utilizacao.',
      },
      {
        question: 'Posso voltar depois de cancelar?',
        answer:
          'Sim! Voce pode se reassociar a qualquer momento. Sera necessario fazer uma nova vistoria e o periodo de carencia sera reiniciado.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Perguntas Frequentes
          </h1>
          <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto">
            Tudo o que voce precisa saber sobre protecao veicular, planos, sinistros e mais.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main content */}
            <div className="space-y-16">
              {categories.map((category) => (
                <div key={category.title}>
                  <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-blue-500" />
                    {category.title}
                  </h2>
                  <Accordion items={category.items} />
                </div>
              ))}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:sticky lg:top-32 h-fit">
              <Card className="p-8 border-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>

                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  Nao encontrou sua resposta?
                </h3>

                <p className="font-body text-sm text-gray-400 mb-6">
                  Fale com nosso time pelo WhatsApp. Estamos prontos para ajudar.
                </p>

                <Button
                  variant="primary"
                  href="/cotacao"
                  className="w-full justify-center mb-4"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar no WhatsApp
                </Button>

                <div className="w-full h-px bg-dark-700/50 my-6" />

                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  Pronto para cotar?
                </h3>
                <p className="font-body text-sm text-gray-400 mb-4">
                  Descubra quanto custa proteger seu veiculo.
                </p>

                <Button variant="cta" href="/cotacao" className="w-full justify-center">
                  Fazer Cotacao
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
