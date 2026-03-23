import { Metadata } from 'next'
import { Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog 21Go — Conteudo sobre Protecao Veicular',
  description: 'Artigos, dicas e guias sobre protecao veicular, seguranca no transito, economia e muito mais. Blog da 21Go Protecao Veicular no RJ.',
}

const categoryColors: Record<string, string> = {
  Seguranca: 'bg-[#EF4444]/10 text-[#EF4444]',
  Dicas: 'bg-[#1B4DA1]/10 text-[#1B4DA1]',
  Guia: 'bg-[#1B4DA1]/10 text-[#1B4DA1]',
  Economia: 'bg-[#10B981]/10 text-[#10B981]',
  Tecnologia: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  Comparativo: 'bg-[#E07620]/10 text-[#E07620]',
  Geral: 'bg-[#64748B]/10 text-[#64748B]',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#0A1E3D] to-[#1B4DA1]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-[var(--font-outfit)] text-4xl md:text-5xl font-bold text-white mb-6">
            Blog 21Go
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Artigos, dicas e guias para voce tomar decisoes mais inteligentes sobre seu veiculo.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-[#F0F4FA] to-[#E2E8F0] flex items-center justify-center">
                  <span className="font-[var(--font-outfit)] text-3xl font-bold text-[#1B4DA1]/20">21Go</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || categoryColors.Geral}`}>
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-[#64748B]">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <h2 className="font-[var(--font-outfit)] text-base font-semibold text-[#0A1E3D] mb-2 leading-tight group-hover:text-[#1B4DA1] transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-sm text-[#64748B] leading-relaxed mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1B4DA1]">
                    Ler mais <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
