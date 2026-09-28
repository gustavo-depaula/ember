// Turns pages saved from opusdei.org/prayers into one aligned, multilingual
// prayerbook.json. The pages sit behind a Cloudflare challenge, so they were saved
// once from a browser into research/opus-dei-prayerbook/.cache/ (not committed):
// `{lang}-{section id}-latin-{latin section id}.html`, plus `en-{id}-{lang}-{id}.html`
// for sections without Latin, and `index.json`: per site language, its sections'
// `{s1, s2}` ids (own, Latin) in English's order, null where it lacks one.
//
// Each cached page shows two languages side by side. The columns are a CSS subgrid:
// the n-th child of one column sits beside the n-th child of the other, and a
// language lacking a paragraph gets an empty placeholder (`figure.emptyparagraph`).
// So a page gives row-level alignment between exactly two languages; this script
// stitches the pairings together through a pivot (Latin where the prayer has it,
// English otherwise) and fails loudly where the pairs disagree.
import fs from 'node:fs'
import path from 'node:path'
import { parseDocument } from 'htmlparser2'

const root = path.resolve(import.meta.dirname, '../research/opus-dei-prayerbook')
const cacheDir = path.join(root, '.cache')

// Site locale / html lang attribute → corpus language key.
const langKey = {
  en: 'en-US',
  'pt-br': 'pt-BR',
  'pt-pt': 'pt-PT',
  latin: 'la',
  la: 'la',
  es: 'es',
  it: 'it',
  fr: 'fr',
  ca: 'ca',
  'da-dk': 'da',
  'hr-hr': 'hr',
  'hu-hu': 'hu',
  'ro-ro': 'ro',
  'sk-sk': 'sk',
  'sl-si': 'sl',
  'sv-se': 'sv',
  da: 'da',
  hr: 'hr',
  hu: 'hu',
  ro: 'ro',
  sk: 'sk',
  sl: 'sl',
  sv: 'sv',
}
const key = (lang) => {
  const k = langKey[lang.toLowerCase()]
  if (!k) throw new Error(`unknown language: ${lang}`)
  return k
}

