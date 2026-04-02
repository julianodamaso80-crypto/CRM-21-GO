'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  TrendingUp,
  Trophy,
  DollarSign,
  Users,
  Repeat,
  Target,
  Rocket,
  MessageCircle,
  Check,
  ArrowRight,
  Star,
  Zap,
  ShieldCheck,
  Clock,
} from 'lucide-react'

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }

const benefits = [
  {
    icon: DollarSign,
    title: 'Comissão na Adesão',
    description: 'Ganhe uma comissão por cada novo associado que você trouxer para a 21Go.',
  },
  {
    icon: Repeat,
    title: 'Renda Recorrente',
    description: 'Receba mensalmente enquanto seus indicados permanecerem ativos. Renda que cresce.',
  },
  {
    icon: Trophy,
    title: 'Prêmios por Meta',
    description: 'Bata metas e ganhe bônus extras, viagens e prêmios exclusivos.',
  },
  {
    icon: Zap,
    title: 'Treinamento Completo',
    description: 'Capacitação gratuita sobre proteção veicular, técnicas de venda e nossos produtos.',
  },
  {
    icon: ShieldCheck,
    title: 'Produto que Vende',
    description: 'Proteção veicular é necessidade real. Sem análise de perfil, sem burocracia. Fácil de vender.',
  },
  {
    icon: Clock,
    title: 'Flexibilidade Total',
    description: 'Trabalhe no seu horário, de qualquer lugar. Sem chefe, sem escritório, sem limite de ganho.',
  },
]

const howItWorks = [
  { step: '01', title: 'Cadastre-se', description: 'Preencha seus dados e entre para o time de consultores 21Go.' },
  { step: '02', title: 'Treine', description: 'Receba treinamento completo sobre nossos planos e como vender.' },
  { step: '03', title: 'Venda', description: 'Use nosso sistema e materiais prontos para atrair clientes.' },
  { step: '04', title: 'Ganhe', description: 'Comissão na adesão + recorrente mensal + prêmios por meta.' },
]


const testimonials = [
  { name: 'Rodrigo M.', role: 'Consultor há 8 meses', text: 'Comecei nas horas vagas e hoje é minha principal renda. O recorrente faz toda a diferença.' },
  { name: 'Carla S.', role: 'Consultora há 1 ano', text: 'O produto vende sozinho. Sem análise de perfil, preço justo — os clientes agradecem.' },
  { name: 'Thiago R.', role: 'Consultor há 6 meses', text: 'Bati a meta do primeiro trimestre e ganhei um bônus incrível. O suporte é sensacional.' },
]

export default function SejaConsultorPage() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#0A1E3D] via-[#0D2653] to-[#1B4DA1] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#E07620]/15 blur-[120px]" />
          <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-[#1B4DA1]/30 blur-[150px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#C9A84C]/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-[0.04]" />
        </div>

        <motion.div
          ref={ref}
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-5 py-2.5 text-sm font-semibold text-[#C9A84C] mb-6">
              <Briefcase className="w-4 h-4" />
              Oportunidade
            </span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Seja Consultor{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07620] to-[#F08C28]">
              21Go
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto mb-4">
            Venda nossos planos de proteção veicular e construa uma renda sólida. Comissão na adesão, recorrente mensal e prêmios por meta batida.
          </motion.p>

          <motion.p variants={fadeInUp} className="text-base text-[#C9A84C] font-semibold mb-10">
            Sem limite de ganho. Quanto mais vender, mais ganha.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/5521965700021?text=Ol%C3%A1!%20Quero%20ser%20consultor%2021Go."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#E07620] to-[#F08C28] text-white font-bold rounded-full shadow-lg shadow-[#E07620]/20 hover:shadow-xl hover:shadow-[#E07620]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Quero Ser Consultor
            </a>
            <a href="#como-funciona" className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-all">
              Saiba mais <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Numbers bar */}
      <section className="py-8 bg-white border-b border-[#E8ECF4]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '200+', label: 'Consultores ativos' },
              { value: 'R$ 3K+', label: 'Ganho médio mensal' },
              { value: '20+', label: 'Anos de mercado' },
              { value: '100%', label: 'Suporte ao consultor' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-[var(--font-display)] text-2xl md:text-3xl font-bold text-[#0A1E3D]">{stat.value}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[#F7F8FC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#E07620] bg-[#E07620]/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">Vantagens</span>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#0A1E3D] mb-3">Por que ser consultor 21Go?</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Um modelo de negócio que remunera bem, cresce com você e tem produto que o cliente precisa.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border border-[#E8ECF4] p-7 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#1B4DA1]/5 flex items-center justify-center mb-5">
                  <b.icon className="w-6 h-6 text-[#1B4DA1]" />
                </div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold text-[#0A1E3D] mb-2">{b.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#E07620] bg-[#E07620]/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">Processo</span>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#0A1E3D] mb-3">Como funciona</h2>
            <p className="text-[#64748B]">Do cadastro à primeira comissão em 4 passos.</p>
          </div>

          <div className="space-y-6">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="flex items-start gap-5 bg-[#F7F8FC] rounded-2xl border border-[#E8ECF4] p-6 hover:bg-white hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B4DA1] to-[#3D72DE] text-white font-[var(--font-display)] text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-lg font-semibold text-[#0A1E3D] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#64748B]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* spacer between sections */}

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#E07620] bg-[#E07620]/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">Depoimentos</span>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#0A1E3D]">Quem já é consultor</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#F7F8FC] rounded-2xl border border-[#E8ECF4] p-7">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                  ))}
                </div>
                <p className="text-sm text-[#475569] leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#0A1E3D] text-sm">{t.name}</p>
                  <p className="text-xs text-[#94A3B8]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 bg-[#F7F8FC]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-[#E07620] bg-[#E07620]/10 px-3 py-1 rounded-full uppercase tracking-wider mb-4">Suporte</span>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#0A1E3D]">O que você recebe</h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8ECF4] p-8 space-y-4">
            {[
              'Treinamento completo em proteção veicular e vendas',
              'Material de divulgação pronto (artes, textos, vídeos)',
              'Acesso ao sistema de simulação e acompanhamento de associados',
              'Suporte dedicado via WhatsApp com nosso time comercial',
              'Comissão por adesão + recorrente mensal por cliente ativo',
              'Bônus e prêmios exclusivos por metas batidas',
              'Sem investimento inicial — comece a vender hoje',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#10B981]" />
                </div>
                <span className="text-[15px] text-[#475569]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-[#0A1E3D] to-[#1B4DA1] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#E07620]/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para ganhar dinheiro com a 21Go?
          </h2>
          <p className="text-lg text-white/50 mb-10">
            Entre em contato agora e comece a construir sua renda como consultor de proteção veicular.
          </p>
          <a
            href="https://wa.me/5521965700021?text=Ol%C3%A1!%20Quero%20ser%20consultor%2021Go.%20Como%20funciona%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-[#E07620] to-[#F08C28] text-white font-bold text-lg rounded-full shadow-lg shadow-[#E07620]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Quero Ser Consultor
          </a>
        </div>
      </section>
    </>
  )
}
