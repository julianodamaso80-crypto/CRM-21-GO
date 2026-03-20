'use client'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Button } from '@/components/ui/Button'
import {
  Shield,
  Heart,
  Eye,
  Target,
  Users,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react'

const milestones = [
  { year: '2003', title: 'Fundacao', description: 'A 21Go nasce no Rio de Janeiro como associacao de protecao veicular.' },
  { year: '2008', title: '1.000 Associados', description: 'Alcancamos a marca de mil veiculos protegidos na regiao metropolitana.' },
  { year: '2015', title: 'Expansao RJ', description: 'Cobertura em todo o estado do Rio de Janeiro com rede de oficinas credenciadas.' },
  { year: '2020', title: 'Transformacao Digital', description: 'Inicio da digitalizacao com atendimento por WhatsApp e sistemas integrados.' },
  { year: '2025', title: 'IA e Tecnologia', description: 'Lancamento da plataforma com inteligencia artificial e cotacao automatica.' },
]

const stats = [
  { target: 20, suffix: '+', label: 'Anos de Mercado' },
  { target: 5000, suffix: '+', label: 'Veiculos Protegidos' },
  { target: 3500, suffix: '+', label: 'Sinistros Resolvidos' },
  { target: 98, suffix: '%', label: 'Satisfacao' },
]

const values = [
  {
    icon: Shield,
    title: 'Protecao',
    description: 'Nosso compromisso e garantir que todo associado se sinta seguro e amparado.',
  },
  {
    icon: Heart,
    title: 'Mutualismo',
    description: 'Todos contribuem, todos se beneficiam. Juntos somos mais fortes.',
  },
  {
    icon: Eye,
    title: 'Transparencia',
    description: 'Processos claros, comunicacao aberta e prestacao de contas constante.',
  },
  {
    icon: Target,
    title: 'Inovacao',
    description: 'Investimos em tecnologia para oferecer a melhor experiencia possivel.',
  },
]

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Sobre a 21Go{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
              Protecao Veicular
            </span>
          </h1>
          <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto">
            Ha mais de 20 anos protegendo veiculos no Rio de Janeiro com transparencia, tecnologia e o poder do mutualismo.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center p-8">
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2000} />
                </div>
                <p className="font-body text-sm text-gray-400">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeading
            badge="Historia"
            title="Nossa trajetoria"
            subtitle="Duas decadas de compromisso com a protecao dos cariocas."
          />

          <div className="mt-16 relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-transparent" />

            <div className="space-y-12">
              {milestones.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-8 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-dark-950 z-10" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                    <span className="font-display text-sm font-bold text-blue-400">{item.year}</span>
                    <h3 className="font-display text-lg font-semibold text-white mt-1">{item.title}</h3>
                    <p className="font-body text-sm text-gray-400 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Valores"
            title="No que acreditamos"
            subtitle="Nossos principios guiam cada decisao que tomamos."
          />

          <div className="grid md:grid-cols-2 gap-6 mt-16">
            {/* Mission */}
            <Card hover className="p-8 border-blue-500/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">Missao</h3>
              <p className="font-body text-sm text-gray-400 leading-relaxed">
                Democratizar a protecao veicular no Rio de Janeiro, oferecendo cobertura acessivel e atendimento humanizado a todos os motoristas, independente de perfil ou historico.
              </p>
            </Card>

            {/* Vision */}
            <Card hover className="p-8 border-orange-500/20">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-2">Visao</h3>
              <p className="font-body text-sm text-gray-400 leading-relaxed">
                Ser a maior e mais confiavel associacao de protecao veicular do Rio de Janeiro, referencia em tecnologia e satisfacao do associado.
              </p>
            </Card>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            {values.map((value) => (
              <Card key={value.title} hover className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-dark-700 border border-dark-600/50 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-display text-sm font-semibold text-white mb-1">{value.title}</h4>
                <p className="font-body text-xs text-gray-500">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team placeholder */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            badge="Equipe"
            title="Quem faz a 21Go acontecer"
            subtitle="Uma equipe dedicada a proteger o que importa para voce."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { name: 'Equipe Comercial', role: 'Vendas e Atendimento' },
              { name: 'Equipe Operacao', role: 'Sinistros e Vistorias' },
              { name: 'Equipe Financeiro', role: 'Cobranca e Rateio' },
              { name: 'Equipe Tech', role: 'Tecnologia e IA' },
            ].map((member) => (
              <Card key={member.name} hover className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <h4 className="font-display text-sm font-semibold text-white">{member.name}</h4>
                <p className="font-body text-xs text-gray-500 mt-1">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Faca parte da 21Go
          </h2>
          <p className="font-body text-lg text-gray-400 mb-8">
            Junte-se a milhares de cariocas que confiam na 21Go para proteger seus veiculos.
          </p>
          <Button variant="cta" size="lg" href="/cotacao">
            Fazer Cotacao Gratis
          </Button>
        </div>
      </section>
    </>
  )
}
