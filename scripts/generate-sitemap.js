import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://warmr.space';

const pages = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/opportunities', changefreq: 'daily', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/how-it-works', changefreq: 'monthly', priority: 0.8 },
  { url: '/help', changefreq: 'monthly', priority: 0.7 },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

writeFileSync(resolve(process.cwd(), 'public', 'sitemap.xml'), sitemap);
console.log('Sitemap generated successfully!');