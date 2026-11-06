// Builds `content/loth/latin/`: the Latin of every part of the Brazilian
// corpus that has one, from iBreviary's editio typica as crawled for
// 2020-2040 (`research/liturgia-das-horas/latin/crawl.mjs`).
//
// Each day's hours are laid beside the Latin of the same day and checked
// (`verify.ts`); every part the check lets through gives its Latin one vote,
// under its place in the corpus. A part is said on many days, so the Latin it
// is kept with is the one most of its days agree on: a slip of iBreviary's on
// one day is outvoted by the others.
//
// Where the Latin keeps a day otherwise (a feast on another date), the same
// office is looked for on the Latin's other days, by its psalms and reading.
//
//   npx tsx scripts/loth/latin/build.ts index <crawl dir> <from> <to> <index.json>
//   npx tsx scripts/loth/latin/build.ts votes <crawl dir> <from> <to> <votes.json> [index.json]
//   npx tsx scripts/loth/latin/build.ts write <report.tsv> <index.json> <votes.json>...

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import type { Hour, LothSource } from '../../../packages/loth/src/index'
import {
  latinSection,
  latinTexts,
  plain,
  type StoredLatin,
} from '../../../apps/app/src/sources/loth/pair'
import { withheld } from './corrections'
import { citedKey, citedOfLatin, keysOfDay, keysOfLatin, latinOfDay, otherDaysOf } from './day'

// Run from the repository's root, as `scripts/loth/import.ts` is.
const root = resolve('content/loth')
const read = (path: string) => {
  const file = join(root, path)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined
}
const memo = new Map<string, unknown>()
const cached = <T>(path: string): T => {
  if (!memo.has(path)) memo.set(path, read(path))
  return memo.get(path) as T
}
const source: LothSource = {
  calendar: async () => cached('calendar.json'),
  index: async (hour) => cached(`index/${hour}.json`),
  parts: async (bundle) => cached(`parts/${bundle}.json`),
  extras: async () => cached('extras.json'),
}

// The hours, by iBreviary's page.
const hours: [Hour, string, string][] = [
  ['readings', 'office-of-readings', 'ufficio_delle_letture'],
  ['lauds', 'lauds', 'lodi'],
  ['terce', 'terce', 'ora_media'],
  ['sext', 'sext', 'ora_media'],
  ['none', 'none', 'ora_media'],
  ['vespers', 'vespers', 'vespri'],
  ['compline', 'compline', 'compieta'],
]

// ref -> the Latin's key -> its votes, and the first day it was given.
type Votes = Record<string, Record<string, { latin: StoredLatin; votes: number; first: string }>>

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// The first day and hour each part was said on, for a part left without Latin.
const unseen: Record<string, string> = {}

// Where each office of the Latin is, by its key (`keysOfLatin`), and the
// readings and responsories it prints, by their citation.
type Index = {
  offices: Record<string, string[]>
  cited: Record<string, StoredLatin[]>
}

const pageOf = Object.fromEntries(hours.map(([hour, page, file]) => [hour, { page, file }]))

function htmlOf(crawl: string, day: string, file: string): string | undefined {
  const path = join(crawl, day.slice(0, 4), `${day}_${file}.html.gz`)
  return existsSync(path) ? gunzipSync(readFileSync(path)).toString() : undefined
}

function indexOf(crawl: string, from: string, to: string): Index {
  const index: Index = { offices: {}, cited: {} }
  for (let d = new Date(`${from}T12:00:00`); iso(d) <= to; d.setDate(d.getDate() + 1)) {
    const day = iso(d)
    for (const [hour, page, file] of hours) {
      const html = htmlOf(crawl, day, file)
      if (!html) continue
      for (const key of keysOfLatin(hour, page, html)) {
        const days = (index.offices[key] ??= [])
        if (days.length < 6) days.push(day)
      }
      for (const { key, latin } of citedOfLatin(page, html)) {
        const texts = (index.cited[key] ??= [])
        if (texts.length < 8) texts.push(latin)
      }
    }
    if (day.endsWith('-12-31')) console.error(`${day}`)
  }
  return index
}

