import { Metadata } from 'next'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return {
    title: `${title} | Blog 21Go`,
    description: `Leia o artigo completo sobre ${title.toLowerCase()} no blog da 21Go Protecao Veicular.`,
    openGraph: {
      type: 'article',
      title,
    },
  }
}

const relatedPosts = [
  {
    slug: 'protecao-veicular-vs-seguro',
    title: 'Protecao veicular vs seguro: qual a diferenca?',
    category: 'Guia',
  },
  {
    slug: '7-dicas-evitar-roubo-carro-rj',
    title: '7 dicas para evitar roubo de carro no RJ',
    category: 'Seguranca',
  },
  {
    slug: 'quanto-custa-protecao-veicular',
    title: 'Quanto custa a protecao veicular em 2026?',
    category: 'Economia',
  },
]

export async function generateStaticParams() {
  return [
    { slug: 'protecao-veicular-vs-seguro' },
    { slug: '7-dicas-evitar-roubo-carro-rj' },
    { slug: 'quanto-custa-protecao-veicular' },
  ]
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <>
      {/* Article header */}
      <section className="pt-32 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-4xl mx-auto px-6">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-gray-400 hover:text-blue-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </a>

          <Badge variant="blue" className="mb-4">Artigo</Badge>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-body text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Equipe 21Go</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>15 Mar 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min de leitura</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Article content */}
            <article className="prose prose-invert max-w-none">
              {/* Hero image placeholder */}
              <div className="rounded-2xl bg-gradient-to-br from-dark-700 to-dark-800 h-64 md:h-80 flex items-center justify-center border border-dark-700/50 mb-10">
                <span className="font-display text-5xl font-bold text-dark-600/30">21Go</span>
              </div>

              {/* Placeholder article content */}
              <div className="space-y-6">
                <p className="font-body text-base text-gray-300 leading-relaxed">
                  Este artigo esta em construcao. Em breve voce podera ler o conteudo completo sobre{' '}
                  <strong className="text-white">{title.toLowerCase()}</strong>.
                </p>

                <p className="font-body text-base text-gray-300 leading-relaxed">
                  A 21Go e uma associacao de protecao veicular com mais de 20 anos no Rio de Janeiro.
                  Nosso blog traz conteudo relevante para ajudar voce a tomar decisoes mais inteligentes
                  sobre a protecao do seu veiculo.
                </p>

                <h2 className="font-display text-2xl font-bold text-white mt-10 mb-4">
                  O que voce vai aprender neste artigo
                </h2>

                <ul className="space-y-3">
                  {[
                    'Como funciona a protecao veicular no Brasil',
                    'Vantagens do mutualismo para o motorista',
                    'Comparacao de custos com seguro tradicional',
                    'Dicas praticas para proteger seu veiculo',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      <span className="font-body text-base text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="font-display text-2xl font-bold text-white mt-10 mb-4">
                  Por que isso importa
                </h2>

                <p className="font-body text-base text-gray-300 leading-relaxed">
                  Com mais de 26 mil veiculos roubados no RJ em 2025, a protecao veicular nao e luxo —
                  e necessidade. A 21Go oferece planos a partir de R$89/mes, sem analise de perfil e
                  sem burocracia. Faca sua cotacao em 30 segundos.
                </p>

                {/* Share */}
                <div className="flex items-center gap-4 pt-8 mt-8 border-t border-dark-700/50">
                  <span className="font-body text-sm text-gray-400">Compartilhar:</span>
                  <button className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700/50 flex items-center justify-center hover:border-blue-500/30 transition-colors">
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-32 h-fit">
              {/* CTA Card */}
              <Card className="p-8 border-blue-500/20">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  Proteja seu veiculo
                </h3>
                <p className="font-body text-sm text-gray-400 mb-6">
                  Cotacao gratuita em 30 segundos. A partir de R$89/mes.
                </p>
                <Button variant="cta" href="/cotacao" className="w-full justify-center">
                  Fazer Cotacao
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>

              {/* Related posts */}
              <Card className="p-6">
                <h3 className="font-display text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                  Artigos Relacionados
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((post) => (
                    <a
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <Badge variant="blue" className="mb-1">{post.category}</Badge>
                      <p className="font-body text-sm text-gray-300 group-hover:text-blue-300 transition-colors leading-snug">
                        {post.title}
                      </p>
                    </a>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* Related posts bottom */}
      <section className="py-16 border-t border-dark-700/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl font-bold text-white mb-8">
            Leia tambem
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((post) => (
              <Card key={post.slug} hover className="p-6 group">
                <Badge variant="blue" className="mb-3">{post.category}</Badge>
                <h3 className="font-display text-base font-semibold text-white group-hover:text-blue-300 transition-colors mb-3">
                  {post.title}
                </h3>
                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-body text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Ler mais
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
