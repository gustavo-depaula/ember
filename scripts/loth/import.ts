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
  lookup,
  type OfficeKey,
  officeKey,
} from '../../packages/loth/src/index-types'
import { type Hour, hours, officeOf } from '../../packages/loth/src/office'
import type { Block } from '../../packages/loth/src/text'
import { buildLayers, type Observation } from './layers'
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

const parts = new Map<string, Block[]>()
// text id -> [slot, part id][]
const textParts = new Map<string, [string, string][]>()
for (const line of readFileSync(join(dumps, 'textos.jsonl'), 'utf8').split('\n')) {
  if (!line) continue
  const text = JSON.parse(line) as { id: string; hora: string; html: string }
  const cut = slotsOf(relink(normalize(text.html)), text.hora)
  textParts.set(
    text.id,
    cut.map((part) => {
      const id = sha(part.blocks)
      if (!parts.has(id)) parts.set(id, part.blocks)
      return [part.slot, id]
    }),
  )
}
console.log(`${textParts.size} texts, ${parts.size} parts`)

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
    const sequence = (textParts.get(text) as [string, string][]).map(([slot]) => slot)
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
  for (const slot of order) {
    const observations: Observation[] = list.map(({ key, text }) => ({
      key,
      value: (textParts.get(text) as [string, string][]).find(([s]) => s === slot)?.[1] ?? '',
    }))
    slots[slot] = buildLayers(observations, hour === 'invitatory')
  }
  indexes.set(hour, { order, slots })

  // Every observed hour must come back part for part.
  let wrong = 0
  for (const { key, text, date } of list) {
    const cut = textParts.get(text) as [string, string][]
    const got = order.map((slot) => lookup(slots[slot], key)).filter(Boolean).join(' ')
    if (got !== cut.map(([, part]) => part).join(' ') && wrong++ < 3) console.log('  WRONG', hour, date)
  }
  if (holdout) {
    const unseen = all.filter((o) => o.date >= holdout)
    let same = 0
    let sameWords = 0
    const letters = (ids: string[]) =>
      ids
        .flatMap((id) => (parts.get(id) as Block[]).map((b) => b.lines.map((l) => l.map((x) => (typeof x === 'string' ? x : x.t)).join('')).join('')))
        .join('')
        .replace(/[^\p{L}\p{N}]/gu, '')
        .toLowerCase()
    const misses: string[] = []
    for (const { key, text, date } of unseen) {
      const want = (textParts.get(text) as [string, string][]).map(([, part]) => part)
      const got = order.map((slot) => lookup(slots[slot], key)).filter((p): p is string => Boolean(p))
      if (got.join(' ') === want.join(' ')) same++
      else if (letters(got) === letters(want)) sameWords++
      else misses.push(`${date} ${key.C}`)
    }
    console.log(`  holdout ${hour}: ${unseen.length} unmet keys, ${same} exact, ${sameWords} same words, ${misses.length} differ  ${misses.slice(0, 6).join(', ')}`)
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
  console.log(
    `${hour}: ${list.length} keys, ${order.length} slots, wrong ${wrong}\n   ` +
      [...perLayer].map(([k, n]) => `${k || '-'}:${n}`).join(' '),
  )
}

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
      for (const slot of index.order) {
        const part = lookup(index.slots[slot], key)
        if (!part || seen.has(part)) continue
        seen.add(part)
        const group = slot.replace(/~\d+$/, '').replace(/-\d+/, '').replace(/^(ant|collect)-end$/, '$1')
        groups.set(group, [...(groups.get(group) ?? []), part])
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
              .map(([at, part]) => [at, part && (bundleOf.get(part) as string)]),
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
      html
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .normalize('NFC')
        .replace(/[^\p{L}\p{N}]/gu, '')
        .toLowerCase(),
    )
    .digest()
    .subarray(0, 3)
const htmlOf = new Map<string, string>()
for (const line of readFileSync(join(dumps, 'textos.jsonl'), 'utf8').split('\n')) {
  if (!line) continue
  const text = JSON.parse(line) as { id: string; html: string }
  htmlOf.set(text.id, text.html)
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
