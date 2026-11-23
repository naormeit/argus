/**
 * Post-build SEO step.
 *  - replaces the fallback deployment URL with VITE_SITE_URL in every built HTML file
 *  - writes dist/robots.txt and dist/sitemap.xml using the same base URL
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '..', 'dist')

const FALLBACK = 'https://frontend-eight-theta-43.vercel.app'
const SITE_URL = (process.env.VITE_SITE_URL || FALLBACK).trim().replace(/\/+$/, '')

if (!fs.existsSync(dist)) {
  console.error('[seo] dist/ not found — run vite build first.')
  process.exit(1)
}

let rewritten = 0
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.html')) {
      const before = fs.readFileSync(full, 'utf8')
      if (!before.includes(FALLBACK)) continue
      fs.writeFileSync(full, before.split(FALLBACK).join(SITE_URL))
      rewritten += 1
    }
  }
}
walk(dist)

const today = new Date().toISOString().slice(0, 10)
const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly' },
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /dashboard
Disallow: /admin
Disallow: /audit
Disallow: /report/
Disallow: /login
Disallow: /reset-password
Disallow: /success
Disallow: /github

Sitemap: ${SITE_URL}/sitemap.xml
`

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
fs.writeFileSync(path.join(dist, 'robots.txt'), robots)

console.log(`[seo] site url: ${SITE_URL}`)
console.log(`[seo] rewrote ${rewritten} HTML file(s); wrote robots.txt and sitemap.xml`)