// Hand-made corrections (links.tsv). A line of lang:id pairs unions translations
// the site never pairs; a line `=<TAB>lang:id<TAB>lang` relabels a column the site
// files under the wrong language.
const relabel = new Map()
const links = []
for (const line of fs.readFileSync(path.join(root, 'links.tsv'), 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue
  const [first, ...rest] = line.split('\t')
  if (first === '=') relabel.set(rest[0], rest[1])
  else links.push([first, ...rest])
}

// — DOM helpers —

const isTag = (n) => n.type === 'tag' || n.type === 'script' || n.type === 'style'
const classes = (n) => (n.attribs?.class ?? '').split(/\s+/).filter(Boolean)
const hasClass = (n, c) => classes(n).includes(c)
const kids = (n) => (n.children ?? []).filter(isTag)

function find(n, pred) {
  if (pred(n)) return n
  for (const c of n.children ?? []) {
    const hit = find(c, pred)
    if (hit) return hit
  }
  return undefined
}

function findAll(n, pred, out = []) {
  if (pred(n)) out.push(n)
  else for (const c of n.children ?? []) findAll(c, pred, out)
  return out
}

function rawText(n) {
  if (n.type === 'text') return n.data
  // The "en" / "la" badge the site adds to a title shown in one language only.
  if (hasClass(n, 'info-langs')) return ''
  return (n.children ?? []).map(rawText).join('')
}

const clean = (s) =>
  s
    .replace(/[  ]/g, ' ')
    .replace(/[⁠​﻿­]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()

// — Row conversion —

// Inline HTML → our inline markdown: <em> → *…*, <strong> → **…**, <br> → newline.
// Red spans (`.rub`: verse numbers, "Antiphon.", parentheses) stay plain text; the
// colour carries no meaning the words don't already say.
function inline(n, state) {
  if (n.type === 'text') return n.data
  if (!isTag(n)) return ''
  if (n.name === 'br') return '\n'
  if (n.name === 'svg') {
    if (hasClass(n, 'icon-prayer-v')) state.marker ??= 'v'
    else if (hasClass(n, 'icon-prayer-r')) state.marker ??= 'r'
    return ''
  }
  // The ℣/℟ glyph is followed by a red dot; drop the dot, keep anything else.
  if (hasClass(n, 'dot-vr') && /^[\s.]*$/.test(rawText(n))) return ''
  const inner = (n.children ?? []).map((c) => inline(c, state)).join('')
  const text = hasClass(n, 'up') ? smallCaps(inner) : inner
  if (n.name === 'em' || n.name === 'i') return wrap(text, '*')
  if (n.name === 'strong' || n.name === 'b') return wrap(text, '**')
  return text
}

// `.up` is CSS uppercase over lowercase source ("joyful mysteries"); a capital on
// the first letter is the closest plain-text reading. The uppercase also hides
// stray capitals mid-word in the source ("PrimeIra deZena"), so those are folded.
const sentenceCase = (s) => s.replace(/^(\s*)(\p{L})/u, (_, sp, c) => sp + c.toUpperCase())
const smallCaps = (s) => sentenceCase(/\p{Ll}\p{Lu}/u.test(s) ? s.toLowerCase() : s)

function wrap(s, mark) {
  const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)
  if (!m[2]) return s
  return `${m[1]}${mark}${m[2]}${mark}${m[3]}`
}

// Every non-blank text node sits inside an element carrying one of `cls`.
function allTextWithin(n, cls, inside = false) {
  if (n.type === 'text') return inside || !clean(n.data).replace(/[.()]/g, '').trim()
  if (!isTag(n)) return true
  const here = inside || cls.some((c) => hasClass(n, c))
  return (n.children ?? []).every((c) => allTextWithin(c, cls, here))
}

function toRow(el) {
  if (hasClass(el, 'emptyparagraph')) return undefined
  const state = {}
  const text = clean(inline(el, state))
  if (!text) return undefined
  if (state.marker) return { kind: state.marker, text }
  const centred = hasClass(el, 'cn') || /text-align:\s*center/.test(el.attribs?.style ?? '')
  if (hasClass(el, 'rb') || allTextWithin(el, ['rb'])) return { kind: 'rubric', text }
  if (centred) return { kind: 'subheading', text }
  return { kind: 'text', text }
}

// — Page parsing —

function parsePage(file) {
  const doc = parseDocument(fs.readFileSync(path.join(cacheDir, file), 'utf8'))
  const h1 = find(doc, (n) => n.attribs?.id === 'section_title')
  const sectionTitles = {}
  for (const s of findAll(h1 ?? { children: [] }, (n) => n.name === 'span' && n.attribs?.lang)) {
    sectionTitles[key(s.attribs.lang)] = clean(rawText(s))
  }
  const wrapper = find(doc, (n) => n.attribs?.id === 'prayersWrapper')
  if (!wrapper) throw new Error(`${file}: no #prayersWrapper`)
  const prayers = findAll(wrapper, (n) => hasClass(n, 'prayer-wrapper')).map((w) => {
    const sides = {}
    for (const h2 of findAll(w, (n) => n.name === 'h2' && /^dm-prayer-\d+$/.test(n.attribs?.id ?? ''))) {
      const lang = key(h2.attribs.lang)
      sides[lang] = { id: Number(h2.attribs.id.slice(10)), title: clean(rawText(h2)), rows: [] }
    }
    const body = find(w, (n) => hasClass(n, 'prayer'))
    for (const col of kids(body ?? { children: [] })) {
      const lang = col.attribs?.lang && key(col.attribs.lang)
      if (!lang || !sides[lang]) throw new Error(`${file}: column without a title (${lang})`)
      sides[lang].rows = kids(col).map(toRow)
    }
    for (const [l, side] of Object.entries(sides)) {
      const to = relabel.get(`${l}:${side.id}`)
      if (!to) continue
      delete sides[l]
      sides[to] = side
    }
    return sides
  })
  return { sectionTitles, prayers }
}

// — Load every page —

const index = JSON.parse(fs.readFileSync(path.join(cacheDir, 'index.json'), 'utf8'))
const siteLangs = Object.keys(index)
const nSections = index.en.length
for (const l of siteLangs) {
  if (index[l].length !== nSections) throw new Error(`${l}: ${index[l].length} sections, en has ${nSections}`)
}

// pages[section] = [{ a: lang, b: lang, prayers }]
const pages = []
const sectionTitles = []
for (let i = 0; i < nSections; i++) {
  pages[i] = []
  sectionTitles[i] = {}
  for (const l of siteLangs) {
    const s = index[l][i]
    if (!s) continue
    const withLatin = parsePage(`${l}-${s.s1}-latin-${s.s2 || 'none'}.html`)
    Object.assign(sectionTitles[i], withLatin.sectionTitles)
    pages[i].push(withLatin)
    if (l !== 'en') pages[i].push(parsePage(`en-${index.en[i].s1}-${l}-${s.s1}.html`))
  }
}

// — Group prayers across languages —
// Every two-column prayer links its two language ids; connected components are
// one prayer in many languages.

const parent = new Map()
const findRoot = (x) => {
  while (parent.get(x) !== x) {
    parent.set(x, parent.get(parent.get(x)))
    x = parent.get(x)
  }
  return x
}
const union = (a, b) => {
  for (const x of [a, b]) if (!parent.has(x)) parent.set(x, x)
  parent.set(findRoot(a), findRoot(b))
}

// Hand-made unions for translations the site never pairs (links.tsv).
for (const [first, ...rest] of links) for (const n of rest) union(first, n)

const warnings = []
const sections = []

// Nodes are collected across all sections before grouping: linked translations
// can sit in different sections (Italian files O Bona Crux under the hymns). A
// prayer belongs to the section its pivot language puts it in.
const sidesByNode = new Map() // node → [page prayer sides]
const nodeSection = new Map() // node → section index where first seen
const order = []
for (let i = 0; i < nSections; i++) {
  for (const page of [...pages[i]].sort((x, y) => enFirst(x) - enFirst(y))) {
    for (const sides of page.prayers) {
      const nodes = Object.entries(sides).map(([l, s]) => `${l}:${s.id}`)
      for (const n of nodes) {
        if (!parent.has(n)) parent.set(n, n)
        if (!sidesByNode.has(n)) {
          sidesByNode.set(n, [])
          nodeSection.set(n, i)
          order.push(n)
        }
        sidesByNode.get(n).push(sides)
      }
      if (nodes.length === 2) union(nodes[0], nodes[1])
    }
  }
}

const groups = new Map()
for (const n of order) {
  const r = findRoot(n)
  if (!groups.has(r)) groups.set(r, [])
  groups.get(r).push(n)
}

const sectionPrayers = Array.from({ length: nSections }, () => [])
for (const members of groups.values()) {
  const ids = {}
  for (const n of members) {
    const [l, id] = n.split(':')
    if (ids[l] !== undefined && ids[l] !== Number(id)) {
      warnings.push(`${l} has two ids (${ids[l]}, ${id}) in one prayer`)
    }
    ids[l] = Number(id)
  }
  const pivot = ['la', 'en-US', 'pt-BR'].find((l) => ids[l] !== undefined) ?? Object.keys(ids)[0]
  const pairs = members.flatMap((n) => sidesByNode.get(n))
  const section = nodeSection.get(`${pivot}:${ids[pivot]}`)
  sectionPrayers[section].push(align(ids, pivot, pairs, `section ${section} ${pivot}:${ids[pivot]}`))
}

for (let i = 0; i < nSections; i++) {
  sections.push({
    ids: Object.fromEntries(siteLangs.filter((l) => index[l][i]).map((l) => [key(l), Number(index[l][i].s1)])),
    laId: index.en[i].s2 ? Number(index.en[i].s2) : undefined,
    title: sectionTitles[i],
    prayers: sectionPrayers[i].filter((p) => Object.keys(p.ids).length),
  })
}

function enFirst(page) {
  return Object.keys(page.sectionTitles).includes('en-US') ? 0 : 1
}

// Map every language's rows onto the pivot's slots. A slot is (k, j): the k-th
// non-empty pivot row, or the j-th extra row a language has between pivot rows k
// and k+1.
//
// Equal row counts mean the site's own grid alignment holds, so rows pair by
// index (empty placeholders mark the gaps). Unequal counts mean one language
// carries rows the other lacks (a Holy Week variant, a trailing rubric), and the
// grid only lines up the prefix, so the rows are re-aligned by kind and length.
function slotsFor(xRows, pRows, byContent = false) {
  const out = []
  if (!byContent && xRows.length === pRows.length) {
    let k = -1
    let j = 0
    for (let r = 0; r < pRows.length; r++) {
      if (pRows[r]) {
        k++
        j = 0
      } else j++
      if (xRows[r]) out.push([[k, j], xRows[r]])
    }
    return out
  }
  const a = pRows.filter(Boolean)
  const b = xRows.filter(Boolean)
  const textual = new Set(['text', 'rubric', 'subheading'])
  const ratio = (x, y) => Math.min(x.length, y.length) / Math.max(x.length, y.length, 1)
  const sim = (p, x) => {
    if (p.kind === x.kind) return 1 + ratio(p.text, x.text)
    if (textual.has(p.kind) && textual.has(x.kind)) return -0.5 + ratio(p.text, x.text) / 2
    return -2
  }
  const gap = -0.4
  const n = a.length
  const m = b.length
  const score = Array.from({ length: n + 1 }, () => new Float64Array(m + 1))
  for (let i = 1; i <= n; i++) score[i][0] = score[i - 1][0] + gap
  for (let j = 1; j <= m; j++) score[0][j] = score[0][j - 1] + gap
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      score[i][j] = Math.max(
        score[i - 1][j - 1] + sim(a[i - 1], b[j - 1]),
        score[i - 1][j] + gap,
        score[i][j - 1] + gap,
      )
    }
  }
  const steps = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && score[i][j] === score[i - 1][j - 1] + sim(a[i - 1], b[j - 1])) {
      steps.push(['match', i - 1, j - 1])
      i--
      j--
    } else if (i > 0 && (j === 0 || score[i][j] === score[i - 1][j] + gap)) {
      steps.push(['pivot-only', i - 1])
      i--
    } else {
      steps.push(['x-only', j - 1])
      j--
    }
  }
  let k = -1
  let extra = 0
  for (const [op, x, y] of steps.reverse()) {
    if (op === 'match') {
      k = x
      extra = 0
      out.push([[k, 0], b[y]])
    } else if (op === 'pivot-only') {
      k = x
      extra = 0
    } else out.push([[k, ++extra], b[x]])
  }
  return out
}

