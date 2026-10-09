// The share cards are built as pages (src/pages/share): each is photographed
// here to the image beside it, `share/<lang>/<slug>/index.html` →
// `share/<lang>/<slug>.jpg`, and the page removed. Run after `astro build`.
// A browser draws them so the card is the site's own stamp, type and color,
// not a second drawing of them.
import { createReadStream, existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { delimiter, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const dist = resolve(fileURLToPath(import.meta.url), '../../dist')
const cards = join(dist, 'share')
const tabs = 8

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

/** Chrome or Chromium from the machine: CI images carry one, and none is downloaded. */
function browserPath() {
  const names = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  const found = (process.env.PATH ?? '')
    .split(delimiter)
    .flatMap((dir) => names.map((name) => join(dir, name)))
    .find((path) => existsSync(path))
  const path = process.env.EMBER_CHROME ?? found
  if (!path) throw new Error('The share cards need Chrome or Chromium on PATH (or EMBER_CHROME).')
  return path
}

const pages = readdirSync(cards).flatMap((lang) =>
  readdirSync(join(cards, lang))
    .filter((slug) => statSync(join(cards, lang, slug)).isDirectory())
    .map((slug) => `${lang}/${slug}`),
)

// The pages name their fonts and styles from the root, so they are served, not opened as files.
const server = createServer((req, res) => {
  const path = join(dist, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)))
  const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path
  if (!file.startsWith(dist) || !existsSync(file)) return res.writeHead(404).end()
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`

// --no-sandbox: CI runners deny Chrome its sandbox, and it only opens these pages.
const browser = await chromium.launch({ executablePath: browserPath(), args: ['--no-sandbox'] })
const context = await browser.newContext({ viewport: { width: 1200, height: 630 } })
const queue = [...pages]
await Promise.all(
  Array.from({ length: tabs }, async () => {
    const tab = await context.newPage()
    for (let card = queue.pop(); card; card = queue.pop()) {
      await tab.goto(`${origin}/share/${card}/`)
      await tab.evaluate(() => document.fonts.ready)
      await tab.screenshot({ path: join(cards, `${card}.jpg`), type: 'jpeg', quality: 86 })
      rmSync(join(cards, card), { recursive: true })
    }
  }),
)
await browser.close()
server.close()
console.log(`${pages.length} share cards`)
