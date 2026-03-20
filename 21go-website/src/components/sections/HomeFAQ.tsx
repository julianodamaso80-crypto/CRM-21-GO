import { SectionHeading } from '@/components/ui/SectionHeading'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

const faqItems = [
  {
    question: 'O que e protecao veicular?',
    answer:
      'Protecao veicular e um sistema cooperativo (mutualismo) em que todos os associados contribuem mensalmente para um fundo comum. Quando alguem sofre um sinistro — roubo, furto, colisao ou incendio — o fundo cobre a indenizacao. Diferente do seguro tradicional, nao ha analise de perfil, e os custos sao muito menores.',
  },
  {
    question: 'Protecao veicular e legal?',
    answer:
      'Sim! A protecao veicular por cooperativas e associacoes e 100% legal no Brasil, amparada pelo artigo 5 da Constituicao Federal (liberdade de associacao) e pelo Codigo Civil. A 21Go atua ha mais de 20 anos no Rio de Janeiro com total transparencia.',
  },
  {
    question: 'Quanto custa a protecao veicular?',
    answer:
      'O valor depende do modelo e ano do seu veiculo (tabela FIPE). Nossos planos comecam a partir de R$89/mes para o Basico, R$149/mes para o Completo e R$219/mes para o Premium. Faca uma cotacao gratuita em 30 segundos para saber o valor exato para o seu veiculo.',
  },
  {
    question: 'Como funciona o sinistro?',
    answer:
      'Em caso de sinistro, voce entra em contato pelo WhatsApp ou app. Abrimos o processo imediatamente, direcionamos para a oficina credenciada e acompanhamos tudo ate a resolucao. Para roubo/furto, a indenizacao e baseada na tabela FIPE. O prazo medio de resolucao e de 15 a 30 dias.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim! Nao existe fidelidade ou multa de cancelamento. Voce pode cancelar sua protecao a qualquer momento, sem burocracia. Basta entrar em contato com nosso atendimento.',
  },
]

export function HomeFAQ() {
  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading
          badge="Duvidas"
          title="Perguntas frequentes"
          subtitle="As principais duvidas sobre protecao veicular respondidas de forma simples."
        />

        <div className="mt-16">
          <Accordion items={faqItems} />
        </div>

        <div className="text-center mt-10">
          <Button variant="ghost" href="/faq">
            Ver todas as perguntas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
