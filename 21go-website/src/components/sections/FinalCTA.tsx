import { Button } from '@/components/ui/Button'
import { ShieldCheck } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-blue-950/20 to-dark-950" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-8">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>

        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Proteja seu veiculo agora
        </h2>

        <p className="font-body text-lg text-gray-400 max-w-xl mx-auto mb-10">
          Cotacao em 30 segundos. Sem burocracia. Sem analise de perfil.
          Junte-se a milhares de cariocas que ja protegem seus veiculos com a 21Go.
        </p>

        <Button variant="cta" size="lg" href="/cotacao" className="text-lg px-10 py-4">
          Fazer Cotacao Gratis
        </Button>

        <p className="mt-6 text-sm text-gray-500 font-body">
          Sem compromisso. Cancele quando quiser.
        </p>
      </div>
    </section>
  )
}
