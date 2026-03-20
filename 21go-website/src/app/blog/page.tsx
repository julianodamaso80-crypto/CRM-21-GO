import { Metadata } from 'next'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog 21Go — Conteudo que Protege',
  description:
    'Artigos, dicas e guias sobre protecao veicular, seguranca no transito, economia e muito mais. Blog da 21Go Protecao Veicular.',
}

type PostCategory = 'Seguranca' | 'Dicas' | 'Guia' | 'Economia' | 'Tecnologia'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: PostCategory
  date: string
}

const posts: BlogPost[] = [
  {
    slug: 'protecao-veicular-vs-seguro',
    title: 'Protecao veicular vs seguro: qual a diferenca?',
    excerpt: 'Entenda de uma vez por todas como funciona a protecao veicular por mutualismo e por que ela pode ser mais vantajosa que o seguro tradicional.',
    category: 'Guia',
    date: '15 Mar 2026',
  },
  {
    slug: '7-dicas-evitar-roubo-carro-rj',
    title: '7 dicas para evitar roubo de carro no Rio de Janeiro',
    excerpt: 'O RJ e o estado com mais roubos de veiculos do Brasil. Veja como reduzir as chances de ser vitima.',
    category: 'Seguranca',
    date: '12 Mar 2026',
  },
  {
    slug: 'como-funciona-sinistro-protecao-veicular',
    title: 'Como funciona o sinistro na protecao veicular?',
    excerpt: 'Passo a passo completo: da abertura do sinistro ao recebimento da indenizacao. Sem letra miuda.',
    category: 'Guia',
    date: '8 Mar 2026',
  },
  {
    slug: 'tabela-fipe-como-consultar',
    title: 'Tabela FIPE: como consultar e entender o valor do seu veiculo',
    excerpt: 'Aprenda a consultar a tabela FIPE e entenda como ela influencia o valor da sua protecao veicular.',
    category: 'Dicas',
    date: '5 Mar 2026',
  },
  {
    slug: 'carros-mais-roubados-rj-2025',
    title: 'Top 10 carros mais roubados no RJ em 2025',
    excerpt: 'Confira a lista dos veiculos com maior indice de roubo no estado e como se proteger.',
    category: 'Seguranca',
    date: '1 Mar 2026',
  },
  {
    slug: 'quanto-custa-protecao-veicular',
    title: 'Quanto custa a protecao veicular em 2026?',
    excerpt: 'Comparativo completo de precos entre seguro e protecao veicular para diferentes veiculos.',
    category: 'Economia',
    date: '25 Fev 2026',
  },
  {
    slug: 'assistencia-24h-como-funciona',
    title: 'Assistencia 24h: como funciona o guincho e socorro mecanico',
    excerpt: 'Saiba como acionar a assistencia 24h, qual o prazo de atendimento e o que esta incluso.',
    category: 'Guia',
    date: '20 Fev 2026',
  },
  {
    slug: 'carro-reserva-protecao-veicular',
    title: 'Carro reserva na protecao veicular: quando e como usar',
    excerpt: 'Entenda em quais situacoes voce tem direito ao carro reserva e como solicitar.',
    category: 'Dicas',
    date: '15 Fev 2026',
  },
  {
    slug: 'rastreamento-veicular-vale-a-pena',
    title: 'Rastreamento veicular: vale a pena investir?',
    excerpt: 'Analise completa sobre os beneficios do rastreamento e como ele ajuda na recuperacao do veiculo.',
    category: 'Tecnologia',
    date: '10 Fev 2026',
  },
  {
    slug: 'como-economizar-protecao-veicular',
    title: '5 formas de economizar na protecao veicular',
    excerpt: 'Dicas praticas para pagar menos na sua mensalidade sem perder cobertura.',
    category: 'Economia',
    date: '5 Fev 2026',
  },
]

const categoryColors: Record<PostCategory, 'blue' | 'orange' | 'success'> = {
  Seguranca: 'orange',
  Dicas: 'blue',
  Guia: 'blue',
  Economia: 'success',
  Tecnologia: 'blue',
}

const allCategories: PostCategory[] = ['Seguranca', 'Dicas', 'Guia', 'Economia', 'Tecnologia']

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-dark-950" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Blog 21Go{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
              — Conteudo que Protege
            </span>
          </h1>
          <p className="font-body text-lg text-gray-400 max-w-2xl mx-auto">
            Artigos, dicas e guias para voce tomar decisoes mais inteligentes sobre seu veiculo.
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" className="cursor-pointer opacity-100">Todos</Badge>
            {allCategories.map((cat) => (
              <Badge key={cat} variant={categoryColors[cat]} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-8 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.slug} hover className="overflow-hidden group">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border-b border-dark-700/50">
                  <span className="font-display text-3xl font-bold text-dark-600/50">21Go</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={categoryColors[post.category]}>{post.category}</Badge>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs font-body">{post.date}</span>
                    </div>
                  </div>

                  <h2 className="font-display text-base font-semibold text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors">
                    {post.title}
                  </h2>

                  <p className="font-body text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-body text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Ler mais
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
