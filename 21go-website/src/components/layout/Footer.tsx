import Link from 'next/link'
import Image from 'next/image'

const links = {
  protecao: [
    { label: 'Planos', href: '/protecao-veicular' },
    { label: 'Cotacao', href: '/cotacao' },
    { label: 'Rastreamento', href: '/rastreamento' },
    { label: 'Clube de Beneficios', href: '/clube-de-beneficios' },
  ],
  empresa: [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Blog', href: '/blog' },
    { label: 'Indique e Ganhe', href: '/indique' },
    { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
  ],
  suporte: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
    { label: 'Area do Associado', href: '/area-do-associado' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Image src="/logo21go.png" alt="21Go" width={32} height={32} className="rounded-lg" />
              <span className="font-display text-lg font-extrabold text-[#C9A84C]">21GO</span>
            </Link>
            <p className="text-sm text-[#555570] leading-relaxed mb-6">
              Protecao veicular inteligente no Rio de Janeiro. 20+ anos de mercado.
            </p>
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'LinkedIn'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs text-[#555570] hover:bg-[#C9A84C]/10 hover:text-[#C9A84C] hover:border-[#C9A84C]/20 transition-all cursor-pointer">
                  {s[0]}
                </div>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-[#555570] mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#555570]">2026 21Go Protecao Veicular. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link href="/termos-de-uso" className="text-xs text-[#555570] hover:text-[#8888A0]">Termos</Link>
            <Link href="/politica-privacidade" className="text-xs text-[#555570] hover:text-[#8888A0]">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
