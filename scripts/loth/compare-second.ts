// Holds the corpus against a second transcription of the same edition:
// liturgiadashoras.online, kept by hand and filed by liturgical day. Each of
// its posts is one hour; it is cut into the same slots as the corpus and set
// beside what the engine gives for the day it was posted for.
//
//   npx tsx scripts/loth/compare-second.ts <dir of posts-*.json> [--list <slot>] [--json <out>]
//
// The posts come from the site's public API:
//   /wp-json/wp/v2/posts?per_page=100&page=N&_fields=id,slug,date,title,content

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { addDays } from '../../packages/liturgical/src/of-temporal'
import type { LothCalendar } from '../../packages/loth/src/day'
import { assembleHour, formsOf, type LothSource } from '../../packages/loth/src/hour'
import { type Hour, officeOf } from '../../packages/loth/src/office'
import type { Block } from '../../packages/loth/src/text'
import { normalize } from './normalize'
import { slotsOf } from './slots'

const dir = process.argv[2]
const corpus = join(__dirname, '../../content/loth')
const cache = new Map<string, unknown>()
const read = <T>(path: string): T | undefined => {
  if (!cache.has(path)) {
    const file = join(corpus, path)
    cache.set(path, existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined)
  }
  return cache.get(path) as T | undefined
}
const source: LothSource = {
  calendar: async () => read<LothCalendar>('calendar.json') as LothCalendar,
  index: async (hour) => read(`index/${hour}.json`),
  parts: async (bundle) => read(`parts/${bundle}.json`),
  extras: async () => read('extras.json') ?? {},
}

interface Post {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
}

const hourOf: [RegExp, Hour, string][] = [
  [/^\s*(i{1,2}\s+)?v[ée]speras/i, 'vespers', 'vesperas'],
  [/^\s*laudes/i, 'lauds', 'laudes'],
  [/^\s*completas/i, 'compline', 'completas'],
  [/^\s*of[íi]cio das? leituras?/i, 'readings', 'leituras'],
  [/^\s*hora ter[çc]a/i, 'terce', 'terca'],
  [/^\s*hora sexta/i, 'sext', 'sexta'],
  [/^\s*hora nona/i, 'none', 'nona'],
]

const entities = (s: string) =>
  s.replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&#8220;/g, '“').replace(/&#8221;/g, '”').replace(/&#8230;/g, '…')

// The site's pages carry advertising scripts and players between the prayers.
const clean = (html: string) =>
  entities(html)
    .replace(/<(script|style|ins|iframe|figure|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/\(adsbygoogle[^)]*\)[^<]*/g, ' ')

// The slots that are only labels: what opens the hour is the app's to set.
const isLabel = (slot: string) => slot.startsWith('head') || slot === 'intro-note' || slot === 'psalmody'

