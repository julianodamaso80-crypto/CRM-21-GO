'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'

const posts = [
  { slug: 'protecao-veicular-vs-seguro', title: 'Protecao Veicular vs Seguro: Qual a Diferenca?', excerpt: 'Entenda as vantagens e desvantagens de cada opcao para proteger seu veiculo no Rio de Janeiro.', tag: 'Guia' },
  { slug: '7-dicas-evitar-roubo-carro-rj', title: '7 Dicas Para Evitar Roubo de Carro no RJ', excerpt: 'Medidas praticas para reduzir o risco de roubo e furto na cidade do Rio de Janeiro.', tag: 'Seguranca' },
  { slug: 'quanto-custa-protecao-veicular', title: 'Quanto Custa Protecao Veicular em 2026?', excerpt: 'Valores atualizados, comparativo com seguro e como economizar na protecao do seu carro.', tag: 'Precos' },
]

export function BlogPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="mx-auto max-w-7xl px-6"
      >
        <motion.div variants={fadeInUp} className="flex items-end justify-between mb-14">
          <div>
            <h2 className="font-[var(--font-outfit)] text-3xl md:text-4xl font-bold text-[#0A1E3D]">
              Blog 21Go
            </h2>
            <p className="mt-4 text-lg text-[#64748B]">Conteudo para voce fazer escolhas mais inteligentes</p>
          </div>
          <Link href="/blog" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#1B4DA1] hover:text-[#164087] transition-colors">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div key={post.slug} variants={fadeInUp}>
              <Link
                href={`/blog/${post.slug}`}
                className="block group bg-[#F0F4FA] rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <span className="inline-block bg-[#1B4DA1]/5 text-[#1B4DA1] text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {post.tag}
                </span>
                <h3 className="font-[var(--font-outfit)] text-lg font-semibold text-[#0A1E3D] group-hover:text-[#1B4DA1] transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-[#64748B] leading-relaxed">{post.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1B4DA1]">
            Ver todos os posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
