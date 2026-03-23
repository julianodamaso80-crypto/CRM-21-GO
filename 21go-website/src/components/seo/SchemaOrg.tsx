export function SchemaOrg() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://21go.site/#organization',
        name: '21Go Protecao Veicular',
        url: 'https://21go.site',
        logo: {
          '@type': 'ImageObject',
          url: 'https://21go.site/logo21go.png',
        },
        description: 'Associacao de protecao veicular no Rio de Janeiro com mais de 20 anos de mercado. Protecao por mutualismo contra roubo, furto, colisao e incendio.',
        foundingDate: '2004',
        sameAs: [],
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://21go.site/#localbusiness',
        name: '21Go Protecao Veicular',
        url: 'https://21go.site',
        logo: 'https://21go.site/logo21go.png',
        image: 'https://21go.site/logo21go.png',
        telephone: '+55-21-3333-2100',
        email: 'contato@21go.org',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rio de Janeiro',
          addressRegion: 'RJ',
          postalCode: '20040-020',
          addressCountry: 'BR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -22.9068,
          longitude: -43.1729,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
        priceRange: '$$',
        sameAs: [],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://21go.site/#faq',
        mainEntity: [
          { '@type': 'Question', name: 'O que e protecao veicular?', acceptedAnswer: { '@type': 'Answer', text: 'Protecao veicular e um sistema cooperativo (mutualismo) onde associados dividem os custos de sinistros. Diferente do seguro tradicional, nao ha analise de perfil e o custo e significativamente menor.' } },
          { '@type': 'Question', name: 'Qual a diferenca entre protecao veicular e seguro?', acceptedAnswer: { '@type': 'Answer', text: 'O seguro e oferecido por seguradoras com analise de perfil e precos altos. A protecao veicular funciona por mutualismo — todos contribuem para um fundo comum, o que reduz o custo em ate 60%.' } },
          { '@type': 'Question', name: 'Quanto custa a protecao veicular na 21Go?', acceptedAnswer: { '@type': 'Answer', text: 'Os planos comecam a partir de R$89/mes para o Basico. O valor exato depende do veiculo (tabela FIPE) e do plano escolhido.' } },
          { '@type': 'Question', name: 'Posso cancelar a qualquer momento?', acceptedAnswer: { '@type': 'Answer', text: 'Sim. Nao existe fidelidade nem multa por cancelamento. Voce pode cancelar quando quiser.' } },
          { '@type': 'Question', name: 'A 21Go aceita carros antigos?', acceptedAnswer: { '@type': 'Answer', text: 'Sim! A 21Go protege qualquer carro, qualquer ano, sem analise de perfil.' } },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
