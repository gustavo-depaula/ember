/**
 * Regenerate apps/app/src/sources/ccc/en-pages.json — the static reading-order
 * index of the English Catechism on vatican.va (archive/ENG0015).
 *
 * The English CCC is served as ~374 tiny IntraText pages (__P1.HTM … __PZZ.HTM)
 * chained by "Next" links, with ~9 numbered paragraphs each. There is no
 * paragraph→page map on the site, so we crawl the Next-chain once and record
 * each page's first/last paragraph number. The text is frozen (dated 2003), so
 * the output is committed and used at runtime — no per-device crawl.
 *
 * Run:  node scripts/build-ccc-en-index.mjs
 */

import { writeFileSync } from 'node:fs'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const BASE = 'https://www.vatican.va/archive/ENG0015/'
const OUT = new URL('../apps/app/src/sources/ccc/en-pages.json', import.meta.url)

// ISO-8859-1: each byte maps to the same code point.
function decodeLatin1(buf) {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return s
}

async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } })
      if (!res.ok) throw new Error(`status ${res.status}`)
      return decodeLatin1(await res.arrayBuffer())
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 600))
    }
  }
}

// Numbered paragraphs render as `<p class=MsoNormal>NNN text` (regular) or
// `<p class=MsoNormal><i>NNNN` (IN BRIEF summaries). Headings use `<b>`.
// Candidate paragraph numbers in document order. Includes numbers that are NOT
// paragraph markers (the Ten Commandments enumerated 1–10, scripture refs); the
// caller filters them out by monotonic sequence.
function candidateNumbers(html) {
  const out = []
  const re = /<p[^>]*class=["']?msonormal["']?[^>]*>\s*(?:<[ib][^>]*>\s*)?(\d{1,4})(?=[\s<&.])/gi
  for (let m = re.exec(html); m; m = re.exec(html)) out.push([m.index, Number(m[1])])
  // A handful of paragraphs follow a <br> inside a shared <p> (e.g. §2436).
  const br = /<br\s*\/?>\s*(\d{1,4})\s+[A-Z"«]/gi
  for (let m = br.exec(html); m; m = br.exec(html)) out.push([m.index, Number(m[1])])
  return out.sort((a, b) => a[0] - b[0]).map((x) => x[1])
}

function baseName(href) {
  const m = href.match(/(__P[0-9A-Z]+\.HTM)/i)
  return m ? m[1].toUpperCase() : undefined
}

// Next-link markup is inconsistent across pages: early ones are
// `<a href=__P3.HTM>Next</a>` (unquoted/relative), later ones
// `<A\nhref="http://…/__P86.HTM">Next</A>` (quoted/absolute/uppercase).
function nextHref(html) {
  const m = html.match(/<a\b[^>]*\bhref\s*=\s*"?([^"\s>]+)"?[^>]*>\s*Next\s*<\/a>/i)
  return m ? baseName(m[1]) : undefined
}

const pages = []
const seen = new Set()
let cur = '__P1.HTM'
// CCC paragraphs are globally consecutive (1…2865), so we accept a candidate
// only when it continues the running sequence. This rejects out-of-sequence
// numbers — the enumerated Ten Commandments (1–10) and scripture references —
// that would otherwise give a page a wildly wrong range.
let expected = 1
while (cur && !seen.has(cur)) {
  seen.add(cur)
  const html = await get(BASE + cur)
  const accepted = []
  for (const n of candidateNumbers(html)) {
    if (n >= expected - 1 && n <= expected + 4) {
      accepted.push(n)
      expected = n + 1
    }
  }
  pages.push([cur, accepted.length ? accepted[0] : null, accepted.length ? accepted.at(-1) : null])
  cur = nextHref(html)
  if (pages.length % 60 === 0) console.error('…', pages.length, 'pages')
}

const withNums = pages.filter((p) => p[1] != null)
const maxPara = Math.max(...withNums.map((p) => p[2]))
if (maxPara !== 2865) throw new Error(`expected last paragraph 2865, got ${maxPara} — crawl incomplete`)

writeFileSync(
  OUT,
  JSON.stringify({
    note: 'Static reading-order index of the English CCC on vatican.va (ENG0015). Regenerate with scripts/build-ccc-en-index.mjs. Each entry: [pageFile, firstParagraph|null, lastParagraph|null].',
    base: BASE,
    pages,
  }),
)
console.error(`wrote ${pages.length} pages (max paragraph ${maxPara}) → ${OUT.pathname}`)
