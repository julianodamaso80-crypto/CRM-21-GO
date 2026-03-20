'use client'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { AlertTriangle, TrendingDown, ShieldCheck } from 'lucide-react'

export function ProblemSolution() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="O Problema"
          title="26.817 veiculos roubados no RJ em 2025"
          subtitle="O Rio de Janeiro lidera o ranking de roubos de veiculos no Brasil. Voce nao pode ficar desprotegido."
        />

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {/* Stat card */}
          <Card hover className="text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-5xl font-display font-bold text-white mb-2">
              <AnimatedCounter target={5} duration={1500} />
            </div>
            <p className="text-lg font-body text-gray-400 mb-2">por hora</p>
            <p className="text-sm font-body text-gray-500">
              Sao 5 veiculos roubados a cada hora no estado do Rio de Janeiro. Um a cada 12 minutos.
            </p>
          </Card>

          {/* Comparison card */}
          <Card hover className="text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <TrendingDown className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-4xl font-display font-bold text-white mb-2">2x</p>
            <p className="text-lg font-body text-gray-400 mb-2">mais caro</p>
            <p className="text-sm font-body text-gray-500">
              Seguro tradicional no RJ custa o dobro da media nacional. Muitos motoristas ficam sem protecao.
            </p>
          </Card>

          {/* Solution card */}
          <Card hover className="text-center p-8 border-blue-500/30">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300 mb-2">
              60%
            </p>
            <p className="text-lg font-body text-gray-400 mb-2">mais acessivel</p>
            <p className="text-sm font-body text-gray-500">
              A 21Go protege seu veiculo por ate 60% menos que o seguro tradicional. Sem analise de perfil.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
