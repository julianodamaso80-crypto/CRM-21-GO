import { SectionHeading } from '@/components/ui/SectionHeading'
import { Calculator, Camera, CheckCircle, ShieldCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Calculator,
    title: 'Faca sua Cotacao',
    description: 'Informe a placa ou modelo do veiculo e receba o valor em segundos.',
  },
  {
    number: '02',
    icon: Camera,
    title: 'Agende a Vistoria',
    description: 'Agendamos a vistoria no local mais conveniente para voce.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Ativacao',
    description: 'Vistoria aprovada, assinatura digital e sua protecao e ativada.',
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Protegido!',
    description: 'Seu veiculo esta coberto 24h. Atendimento e assistencia sempre disponiveis.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Simples"
          title="Do cote ao protegido em 48 horas"
          subtitle="Processo 100% digital. Sem filas, sem papelada, sem dor de cabeca."
        />

        <div className="relative mt-16">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center group">
                {/* Number circle */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-dark-800 border border-dark-700/50 group-hover:border-blue-500/30 transition-colors duration-300 mb-6">
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-xs font-display font-bold text-blue-300">
                      {step.number}
                    </span>
                  </div>
                  <step.icon className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                </div>

                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-gray-400 leading-relaxed max-w-[240px] mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
