import { Shield, FileCheck, Clock, Bot } from 'lucide-react'

const trustItems = [
  { icon: Shield, label: '20+ Anos de Mercado' },
  { icon: FileCheck, label: 'Cadastro SUSEP' },
  { icon: Clock, label: 'Atendimento 24h' },
  { icon: Bot, label: 'IA Inteligente' },
]

export function TrustBar() {
  return (
    <section className="bg-dark-800/50 border-y border-dark-700/50 py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="font-body text-sm text-gray-300 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
