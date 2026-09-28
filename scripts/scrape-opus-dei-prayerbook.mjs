// Scrapes the Opus Dei Pocket Prayer Book (opusdei.org/{lang}/prayers/) in every
// language the site offers, each paired with Latin, into a raw-HTML cache that
// scripts/parse-opus-dei-prayerbook.py turns into aligned JSON.
//
// opusdei.org sits behind a Cloudflare managed challenge: plain fetch gets a 403 and
// headless-shell is challenged too, so this drives a headed Chromium. Pass its path
// in CHROMIUM if Playwright's bundled one isn't installed.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const langs = ['en', 'pt-br', 'pt-pt', 'es', 'it', 'fr', 'ca', 'da-dk', 'hr-hr', 'hu-hu', 'ro-ro', 'sk-sk', 'sl-si', 'sv-se']
const cacheDir = path.resolve(import.meta.dirname, '../research/opus-dei-prayerbook/.cache')
const force = process.argv.includes('--force')

fs.mkdirSync(cacheDir, { recursive: true })

const browser = await chromium.launch({ headless: false, executablePath: process.env.CHROMIUM })
const page = await browser.newPage()

async function get(name, url) {
  const file = path.join(cacheDir, `${name}.html`)
  if (!force && fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  for (let attempt = 1; ; attempt++) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
    const html = await page.content()
    if (html.includes('id="prayersWrapper"') || html.includes('id="indexWrapper"') || html.includes('class="index-dm')) {
      fs.writeFileSync(file, html)
      await page.waitForTimeout(1200)
      return html
    }
    if (attempt === 3) throw new Error(`challenge not cleared: ${url}`)
    await page.waitForTimeout(5000)
  }
}

// Home page links read /{lang}/prayers/section/?section1={own id}&section2={pb2 id}.
function sectionLinks(html, lang) {
  const main = html.slice(html.indexOf('<main'))
  const re = new RegExp(`href="/${lang}/prayers/section/\\?section1=(\\d+)&amp;section2=(\\d*)"`, 'g')
  const seen = new Set()
  const out = []
  for (const [, s1, s2] of main.matchAll(re)) {
    if (seen.has(s1)) continue
    seen.add(s1)
    out.push({ s1, s2 })
  }
  return out
}

// A language lacking a section links straight to the Latin one (Catalan's
// "Hymni" is /ca/prayers/section/?section1=64, 64 being the Latin id), so its own
// sections are matched to English's by Latin id, never by position. The one
// section with no Latin (the prayer cards) is the one left over.
const index = {}
for (const lang of langs) {
  const home = await get(`home-${lang}`, `https://opusdei.org/${lang}/prayers/?pb1=${lang}&pb2=latin`)
  index[lang] = sectionLinks(home, lang)
}
const latinIds = new Set(index.en.map((s) => s.s2).filter(Boolean))
for (const lang of langs) {
  const own = index[lang].filter((s) => s.s2 || !latinIds.has(s.s1))
  index[lang] = index.en.map((e) => own.find((s) => s.s2 === e.s2) ?? null)
  console.log(lang, index[lang].map((s) => (s ? `${s.s1}/${s.s2 || '-'}` : '·')).join(' '))
  for (const s of index[lang].filter(Boolean)) {
    await get(`${lang}-${s.s1}-latin-${s.s2 || 'none'}`, `https://opusdei.org/${lang}/prayers/section/?section1=${s.s1}&section2=${s.s2}`)
  }
}

// Prayers with no Latin (the prayer cards, some doctrine) can't be matched across
// languages through the Latin column, so every language is also paired with
// English.
for (const lang of langs.filter((l) => l !== 'en')) {
  for (const [i, s] of index[lang].entries()) {
    if (!s) continue
    const en = index.en[i].s1
    await get(`en-${en}-${lang}-${s.s1}`, `https://opusdei.org/en/prayers/section/?section1=${en}&section2=${s.s1}`)
  }
}

fs.writeFileSync(path.join(cacheDir, 'index.json'), JSON.stringify(index, null, 2))
await browser.close()
