// Builds `content/loth/` and the tests' reference from the archive's dumps
// (`dump.py`). The method is in research/liturgia-das-horas/README.md.
//
//   npx tsx scripts/loth/import.ts <dumps dir> [--check | --slots | --holdout <year>]

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LothCalendar } from '../../packages/loth/src/day'
import {
  type HourIndex,
  invitatoryPsalms,
  applies,
  celebrationCoverage,
  lookup,
  type OfficeKey,
  officeKey,
  project,
  seasonCoverage,
} from '../../packages/loth/src/index-types'
import { type Hour, hours, officeOf } from '../../packages/loth/src/office'
import { type Block, wordsOf, wordsOfBlocks } from '../../packages/loth/src/text'
import { withoutSlips } from './corrections'
import { buildLayers, type Observation, setDiffUntold } from './layers'
import { normalize } from './normalize'
import { slotsOf } from './slots'

const dumps = process.argv[2]
const root = join(__dirname, '../..')
const out = join(root, 'content/loth')

const theirHour: Record<Hour, string> = {
  invitatory: 'invitatorio',
  readings: 'leituras',
  lauds: 'laudes',
  terce: 'terca',
  sext: 'sexta',
  none: 'nona',
  vespers: 'vesperas',
  compline: 'completas',
}

const calendar: LothCalendar = JSON.parse(readFileSync(join(out, 'calendar.json'), 'utf8'))
const days: Record<string, string>[] = JSON.parse(readFileSync(join(dumps, 'cal.json'), 'utf8'))
const keys: { chave: string; texto_id: string }[] = JSON.parse(
  readFileSync(join(dumps, 'chaves.json'), 'utf8'),
)
const textOfKey = new Map(keys.map((k) => [k.chave, k.texto_id]))
// season -> hour and Sunday -> year of the cycle -> antiphon of the Gospel canticle
const sundays: Record<string, Record<string, Record<string, string>>> = JSON.parse(
  readFileSync(join(dumps, 'domingos.json'), 'utf8'),
)

// ---- texts to parts --------------------------------------------------------

const sha = (value: unknown) =>
  createHash('sha1').update(JSON.stringify(value)).digest('hex').slice(0, 12)

const extraIds = new Map<string, string>()
const extraId = (url: string) => {
  const id = url.replace(/^.*\//, '').replace(/\.htm$/, '')
  extraIds.set(url, id)
  return id
}
function relink(blocks: Block[]): Block[] {
  return blocks.map((block) => ({
    ...block,
    lines: block.lines.map((line) =>
      line.map((seg) =>
        typeof seg !== 'string' && seg.to ? { ...seg, to: extraId(seg.to) } : seg,
      ),
    ),
  }))
}

// The same words are one part however a given hour happens to mark them up.
// The source cuts a memorial's hour out of the weekday's and loses a red
// label or a line break on the way; kept apart, the two would look like the
// saint having psalms of his own. Of the variants, the one that kept the most
// of its markup is the part.
const lineOf = (line: Block['lines'][number]) => line.map((seg) => (typeof seg === 'string' ? seg : seg.t)).join('')
const marked = (blocks: Block[]) =>
  // A variant set all in capitals is the one a source file shouted.
  (/\p{L}{4}/u.test(lineOf(blocks[0]?.lines[0] ?? [])) && lineOf(blocks[0].lines[0]) === lineOf(blocks[0].lines[0]).toUpperCase() ? -1000 : 0) +
  blocks.reduce(
    (n, block) =>
      n +
      (block.k === 'title' ? 2 : 0) +
      block.lines.length +
      // The red marks are the book's; a hand that set a prayer in italic or bold
      // in one hour and not in another added nothing to it.
      block.lines.reduce(
        (m, line) =>
          m +
          line.reduce(
            (k, seg) => k + (typeof seg === 'string' ? 0 : seg.m === 'italic' || seg.m === 'bold' ? -1 : 1),
            0,
          ),
        0,
      ),
    0,
  )

const parts = new Map<string, Block[]>()
// text id -> [slot, part id][]
const textParts = new Map<string, [string, string][]>()
for (const line of readFileSync(join(dumps, 'textos.jsonl'), 'utf8').split('\n')) {
  if (!line) continue
  const text = JSON.parse(line) as { id: string; hora: string; html: string }
  const cut = slotsOf(relink(normalize(withoutSlips(text.html))), text.hora)
  // One Sunday's Lauds has the antiphon's label run into the line above it,
  // and so the canticle's own title left with the heading.
  for (const [i, part] of cut.entries()) {
    const last = part.blocks[0]?.lines.at(-1)?.at(-1)
    if (part.slot !== 'canticle-title' || typeof last !== 'object' || last.m !== 'rubric' || !/ Ant\.$/.test(last.t)) continue
    last.t = last.t.replace(/ Ant\.$/, '')
    if (cut[i + 1]?.slot === 'canticle') cut[i + 1].blocks.unshift(...part.blocks.splice(1))
  }
  textParts.set(
    text.id,
    cut.map((part) => {
      const id = sha(wordsOfBlocks(part.blocks))
      const kept = parts.get(id)
      const better =
        !kept ||
        marked(part.blocks) > marked(kept) ||
        (marked(part.blocks) === marked(kept) && JSON.stringify(part.blocks) < JSON.stringify(kept))
      if (better) parts.set(id, part.blocks)
      return [part.slot, id]
    }),
  )
}
console.log(`${textParts.size} texts, ${parts.size} parts`)
if (process.env.LOTH_SLOT) {
  const seen = new Map<string, number>()
  for (const cut of textParts.values())
    for (const [slot, id] of cut) if (slot.replace(/\d/g, 'N').startsWith(process.env.LOTH_SLOT)) seen.set(id, (seen.get(id) ?? 0) + 1)
  console.log(`  ${process.env.LOTH_SLOT}: ${seen.size} distinct parts`)
  for (const [id, n] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 14))
    console.log(`    ${n}× ${JSON.stringify(parts.get(id)).slice(0, 200)}`)
}

