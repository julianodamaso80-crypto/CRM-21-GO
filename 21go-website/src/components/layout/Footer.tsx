import Image from 'next/image';
import Link from 'next/link';

const protecaoLinks = [
  { label: 'Plano Basico', href: '/#planos' },
  { label: 'Plano Completo', href: '/#planos' },
  { label: 'Plano Premium', href: '/#planos' },
  { label: 'Cotacao Online', href: '/#cotacao' },
  { label: 'Assistencia 24h', href: '/#assistencia' },
];

const institucionalLinks = [
  { label: 'Sobre a 21Go', href: '/#sobre' },
  { label: 'Como Funciona', href: '/#como-funciona' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Politica de Privacidade', href: '/privacidade' },
  { label: 'Termos de Uso', href: '/termos' },
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/21go',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/21go',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/21go',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Protecao */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-dark-50 mb-4">
              Protecao
            </h3>
            <ul className="space-y-3">
              {protecaoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-200 transition-colors hover:text-dark-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-dark-50 mb-4">
              Institucional
            </h3>
            <ul className="space-y-3">
              {institucionalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-dark-200 transition-colors hover:text-dark-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-dark-50 mb-4">
              Contato
            </h3>
            <ul className="space-y-3 text-sm text-dark-200">
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href="tel:+552100000000" className="hover:text-dark-50 transition-colors">
                  (21) 0000-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:contato@21go.site" className="hover:text-dark-50 transition-colors">
                  contato@21go.site
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Rio de Janeiro, RJ</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-dark-50 mb-4">
              Redes Sociais
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-700 text-dark-200 transition-all hover:bg-dark-600 hover:text-dark-50"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-6">
              <Image
                src="/logo21go.png"
                alt="21Go Protecao Veicular"
                width={48}
                height={48}
                className="h-12 w-auto opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-12 border-t border-dark-700 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-dark-200 mb-6">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              20+ anos de mercado
            </span>
            <span className="text-dark-500">|</span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Regulamentada
            </span>
            <span className="text-dark-500">|</span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Atendimento 24h
            </span>
            <span className="text-dark-500">|</span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6h4c0-3 2-4 2-6a4 4 0 0 0-4-4z" />
                <line x1="10" y1="16" x2="14" y2="16" />
                <line x1="10" y1="19" x2="14" y2="19" />
              </svg>
              Inteligencia Artificial
            </span>
          </div>

          <p className="text-center text-xs text-dark-300">
            &copy; 2026 21Go Protecao Veicular. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
