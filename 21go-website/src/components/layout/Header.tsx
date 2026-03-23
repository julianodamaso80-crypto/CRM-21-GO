'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/ShimmerButton'

const navLinks = [
  { label: 'Protecao', href: '/protecao-veicular' },
  { label: 'Cotacao', href: '/cotacao' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Indique', href: '/indique' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo21go.png" alt="21Go" width={36} height={36} className="rounded-lg" />
          <span className="font-display text-xl font-extrabold tracking-tight text-[#C9A84C]">21GO</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#8888A0] hover:text-[#F0F0F5] transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <ShimmerButton href="/cotacao" size="sm">Fazer Cotacao</ShimmerButton>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-[#8888A0] hover:text-[#F0F0F5]">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="lg:hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-[#8888A0] hover:text-[#F0F0F5] py-2"
              >
                {link.label}
              </Link>
            ))}
            <ShimmerButton href="/cotacao" className="mt-2 w-full text-center">Fazer Cotacao</ShimmerButton>
          </div>
        </div>
      )}
    </header>
  )
}
