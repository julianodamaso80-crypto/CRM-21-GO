import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import {
  Check,
  X,
  Users,
  HandCoins,
  ShieldCheck,
  ArrowRight,
  Building2,
  Sparkles,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Planos de Protecao Veicular | Basico, Completo e Premium | 21Go',
  description:
    'Conhega os planos de protecao veicular da 21Go. A partir de R$89/mes, sem analise de perfil. Basico, Completo e Premium. Cotacao em 30 segundos.',
}

const mutualSteps = [
  {
    icon: Users,
    title: 'Todos Contribuem',
    description: 'Associados pagam uma mensalidade que forma um fundo comum de protecao.',
  },
  {
    icon: HandCoins,
    title: 'Fundo Coletivo',
    description: 'O fundo e administrado com transparencia para cobrir sinistros dos associados.',
  },
  {
    icon: ShieldCheck,
    title: 'Todos Protegidos',
    description: 'Quando alguem sofre um sinistro, o fundo cobre. Quanto mais associados, menor o rateio.',
  },
]

interface FeatureRow {
  feature: string
  basico: boolean | string
  completo: boolean | string
  premium: boolean | string
}

const comparisonFeatures: FeatureRow[] = [
  { feature: 'Roubo/Furto', basico: true, completo: true, premium: true },
  { feature: 'Assistencia 24h', basico: true, completo: true, premium: true },
  { feature: 'Guincho 200km', basico: true, completo: true, premium: true },
  { feature: 'Colisao', basico: false, completo: true, premium: true },
  { feature: 'Incendio', basico: false, completo: true, premium: true },
  { feature: 'Carro Reserva', basico: false, completo: '7 dias', premium: '15 dias' },
  { feature: 'Terceiros', basico: false, completo: false, premium: 'R$100K' },
  { feature: 'Vidros', basico: false, completo: false, premium: true },
  { feature: 'Rastreamento', basico: false, completo: false, premium: true },
  { feature: 'Preco a partir de', basico: 'R$89/mes', completo: 'R$149/mes', premium: 'R$219/mes' },
]

interface ComparisonRow {
  item: string
  seguro: string
  go21: string
}

const vsSeguro: ComparisonRow[] = [
  { item: 'Analise de perfil', seguro: 'Obrigatoria', go21: 'Nao exigida' },
  { item: 'Restricao de idade', seguro: 'Sim', go21: 'Nao' },
  { item: 'Restricao de regiao', seguro: 'Sim (RJ penalizado)', go21: 'Nao' },
  { item: 'Preco medio mensal', seguro: 'R$350 — R$800', go21: 'R$89 — R$219' },
  { item: 'Burocracia', seguro: 'Alta', go21: 'Minima' },
  { item: 'Tempo de contratacao', seguro: '7 a 15 dias', go21: '48 horas' },
  { item: 'Guincho', seguro: '100km (media)', go21: '200km' },
  { item: 'Cancelamento', seguro: 'Multa proporcional', go21: 'Sem multa' },
]

const planFAQ = [
  {
    question: 'Qual a diferenca entre os planos Basico, Completo e Premium?',
    answer:
      'O Basico cobre roubo/furto e assistencia 24h. O Completo adiciona colisao, incendio e carro reserva por 7 dias. O Premium inclui tudo do Completo mais cobertura de terceiros ate R$100K, vidros, rastreamento e carro reserva estendido por 15 dias.',
  },
  {
    question: 'Como e calculada a mensalidade?',
    answer:
      'A mensalidade e calculada com base no valor FIPE do seu veiculo multiplicado pela taxa do plano escolhido (Basico 1.8%, Completo 2.8%, Premium 3.8%), mais uma taxa administrativa fixa de R$35.',
  },
  {
    question: 'Posso trocar de plano depois?',
    answer:
      'Sim! Voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudanca entra em vigor no proximo ciclo de cobranca.',
  },
  {
    question: 'O que e a tabela FIPE e por que ela importa?',
    answer:
      'A tabela FIPE (Fundacao Instituto de Pesquisas Economicas) e a referencia de precos de veiculos no Brasil. Usamos ela para calcular sua mensalidade e para definir o valor de indenizacao em caso de sinistro de perda total.',
  },
  {
    question: 'Existe carencia?',
    answer:
      'Sim, ha uma carencia de 90 dias para sinistros de roubo/furto e colisao apos a ativacao. A assistencia 24h (guincho) esta disponivel imediatamente.',
  },
]

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="font-body text-sm text-white font-medium">{value}</span>
  }
  return value ? (
    <Check className="w-5 h-5 text-green-400 mx-auto" />
  ) : (
    <X className="w-5 h-5 text-gray-600 mx-auto" />
  )
}