setDiffUntold((slot, o, below) => {
  const flat = (id: string | undefined) =>
    id
      ? (parts.get(id) as Block[])
          .map((b) => b.lines.map((l) => l.map((x) => (typeof x === 'string' ? x : x.t)).join('')).join(' / '))
          .join(' // ')
      : ''
  const a = flat(o.value)
  const b = flat(below)
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  console.log(
    `     DIFF ${slot.hour} ${slot.slot} ${o.key.C} ${o.key.s} w${o.key.w} d${o.key.d} (${a.length} vs ${b.length} chars, differ at ${i})\n        saint's: …${a.slice(Math.max(0, i - 50), i + 90)}\n        below:   …${b.slice(Math.max(0, i - 50), i + 90)}`,
  )
})

// ---- what the archive lacks ------------------------------------------------

// The app set the Sunday's antiphon of the Gospel canticle into the hour as it
// was shown, from a table by year of the cycle, and the archive's hours were
// taken before that: outside Ordinary Time they have the label and no
// antiphon. The table supplies it. Parts that come from it are kept apart
// (`supplied`), so the tests can still hold the rest of the hour to the archive.
const supplied = new Set<string>()
const isSaid = (id: string | undefined) =>
  Boolean(id) && wordsOfBlocks(parts.get(id as string) as Block[]).replace(/^ant\d?/, '') !== ''

const ofSeason: Record<string, string> = { advent: 'Advento', lent: 'Quaresma', easter: 'Pascoa', 'ordinary-time': 'TC' }
const ofCelebration: Record<string, [string, string]> = {
  'tempore.holy-week.palm-sunday': ['Quaresma', 'ramos'],
  'tempore.christmas.holy-family': ['Natal', 'sagradafamilia'],
}
function sundayAntiphon(hour: Hour, key: OfficeKey): string | undefined {
  if (hour !== 'lauds' && hour !== 'vespers') return undefined
  const which = hour === 'lauds' ? 'laudes' : key.g ? 'vesperasI' : 'vesperasII'
  const own = ofCelebration[key.C]
  if (own) return sundays[own[0]][which + own[1]]?.[key.c]
  if (key.C || !(key.d === '0' || key.g === 'eve')) return undefined
  const season = ofSeason[key.s]
  // The evening before belongs to the week that is ending.
  const sunday = Number(key.w) + (key.g === 'eve' ? 1 : 0)
  return sundays[season]?.[which + (season === 'TC' ? String(sunday).padStart(2, '0') : sunday)]?.[key.c]
}

function antiphonPart(text: string): string {
  const [first, ...rest] = text.split('\n')
  const blocks: Block[] = [{ k: 'p', lines: [[{ m: 'rubric', t: 'Ant.' }, ` ${first}`], ...rest.map((line) => [line])] }]
  // Its own part even where the archive has the same words elsewhere, so that
  // what was supplied can always be told from what was found.
  const id = `supplied-${sha(wordsOfBlocks(blocks))}`
  parts.set(id, blocks)
  supplied.add(id)
  return id
}

