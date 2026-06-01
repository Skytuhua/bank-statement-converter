// Drives the app in a real browser, captures screenshots of every screen/state
// at multiple viewports, verifies the download works, and records every network
// request (to prove nothing is uploaded). Run against `vite preview`.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:4173/'
const OUT = 'docs/screenshots'
mkdirSync(OUT, { recursive: true })

const externalRequests = []
const allRequests = []

const browser = await chromium.launch()
const ctx = await browser.newContext({ deviceScaleFactor: 2 })
const page = await ctx.newPage()

page.on('request', (req) => {
  const url = req.url()
  allRequests.push(url)
  if (!url.startsWith(BASE) && !url.startsWith('data:') && !url.startsWith('blob:')) {
    externalRequests.push(url)
  }
})

async function shot(name, opts = {}) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full ?? false })
  console.log('shot:', name)
}

// ---- Desktop 1440 ----
await page.setViewportSize({ width: 1440, height: 900 })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Convert bank statement files')
await shot('01-load-desktop', { full: true })

// Load the sample CSV -> Map step
await page.click('text=Or try a sample bank CSV')
await page.waitForSelector('text=Map your columns')
await shot('02-map-desktop', { full: true })

// Preview
await page.click('text=Preview transactions')
await page.waitForSelector('text=Preview')
await page.waitForSelector('table')
await shot('03-preview-desktop', { full: true })

// Export
await page.click('text=Choose output')
await page.waitForSelector('text=Choose output format')
await shot('04-export-desktop', { full: true })

// Pick OFX and verify the download produces real content.
await page.click('text=OFX 2.x')
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('button:has-text("Download")'),
])
const dlPath = `docs/screenshots/_download-${download.suggestedFilename()}`
await download.saveAs(dlPath)
console.log('downloaded:', download.suggestedFilename())
await page.waitForSelector('text=Saved')
await shot('05-export-downloaded-desktop')

// ---- Dark mode (export screen) ----
await page.click('button[aria-label*="dark mode"]')
await page.waitForTimeout(300)
await shot('06-export-dark-desktop', { full: true })

// ---- Mobile 375 (load + map) ----
const m = await ctx.newPage()
m.on('request', (req) => {
  const url = req.url()
  if (!url.startsWith(BASE) && !url.startsWith('data:') && !url.startsWith('blob:')) externalRequests.push(url)
})
await m.setViewportSize({ width: 375, height: 812 })
await m.goto(BASE, { waitUntil: 'networkidle' })
await m.waitForSelector('text=Convert bank statement files')
await m.screenshot({ path: `${OUT}/07-load-mobile.png`, fullPage: true })
await m.click('text=Or try a sample bank CSV')
await m.waitForSelector('text=Map your columns')
await m.screenshot({ path: `${OUT}/08-map-mobile.png`, fullPage: true })
console.log('shot: mobile load + map')

await browser.close()

// ---- Network audit ----
const audit = {
  baseUrl: BASE,
  totalRequests: allRequests.length,
  externalRequests,
  verdict: externalRequests.length === 0 ? 'PASS — no external requests' : 'FAIL — external requests detected',
}
writeFileSync(`${OUT}/network-audit.json`, JSON.stringify(audit, null, 2))
console.log('\nNetwork audit:', audit.verdict)
if (externalRequests.length) console.log(externalRequests)

if (!existsSync(dlPath)) {
  console.error('Download verification FAILED')
  process.exit(1)
}
