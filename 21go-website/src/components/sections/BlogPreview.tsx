'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Calendar } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const posts = [
  {
    category: 'Seguranca',
    title: 'Protecao veicular vs seguro: qual a diferenca?',
    excerpt:
      'Entenda de uma vez por todas como funciona a protecao veicular por mutualismo e por que ela pode ser mais vantajosa que o seguro tradicional.',
    date: '15 Mar 2026',
    slug: 'protecao-veicular-vs-seguro',
    gradient: 'from-[#C9A84C]/20 to-[#141420]',
  },
  {
    category: 'Dicas',
    title: '7 dicas para evitar roubo de carro no Rio de Janeiro',
    excerpt:
      'O RJ e o estado com mais roubos de veiculos do Brasil. Veja como reduzir as chances de ser vitima.',
    date: '12 Mar 2026',
    slug: '7-dicas-evitar-roubo-carro-rj',
    gradient: 'from-blue-500/20 to-[#141420]',
  },
  {
    category: 'Guia',
    title: 'Como funciona o sinistro na protecao veicular?',
    excerpt:
      'Passo a passo completo: da abertura do sinistro ao recebimento da indenizacao. Sem letra miuda.',
    date: '8 Mar 2026',
    slug: 'como-funciona-sinistro-protecao-veicular',
    gradient: 'from-purple-500/20 to-[#141420]',
  },
]

export function BlogPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-[#C9A84C]">
            BLOG
          </span>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-[#F0F0F5] md:text-5xl">
            Conteudo que protege
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#8888A0]">
            Artigos, dicas e guias para voce tomar decisoes mais inteligentes sobre seu veiculo.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid gap-6 md:grid-cols-3"
        >
          {posts.map((post) => (
            <motion.div key={post.slug} variants={fadeInUp}>
              <SpotlightCard className="group h-full overflow-hidden !p-0">
                {/* Image placeholder */}
                <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${post.gradient}`}>
                  <span className="font-display text-4xl font-bold text-white/10">21Go</span>
                </div>

                <div className="p-6">
                  {/* Meta */}
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-[#C9A84C]/10 px-2.5 py-0.5 text-xs font-semibold text-[#C9A84C]">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-[#555570]">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{post.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-base font-semibold leading-tight text-[#F0F0F5] transition-colors group-hover:text-[#C9A84C]">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#8888A0]">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <a
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#C9A84C] transition-colors hover:text-[#E0C060]"
                  >
                    Ler mais
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
