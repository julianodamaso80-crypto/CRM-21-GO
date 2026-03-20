/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://21go.site',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/area-do-associado'] },
    ],
  },
  transform: async (config, path) => {
    const priorities = {
      '/': 1.0,
      '/protecao-veicular': 0.9,
      '/cotacao': 0.9,
      '/indique': 0.8,
      '/sobre': 0.7,
      '/faq': 0.7,
      '/blog': 0.8,
    }
    return {
      loc: path,
      changefreq: path.startsWith('/blog/') ? 'monthly' : config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