// From 17 December the Magnificat has the antiphon of the date ("Ó
// Sabedoria"…), the Sunday's Vespers as any other day's; the archive has it on
// the weekdays. The evening before a Sunday is keyed by the Sunday's date.
function antiphonOfTheDate(key: OfficeKey): string | undefined {
  if (key.s !== 'advent' || !key.k || key.C) return undefined
  const [month, day] = key.k.split('-').map(Number)
  const date = `${String(month).padStart(2, '0')}-${String(day - (key.g === 'eve' ? 1 : 0)).padStart(2, '0')}`
  if (date < '12-17' || date > '12-23') return undefined
  for (const seen of observed.get('vespers')?.values() ?? []) {
    if (seen.key.k !== date || seen.key.C || seen.key.g || seen.key.d === '0') continue
    const theirs = (textParts.get(seen.text) as [string, string][]).find(([slot]) => slot === 'canticle-ant')?.[1]
    if (!isSaid(theirs)) continue
    const lines = (parts.get(theirs as string) as Block[]).flatMap((block) => block.lines.map(lineOf))
    return antiphonPart(lines.join('\n').replace(/^Ant\.\s*/, ''))
  }
  return undefined
}

const disagreements = new Set<string>()
// Where the archive has a text and the corpus another.
const corrected = new Set<string>()
/** A text's parts as a day has them: the archive's, and what it lacks. */
function cutOf(hour: Hour, key: OfficeKey, text: string): [string, string][] {
  const cut = textParts.get(text) as [string, string][]
  if (cut[0][0] === 'whole') return cut
  // The archive's second Vespers of Christ the King stop after the responsory.
  // What follows is as at the first (the book gives both the same
  // intercessions and prayer), but for the antiphon, which is taken from
  // liturgiadashoras.online.
  if (hour === 'vespers' && key.C === 'tempore.solemnity.christ-the-king' && !key.g && !cut.some(([slot]) => slot === 'canticle')) {
    const first = [...(observed.get('vespers')?.values() ?? [])].find((o) => o.key.C === key.C && o.key.g === 'first')
    if (!first) throw new Error('no first Vespers of Christ the King to complete the second from')
    const theirs = textParts.get(first.text) as [string, string][]
    const antiphon = antiphonPart('Todo poder foi-me dado no céu e na terra,\nafirmou o Senhor.')
    const copy = (id: string) => {
      parts.set(`supplied-${id}`, parts.get(id) as Block[])
      supplied.add(`supplied-${id}`)
      return `supplied-${id}`
    }
    return [
      ...cut,
      ...theirs
        .slice(theirs.findIndex(([slot]) => slot === 'canticle-title'))
        .map(([slot, id]): [string, string] => [slot, slot.startsWith('canticle-ant') ? antiphon : copy(id)]),
    ]
  }
  if (!cut.some(([slot]) => slot === 'canticle')) return cut
  const theirs = cut.find(([slot]) => slot === 'canticle-ant')?.[1]
  const antiphon = sundayAntiphon(hour, key)
  const sunday = hour === 'vespers' && (key.d === '0' || key.g === 'eve')
  const ofTheDate = sunday ? antiphonOfTheDate(key) : undefined
  const same = (a: string, b: string) => wordsOfBlocks(parts.get(a) as Block[]) === wordsOfBlocks(parts.get(b) as Block[])
  // On a Sunday that is 17 December the archive has the 18th's.
  const mistaken = isSaid(theirs) && ofTheDate !== undefined && !same(theirs as string, ofTheDate)
  if (mistaken)
    corrected.add(
      `${hour} ${key.k}${key.g && ` (${key.g})`}: ${lineOf((parts.get(theirs as string) as Block[])[0].lines[0])} → ${lineOf((parts.get(ofTheDate as string) as Block[])[0].lines[0])}`,
    )
  if (isSaid(theirs) && !mistaken) {
    if (antiphon && wordsOfBlocks(parts.get(antiphonPart(antiphon)) as Block[]) !== wordsOfBlocks(parts.get(theirs as string) as Block[]))
      disagreements.add(`${hour} ${key.C || key.s} ${key.w}${key.g} ${key.c}: ${lineOf((parts.get(theirs as string) as Block[])[0].lines[0])} ≠ ${antiphon.split('\n')[0]}`)
    return cut
  }
  const part = ofTheDate ?? (antiphon ? antiphonPart(antiphon) : undefined)
  if (!part) return cut
  const isAntiphon = (slot: string) => slot === 'canticle-ant' || slot === 'canticle-ant-end'
  return cut
    .filter(([slot]) => !isAntiphon(slot))
    .flatMap((entry): [string, string][] =>
      entry[0] === 'canticle' ? [['canticle-ant', part], entry, ['canticle-ant-end', part]] : [entry],
    )
}