// The words of an hour, in order, without what the two sources set out
// differently by design: the labels that open the hour, and the psalm-prayers,
// which the archive's app adds and the breviary does not print.
const skipped = (slot: string) => isLabel(slot) || /collect/.test(slot)
function words(parts: Map<string, Block[]>): string[] {
  return [...parts]
    .filter(([slot]) => !skipped(slot))
    .flatMap(([, blocks]) => blocks.flatMap((b) => b.lines.map((l) => l.map((x) => (typeof x === 'string' ? x : x.t)).join(''))))
    .join('\n')
    .normalize('NFC')
    .replace(/(?<![\p{L}\p{N}])[VR]\s?[./](?=\s*[\p{Lu}“"'‘(])/gu, ' ')
    .toLowerCase()
    // A verse number set against its word is still two things.
    .replace(/(\p{N})(?=\p{L})|(\p{L})(?=\p{N})/gu, '$1$2 ')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
}

// How a difference is to be read, where that can be told from its words.
const doxology = 'glória ao pai e ao filho e ao espírito santo como era no princípio agora e sempre amém'
const bare = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9 ]/g, '')
function kindOf(run: Run, repeated: boolean): string {
  const ours = run.ours.join(' ')
  const theirs = run.theirs.join(' ')
  if (/adsbygoogle/.test(theirs)) return 'site furniture'
  if (bare(ours).replace(/ /g, '') === bare(theirs).replace(/ /g, '')) return 'spelling or spacing'
  if (!theirs && doxology.startsWith(ours)) return 'doxology written out (ours)'
  if (!ours && doxology.startsWith(theirs)) return 'doxology written out (theirs)'
  if (!theirs && repeated) return 'response repeated (ours)'
  if (/\b(saecul|dominus|domine|nostrum|caelis|eius|quia|gloria patri|sicut erat)\b/.test(bare(theirs)) && !ours) return 'latin set out (theirs)'
  if (!theirs && /^(em latim|versao em latim)$/.test(bare(ours))) return 'link to the latin (ours)'
  if (!ours && /^ou\b/.test(theirs) && run.theirs.length > 12) return 'second hymn or option (theirs only)'
  if (!ours) return run.theirs.length > 8 ? 'text only theirs (long)' : 'words only theirs'
  if (!theirs) return run.ours.length > 8 ? 'text only ours (long)' : 'words only ours'
  return run.ours.length + run.theirs.length > 24 ? 'different text' : 'different words'
}

interface Run {
  ours: string[]
  theirs: string[]
  before: string[]
  after: string[]
}

/** Where two runs of words part and meet again (Myers), as the stretches each has alone. */
function apart(a: string[], b: string[]): Run[] | undefined {
  const n = a.length
  const m = b.length
  const max = Math.min(n + m, 4000)
  const offset = max
  const v = new Int32Array(2 * max + 2)
  const trace: Int32Array[] = []
  let found = -1
  for (let d = 0; d <= max && found < 0; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]) ? v[offset + k + 1] : v[offset + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) {
        found = d
        break
      }
    }
  }
  if (found < 0) return undefined
  // Walk back, collecting the edits.
  const edits: { x: number; y: number; kind: 'ours' | 'theirs' }[] = []
  let x = n
  let y = m
  for (let d = found; d > 0; d--) {
    const prev = trace[d]
    const k = x - y
    const down = k === -d || (k !== d && prev[offset + k - 1] < prev[offset + k + 1])
    const pk = down ? k + 1 : k - 1
    const px = prev[offset + pk]
    const py = px - pk
    if (down) edits.push({ x: px, y: py, kind: 'theirs' })
    else edits.push({ x: px, y: py, kind: 'ours' })
    x = px
    y = py
  }
  edits.reverse()
  const runs: Run[] = []
  let last: { x: number; y: number } | undefined
  for (const e of edits) {
    const nextX = e.kind === 'ours' ? e.x + 1 : e.x
    const nextY = e.kind === 'theirs' ? e.y + 1 : e.y
    const run = runs[runs.length - 1]
    // Edits a word or two apart are one difference.
    if (run && last && e.x - last.x <= 2 && e.y - last.y <= 2) {
      run.ours.push(...a.slice(last.x, e.kind === 'ours' ? e.x + 1 : e.x))
      run.theirs.push(...b.slice(last.y, e.kind === 'theirs' ? e.y + 1 : e.y))
    } else {
      runs.push({
        ours: e.kind === 'ours' ? [a[e.x]] : [],
        theirs: e.kind === 'theirs' ? [b[e.y]] : [],
        before: a.slice(Math.max(0, e.x - 6), e.x),
        after: [],
      })
    }
    last = { x: nextX, y: nextY }
    runs[runs.length - 1].after = a.slice(nextX, nextX + 6)
  }
  return runs
}