// The parts that have a Latin original (the opening of an hour has none, nor
// a psalm-prayer).
const translatable = (ref: string) => !/^(head-|collect-|canticle-title|intro-note|psalmody|opening|whole)/.test(ref)

async function votesOf(crawl: string, from: string, to: string, index?: Index): Promise<Votes> {
  const votes: Votes = {}
  const give = (ref: string, latin: StoredLatin, day: string) => {
    const key = JSON.stringify(latin)
    const entry = ((votes[ref] ??= {})[key] ??= { latin, votes: 0, first: day })
    entry.votes++
  }
  for (let d = new Date(`${from}T12:00:00`); iso(d) <= to; d.setDate(d.getDate() + 1)) {
    const day = iso(d)
    for (const [hour, page, file] of hours) {
      const html = htmlOf(crawl, day, file)
      if (!html) continue
      const said = new Set<string>()
      const seen = (ref: string) => {
        unseen[ref] ??= `${day} ${hour}`
        said.add(ref)
      }
      const given = await latinOfDay(new Date(d), hour, page, html, source, seen)
      for (const { ref, latin } of given) give(ref, latin, day)
      // A celebration Brazil keeps on another day than the Latin: the Latin of
      // the day the Latin keeps it, the same office.
      for (const other of await otherDaysOf(new Date(d), hour, source)) {
        const html = htmlOf(crawl, iso(other), pageOf[hour].file)
        if (!html) continue
        for (const { ref, latin } of await latinOfDay(new Date(d), hour, page, html, source))
          give(ref, latin, `${day}~${iso(other)}`)
      }
      // Where the day's Latin left parts without, the same office on another
      // day of the Latin (the Epiphany, kept on a Sunday in Brazil), taken
      // with the care another saint's of the same Common calls for.
      const short = [...said].some((ref) => translatable(ref) && !given.some((g) => g.ref === ref))
      if (!short || !index) continue
      const elsewhere = new Set(
        (await keysOfDay(new Date(d), hour, source)).flatMap((key) => index.offices[key] ?? []),
      )
      elsewhere.delete(day)
      for (const other of [...elsewhere].slice(0, 3)) {
        const html = htmlOf(crawl, other, pageOf[hour].file)
        if (!html) continue
        for (const { ref, latin } of await latinOfDay(new Date(d), hour, page, html, source, undefined, true))
          give(ref, latin, `${day}~${other}`)
      }
    }
    if (day.endsWith('-12-31')) console.error(`${day}`)
  }
  return votes
}

type Candidate = { latin: StoredLatin; votes: number; first: string }

// A block of the corpus as its words.
type Seg = string | { t: string }
type Blocks = { lines: Seg[][] }[]
const flat = (blocks: Blocks | undefined) =>
  (blocks ?? []).flatMap((b) => b.lines.map((line) => line.map((s) => (typeof s === 'string' ? s : s.t)).join(''))).join(' ')
const wordSet = (text: string) => new Set(plain(text))
const jaccard = (a: Set<string>, b: Set<string>) => {
  let both = 0
  for (const w of a) if (b.has(w)) both++
  return both / (a.size + b.size - both || 1)
}

/**
 * The Missal's collects, in Latin, by their Brazilian words. Most prayers of
 * the Hours are the Mass's collects, and where the Brazilian breviary words
 * one as the Brazilian Missal does, the Missal's Latin is a witness of its own.
 */
function missalCollects(): { words: Set<string>; latin: string }[] {
  const out: { words: Set<string>; latin: string }[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.json')) {
        const data = JSON.parse(readFileSync(path, 'utf8'))
        for (const item of data?.items ?? []) {
          const text = item?.text
          if (!text?.la || !text['pt-BR']) continue
          const words = wordSet(flat(text['pt-BR']))
          if (words.size > 8 && words.size < 80) out.push({ words, latin: flat(text.la).trim() })
        }
      }
    }
  }
  walk(resolve('content/missal'))
  return out
}

const prayerWords = (prayer: Blocks[]) => {
  const words = wordSet(flat(prayer.flat() as never))
  words.delete('oracao')
  return words
}