// ---- observations ----------------------------------------------------------

// hour -> key (serialised) -> text id
const observed = new Map<Hour, Map<string, { key: OfficeKey; text: string; date: string }>>()
const conflicts: string[] = []
function observe(hour: Hour, key: OfficeKey, text: string | undefined, date: string) {
  if (!text) return
  const byKey = observed.get(hour) ?? new Map()
  observed.set(hour, byKey)
  const at = JSON.stringify(key)
  const seen = byKey.get(at)
  if (seen && seen.text !== text) conflicts.push(`${hour} ${date} vs ${seen.date} ${at}`)
  if (!seen) byKey.set(at, { key, text, date })
}

for (const day of days) {
  const [y, m, d] = day.data.split('-').map(Number)
  const date = new Date(y, m - 1, d, 12)
  for (const hour of hours) {
    const office = officeOf(date, hour, calendar)
    const theirs = day[`chave_${theirHour[hour]}`]
    const base = textOfKey.get(theirs)
    const psalms = hour === 'invitatory' ? invitatoryPsalms : (['94c'] as const)
    for (const psalm of psalms) {
      const suffix = psalm === '94c' ? '' : `|SALMO${psalm}`
      const text = suffix ? textOfKey.get(theirs + suffix) : base
      const c = office.celebration
      if (!c) {
        observe(hour, officeKey(office, 'season', psalm), text, day.data)
        continue
      }
      if (c.rank !== 'memorial') {
        observe(hour, officeKey(office, 'celebration', psalm), text, day.data)
        continue
      }
      if (c.obligatory) {
        observe(hour, officeKey(office, 'celebration', psalm), text, day.data)
        if (!suffix)
          observe(hour, officeKey(office, 'season', psalm), textOfKey.get(`${theirs}|TEMPO`), day.data)
        continue
      }
      // The Invitatory of an optional memorial is given with the saint's
      // antiphon only; the weekday's is the one any other weekday has.
      if (hour === 'invitatory') {
        observe(hour, officeKey(office, 'celebration', psalm), text, day.data)
        continue
      }
      // An optional memorial: the archive's own text is the weekday's, and the
      // saint's is filed beside it where it differs.
      observe(hour, officeKey(office, 'season', psalm), text, day.data)
      if (!suffix)
        observe(
          hour,
          officeKey(office, 'celebration', psalm),
          textOfKey.get(`${theirs}|MEMORIA`) ?? text,
          day.data,
        )
    }
  }
}
console.log(`conflicts: ${conflicts.length}`)
{
  const byDate = new Map(days.map((d) => [d.data, d]))
  const kinds = new Map<string, string[]>()
  for (const c of conflicts) {
    const [hour, a, , b] = c.split(' ')
    const tag = (iso: string) => {
      const d = byDate.get(iso) as Record<string, string>
      const k = d.chave_laudes.split('|')
      return `${d.tipo || 'feria'}${d.tipo === 'Memória' ? (k[12] === '1' ? '-obl' : '-opt') : ''}`
    }
    const kind = `${hour} ${tag(a)} / ${tag(b)}`
    kinds.set(kind, [...(kinds.get(kind) ?? []), c])
  }
  for (const [kind, list] of [...kinds].sort((x, y) => y[1].length - x[1].length))
    console.log(`  ${list.length} ${kind}  e.g. ${list[0].slice(0, 260)}`)
}

// ---- layers ----------------------------------------------------------------

/**
 * One order for every slot of an hour, so that an hour is its slots in that
 * order, each present or absent on its own. Fails if two texts disagree.
 */
const isHead = (slot: string) => slot.startsWith('head')

