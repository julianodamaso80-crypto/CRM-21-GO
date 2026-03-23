import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Linkedin } from 'lucide-react'

const links = {
  Protecao: [
    { label: 'Planos', href: '/protecao-veicular' },
    { label: 'Cotacao', href: '/cotacao' },
    { label: 'Coberturas', href: '/protecao-veicular#coberturas' },
  ],
  Empresa: [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Blog', href: '/blog' },
    { label: 'Indique e Ganhe', href: '/indique' },
  ],
  Suporte: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
    { label: 'Area do Associado', href: '/area-do-associado' },
  ],
}

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="bg-[#0A1E3D]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Image src="/logo21go.png" alt="21Go" width={32} height={32} className="rounded-lg" />
              <span className="font-[var(--font-outfit)] text-lg font-bold text-white">21Go</span>
            </Link>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Protecao veicular inteligente no Rio de Janeiro. 20+ anos de mercado protegendo seu patrimonio.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-[#E07620]/10 hover:text-[#E07620] hover:border-[#E07620]/30 transition-all duration-200"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-[var(--font-outfit)] text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-[#94A3B8] hover:text-white transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#64748B]">&copy; 2026 21Go Protecao Veicular. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link href="/termos-de-uso" className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors">Termos</Link>
            <Link href="/politica-privacidade" className="text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