function missalLatinOf(prayer: Blocks[], collects: { words: Set<string>; latin: string }[]) {
  const words = prayerWords(prayer)
  let best: { latin: string; score: number } | undefined
  for (const c of collects) {
    const score = jaccard(words, c.words)
    if (!best || score > best.score) best = { latin: c.latin, score }
  }
  return best && best.score >= 0.5 ? best : undefined
}

// How near the breviary's Brazilian words are to the Missal's for a Latin
// collect: the Missal's Brazilian of that Latin, if the Missal has it.
function nearness(prayer: Blocks[], latin: string, collects: { words: Set<string>; latin: string }[]) {
  const theirs = wordSet(latin)
  const same = collects.find((c) => {
    const missal = wordSet(c.latin)
    return [...missal].filter((w) => theirs.has(w)).length / (missal.size || 1) >= 0.8
  })
  return same ? jaccard(prayerWords(prayer), same.words) : undefined
}

// A short reading is voted on by its words, without the versicle after it.
const isShortReading = (latin: StoredLatin) => latin.slot === 'reading'
const withoutVersicle = (latin: StoredLatin): StoredLatin => ({
  ...latin,
  body: latin.body.filter((line) => typeof line === 'string'),
})

const wordsOf = (latin: StoredLatin) => {
  const section = latinSection(isShortReading(latin) ? withoutVersicle(latin) : latin)
  return [section.subtitle ?? '', ...latinTexts(section.body)].map((t) => plain(t).join(' ')).join('|')
}

// The great antiphons of 17-23 December, by the name each opens with: iBreviary
// sets some a day off.
const greatAntiphons: [RegExp, RegExp][] = [
  [/^Ó Sabedoria/, /^O Sapiéntia/],
  [/^Ó Adonai/, /^O Adonái/],
  [/^Ó Raiz/, /^O Radix/],
  [/^Ó Chave/, /^O Clavis/],
  [/^Ó (Sol|Oriente|Astro)/, /^O Óriens/],
  [/^Ó Rei/, /^O Rex/],
  [/^Ó Emanuel/, /^O Emmánuel/],
]
function greatAntiphonOf(portuguese: string): RegExp | undefined {
  const said = portuguese.replace(/^Ant\.?\s*/, '').trim()
  return greatAntiphons.find(([pt]) => pt.test(said))?.[1]
}

// At least as many days as this must give a part its Latin: on one or two days
// a feast's Latin may be another feast's.
const fewestDays = 3

const saidOf = (latin: StoredLatin) =>
  JSON.stringify(latin.body.find((line) => typeof line === 'string' || 'v' in line) ?? '').slice(0, 80)

// The parts said in the same words, by kind: the Brazilian files one text
// under many places (an antiphon before its psalm and after it, a feast's
// antiphon again at its octave, a short reading on two days), worded a little
// otherwise at times ("por Deus constituído" / "constituído por Deus Pai").
const family = (bundle: string) => {
  const kind = bundle.replace(/-\d+$/, '')
  return /^(ant|canticle-ant|canticle-ant-end)$/.test(kind) ? 'antiphon' : kind
}
// An Invitatory is its antiphon and a psalm: two are near in words whatever
// their antiphons, so a psalm is matched by its whole words only.
const nearEnough = (bundle: string) => (family(bundle) === 'psalm' ? 1 : 0.9)
const label = /^(Ant\.?\s*\d?\.?|Oração|Responsório breve|Responsório|Preces|Hino|Leitura breve)\s*/
// Easter time's alleluia, said or (in parentheses) left to the season.
const alleluiaWord = /^alel[uú]ia$/
const ptWords = (blocks: Blocks) =>
  plain(flat(blocks).replace(label, '')).filter((w) => !alleluiaWord.test(w))
