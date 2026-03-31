import type { Metadata } from 'next'
import { Outfit, DM_Sans } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { GTMProvider } from '@/components/GTMProvider'
import { SchemaOrg } from '@/components/seo/SchemaOrg'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import MobileCTA from '@/components/MobileCTA'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Proteção Veicular RJ | 21Go — 20+ Anos Protegendo Seu Carro',
    template: '%s | 21Go Proteção Veicular',
  },
  description: 'Proteção veicular no Rio de Janeiro a partir de R$77,50/mês. 8 planos para carros, motos, SUVs e especiais. 20+ anos de mercado, sem análise de perfil. Cotação grátis.',
  metadataBase: new URL('https://21go.site'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: '21Go Proteção Veicular',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://21go.site' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable}`}>
      <body>
        <GTMProvider />
        <SchemaOrg />
        <SmoothScrollProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
          <MobileCTA />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