function orderOf(sequences: string[][]): string[] {
  const after = new Map<string, Set<string>>()
  for (const sequence of sequences) {
    for (let i = 0; i < sequence.length; i++) {
      const set = after.get(sequence[i]) ?? new Set()
      after.set(sequence[i], set)
      if (i + 1 < sequence.length) set.add(sequence[i + 1])
    }
  }
  const order: string[] = []
  const state = new Map<string, 1 | 2>()
  const visit = (slot: string, path: string[]) => {
    if (state.get(slot) === 2) return
    if (state.get(slot) === 1) throw new Error(`slots out of order: ${[...path, slot].join(' > ')}`)
    state.set(slot, 1)
    for (const next of after.get(slot) ?? []) visit(next, [...path, slot])
    state.set(slot, 2)
    order.unshift(slot)
  }
  for (const slot of after.keys()) visit(slot, [])
  return order
}

// `--holdout <year>` files only the days before that year and then asks for
// the days from it on that were never met: how well the layers foretell.
const holdout = process.argv.includes('--holdout')
  ? process.argv[process.argv.indexOf('--holdout') + 1]
  : undefined

const indexes = new Map<Hour, HourIndex>()
for (const hour of hours) {
  const all = [...(observed.get(hour)?.values() ?? [])]
  const list = holdout ? all.filter((o) => o.date < holdout) : all
  // The few hours laid out unlike any other (the Easter Vigil's readings) are
  // kept whole, as one part, rather than bend the order of all the rest.
  const uses = new Map<string, { sequence: string[]; texts: Set<string>; count: number }>()
  for (const { text } of list) {
    // What opens the hour is arranged day by day (`@head`), not in one order.
    const sequence = (textParts.get(text) as [string, string][]).map(([slot]) => slot).filter((slot) => !isHead(slot))
    const use = uses.get(sequence.join(' ')) ?? { sequence, texts: new Set(), count: 0 }
    uses.set(sequence.join(' '), use)
    use.texts.add(text)
    use.count++
  }
  const regular: string[][] = []
  let order: string[] = []
  for (const use of [...uses.values()].sort((a, b) => b.count - a.count)) {
    try {
      order = orderOf([...regular, use.sequence])
      regular.push(use.sequence)
    } catch {
      for (const text of use.texts) {
        const blocks = (textParts.get(text) as [string, string][]).flatMap(([, part]) => parts.get(part) as Block[])
        const id = sha(blocks)
        parts.set(id, blocks)
        textParts.set(text, [['whole', id]])
        console.log(`  kept whole: ${hour} ${text} (${use.sequence.join(' ')})`)
      }
    }
  }
  if (order.length < regular.flat().length && [...uses.values()].some((u) => !regular.includes(u.sequence))) order.push('whole')
  const slots: HourIndex['slots'] = {}
  const untold = new Map<string, number>()
  // The slots the engine reads for a day: the hour kept whole, or its opening
  // as that day arranges it and then the rest in order.
  const slotsFor = (key: OfficeKey) =>
    lookup(slots.whole, key) ? ['whole'] : [...(lookup(slots['@head'], key)?.split(' ') ?? []), ...order]
  const assembled = (key: OfficeKey) =>
    slotsFor(key)
      .map((slot) => lookup(slots[slot], key))
      .filter((p): p is string => Boolean(p))
  const arrangement = (text: string) =>
    (textParts.get(text) as [string, string][]).map(([slot]) => slot).filter(isHead).join(' ')
  const heads = [...new Set(list.flatMap(({ text }) => (textParts.get(text) as [string, string][]).map(([slot]) => slot).filter(isHead)))]
  for (const slot of ['@head', ...heads, ...order]) {
    // An hour kept whole says nothing about the parts of the others.
    const isWhole = (text: string) => (textParts.get(text) as [string, string][])[0][0] === 'whole'
    const observations: Observation[] = list
      .filter(({ text }) => slot === 'whole' || !isWhole(text))
      .map(({ key, text }) => ({
        key,
        value:
          slot === '@head'
            ? arrangement(text)
            : (cutOf(hour, key, text).find(([s]) => s === slot)?.[1] ?? ''),
      }))
    const built = buildLayers(observations, { hour, slot })
    // The Sundays of the table that these years never had, a late Easter's
    // before Lent among them.
    if ((hour === 'lauds' || hour === 'vespers') && (slot === 'canticle-ant' || slot === 'canticle-ant-end')) {
      const byCycle = built.layers.find((layer) => layer.fields.join('') === 'swdgc')
      for (const [season, name] of Object.entries(ofSeason)) {
        for (const [sunday, years] of Object.entries(sundays[name])) {
          const [, which, n] = /^(laudes|vesperasII|vesperasI)(\d+)$/.exec(sunday) ?? []
          if (!which || (which === 'laudes') !== (hour === 'lauds') || !byCycle) continue
          for (const [c, antiphon] of Object.entries(years)) {
            // The year of the cycle begins with Advent's first Sunday, whose
            // eve is that Sunday's own first Vespers.
            const eve = which === 'vesperasI'
            const first = eve && season === 'advent' && Number(n) === 1
            const at = [season, String(Number(n) - (eve && !first ? 1 : 0)), eve && !first ? '6' : '0', eve ? (first ? 'first' : 'eve') : '', c].join('|')
            byCycle.entries[at] ??= antiphonPart(antiphon)
          }
        }
      }
    }
    // At Lauds the fourth Sunday of Advent keeps its own antiphon of the
    // Benedictus on 18-23 December, by the year of the cycle. A date meets a
    // Sunday in years six or eleven apart, as like as not in one year of the
    // cycle only (22 December: a year C both times), and what was seen there
    // would pass for the date's.
    if (hour === 'lauds' && (slot === 'canticle-ant' || slot === 'canticle-ant-end')) {
      const fields: Field[] = ['s', 'k', 'd', 'g', 'c']
      const found = built.layers.find((layer) => layer.fields.join('') === fields.join(''))
      const byDateAndCycle = found ?? { fields, entries: {} }
      if (!found) {
        const ofCelebrations = built.layers.findIndex((layer) => layer.fields.some((f) => 'rKC'.includes(f)))
        built.layers.splice(ofCelebrations < 0 ? built.layers.length : ofCelebrations, 0, byDateAndCycle)
      }
      for (const [c, antiphon] of Object.entries(sundays.Advento.laudes4))
        for (let day = 18; day <= 23; day++) byDateAndCycle.entries[['advent', `12-${day}`, '0', '', c].join('|')] ??= antiphonPart(antiphon)
    }
    slots[slot] = built.layers
    if (built.untold > 0) untold.set(slot, built.untold)
  }
  indexes.set(hour, { order, slots })

  // Every observed hour must come back part for part.
  let wrong = 0
  for (const { key, text, date } of list) {
    const cut = cutOf(hour, key, text)
    const got = assembled(key).join(' ')
    if (got !== cut.map(([, part]) => part).join(' ') && wrong++ < 3)
      console.log('  WRONG', hour, date, cut.map(([slot]) => slot).join(' '), '|', slotsFor(key).filter((slot) => lookup(slots[slot], key)).join(' '))
  }
  if (holdout) {
    const unseen = all.filter((o) => o.date >= holdout)
    let same = 0
    let sameWords = 0
    const letters = (ids: string[]) => wordsOfBlocks(ids.flatMap((id) => parts.get(id) as Block[]))
    const misses: string[] = []
    // Which layer answered, for telling a rule that misled from one that was missing.
    const answeredBy = (slot: string, key: OfficeKey) => {
      const layers = slots[slot] ?? []
      for (let i = layers.length - 1; i >= 0; i--) {
        if (!applies(layers[i], key)) continue
        if (layers[i].entries[project(key, layers[i].fields)] !== undefined) return layers[i].fields.join('') || '-'
      }
      return 'none'
    }
    const flat = (id: string | undefined) =>
      id
        ? (parts.get(id) as Block[])
            .map((b) => b.lines.map((l) => l.map((x) => (typeof x === 'string' ? x : x.t)).join('')).join(' / '))
            .join(' // ')
        : ''
    // The two texts from a little before where they part.
    const apart = (mine: string | undefined, theirs: string | undefined) => {
      const a = flat(mine)
      const b = flat(theirs)
      let i = 0
      while (i < a.length && a[i] === b[i]) i++
      const from = Math.max(0, i - 40)
      return [a, b].map((t) => (t ? `${from > 0 ? '…' : ''}${t.slice(from, i + 100)}` : '(nothing)'))
    }
    const causes = new Map<string, number>()
    // Would the engine have known it was on unchecked ground?
    const metSeasons = new Set(list.map((o) => seasonCoverage(o.key)))
    const metCelebrations = new Set(list.map((o) => celebrationCoverage(o.key)))
    const covered = (key: OfficeKey) =>
      metSeasons.has(seasonCoverage(key)) && (!key.C || metCelebrations.has(celebrationCoverage(key)))
    let flagged = 0
    let silent = 0
    for (const { key, text, date } of unseen) {
      if (!covered(key)) flagged++
      const cut = cutOf(hour, key, text)
      const want = cut.map(([, part]) => part)
      const got = assembled(key)
      if (got.join(' ') === want.join(' ')) same++
      else if (letters(got) === letters(want)) sameWords++
      else {
        misses.push(`${date} ${key.C}`)
        if (covered(key)) silent++
        const mine = slotsFor(key)
        const differing = [...new Set([...mine, ...cut.map(([s]) => s)])].filter(
          (slot) =>
            ((mine.includes(slot) && lookup(slots[slot], key)) || undefined) !==
            cut.find(([s]) => s === slot)?.[1],
        )
        for (const slot of differing) {
          const cause = `${slot.replace(/\d/g, 'N')} via ${answeredBy(slot, key)}`
          causes.set(cause, (causes.get(cause) ?? 0) + 1)
        }
        if (process.argv.includes('--misses')) {
          console.log(`MISS${covered(key) ? '' : '(flagged)'} ${hour} ${date} ${JSON.stringify(key)}`)
          for (const slot of differing.slice(0, 5))
          {
            const [mine, theirs] = apart(
              (lookup(slots.whole, key) ? slot === 'whole' : true) ? lookup(slots[slot], key) || undefined : undefined,
              cut.find(([s]) => s === slot)?.[1],
            )
            console.log(`   [${slot} via ${answeredBy(slot, key)}]\n      engine: ${mine}\n      book:   ${theirs}`)
          }
        }
      }
    }
    console.log(
      `  holdout ${hour}: ${unseen.length} unmet keys, ${same} exact, ${sameWords} same words, ${misses.length} differ; ${flagged} would be flagged, ${silent} differ unflagged\n     ${[...causes].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}:${n}`).join('  ')}`,
    )
    continue
  }
  if (process.argv.includes('--slots')) {
    for (const [slot, layers] of Object.entries(slots)) {
      console.log(`   ${slot}: ` + layers.map((l) => `${l.fields.join('') || '-'}:${Object.keys(l.entries).length}`).join(' '))
      for (const l of layers) if (['Cgpd', 'Cgspd', 'Cgswd'].includes(l.fields.join(''))) { const [at, v] = Object.entries(l.entries)[0]; console.log(`      e.g. ${l.fields.join('')} ${at} -> ${JSON.stringify(parts.get(v)).slice(0, 260)}`) }
    }
  }
  const perLayer = new Map<string, number>()
  for (const layers of Object.values(slots))
    for (const layer of layers) {
      const name = layer.fields.join('')
      perLayer.set(name, (perLayer.get(name) ?? 0) + Object.keys(layer.entries).length)
    }
  if (untold.size > 0)
    console.log(`  untold by any layer: ${[...untold].map(([slot, n]) => `${slot}:${n}`).join(' ')}`)
  console.log(
    `${hour}: ${list.length} keys, ${order.length} slots, wrong ${wrong}\n   ` +
      [...perLayer].map(([k, n]) => `${k || '-'}:${n}`).join(' '),
  )
}

console.log(`supplied: ${supplied.size} antiphons of Sundays; the table and the archive differ on ${disagreements.size}`)
for (const d of disagreements) console.log(`  ${d}`)
for (const c of corrected) console.log(`  corrected ${c}`)
if (process.argv.includes('--check') || holdout) process.exit(0)

// ---- write -----------------------------------------------------------------

// Parts are bundled by kind in the order the year meets them, so the psalms
// of one day sit in one file and an hour opens a handful of bundles.
const bundleOf = new Map<string, string>()
const bundles = new Map<string, Block[][]>()
{
  const groups = new Map<string, string[]>()
  const seen = new Set<string>()
  for (const hour of hours) {
    const index = indexes.get(hour) as HourIndex
    for (const { key } of observed.get(hour)?.values() ?? []) {
      for (const slot of Object.keys(index.slots)) {
        if (slot === '@head') continue
        const part = lookup(index.slots[slot], key)
        if (!part || seen.has(part)) continue
        seen.add(part)
        const group = supplied.has(part)
          ? 'supplied'
          : slot.replace(/~\d+$/, '').replace(/-\d+/, '').replace(/^(ant|collect)-end$/, '$1')
        groups.set(group, [...(groups.get(group) ?? []), part])
      }
    }
    // And what no day of these years reaches.
    for (const [slot, layers] of Object.entries(index.slots)) {
      if (slot === '@head') continue
      for (const part of layers.flatMap((layer) => Object.values(layer.entries))) {
        if (!part || seen.has(part)) continue
        seen.add(part)
        groups.set('supplied', [...(groups.get('supplied') ?? []), part])
      }
    }
  }
  const limit = 180_000
  for (const [group, ids] of groups) {
    let n = 0
    let size = 0
    for (const id of ids) {
      const blocks = parts.get(id) as Block[]
      const bytes = JSON.stringify(blocks).length
      if (size > 0 && size + bytes > limit) {
        n++
        size = 0
      }
      size += bytes
      const name = `${group}-${String(n + 1).padStart(2, '0')}`
      const bundle = bundles.get(name) ?? []
      bundles.set(name, bundle)
      bundleOf.set(id, `${name}.${bundle.length}`)
      bundle.push(blocks)
    }
  }
}

const write = (path: string, value: unknown) => {
  mkdirSync(join(out, path, '..'), { recursive: true })
  writeFileSync(join(out, path), `${JSON.stringify(value)}\n`)
}
rmSync(join(out, 'index'), { recursive: true, force: true })
rmSync(join(out, 'parts'), { recursive: true, force: true })
for (const [hour, index] of indexes) {
  write(`index/${hour}.json`, {
    id: hour,
    order: index.order,
    slots: Object.fromEntries(
      Object.entries(index.slots).map(([slot, layers]) => [
        slot,
        layers.map((layer) => ({
          fields: layer.fields,
          entries: Object.fromEntries(
            Object.entries(layer.entries)
              .sort(([a], [b]) => (a < b ? -1 : 1))
              .map(([at, part]) => [at, slot === '@head' ? part : part && (bundleOf.get(part) as string)]),
          ),
        })),
      ]),
    ),
  })
}
for (const [name, list] of bundles) write(`parts/${name}.json`, { id: name, parts: list })

const extras: { url: string; html: string }[] = JSON.parse(readFileSync(join(dumps, 'lh_extras.json'), 'utf8'))
write('extras.json', Object.fromEntries(extras.map((e) => [extraId(e.url), relink(normalize(e.html))])))
for (const [url, id] of extraIds) if (!extras.some((e) => e.url === url)) console.log(`  no text for the link ${id}`)
console.log(`${bundles.size} bundles`)

// ---- the reference the tests hold the engine to ----------------------------

// Letters and digits of the archive's own HTML, hashed: what every hour must
// still say after normalising, cutting, layering and assembling.
const signature = (html: string) =>
  createHash('sha1')
    .update(
      wordsOf(
        html
          .replace(/<br\s*\/?>|<\/(p|div)>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"'),
      ),
    )
    .digest()
    .subarray(0, 3)
const htmlOf = new Map<string, string>()
for (const line of readFileSync(join(dumps, 'textos.jsonl'), 'utf8').split('\n')) {
  if (!line) continue
  const text = JSON.parse(line) as { id: string; html: string }
  htmlOf.set(text.id, withoutSlips(text.html))
}
const none = Buffer.from([0, 0, 0])
const own: Buffer[] = []
const other: Buffer[] = []
// The archive's name for each celebration -> the corpus's id.
const slug: Record<string, string> = JSON.parse(readFileSync(join(__dirname, 'their-ids.json'), 'utf8'))
const referenceDays: string[] = []
for (const day of days) {
  for (const hour of hours) {
    const theirs = day[`chave_${theirHour[hour]}`]
    const sign = (key: string) => {
      const id = textOfKey.get(key)
      return id ? signature(htmlOf.get(id) as string) : none
    }
    own.push(sign(theirs))
    const memorial = sign(`${theirs}|MEMORIA`)
    other.push(memorial.equals(none) ? sign(`${theirs}|TEMPO`) : memorial)
  }
  referenceDays.push(`${day.proprio ? slug[day.proprio] : ''}|${day.salterio}`)
}
const tests = join(root, 'packages/loth/src/__tests__')
mkdirSync(tests, { recursive: true })
writeFileSync(
  join(tests, 'reference.json'),
  `${JSON.stringify({
    from: days[0].data,
    to: days[days.length - 1].data,
    hours,
    own: Buffer.concat(own).toString('base64'),
    other: Buffer.concat(other).toString('base64'),
    days: referenceDays,
  })}\n`,
)
