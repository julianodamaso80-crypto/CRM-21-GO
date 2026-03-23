import { Metadata } from 'next'
import { Calendar, User, Clock, ArrowLeft, ArrowRight, ShieldCheck, Share2 } from 'lucide-react'
import Link from 'next/link'
import { getPostBySlug, getPostSlugs, getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post nao encontrado' }
  return {
    title: `${post.title} | Blog 21Go`,
    description: post.description,
    openGraph: { type: 'article', title: post.title },
  }
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <>
      {/* Article header */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-[#0A1E3D] to-[#1B4DA1]">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>

          <span className="inline-block bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {post.category}
          </span>

          <h1 className="font-[var(--font-outfit)] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min de leitura</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Sidebar */}
      <section className="py-16 bg-[#FAFBFC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Article content — render markdown as HTML */}
            <article
              className="prose prose-lg max-w-none
                prose-headings:font-[var(--font-outfit)] prose-headings:text-[#0A1E3D]
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-[#334155] prose-p:leading-relaxed
                prose-li:text-[#334155]
                prose-strong:text-[#0A1E3D]
                prose-a:text-[#1B4DA1] prose-a:no-underline hover:prose-a:underline
                prose-table:border-collapse prose-th:bg-[#F0F4FA] prose-th:p-3 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:text-[#0A1E3D] prose-th:border prose-th:border-[#E2E8F0]
                prose-td:p-3 prose-td:text-sm prose-td:border prose-td:border-[#E2E8F0]
              "
              dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
            />

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-32 h-fit">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
                <div className="w-12 h-12 rounded-xl bg-[#1B4DA1]/5 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-[#1B4DA1]" />
                </div>
                <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-[#0A1E3D] mb-2">
                  Proteja seu veiculo
                </h3>
                <p className="text-sm text-[#64748B] mb-6">
                  Cotacao gratuita em 30 segundos. Sem compromisso.
                </p>
                <Link
                  href="/cotacao"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E07620] text-white font-semibold text-sm hover:bg-[#C46218] transition-colors"
                >
                  Fazer Cotacao <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <h3 className="font-[var(--font-outfit)] text-sm font-semibold text-[#64748B] mb-4 uppercase tracking-wider">
                    Artigos Relacionados
                  </h3>
                  <div className="space-y-4">
                    {related.map((r) => (
                      <Link key={r.slug} href={`/blog/${r.slug}`} className="block group">
                        <span className="text-xs font-semibold text-[#1B4DA1] bg-[#1B4DA1]/5 px-2 py-0.5 rounded-full">
                          {r.category}
                        </span>
                        <p className="mt-1 text-sm text-[#0A1E3D] group-hover:text-[#1B4DA1] transition-colors leading-snug">
                          {r.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

// Simple markdown to HTML converter for MDX content
function markdownToHtml(md: string): string {
  let html = md
    // Tables
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_, header, body) => {
      const ths = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map((row: string) => {
        const tds = row.split('|').filter(Boolean).map((d: string) => `<td>${d.trim()}</td>`).join('')
        return `<tr>${tds}</tr>`
      }).join('')
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines that aren't already HTML)
    .replace(/^(?!<[hultao]|$)(.+)$/gm, '<p>$1</p>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')

  return html
}
