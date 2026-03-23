import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { SchemaOrg } from '@/components/seo/SchemaOrg'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Protecao Veicular RJ | 21Go - Desde 200X Protegendo Seu Carro',
    template: '%s | 21Go Protecao Veicular',
  },
  description: 'Protecao veicular no Rio de Janeiro a partir de R$89/mes. Sem analise de perfil. Cotacao em 30 segundos. 20+ anos de mercado.',
  metadataBase: new URL('https://21go.site'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: '21Go Protecao Veicular',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://21go.site' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${outfit.variable}`}>
      <body>
        <SchemaOrg />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
