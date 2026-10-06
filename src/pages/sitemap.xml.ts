import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const siteUrl = 'https://felegegenet.org.uk';
  const pages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/am', changefreq: 'weekly', priority: '1.0' },
    { loc: '/privacy', changefreq: 'monthly', priority: '0.3' },
    { loc: '/am/privacy', changefreq: 'monthly', priority: '0.3' },
    { loc: '/accessibility', changefreq: 'monthly', priority: '0.3' },
    { loc: '/am/accessibility', changefreq: 'monthly', priority: '0.3' },
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
