/**
 * Prerender the public marketing pages into static HTML after `vite build`.
 *
 * Each route is loaded in headless Chrome so react-helmet-async can write its
 * title, description, canonical, Open Graph tags and JSON-LD into the document
 * before we serialise it to dist/<route>/index.html.
 *
 * Set SKIP_PRERENDER=1 to skip (useful when no Chrome is available).
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchBrowser } from './chrome.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(here, '..', 'dist')

if (process.env.SKIP_PRERENDER === '1') {
  console.log('[prerender] SKIP_PRERENDER=1 — skipping.')
  process.exit(0)
}

const ROUTES = [
  { path: '/', expectTitle: 'Argus — Multi-Agent' },
  { path: '/pricing', expectTitle: 'Pricing — Argus' },
  { path: '/about', expectTitle: 'About — Argus' },
  { path: '/contact', expectTitle: 'Contact — Argus' },
  { path: '/privacy', expectTitle: 'Privacy Policy — Argus' },
  { path: '/terms', expectTitle: 'Terms of Service — Argus' },
  { path: '/404', expectTitle: 'Page not found — Argus', output: '404.html' },
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8',
}

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('[prerender] dist/index.html not found — run vite build first.')
  process.exit(1)
}

// Keep a pristine SPA shell; each route renders from this, never from an
// already-prerendered page (which would duplicate head tags).
const shellPath = path.join(dist, '__shell.html')
fs.copyFileSync(path.join(dist, 'index.html'), shellPath)

function fileFor(urlPath) {
  const requested = path.join(dist, decodeURIComponent(urlPath))
  if (path.extname(requested)) return requested
  return shellPath
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0]
  let file = fileFor(urlPath)
  if (!fs.existsSync(file)) file = shellPath

  const type = MIME[path.extname(file)] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  fs.createReadStream(file).pipe(res)
})

const port = await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => resolve(server.address().port))
})

let browser
let failed = false

try {
  browser = await launchBrowser()
  const page = await browser.newPage()
  page.on('console', message => {
    if (message.type() === 'error') console.warn('[browser]', message.text())
  })
  page.on('pageerror', error => console.warn('[browser error]', error.message))
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])

  await page.setRequestInterception(true)
  page.on('request', request => {
    const url = request.url()
    if (url.startsWith(`http://127.0.0.1:${port}`) || url.startsWith('data:')) request.continue()
    else request.abort()
  })

  for (const route of ROUTES) {
    const url = `http://127.0.0.1:${port}${route.path}`
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 })
    await page.waitForSelector('#root > *', { timeout: 20_000 })
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready
    })
    await new Promise(resolve => setTimeout(resolve, 250))

    const html = await page.content()
    const title = await page.title()

    if (!title.includes(route.expectTitle)) {
      console.warn(`[prerender] ${route.path}: unexpected title "${title}"`)
    }
    if (!html.includes('rel="canonical"')) {
      console.warn(`[prerender] ${route.path}: no canonical tag found`)
    }

    const output = route.output
      ? path.join(dist, route.output)
      : route.path === '/'
        ? path.join(dist, 'index.html')
        : path.join(dist, route.path.replace(/^\//, ''), 'index.html')

    fs.mkdirSync(path.dirname(output), { recursive: true })
    fs.writeFileSync(output, html)
    console.log(`[prerender] ${route.path} -> ${path.relative(dist, output)} (${title})`)
  }
} catch (error) {
  failed = true
  console.error('[prerender] failed:', error.message)
} finally {
  if (browser) await browser.close().catch(() => {})
  await new Promise(resolve => server.close(resolve))
  fs.rmSync(shellPath, { force: true })
}

if (failed) process.exit(1)
console.log('[prerender] done.')
