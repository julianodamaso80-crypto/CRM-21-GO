import { Button } from '@/components/ui/Button'
import { Rocket, Gift } from 'lucide-react'

export function MGMBanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-dark-900" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 opacity-10">
            <Rocket className="w-32 h-32 text-orange-400" />
          </div>
          <div className="absolute bottom-8 left-8 opacity-10">
            <Gift className="w-24 h-24 text-orange-400" />
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl border border-orange-500/20" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Gift className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-body text-orange-300">
                Member Get Member
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Indique amigos e ganhe ate{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
                100% de desconto
              </span>
            </h2>

            <p className="font-body text-lg text-gray-300 max-w-xl mx-auto mb-8">
              10% de desconto por indicacao que fechar.{' '}
              <span className="text-white font-semibold">Acumula.</span>{' '}
              10 amigos = protecao <span className="text-orange-400 font-semibold">GRATIS</span>.
            </p>

            <Button variant="cta" size="lg" href="/indique" className="text-lg px-8">
              <Rocket className="w-5 h-5 mr-2" />
              Quero Indicar
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
