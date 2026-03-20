'use client'

import { Button } from '@/components/ui/Button'
import { Shield, MessageCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" />

      {/* Decorative blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

      {/* Animated shield orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
        <Shield className="w-[500px] h-[500px] text-blue-500" strokeWidth={0.5} />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(27,77,161,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(27,77,161,0.3) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-body text-blue-300 tracking-wide">
            Associacao com 20+ anos no Rio de Janeiro
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
          5 carros sao roubados{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">
            por hora
          </span>{' '}
          no RJ.{' '}
          <br className="hidden sm:block" />
          O seu ta protegido?
        </h1>

        {/* Subtitle */}
        <p className="font-body text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Protecao veicular a partir de{' '}
          <span className="text-white font-semibold">R$89/mes</span>.
          Sem analise de perfil. Cotacao em 30 segundos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="cta" size="lg" href="/cotacao" className="text-lg px-8 py-4">
            Cote em 30 Segundos
          </Button>
          <Button
            variant="ghost"
            size="lg"
            href="https://wa.me/5521999999999?text=Oi%2C%20quero%20uma%20cota%C3%A7%C3%A3o%20de%20prote%C3%A7%C3%A3o%20veicular"
            className="text-lg px-8 py-4 border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Micro proof */}
        <p className="mt-8 text-sm text-gray-500 font-body">
          Mais de 5.000 veiculos protegidos no Rio de Janeiro
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
    </section>
  )
}