const saysAlleluia = (blocks: Blocks) => {
  const text = flat(blocks)
  return /alel[uú]ia/i.test(text) && !/\(T\.\s*P\./.test(text)
}
const latinSaid = (latin: StoredLatin) => latinTexts(latinSection(latin).body).join(' ')

// The Latin with the alleluia the Brazilian says and its twin did not.
function withAlleluia(latin: StoredLatin): StoredLatin {
  const at = latin.body.findLastIndex((line) => typeof line === 'string')
  if (at === -1) return latin
  return {
    ...latin,
    body: latin.body.map((line, i) =>
      i === at && typeof line === 'string' ? `${line.trim().replace(/[.!]$/, '')}, allelúia.` : line,
    ),
  }
}

/**
 * Gives a part without Latin the Latin of the parts said in its words, where
 * all of them that have one have the same.
 */
function sameWords(built: { id: string; parts: (StoredLatin | null)[] }[]): number {
  const blocksOf = (id: string, i: number) => cached<{ parts: Blocks[] }>(`parts/${id}.json`).parts[i]
  const known: { family: string; words: Set<string>; latin: StoredLatin }[] = []
  for (const { id, parts } of built)
    parts.forEach((latin, i) => {
      const words = new Set(ptWords(blocksOf(id, i)))
      // An Invitatory's psalm is every day's and its antiphon the day's: its
      // words tell the one by the other.
      if (latin && latin.slot !== 'invitatory' && words.size >= 5)
        known.push({ family: family(id), words, latin })
    })
  let given = 0
  for (const { id, parts } of built)
    parts.forEach((latin, i) => {
      const ref = `${id}.${i}`
      if (latin || withheld.has(ref) || !translatable(ref)) return
      const blocks = blocksOf(id, i)
      const words = new Set(ptWords(blocks))
      if (words.size < 5) return
      const near = known.filter(
        (k) => k.family === family(id) && jaccard(words, k.words) >= nearEnough(id),
      )
      if (near.length === 0) return
      // Their Latin, but for an alleluia, must be one.
      const bare = (l: StoredLatin) => plain(latinSaid(l)).filter((w) => !/^allel[uú]ia$/.test(w)).join(' ')
      if (new Set(near.map((k) => bare(k.latin))).size !== 1) return
      const alleluia = saysAlleluia(blocks)
      const own = near.find((k) => /allel[uú]ia/i.test(latinSaid(k.latin)) === alleluia)
      if (own) parts[i] = own.latin
      // An antiphon takes Easter's alleluia at its end; a responsory is set out
      // otherwise in Easter time.
      else if (alleluia && family(id) === 'antiphon') parts[i] = withAlleluia(near[0].latin)
      else return // the Latin's alleluia, where the Brazilian says none
      filledBy.push(`${ref}\tsame words`)
      given++
    })
  return given
}

// The parts given their Latin by citation or by their words, for reading over.
const filledBy: string[] = []

// A reading's or a responsory's citation, as the Brazilian prints it: after
// its title ("Leitura breve Rm 12,1-2", "Responsório Cf. Lc 1,28"), or under
// a Father's reading.
function brazilianCite(slotKind: string, blocks: Blocks): string | undefined {
  const lines = blocks.flatMap((b) =>
    b.lines.map((line) => line.map((seg) => (typeof seg === 'string' ? seg : seg.t)).join('')),
  )
  if (slotKind === 'reading-2') return lines.find((l) => l.trim().startsWith('('))
  return /^(Leitura breve|Responsório)\s*(.*)$/.exec(lines[0]?.trim() ?? '')?.[2]
}

/**
 * Gives a reading without Latin the Latin printed under the same citation on
 * any day, where every day that prints it prints the same.
 */
function byCitation(built: { id: string; parts: (StoredLatin | null)[] }[], index: Index): number {
  let given = 0
  for (const { id, parts } of built) {
    // A responsory is not: its citation may be its versicle's, which other
    // responsories share.
    const kind = id.replace(/-\d+$/, '')
    if (kind !== 'reading') continue
    const blocks = cached<{ parts: Blocks[] }>(`parts/${id}.json`).parts
    parts.forEach((latin, i) => {
      if (latin || withheld.has(`${id}.${i}`)) return
      const heading = flat(blocks[i]).trim()
      const slot = /^Segunda leitura/.test(heading)
        ? 'reading-2'
        : /^Leitura breve/.test(heading)
          ? 'reading'
          : undefined
      if (!slot) return
      const cite = brazilianCite(slot, blocks[i])
      const key = cite && citedKey(slot, cite, 'brazilian')
      const found = key ? (index.cited[key] ?? []) : []
      const texts = new Set(found.map((f) => wordsOf(slot === 'reading' ? withoutVersicle(f) : f)))
      if (texts.size !== 1) return
      // A short reading's versicle is the day's, not the reading's.
      parts[i] = slot === 'reading' ? withoutVersicle(found[0]) : found[0]
      filledBy.push(`${id}.${i}\tcitation`)
      given++
    })
  }
  return given
}

/**
 * The Invitatory, filed once for each of its four psalms with its antiphon
 * written in between the strophes, put together from its two halves: the
 * antiphon's Latin, from the Invitatory with Psalm 94(95) that has its words,
 * and the psalm's, which is every day's.
 */
function invitatories(built: { id: string; parts: (StoredLatin | null)[] }[]): number {
  const latinOfRef = new Map<string, StoredLatin>()
  for (const { id, parts } of built) parts.forEach((l, i) => l && latinOfRef.set(`${id}.${i}`, l))
  const blocksOf = (ref: string) => {
    const dot = ref.lastIndexOf('.')
    return cached<{ parts: Blocks[] }>(`parts/${ref.slice(0, dot)}.json`).parts[Number(ref.slice(dot + 1))]
  }
  const index = cached<{ slots: Record<string, unknown> }>('index/invitatory.json')
  const refs = [...new Set(JSON.stringify(index.slots['psalm-1']).match(/psalm-\d+\.\d+/g) ?? [])]
  const psalmOf = (ref: string) => /Salmo (\d+)/.exec(flat(blocksOf(ref)))?.[1]
  // The antiphon, whole: it may run over two lines, up to the next strophe.
  const antiphonOf = (ref: string) => {
    const text = blocksOf(ref)
      .flatMap((b) => b.lines.map((l) => l.map((seg) => (typeof seg === 'string' ? seg : seg.t)).join('')))
      .join('\n')
    return /℟\.\s*([\s\S]+?)(?=\n\s*[=–-]|\n\s*℟|$)/.exec(text)?.[1].replace(/\s+/g, ' ').trim()
  }
  const key = (antiphon: string) => plain(antiphon).filter((w) => !alleluiaWord.test(w)).join(' ')

  // The antiphons' Latin, and the versicle and Psalm 94 as the Latin prints
  // them, from the Invitatories that have their Latin.
  const antiphons = new Map<string, Set<string>>()
  let versicle: StoredLatin['body'][number] | undefined
  let psalm94: StoredLatin | undefined
  for (const ref of refs) {
    const latin = latinOfRef.get(ref)
    const antiphon = antiphonOf(ref)
    if (!latin || latin.slot !== 'invitatory' || !antiphon) continue
    const body = latin.body
    const at = body.findIndex((l) => typeof l !== 'string' && 'r' in l && /^Ant\.?$/.test(l.r.trim()))
    const said = at === -1 ? undefined : body.slice(at + 1).find((l) => typeof l === 'string')
    if (typeof said === 'string') antiphons.set(key(antiphon), (antiphons.get(key(antiphon)) ?? new Set()).add(said))
    versicle ??= body.find((l) => typeof l !== 'string' && 'v' in l)
    psalm94 ??= latin
  }
  // Psalms 99(100), 66(67) and 23(24) as the hours that say them print them.
  const psalms = new Map<string, StoredLatin>()
  for (const [ref, latin] of latinOfRef)
    if (latin.slot !== 'invitatory' && /^Psalmus (99|66|23) \(/.test(latin.title ?? '') && !refs.includes(ref))
      psalms.set(/^Psalmus (\d+)/.exec(latin.title ?? '')?.[1] ?? '', latin)
  const psalmBody = (n: string): StoredLatin['body'] | undefined => {
    if (n !== '94') {
      const latin = psalms.get(n)
      return latin && [{ r: `${latin.title}\n${latin.subtitle ?? ''}` }, ...latin.body]
    }
    if (!psalm94) return undefined
    const from = psalm94.body.findIndex((l) => typeof l !== 'string' && 'r' in l && /^Psalmus 94/.test(l.r))
    // Its strophes and title, without the antiphon said between them.
    return psalm94.body
      .slice(from)
      .filter((l, i, all) => {
        const before = all[i - 1]
        const afterAnt = typeof before !== 'string' && before && 'r' in before && /^Ant\.?$/.test(before.r.trim())
        return !afterAnt && (typeof l === 'string' || ('r' in l && /^Psalmus/.test(l.r)))
      })
  }

  let given = 0
  for (const { id, parts } of built)
    parts.forEach((latin, i) => {
      const ref = `${id}.${i}`
      if (latin || !refs.includes(ref)) return
      const n = psalmOf(ref)
      const antiphon = antiphonOf(ref)
      const found = antiphon ? [...(antiphons.get(key(antiphon)) ?? [])] : []
      const body = n ? psalmBody(n) : undefined
      if (!body) return
      // The antiphon where one Latin is known for its words; else the
      // versicle and the psalm without it.
      const alleluia = antiphon !== undefined && /alel[uú]ia/i.test(antiphon)
      const one = new Set(found.map((f) => key(f))).size === 1
      const said = !one
        ? undefined
        : (found.find((f) => /allel[uú]ia/i.test(f) === alleluia) ??
          (alleluia ? `${found[0].trim().replace(/[.!]$/, '')}, allelúia.` : undefined))
      parts[i] = {
        slot: 'invitatory',
        body: [...(versicle ? [versicle] : []), ...(said ? [{ r: 'Ant.' }, said] : []), ...body],
      }
      filledBy.push(`${ref}\tinvitatory`)
      given++
    })
  return given
}

function write(report: string, index: Index, files: string[]) {
  const votes: Votes = {}
  for (const file of files) {
    const part: Votes = JSON.parse(readFileSync(file, 'utf8'))
    for (const [ref, byKey] of Object.entries(part))
      for (const [key, entry] of Object.entries(byKey)) {
        const into = ((votes[ref] ??= {})[key] ??= { ...entry, votes: 0 })
        into.votes += entry.votes
        if (entry.first < into.first) into.first = entry.first
      }
  }
  const out = join(root, 'latin')
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out)
  const lines = ['ref\tslot\tvotes\tof\tcandidates\tfirst\tlatin\tother']
  let kept = 0
  let total = 0
  const collects = missalCollects()
  const witness = { agree: 0, differ: 0, filled: 0 }
  // The prayers only the Missal gave, for reading over.
  const filled: string[] = ['ref\tportuguese\tlatin']
  // How many days gave each part the Latin it is kept with, of how many.
  const support: string[] = ['ref\tvotes\tof']
  const built: { file: string; id: string; parts: (StoredLatin | null)[] }[] = []
  for (const file of readdirSync(join(root, 'parts')).filter((f) => f.endsWith('.json')).sort()) {
    const bundle = cached<{ id: string; parts: unknown[] }>(`parts/${file}`)
    total += bundle.parts.length
    const parts = bundle.parts.map((_, i) => {
      const ref = `${bundle.id}.${i}`
      // The days vote on the words; a slip of the pen or a stray space is the
      // same text, written as most of its days write it.
      const groups = new Map<string, { votes: number; first: string; spellings: Candidate[] }>()
      for (const candidate of Object.values(votes[ref] ?? {})) {
        const key = wordsOf(candidate.latin)
        const group = groups.get(key) ?? { votes: 0, first: candidate.first, spellings: [] }
        group.votes += candidate.votes
        if (candidate.first < group.first) group.first = candidate.first
        group.spellings.push(candidate)
        groups.set(key, group)
      }
      const great = greatAntiphonOf(flat(bundle.parts[i] as Blocks))
      const ranked = [...groups.values()]
        .filter(
          (g) =>
            !great ||
            great.test(latinTexts(latinSection(g.spellings[0].latin).body).join(' ').trim()),
        )
        .sort((a, b) => b.votes - a.votes)
      const [best, next] = ranked
      const missalMatch = bundle.id.startsWith('prayer-')
        ? missalLatinOf([bundle.parts[i] as Blocks], collects)
        : undefined
      const fromMissal = missalMatch?.latin
      let confirmed = false
      if (!best) {
        if (!fromMissal || withheld.has(ref)) return null
        witness.filled++
        kept++
        filled.push([ref, JSON.stringify(flat(bundle.parts[i] as Blocks).slice(0, 120)), JSON.stringify(fromMissal.slice(0, 120))].join('\t'))
        return { slot: 'prayer', body: [fromMissal] }
      }
      if (fromMissal) {
        const voted = latinTexts(latinSection(best.spellings[0].latin).body).join(' ')
        // The Missal's words within the breviary's: the closing formula is
        // written out in one and not the other.
        const missal = wordSet(fromMissal)
        const within = [...missal].filter((w) => wordSet(voted).has(w)).length / (missal.size || 1)
        if (within >= 0.8) {
          witness.agree++
          confirmed = true
        }
        else {
          // Two collects: the one whose Brazilian in the Missal is nearer the
          // breviary's (a feast's day and its vigil are worded alike).
          witness.differ++
          const ours = nearness([bundle.parts[i] as Blocks], voted, collects)
          const missalWins = ours === undefined || (missalMatch && missalMatch.score > ours)
          lines.push([ref, 'prayer', best.votes, '', missalWins ? 'missal kept' : 'missal set aside', best.first, JSON.stringify(voted.slice(0, 80)), JSON.stringify(fromMissal.slice(0, 80))].join('\t'))
          if (missalWins) {
            kept++
            return { slot: 'prayer', body: [fromMissal] }
          }
        }
      }
      const all = ranked.reduce((n, g) => n + g.votes, 0)
      const spelt = best.spellings.sort((a, b) => b.votes - a.votes)[0].latin
      // A short reading's versicle goes by the season, which the two editions
      // keep otherwise: the reading alone.
      const latin = isShortReading(spelt) ? withoutVersicle(spelt) : spelt
      if (next) {
        const nextLatin = next.spellings.sort((a, b) => b.votes - a.votes)[0].latin
        lines.push(
          [ref, latin.slot, best.votes, all, ranked.length, best.first, saidOf(latin), saidOf(nextLatin)].join('\t'),
        )
      }
      // A tie is no answer, nor a part too few days gave, nor one found wrong.
      if (next && next.votes === best.votes) return null
      if (best.votes < fewestDays && !confirmed) return null
      if (withheld.has(ref)) return null
      kept++
      support.push(`${ref}\t${best.votes}\t${all}`)
      return latin
    })
    built.push({ file, id: bundle.id, parts })
  }
  const cited = byCitation(built, index)
  const shared = sameWords(built)
  const invited = invitatories(built)
  for (const { file, id, parts } of built)
    if (parts.some(Boolean)) writeFileSync(join(out, file), `${JSON.stringify({ id, parts })}\n`)
  writeFileSync(report, `${lines.join('\n')}\n`)
  writeFileSync(report.replace(/(\.\w+)?$/, '.missal$1'), `${filled.join('\n')}\n`)
  writeFileSync(report.replace(/(\.\w+)?$/, '.support$1'), `${support.join('\n')}\n`)
  writeFileSync(report.replace(/(\.\w+)?$/, '.filled$1'), `${filledBy.join('\n')}\n`)
  console.log(
    `${kept + cited + shared + invited} of ${total} parts have their Latin (${cited} by citation, ${shared} as another part in the same words, ${invited} Invitatories put together); ${lines.length - 1} were given more than one`,
  )
  console.log(`the Missal's collects: ${witness.agree} agree, ${witness.differ} differ, ${witness.filled} filled in`)
}

async function main() {
  const [mode, ...args] = process.argv.slice(2)
  if (mode === 'index') {
    const [crawl, from, to, out] = args
    writeFileSync(out, JSON.stringify(indexOf(crawl, from, to)))
  } else if (mode === 'votes') {
    const [crawl, from, to, out, indexFile] = args
    const index = indexFile ? (JSON.parse(readFileSync(indexFile, 'utf8')) as Index) : undefined
    writeFileSync(out, JSON.stringify(await votesOf(crawl, from, to, index)))
    writeFileSync(out.replace(/\.json$/, '.seen.json'), JSON.stringify(unseen))
  } else if (mode === 'write') {
    const [report, indexFile, ...files] = args
    const index = JSON.parse(readFileSync(indexFile, 'utf8')) as Index
    write(report, index, files.filter((f) => !f.endsWith('.seen.json')))
  } else {
    throw new Error(
      'usage: build.ts index <crawl> <from> <to> <out> | votes <crawl> <from> <to> <out> [index] | write <report> <votes>...',
    )
  }
}

main()
