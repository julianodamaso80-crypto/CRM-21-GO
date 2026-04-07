'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Planos', href: '/protecao-veicular' },
  { label: 'Simulação', href: '/cotacao' },
  { label: 'Indique', href: '/indique' },
  { label: 'Seja Consultor', href: '/seja-consultor' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Ouvidoria', href: '/ouvidoria' },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-[#F0F4FA]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo21go.png" alt="21Go Proteção Veicular" width={36} height={36} className="rounded-lg" />
          <span className={`font-[var(--font-outfit)] text-xl font-bold tracking-tight transition-colors duration-300 ${
            scrolled ? 'text-[#1B4DA1]' : 'text-white'
          }`}>21Go</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                scrolled
                  ? 'text-[#64748B] hover:text-[#1B4DA1]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link
            href="/cotacao"
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#E07620] text-white text-sm font-semibold hover:bg-[#C46218] transition-all duration-200 shadow-sm hover:shadow-[0_4px_12px_rgba(224,118,32,0.35)] hover:-translate-y-px"
          >
            Cotar Agora
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden transition-colors duration-300 ${scrolled ? 'text-[#0A1E3D]' : 'text-white'}`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-[#F0F4FA]">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-[#64748B] hover:text-[#1B4DA1] py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cotacao"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full text-center inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#E07620] text-white font-semibold hover:bg-[#C46218] transition-colors"
            >
              Simular Agora
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