function align(ids, pivot, pairs, label) {
  const title = {}
  const slots = new Map()
  const put = (slot, lang, row) => {
    const k = `${slot[0]}:${slot[1]}`
    if (!slots.has(k)) slots.set(k, { slot, kind: row.kind, text: {} })
    const s = slots.get(k)
    if (s.text[lang] !== undefined && s.text[lang] !== row.text) {
      warnings.push(`${label}: ${lang} row ${k} differs between pages`)
    }
    if (s.kind !== row.kind) s.kinds = { ...s.kinds, [lang]: row.kind }
    s.text[lang] = row.text
  }

  for (const sides of pairs) for (const [l, s] of Object.entries(sides)) title[l] ??= s.title

  // The pivot's own rows first, so each slot's kind is the pivot's.
  const pivotSides = pairs.map((s) => s[pivot]).filter((s) => s?.id === ids[pivot])
  const pivotText = (s) => s.rows.filter(Boolean).map((r) => r.text).join('\n')
  if (pivotSides.some((s) => pivotText(s) !== pivotText(pivotSides[0]))) {
    warnings.push(`${label}: pivot text differs between pages`)
  }
  pivotSides[0]?.rows.filter(Boolean).forEach((row, k) => put([k, 0], pivot, row))

  const done = new Set([pivot])
  const realigned = new Set()
  for (const sides of pairs) {
    const p = sides[pivot]
    if (p?.id !== ids[pivot]) continue
    for (const [l, s] of Object.entries(sides)) {
      if (done.has(l)) continue
      done.add(l)
      if (s.rows.length !== p.rows.length) realigned.add(l)
      for (const [slot, row] of slotsFor(s.rows, p.rows)) put(slot, l, row)
    }
  }
  // Languages linked only through links.tsv or through a third language never sat
  // beside the pivot, so there is no grid to trust: align by content.
  const pivotRows = pivotSides[0]?.rows ?? []
  for (const l of Object.keys(ids).filter((l) => !done.has(l))) {
    const side = pairs.map((s) => s[l]).find((s) => s?.id === ids[l])
    if (!side) continue
    realigned.add(l)
    for (const [slot, row] of slotsFor(side.rows, pivotRows, true)) put(slot, l, row)
  }

  const rows = [...slots.values()]
    .sort((a, b) => a.slot[0] - b.slot[0] || a.slot[1] - b.slot[1])
    .map(({ kind, kinds, text }) => (kinds ? { kind, kinds, text } : { kind, text }))
  // Some languages list a prayer by its (Latin) title with an empty column.
  for (const l of Object.keys(ids)) {
    if (rows.some((r) => r.text[l] !== undefined)) continue
    delete ids[l]
    delete title[l]
  }
  // Languages whose rows were matched to the pivot by content, not by the site's
  // grid: their row-level pairing with the pivot is a guess.
  const guessed = [...realigned].filter((l) => ids[l] !== undefined).sort()
  return { ids, title, rows, ...(guessed.length ? { realigned: guessed } : {}) }
}

// — Report and write —

const langs = siteLangs.map(key).concat('la')
let total = 0
console.log(`${'section'.padEnd(26)} ${langs.map((l) => l.padStart(5)).join('')}`)
for (const s of sections) {
  total += s.prayers.length
  const counts = langs.map((l) => s.prayers.filter((p) => p.ids[l] !== undefined).length)
  console.log(`${(s.title['en-US'] ?? '').padEnd(26)} ${counts.map((c) => String(c).padStart(5)).join('')}`)
}
console.log(`${total} prayers`)
const kindClashes = sections.flatMap((s) => s.prayers.flatMap((p) => p.rows.filter((r) => r.kinds))).length
console.log(`${kindClashes} rows whose kind differs by language`)
const realigned = sections.flatMap((s) => s.prayers.filter((p) => p.realigned))
console.log(`${realigned.length} prayers with at least one language re-aligned by content`)
if (warnings.length) {
  console.log(`\n${warnings.length} warnings:`)
  for (const w of warnings) console.log(`  ${w}`)
}

fs.writeFileSync(
  path.join(root, 'prayerbook.json'),
  `${JSON.stringify({ source: 'https://opusdei.org/en/prayers/', languages: langs, sections }, null, '\t')}\n`,
)
