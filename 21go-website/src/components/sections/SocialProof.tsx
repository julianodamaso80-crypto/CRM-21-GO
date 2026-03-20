import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    quote: 'Meu Civic foi roubado em Madureira. Em 15 dias ja tinha o valor da FIPE na conta. O seguro queria cobrar R$4.800/mes, na 21Go pago R$189.',
    name: 'Carlos M.',
    vehicle: 'Honda Civic 2020',
    stars: 5,
  },
  {
    quote: 'Bati o carro na Linha Amarela e achei que ia ter dor de cabeca. O guincho chegou em 40 minutos e em 2 semanas tava tudo resolvido. Super recomendo!',
    name: 'Ana P.',
    vehicle: 'Hyundai HB20 2022',
    stars: 5,
  },
  {
    quote: 'Tenho Hilux e nenhuma seguradora aceitava ou cobrava um absurdo. Na 21Go nao tem analise de perfil. Protecao completa por um preco justo.',
    name: 'Roberto S.',
    vehicle: 'Toyota Hilux 2021',
    stars: 5,
  },
]

export function SocialProof() {
  return (
    <section className="py-24 relative">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-800/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Depoimentos"
          title="O que nossos associados dizem"
          subtitle="Milhares de cariocas ja protegem seus veiculos com a 21Go."
        />

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {testimonials.map((item) => (
            <Card key={item.name} hover className="p-8 relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-blue-500/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-body text-sm text-gray-300 leading-relaxed mb-6">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-sm font-display font-bold text-blue-300">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-white">{item.name}</p>
                  <p className="font-body text-xs text-gray-500">{item.vehicle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
