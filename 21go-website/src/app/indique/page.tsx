import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Share2,
  ShieldCheck,
  Gift,
  Rocket,
  MessageCircle,
  Crown,
  Star,
  Medal,
  Award,
  Percent,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Indique Amigos e Ganhe ate 100% de Desconto | 21Go',
  description:
    'Indique amigos para a 21Go e ganhe 10% de desconto por indicacao. Acumula! 10 amigos = protecao GRATIS.',
}

const steps = [
  {
    icon: Share2,
    title: 'Compartilhe',
    description: 'Envie seu link exclusivo para amigos e familiares.',
  },
  {
    icon: ShieldCheck,
    title: 'Amigo Fecha',
    description: 'Quando seu amigo ativa a protecao, voce ganha o desconto.',
  },
  {
    icon: Gift,
    title: 'Ganhe Desconto',
    description: '10% de desconto por indicacao. Acumula ate 100%.',
  },
]

const tiers = [
  {
    icon: Medal,
    name: 'Bronze',
    range: '1-2 indicacoes',
    discount: '10-20%',
    color: 'text-amber-600',
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/20',
  },
  {
    icon: Star,
    name: 'Prata',
    range: '3-5 indicacoes',
    discount: '30-50%',
    color: 'text-gray-300',
    bg: 'bg-gray-300/10',
    border: 'border-gray-300/20',
  },
  {
    icon: Award,
    name: 'Ouro',
    range: '6-9 indicacoes',
    discount: '60-90%',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  {
    icon: Crown,
    name: 'Diamante',
    range: '10+ indicacoes',
    discount: '100%',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
]

const discountRows = [
  { friends: 1, discount: '10%', monthly: 'R$134' },
  { friends: 2, discount: '20%', monthly: 'R$119' },
  { friends: 3, discount: '30%', monthly: 'R$104' },
  { friends: 5, discount: '50%', monthly: 'R$74' },
  { friends: 7, discount: '70%', monthly: 'R$44' },
  { friends: 10, discount: '100%', monthly: 'GRATIS' },
]

export default function IndiquePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/10 via-dark-950 to-dark-950" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Rocket className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-body text-orange-300">Member Get Member</span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Indique Amigos e Ganhe ate{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
              100% de Desconto
            </span>
          </h1>

          <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            A cada amigo que fechar a protecao, voce ganha 10% de desconto na sua mensalidade.
            Acumula. 10 amigos = protecao{' '}
            <span className="text-orange-400 font-semibold">GRATIS</span>.
          </p>

          <Button
            variant="cta"
            size="lg"
            href="https://wa.me/5521999999999?text=Oi%2C%20quero%20participar%20do%20programa%20de%20indica%C3%A7%C3%A3o!"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Quero Meu Link de Indicacao
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Simples"
            title="Como funciona"
            subtitle="Tres passos para comecar a economizar."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {steps.map((step, i) => (
              <Card key={step.title} hover className="p-8 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-xs font-display font-bold text-orange-300">{i + 1}</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="font-body text-sm text-gray-400">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tier badges */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Niveis"
            title="Quanto mais indica, mais ganha"
            subtitle="Suba de nivel e veja seu desconto crescer."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {tiers.map((tier) => (
              <Card key={tier.name} hover className={`p-6 text-center border ${tier.border}`}>
                <div className={`w-14 h-14 rounded-2xl ${tier.bg} border ${tier.border} flex items-center justify-center mx-auto mb-4`}>
                  <tier.icon className={`w-7 h-7 ${tier.color}`} />
                </div>
                <h3 className={`font-display text-lg font-bold ${tier.color} mb-1`}>{tier.name}</h3>
                <p className="font-body text-xs text-gray-400 mb-3">{tier.range}</p>
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${tier.bg} border ${tier.border}`}>
                  <Percent className={`w-3 h-3 ${tier.color}`} />
                  <span className={`font-display text-sm font-bold ${tier.color}`}>{tier.discount}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discount calculator table */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6">
          <SectionHeading
            badge="Simulacao"
            title="Veja quanto voce economiza"
            subtitle="Exemplo com plano Completo (R$149/mes)"
          />

          <div className="mt-16 rounded-2xl border border-dark-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-800/80">
                  <th className="text-left font-display text-sm font-semibold text-gray-300 px-6 py-4">
                    Amigos
                  </th>
                  <th className="text-center font-display text-sm font-semibold text-gray-300 px-6 py-4">
                    Desconto
                  </th>
                  <th className="text-right font-display text-sm font-semibold text-gray-300 px-6 py-4">
                    Voce Paga
                  </th>
                </tr>
              </thead>
              <tbody>
                {discountRows.map((row, i) => (
                  <tr
                    key={row.friends}
                    className={`border-t border-dark-700/30 ${
                      row.monthly === 'GRATIS' ? 'bg-orange-500/5' : i % 2 === 0 ? '' : 'bg-dark-800/20'
                    }`}
                  >
                    <td className="font-body text-sm text-gray-300 px-6 py-3">
                      {row.friends} {row.friends === 1 ? 'amigo' : 'amigos'}
                    </td>
                    <td className="font-body text-sm text-orange-400 text-center px-6 py-3 font-medium">
                      {row.discount}
                    </td>
                    <td className={`font-display text-sm text-right px-6 py-3 font-bold ${
                      row.monthly === 'GRATIS' ? 'text-green-400 text-base' : 'text-white'
                    }`}>
                      {row.monthly}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para indicar?
          </h2>
          <p className="font-body text-lg text-gray-400 mb-8">
            Entre em contato pelo WhatsApp e solicite seu link exclusivo de indicacao.
          </p>
          <Button
            variant="cta"
            size="lg"
            href="https://wa.me/5521999999999?text=Oi%2C%20quero%20meu%20link%20de%20indica%C3%A7%C3%A3o!"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Quero Meu Link
          </Button>
        </div>
      </section>
    </>
  )
}
