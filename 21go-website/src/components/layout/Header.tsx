'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
  { label: 'Protecao Veicular', href: '/#protecao' },
  { label: 'Cotacao', href: '/#cotacao' },
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Indique', href: '/#indique' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo21go.png"
              alt="21Go"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-display text-xl font-bold text-dark-50">
              21Go
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-dark-200 transition-colors hover:text-dark-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              href="/#cotacao"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-105"
            >
              Cote em 30s
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="lg:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <span className="block w-6 h-0.5 bg-dark-50 transition-transform" />
            <span className="block w-6 h-0.5 bg-dark-50 transition-opacity" />
            <span className="block w-6 h-0.5 bg-dark-50 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-dark-900 border-l border-dark-700 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
          <span className="font-display text-lg font-bold text-dark-50">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-4 py-6 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-700 hover:text-dark-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 px-4">
            <Link
              href="/#cotacao"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25"
            >
              Cote em 30s
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
