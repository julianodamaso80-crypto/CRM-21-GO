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
        description:
          'Associacao de protecao veicular no Rio de Janeiro com mais de 20 anos de mercado. Protecao contra roubo, furto, colisao e incendio por mutualismo.',
        sameAs: [],
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://21go.site/#localbusiness',
        name: '21Go Protecao Veicular',
        url: 'https://21go.site',
        logo: 'https://21go.site/logo21go.png',
        image: 'https://21go.site/logo21go.png',
        telephone: '+55-21-0000-0000',
        email: 'contato@21go.site',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rio de Janeiro',
          addressRegion: 'RJ',
          addressCountry: 'BR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -22.9068,
          longitude: -43.1729,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
          ],
          opens: '08:00',
          closes: '18:00',
        },
        priceRange: '$$',
        sameAs: [],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
