import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Calendar } from 'lucide-react'

const posts = [
  {
    category: 'Seguranca',
    title: 'Protecao veicular vs seguro: qual a diferenca?',
    excerpt:
      'Entenda de uma vez por todas como funciona a protecao veicular por mutualismo e por que ela pode ser mais vantajosa que o seguro tradicional.',
    date: '15 Mar 2026',
    slug: 'protecao-veicular-vs-seguro',
  },
  {
    category: 'Dicas',
    title: '7 dicas para evitar roubo de carro no Rio de Janeiro',
    excerpt:
      'O RJ e o estado com mais roubos de veiculos do Brasil. Veja como reduzir as chances de ser vitima.',
    date: '12 Mar 2026',
    slug: '7-dicas-evitar-roubo-carro-rj',
  },
  {
    category: 'Guia',
    title: 'Como funciona o sinistro na protecao veicular?',
    excerpt:
      'Passo a passo completo: da abertura do sinistro ao recebimento da indenizacao. Sem letra miuda.',
    date: '8 Mar 2026',
    slug: 'como-funciona-sinistro-protecao-veicular',
  },
]

export function BlogPreview() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          badge="Blog"
          title="Conteudo que protege"
          subtitle="Artigos, dicas e guias para voce tomar decisoes mais inteligentes sobre seu veiculo."
        />

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {posts.map((post) => (
            <Card key={post.slug} hover className="overflow-hidden group">
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center border-b border-dark-700/50">
                <span className="font-display text-4xl font-bold text-dark-600/50">21Go</span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="blue">{post.category}</Badge>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-body">{post.date}</span>
                  </div>
                </div>

                <h3 className="font-display text-base font-semibold text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors">
                  {post.title}
                </h3>

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

        <div className="text-center mt-12">
          <Button variant="secondary" href="/blog">
            Ver todos os artigos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
