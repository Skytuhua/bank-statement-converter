// Re-run axe-core across all four screens in light AND dark mode, and check for
// horizontal overflow at 375px. Verification of the Phase 5 a11y fixes.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const BASE = 'http://127.0.0.1:4173/'
const browser = await chromium.launch()

async function run(theme) {
  const ctx = await browser.newContext(); const page = await ctx.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  if (theme === 'dark') {
    await page.click('button[aria-label*="dark mode"]')
    await page.waitForTimeout(200)
  }
  const screens = []
  async function audit(name) {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const v = r.violations.map((x) => `${x.id}(${x.impact},${x.nodes.length})`)
    screens.push(`${theme}/${name}: ${v.length ? v.join(', ') : 'clean'}`)
  }
  await audit('load')
  await page.click('text=Or try a sample bank CSV')
  await page.waitForSelector('text=Map your columns')
  await audit('map')
  await page.click('text=Preview transactions')
  await page.waitForSelector('table')
  await audit('preview')
  await page.click('text=Choose output')
  await page.waitForSelector('text=Choose output format')
  await audit('export')
  await page.close()
  return screens
}

const light = await run('light')
const dark = await run('dark')

// Overflow check at 375 on every screen
const ctx = await browser.newContext(); const page = await ctx.newPage()
await page.setViewportSize({ width: 375, height: 812 })
await page.goto(BASE, { waitUntil: 'networkidle' })
const overflow = []
async function checkOverflow(name) {
  const o = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }))
  overflow.push(`${name}: scrollW=${o.sw} clientW=${o.cw} ${o.sw > o.cw ? 'OVERFLOW' : 'ok'}`)
}
await checkOverflow('load')
await page.click('text=Or try a sample bank CSV')
await page.waitForSelector('text=Map your columns')
await checkOverflow('map')
await page.click('text=Preview transactions')
await page.waitForSelector('table')
await checkOverflow('preview')
await page.click('text=Choose output')
await page.waitForSelector('text=Choose output format')
await checkOverflow('export')
await browser.close()

console.log('=== axe violations ===')
;[...light, ...dark].forEach((s) => console.log(' ', s))
console.log('=== 375px overflow ===')
overflow.forEach((s) => console.log(' ', s))
