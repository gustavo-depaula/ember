/**
 * Generate the OF liturgical calendar from the canonical ember-extra data
 * (synced into content/of-data/calendar) instead of the hand-authored, drifting
 * content/liturgical/entries.json.
 *
 * Output: content/liturgical/of-calendar.json — an array of LiturgicalEntry
 * (OF half only), consumed by @ember/liturgical's buildYearCalendar(form='of').
 *
 * Movable celebrations (the four tempore solemnities + movable sanctorals) carry
 * no date in the upstream; their dates are computed from a code→rule table here,
 * the single place that knowledge lives. This is what restores correct precedence
 * (Trinity > Visitation on 2026-05-31) and the missing Monday-after-Pentecost
 * memorial (Mary, Mother of the Church).
 *
 * Usage: node scripts/build-of-calendar.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const calDir = resolve(root, 'content/of-data/calendar')
const outPath = resolve(root, 'content/liturgical/of-calendar.json')

// Regions we skip for the universal calendar (jurisdiction handling is a later phase).
const REGION_SCOPES = new Set([
  'africa', 'argentina', 'australia', 'austria', 'brazil', 'canada', 'chile',
  'colombia', 'cuba', 'dominican-republic', 'ecuador', 'el-salvador',
  'england-and-wales', 'france', 'german-speaking', 'guatemala', 'haiti',
  'honduras', 'ireland', 'italy', 'mexico', 'nicaragua', 'nigeria', 'panama',
  'paraguay', 'peru', 'philippines', 'portugal', 'puerto-rico', 'scotland',
  'spain', 'switzerland', 'united-states', 'uruguay', 'venezuela',
])

// Movable celebrations that lack a date upstream → date rule (LiturgicalDate).
// Verified facts: Trinity = Easter+56; Corpus Christi (universal) = Easter+60;
// Sacred Heart = Easter+68; Christ the King = Sunday before Advent I;
// Mary, Mother of the Church = Monday after Pentecost = Easter+50;
// Immaculate Heart of Mary = Saturday after Sacred Heart = Easter+69.
const movableDates = {
  'tempore.solemnity.most-holy-trinity': { type: 'easter_relative', offset: 56 },
  'tempore.solemnity.corpus-christi': { type: 'easter_relative', offset: 60 },
  'tempore.solemnity.sacred-heart-of-jesus': { type: 'easter_relative', offset: 68 },
  'tempore.solemnity.christ-the-king': { type: 'anchor_relative', anchor: 'christ_the_king' },
  'sanctorale.movable.05-35': { type: 'easter_relative', offset: 50 },
  'sanctorale.movable.05-32': { type: 'easter_relative', offset: 69 },
}

function normalizeRank(rank) {
  if (rank === 'optional-memorial') return 'optional_memorial'
  return rank
}

function toName(title) {
  if (!title) return {}
  const name = {}
  if (title.en) name['en-US'] = title.en
  if (title.la) name.la = title.la
  if (title['pt-BR']) name['pt-BR'] = title['pt-BR']
  return name
}

function inferCategory(id, title) {
  if (id.startsWith('tempore.solemnity.')) return 'solemnity_temporal'
  const en = (title?.en ?? '').toLowerCase()
  if (en.includes('blessed virgin mary') || en.includes('our lady')) return 'blessed_virgin_mary'
  return 'other'
}

function dateForEntry(id, raw) {
  if (movableDates[id]) return movableDates[id]
  if (raw.date && typeof raw.date.month === 'number' && typeof raw.date.day === 'number') {
    return { type: 'fixed', month: raw.date.month, day: raw.date.day }
  }
  return undefined
}

function isRegional(id) {
  const last = id.split('.').pop()
  return REGION_SCOPES.has(last)
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

const entries = []
const skipped = []

// 1) Movable tempore solemnities (Trinity, Corpus Christi, Sacred Heart, Christ the King).
for (const file of readdirSync(resolve(calDir, 'tempore/solemnity'))) {
  if (!file.endsWith('.json')) continue
  const raw = loadJson(resolve(calDir, 'tempore/solemnity', file))
  const date = dateForEntry(raw.id, raw)
  if (!date) {
    skipped.push(`${raw.id} (no date rule)`)
    continue
  }
  entries.push({
    id: raw.id,
    name: toName(raw.title),
    category: inferCategory(raw.id, raw.title),
    of: { rank: normalizeRank(raw.rank), date },
    description: {},
  })
}

// 2) Sanctoral — fixed (sanctorale/MM-DD.json) + movable (sanctorale/movable/05-XX.json),
//    universal only. Driven by the _index so we pick up exactly the catalogued ids.
const index = loadJson(resolve(calDir, 'sanctorale/_index.json'))
for (const id of index.ids) {
  if (isRegional(id)) continue
  const rel = id.replace(/^sanctorale\./, '').replace(/\./g, '/') // 05-31 | movable/05-35
  const path = resolve(calDir, 'sanctorale', `${rel}.json`)
  let raw
  try {
    raw = loadJson(path)
  } catch {
    skipped.push(`${id} (file not found: ${rel}.json)`)
    continue
  }
  const date = dateForEntry(id, raw)
  if (!date) {
    skipped.push(`${id} (no date rule)`)
    continue
  }
  entries.push({
    id,
    name: toName(raw.title),
    category: inferCategory(id, raw.title),
    of: { rank: normalizeRank(raw.rank), date },
    description: {},
  })
}

entries.sort((a, b) => a.id.localeCompare(b.id))
writeFileSync(outPath, `${JSON.stringify(entries, null, 0)}\n`, 'utf-8')

console.log(`Wrote ${entries.length} OF entries → ${outPath}`)
if (skipped.length) {
  console.log(`Skipped ${skipped.length}:`)
  for (const s of skipped) console.log(`  - ${s}`)
}
