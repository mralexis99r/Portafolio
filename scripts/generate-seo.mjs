import { mkdir, writeFile } from 'node:fs/promises';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const configuredUrl = process.env.SITE_URL || (productionHost ? `https://${productionHost}` : 'http://localhost:5173');
const siteUrl = configuredUrl.replace(/\/$/, '');

await mkdir('public', { recursive: true });
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /private-insights\nDisallow: /api/\nSitemap: ${siteUrl}/sitemap.xml\n`, 'utf8');
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`, 'utf8');