async function main() {
  const calendar = await source.calendar()
  const posts: Post[] = readdirSync(dir)
    .filter((f) => /^posts-\d+\.json$/.test(f))
    .flatMap((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
  // difference -> where it was met
  const met = new Map<string, { run: Run; hours: Set<string>; where: string[]; kind: string }>()
  const kinds = new Map<string, number>()
  let compared = 0
  let unplaced = 0
  let same = 0
  for (const post of posts) {
    const title = entities(post.title.rendered)
    const kind = hourOf.find(([re]) => re.test(title))
    if (!kind) continue
    const [, hour, theirHour] = kind
    const theirs = new Map(
      slotsOf(normalize(clean(post.content.rendered)), theirHour).map((p) => [p.slot, p.blocks]),
    )
    const theirWords = words(theirs)
    if (theirWords.length < 150) continue
    // A post is dated the day it is for or the evening before.
    const [y, m, d] = post.date.slice(0, 10).split('-').map(Number)
    const posted = new Date(y, m - 1, d, 12)
    let best: { runs: Run[]; date: Date; form: string; cost: number } | undefined
    for (const date of [posted, addDays(posted, 1), addDays(posted, -1)]) {
      const office = officeOf(date, hour, calendar)
      for (const form of formsOf(office)) {
        const ours = new Map((await assembleHour(office, form, source)).map((p) => [p.slot, p.blocks]))
        const runs = apart(words(ours), theirWords)
        if (!runs) continue
        const cost = runs.reduce((n, r) => n + r.ours.length + r.theirs.length, 0)
        if (!best || cost < best.cost) best = { runs, date, form, cost }
      }
    }
    // An hour most of whose words are another's is another day's.
    if (!best || best.cost > theirWords.length * 0.5) {
      unplaced++
      continue
    }
    compared++
    if (best.cost === 0) same++
    const iso = `${best.date.getFullYear()}-${String(best.date.getMonth() + 1).padStart(2, '0')}-${String(best.date.getDate()).padStart(2, '0')}`
    const timesHere = new Map<string, number>()
    for (const run of best.runs) timesHere.set(run.ours.join(' '), (timesHere.get(run.ours.join(' ')) ?? 0) + 1)
    for (const run of best.runs) {
      const id = `${run.ours.join(' ')} => ${run.theirs.join(' ')}`
      const kind = kindOf(run, (timesHere.get(run.ours.join(' ')) ?? 0) >= 3)
      kinds.set(kind, (kinds.get(kind) ?? 0) + 1)
      const entry = met.get(id) ?? { run, hours: new Set<string>(), where: [], kind }
      met.set(id, entry)
      entry.hours.add(hour)
      if (entry.where.length < 4) entry.where.push(`${iso} ${hour} ${best.form} (${post.slug})`)
      ;(entry as { count?: number }).count = ((entry as { count?: number }).count ?? 0) + 1
    }
  }
  console.log(`${compared} hours set beside the engine's; ${same} word for word; ${unplaced} matched no day near their date`)
  console.log(`${met.size} distinct differences`)
  for (const [kind, n] of [...kinds].sort((a, b) => b[1] - a[1])) {
    const distinct = [...met.values()].filter((e) => e.kind === kind).length
    console.log(`  ${String(n).padStart(6)} met, ${String(distinct).padStart(5)} distinct: ${kind}`)
  }
  const list = [...met.values()]
    .map((e) => ({ ...e, count: (e as { count?: number }).count ?? 0 }))
    .sort((a, b) => b.count - a.count)
  const out = process.argv.indexOf('--json')
  if (out > 0)
    writeFileSync(
      process.argv[out + 1],
      JSON.stringify(list.map((e) => ({ kind: e.kind, ours: e.run.ours.join(' '), theirs: e.run.theirs.join(' '), before: e.run.before.join(' '), after: e.run.after.join(' '), count: e.count, hours: [...e.hours], where: e.where }))),
    )
  const only = process.env.KIND
  for (const e of list.filter((x) => !only || x.kind.startsWith(only)).slice(0, Number(process.env.TOP ?? 40)))
    console.log(`${String(e.count).padStart(5)}×  …${e.run.before.join(' ')} [${e.run.ours.join(' ')} | ${e.run.theirs.join(' ')}] ${e.run.after.join(' ')}…   ${e.where[0]}`)
}

main()
