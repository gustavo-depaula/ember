// Every internal link of the built site must lead to a built page, and every
// corpus link (`/hearth/v2/…`) to a file of the corpus. Run after `pnpm build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = resolve(fileURLToPath(import.meta.url), '../..')
const dist = resolve(siteRoot, 'dist')
const corpus = process.env.EMBER_CORPUS_DIR ?? resolve(siteRoot, '../../_site/hearth/v2')
// The landing page and the privacy policy are published at the root from apps/hearth.
const landing = resolve(siteRoot, '../hearth')

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) yield* htmlFiles(path)
    else if (name.endsWith('.html')) yield path
  }
}

const exists = new Map()
function isThere(url) {
  const path = url.split(/[?#]/)[0]
  let known = exists.get(path)
  if (known === undefined) {
    const file = path.startsWith('/hearth/v2/')
      ? join(corpus, decodeURIComponent(path.slice('/hearth/v2/'.length)))
      : join(dist, decodeURIComponent(path))
    const hearth = join(landing, path === '/' ? 'index.html' : decodeURIComponent(path))
    known =
      (existsSync(file) && (statSync(file).isFile() || existsSync(join(file, 'index.html')))) ||
      (existsSync(hearth) && statSync(hearth).isFile())
    exists.set(path, known)
  }
  return known
}

// A build limited to a few books (EMBER_SITE_BOOKS) links to books it did not build.
const partial = !!process.env.EMBER_SITE_BOOKS
const bookLink = /^\/(pt\/livros|books)\/[^/]+\//

const broken = new Map()
let pages = 0
let links = 0
for (const file of htmlFiles(dist)) {
  pages++
  const html = readFileSync(file, 'utf-8')
  for (const match of html.matchAll(/(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
    links++
    const url = match[1]
    if (!isThere(url) && !(partial && bookLink.test(url))) {
      const list = broken.get(url) ?? []
      if (list.length < 3) list.push(file.slice(dist.length))
      broken.set(url, list)
    }
  }
}

console.log(`${pages} pages, ${links} internal links, ${broken.size} broken targets`)
for (const [url, from] of [...broken].slice(0, 40)) console.log(`  ${url}\n    from ${from.join(', ')}`)
if (broken.size) process.exit(1)
