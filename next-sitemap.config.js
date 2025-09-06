/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://alexhaynes.org',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    additionalSitemaps: [
      'https://alexhaynes.org/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path === '/blog') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path.startsWith('/blog/')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }

    // Default transform
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  },
}