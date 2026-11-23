import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

/**
 * Launch a local Chrome for build-time rendering.
 * Order: CHROME_PATH -> common desktop install -> @sparticuz/chromium (Linux/CI).
 */
export async function launchBrowser() {
  const args = ['--disable-dev-shm-usage', '--no-sandbox', '--font-render-hinting=none']

  for (const candidate of CANDIDATES) {
    if (candidate && fs.existsSync(candidate)) {
      return puppeteer.launch({ executablePath: candidate, headless: true, args })
    }
  }

  try {
    const chromium = (await import('@sparticuz/chromium')).default
    const executablePath = await chromium.executablePath()
    return puppeteer.launch({
      executablePath,
      headless: true,
      args: [...chromium.args, ...args],
    })
  } catch (error) {
    throw new Error(
      `No Chrome executable found for prerendering. Set CHROME_PATH to a Chrome/Chromium binary. ${error.message}`,
    )
  }
}