export default function ProtecaoVeicularPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Badge variant="blue" className="mb-6">Planos de Protecao</Badge>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Planos de Protecao Veicular 21Go
          </h1>
          <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto">
            Protecao completa para seu veiculo a partir de R$89/mes. Sem analise de perfil, sem burocracia. Escolha o plano ideal e faca sua cotacao agora.
          </p>
        </div>
      </section>

      {/* How Mutualismo Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Mutualismo"
            title="Como funciona a protecao veicular"
            subtitle="Diferente do seguro, a protecao veicular funciona pelo principio do mutualismo — todos cuidam de todos."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {mutualSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <Card hover className="p-8 text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-dark-800 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-xs font-display font-bold text-blue-300">{i + 1}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-gray-400">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Plan Comparison Table */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            badge="Comparativo"
            title="Compare os planos"
            subtitle="Veja lado a lado o que cada plano oferece."
          />

          <div className="mt-16 rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left font-display text-sm font-semibold text-gray-300 px-6 py-4">
                      Cobertura
                    </th>
                    <th className="text-center font-display text-sm font-semibold text-gray-300 px-6 py-4">
                      Basico
                    </th>
                    <th className="text-center font-display text-sm font-semibold text-orange-400 px-6 py-4 bg-orange-500/5">
                      Completo
                    </th>
                    <th className="text-center font-display text-sm font-semibold text-gray-300 px-6 py-4">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-t border-dark-700/30 ${i % 2 === 0 ? '' : 'bg-dark-800/20'}`}
                    >
                      <td className="font-body text-sm text-gray-300 px-6 py-3">{row.feature}</td>
                      <td className="text-center px-6 py-3">
                        <FeatureCell value={row.basico} />
                      </td>
                      <td className="text-center px-6 py-3 bg-orange-500/5">
                        <FeatureCell value={row.completo} />
                      </td>
                      <td className="text-center px-6 py-3">
                        <FeatureCell value={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button variant="cta" size="lg" href="/cotacao">
              Fazer Cotacao Agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Seguro vs 21Go */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            badge="Comparacao"
            title="Seguro Tradicional vs 21Go"
            subtitle="Veja por que cada vez mais motoristas estao escolhendo a protecao veicular."
          />

          <div className="mt-16 rounded-2xl border border-dark-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left font-display text-sm font-semibold text-gray-300 px-6 py-4">
                      Item
                    </th>
                    <th className="text-center font-display text-sm font-semibold text-gray-400 px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Seguro
                      </div>
                    </th>
                    <th className="text-center font-display text-sm font-semibold text-blue-400 px-6 py-4 bg-blue-500/5">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        21Go
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vsSeguro.map((row, i) => (
                    <tr
                      key={row.item}
                      className={`border-t border-dark-700/30 ${i % 2 === 0 ? '' : 'bg-dark-800/20'}`}
                    >
                      <td className="font-body text-sm text-gray-300 px-6 py-3">{row.item}</td>
                      <td className="font-body text-sm text-gray-500 text-center px-6 py-3">{row.seguro}</td>
                      <td className="font-body text-sm text-green-400 text-center px-6 py-3 bg-blue-500/5 font-medium">
                        {row.go21}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Plan-specific FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <SectionHeading
            badge="Duvidas"
            title="Duvidas sobre os planos"
          />

          <div className="mt-16">
            <Accordion items={planFAQ} />
          </div>

          <div className="text-center mt-10">
            <Button variant="ghost" href="/faq">
              Ver todas as perguntas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
