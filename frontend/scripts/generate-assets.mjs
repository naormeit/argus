/**
 * Generate static brand assets (Open Graph card, PNG favicons) with headless
 * Chrome. Run after changing branding: `npm run seo:assets`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launchBrowser } from './chrome.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const publicDir = path.join(root, 'public')
const fontSource = path.join(root, 'node_modules', '@fontsource')

function fontFace(family, pkg, file, weight) {
  const data = fs.readFileSync(path.join(fontSource, pkg, 'files', file)).toString('base64')
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/woff2;base64,${data}) format('woff2');}`
}

const css = [
  fontFace('Syne', 'syne', 'syne-latin-800-normal.woff2', 800),
  fontFace('DM Sans', 'dm-sans', 'dm-sans-latin-400-normal.woff2', 400),
  fontFace('JetBrains Mono', 'jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2', 400),
].join('\n')

const mark = size => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#121111"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="13" fill="none" stroke="#D4A052" stroke-opacity="0.4"/>
  <path d="M19 47 L32 17 L45 47" fill="none" stroke="#D4A052" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24.5 37 H39.5" fill="none" stroke="#D4A052" stroke-width="4.5" stroke-linecap="round"/>
</svg>`

const ogHtml = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  ${css}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #121111; color: #fff;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(212,160,82,0.10) 1px, transparent 0);
    background-size: 44px 44px;
  }
  .glow {
    position: absolute; width: 720px; height: 720px; right: -220px; top: -300px;
    background: radial-gradient(circle, rgba(35,79,96,0.55) 0%, rgba(35,79,96,0) 65%);
  }
  .content { position: relative; padding: 64px 72px; height: 100%; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .wordmark { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 34px; letter-spacing: -0.01em; }
  .eyebrow {
    font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.22em;
    text-transform: uppercase; color: rgba(212,160,82,0.75);
  }
  h1 {
    margin-top: 82px; font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 78px; line-height: 1.02; letter-spacing: -0.025em; max-width: 940px;
  }
  h1 span { color: #D4A052; }
  p {
    margin-top: 28px; max-width: 760px; font-size: 24px; line-height: 1.45;
    color: rgba(223,230,230,0.62);
  }
  .footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
  .chips { display: flex; gap: 12px; }
  .chip {
    border: 1px solid rgba(239,239,239,0.14); border-radius: 999px; padding: 9px 18px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(223,230,230,0.62);
  }
  .gold { color: #D4A052; border-color: rgba(212,160,82,0.45); }
  .url { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: rgba(223,230,230,0.35); }
  .rule { height: 1px; background: linear-gradient(90deg, rgba(212,160,82,0.65), rgba(212,160,82,0)); margin: 34px 0 28px; }
</style></head>
<body>
  <div class="grid"></div><div class="glow"></div>
  <div class="content">
    <div class="top">
      <div class="brand">${mark(64)}<div class="wordmark">Argus</div></div>
      <div class="eyebrow">Multi-agent smart contract security</div>
    </div>
    <h1>Security audits,<br><span>at agent speed.</span></h1>
    <p>Scout, Hunter, Forge and Arbiter triage risk, write proof-of-concept exploits and return a signed report in under 90 seconds.</p>
    <div class="footer">
      <div class="chips">
        <div class="chip gold">4 agents</div>
        <div class="chip">PoC exploits</div>
        <div class="chip">Signed reports</div>
      </div>
      <div class="url">argus · smart contract security</div>
    </div>
  </div>
</body></html>`

const iconHtml = size => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body { margin:0; padding:0; width:${size}px; height:${size}px; background:#121111; }
  svg { display:block; width:${size}px; height:${size}px; }
</style></head><body>${mark(size)}</body></html>`

const browser = await launchBrowser()
try {
  const page = await browser.newPage()

  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  await page.setContent(ogHtml, { waitUntil: 'load' })
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready })
  await page.screenshot({ path: path.join(publicDir, 'og.png'), type: 'png' })
  console.log('[assets] public/og.png (1200x630)')

  for (const [file, size] of [['apple-touch-icon.png', 180], ['favicon-32.png', 32]]) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 })
    await page.setContent(iconHtml(size), { waitUntil: 'load' })
    await page.screenshot({ path: path.join(publicDir, file), type: 'png', omitBackground: true })
    console.log(`[assets] public/${file} (${size}x${size})`)
  }
} finally {
  await browser.close()
}
