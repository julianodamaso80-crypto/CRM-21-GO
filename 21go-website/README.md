# 21Go Website — Site Publico de Protecao Veicular

Site institucional da 21Go Protecao Veicular, construido com Next.js 16, Tailwind CSS 4 e TypeScript.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Content:** MDX (blog posts)
- **SEO:** next-sitemap, Schema JSON-LD, Open Graph
- **Deploy:** Vercel ou similar

## Como rodar

```bash
# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build para producao
npm run build

# Rodar producao local
npm start
```

O site roda em http://localhost:3000

## Estrutura

```
src/
  app/              # Pages (Next.js App Router)
    page.tsx        # Home
    sobre/          # Sobre a 21Go
    protecao-veicular/ # Planos
    cotacao/        # Formulario de cotacao
    indique/        # Programa MGM
    faq/            # Perguntas frequentes
    blog/           # Blog hub + [slug]
  components/
    layout/         # Header, Footer
    ui/             # Button, Card, Badge, Accordion, etc.
    sections/       # Hero, Plans, FAQ, etc. (home sections)
    seo/            # Schema markup
  lib/              # Utilities (blog loader, etc.)
content/
  blog/             # Posts MDX
public/             # Assets estaticos
```

## SEO

- Meta title e description em cada pagina
- Schema JSON-LD: Organization, LocalBusiness, Product, FAQPage, Article, HowTo
- Sitemap.xml gerado automaticamente (next-sitemap)
- Robots.txt otimizado
- Open Graph tags
- Canonical URLs

## Brand Guide

- **Azul primario:** #1B4DA1
- **Laranja CTA:** #E07620
- **Backgrounds dark:** #060A14 -> #0B1120 -> #111827 -> #1A1F35
- **Fonts:** Outfit (display) + DM Sans (body)
