#!/usr/bin/env tsx
/**
 * Reconstructs a complete OF lectionary database by:
 * 1. Computing which years to fetch (greedy set-cover over temporal occasions)
 * 2. Fetching from the Liturgia Diária API with rate limiting
 * 3. Writing structured JSON to content/lectionary/of/
 *
 * Usage:
 *   pnpm tsx scripts/build-of-lectionary.ts [--plan-only] [--resume]
 */

import { addDays, format } from 'date-fns'
import * as fs from 'node:fs'
import * as path from 'node:path'

import { buildYearCalendar } from '../packages/liturgical/src/calendar-builder'
import type { LiturgicalEntry, RankOF } from '../packages/liturgical/src/calendar-types'
import {
  getOfLiturgicalPosition,
  getLiturgicalYear,
  getSundayCycle,
  getWeekdayCycle,
} from '../packages/liturgical/src/of-position'
import { getFirstSundayOfAdvent } from '../packages/liturgical/src/season'

// ── Config ──

const yearRange = { start: 2024, end: 2027 }
const contentDir = path.resolve(__dirname, '../content/lectionary/of')
const checkpointPath = path.resolve(__dirname, '.lectionary-checkpoint.json')
const entriesPath = path.resolve(__dirname, '../content/liturgical/entries.json')

const planOnly = process.argv.includes('--plan-only')
const resume = process.argv.includes('--resume')

// ── Types ──

type ProperSection = { text: string; citation?: string }

type ProperDay = {
  [slot: string]: ProperSection
}

type LiturgiaDiariaResponse = {
  data: string
  liturgia: string
  cor: string
  oracoes: {
    coleta: string
    oferendas: string
    comunhao: string
    extras: { titulo: string; texto: string }[]
  }
  leituras: {
    primeiraLeitura: { referencia: string; titulo: string; texto: string }[]
    salmo: { referencia: string; refrao: string; texto: string }[]
    segundaLeitura: { referencia: string; titulo: string; texto: string }[]
    evangelho: { referencia: string; titulo: string; texto: string }[]
    extras: { tipo: string; referencia: string; titulo: string; texto: string }[]
  }
  antifonas: {
    entrada: string
    comunhao: string
  }
}

type CheckpointData = {
  fetched: Record<string, { occasionKey: string; cycleKey: string }>
  // raw API responses keyed by date string
  responses: Record<string, LiturgiaDiariaResponse>
}

// Ranks that suppress temporal readings (OF)
const suppressingRanks = new Set<RankOF>(['solemnity', 'feast'])

// ── Phase 1: Compute optimal years ──

function loadEntries(): LiturgicalEntry[] {
  const raw = fs.readFileSync(entriesPath, 'utf-8')
  return JSON.parse(raw)
}

/**
 * Returns the full occasion key including cycle variant.
 * - Sundays: "{base}/A", "{base}/B", or "{base}/C"
 * - OT weekdays: "{base}/I" or "{base}/II"
 * - Other weekdays: "{base}" (no cycle — same readings every year)
 * - Fixed dates: "{base}" (no cycle)
 */
function getOccasionKey(date: Date): { base: string; full: string } {
  const pos = getOfLiturgicalPosition(date)
  const litYear = getLiturgicalYear(date)
  const isSunday = pos.dayOfWeek === 0
  const base = pos.key

  if (base.startsWith('fixed/')) {
    return { base, full: base }
  }

  if (isSunday) {
    return { base, full: `${base}/${getSundayCycle(litYear)}` }
  }

  if (pos.season === 'ordinary') {
    return { base, full: `${base}/${getWeekdayCycle(litYear)}` }
  }

  return { base, full: base }
}

/**
 * Determines if a date's temporal reading is suppressed by a sanctoral celebration.
 * A date is suppressed when its principal celebration is a solemnity or feast
 * from the sanctoral calendar (i.e., not a temporal/seasonal celebration).
 */
function isSuppressed(
  dateStr: string,
  calendar: Map<string, ReturnType<typeof buildYearCalendar> extends Map<string, infer V> ? V : never>,
): boolean {
  const dayCalendar = calendar.get(dateStr)
  if (!dayCalendar?.principal) return false

  const rank = dayCalendar.principal.rank as RankOF
  if (!suppressingRanks.has(rank)) return false

  // Temporal solemnities/feasts (e.g., Easter, Trinity) don't suppress — they ARE the temporal reading.
  // Only sanctoral entries suppress temporal readings.
  const category = dayCalendar.principal.entry.category
  const temporalCategories = new Set(['solemnity_temporal', 'feast_of_the_lord', 'liturgical_season'])
  return !temporalCategories.has(category)
}

function computeYearSelection(entries: LiturgicalEntry[]) {
  console.log(`\nAnalyzing years ${yearRange.start}-${yearRange.end}...\n`)

  // Build the temporal universe and per-year availability
  const universe = new Set<string>()
  const yearAvailability = new Map<number, Set<string>>()
  // Track sanctoral occasions separately
  const sanctoralOccasions = new Set<string>()

  for (let year = yearRange.start; year <= yearRange.end; year++) {
    const calendar = buildYearCalendar({ year, form: 'of', entries, jurisdiction: 'BR' })
    const available = new Set<string>()

    // Iterate every day of the year
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    let current = start

    while (current <= end) {
      const dateStr = format(current, 'yyyy-MM-dd')
      const { full: occasionKey } = getOccasionKey(current)

      if (isSuppressed(dateStr, calendar)) {
        // This date has a sanctoral feast — record the sanctoral occasion
        const dayCalendar = calendar.get(dateStr)
        if (dayCalendar?.principal) {
          const entry = dayCalendar.principal.entry
          const month = current.getMonth() + 1
          const day = current.getDate()
          const sanctKey = `sanctoral/${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          sanctoralOccasions.add(sanctKey)
        }
      } else {
        // Temporal reading is available
        universe.add(occasionKey)
        available.add(occasionKey)
      }

      current = addDays(current, 1)
    }

    yearAvailability.set(year, available)
  }

  console.log(`Temporal universe: ${universe.size} unique occasion keys`)
  console.log(`Sanctoral occasions: ${sanctoralOccasions.size} fixed feasts\n`)

  // Greedy set-cover
  const uncovered = new Set(universe)
  const selectedYears: number[] = []

  while (uncovered.size > 0) {
    let bestYear = -1
    let bestCount = 0

    for (const [year, available] of yearAvailability) {
      let count = 0
      for (const key of available) {
        if (uncovered.has(key)) count++
      }
      if (count > bestCount) {
        bestCount = count
        bestYear = year
      }
    }

    if (bestYear === -1 || bestCount === 0) {
      console.log(`WARNING: ${uncovered.size} occasions could not be covered:`)
      for (const key of uncovered) {
        console.log(`  - ${key}`)
      }
      break
    }

    selectedYears.push(bestYear)
    const available = yearAvailability.get(bestYear)!
    for (const key of available) {
      uncovered.delete(key)
    }

    console.log(`  Selected ${bestYear}: covers ${bestCount} new occasions (${uncovered.size} remaining)`)
  }

  selectedYears.sort((a, b) => a - b)

  // Count total fetch days
  let totalDays = 0
  for (const year of selectedYears) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    totalDays += isLeap ? 366 : 365
  }

  console.log(`\nSelected ${selectedYears.length} years: [${selectedYears.join(', ')}]`)
  console.log(`Total days to fetch: ${totalDays}`)
  console.log(`Fetching: all ${selectedYears.length} years in parallel, no delay`)

  return { selectedYears, universe, sanctoralOccasions }
}

// ── Phase 2: API fetching ──

function loadCheckpoint(): CheckpointData {
  if (resume && fs.existsSync(checkpointPath)) {
    const raw = fs.readFileSync(checkpointPath, 'utf-8')
    return JSON.parse(raw)
  }
  return { fetched: {}, responses: {} }
}

function saveCheckpoint(data: CheckpointData) {
  fs.writeFileSync(checkpointPath, JSON.stringify(data), 'utf-8')
}

async function fetchDate(date: Date): Promise<LiturgiaDiariaResponse | undefined> {
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const ano = String(date.getFullYear())
  const url = `https://liturgia.up.railway.app/v2/?dia=${dia}&mes=${mes}&ano=${ano}`

  try {
    const res = await fetch(url)
    if (!res.ok) return undefined
    return await res.json()
  } catch {
    return undefined
  }
}

function normalizeLiturgiaDiaria(data: LiturgiaDiariaResponse): ProperDay {
  const propers: ProperDay = {}

  if (data.oracoes?.coleta) {
    propers.collect = { text: data.oracoes.coleta }
  }
  if (data.oracoes?.oferendas) {
    propers['prayer-over-offerings'] = { text: data.oracoes.oferendas }
  }
  if (data.oracoes?.comunhao) {
    propers['prayer-after-communion'] = { text: data.oracoes.comunhao }
  }

  if (data.antifonas?.entrada) {
    propers['entrance-antiphon'] = { text: data.antifonas.entrada }
  }
  if (data.antifonas?.comunhao) {
    propers.communion = { text: data.antifonas.comunhao }
  }

  const first = data.leituras?.primeiraLeitura?.[0]
  if (first?.texto) {
    propers['first-reading'] = { text: first.texto, citation: first.referencia || undefined }
  }

  const psalm = data.leituras?.salmo?.[0]
  if (psalm?.texto) {
    const text = psalm.refrao ? `℟. ${psalm.refrao}\n\n${psalm.texto}` : psalm.texto
    propers['responsorial-psalm'] = { text, citation: psalm.referencia || undefined }
  }

  const second = data.leituras?.segundaLeitura?.[0]
  if (second?.texto) {
    propers['second-reading'] = { text: second.texto, citation: second.referencia || undefined }
  }

  const gospel = data.leituras?.evangelho?.[0]
  if (gospel?.texto) {
    propers.gospel = { text: gospel.texto, citation: gospel.referencia || undefined }
  }

  return propers
}

async function testApiAvailability(selectedYears: number[]): Promise<boolean> {
  console.log('\nTesting API availability...')

  // Test with a date from the first selected year
  const testYear = selectedYears[0]
  const testDate = new Date(testYear, 11, 25) // Christmas — always has data
  const data = await fetchDate(testDate)

  if (!data) {
    console.log(`  FAILED: API did not return data for ${testYear}-12-25`)
    console.log('  The API may not serve historical dates, or it may be down.')
    console.log('  Try running again later, or adjust yearRange to use future years.')
    return false
  }

  console.log(`  OK: API returned data for ${testYear}-12-25 ("${data.liturgia}")`)

  // Also test the last selected year
  const lastYear = selectedYears[selectedYears.length - 1]
  if (lastYear !== testYear) {
    const data2 = await fetchDate(new Date(lastYear, 0, 1))
    if (!data2) {
      console.log(`  WARNING: API did not return data for ${lastYear}-01-01`)
      console.log('  Some years in the selection may not be available.')
    } else {
      console.log(`  OK: API returned data for ${lastYear}-01-01 ("${data2.liturgia}")`)
    }
  }

  return true
}

async function fetchYear(
  year: number,
  entries: LiturgicalEntry[],
  checkpoint: CheckpointData,
  stats: { fetched: number; skipped: number; failed: number; processed: number },
  totalDays: number,
  startTime: number,
) {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInYear = isLeap ? 366 : 365
  const calendar = buildYearCalendar({ year, form: 'of', entries, jurisdiction: 'BR' })
  const failedDates: string[] = []

  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  let current = start

  while (current <= end) {
    const dateStr = format(current, 'yyyy-MM-dd')
    stats.processed++

    if (checkpoint.fetched[dateStr]) {
      stats.skipped++
      current = addDays(current, 1)
      continue
    }

    const { full: occasionKey } = getOccasionKey(current)
    const sanctoral = isSuppressed(dateStr, calendar)
    const cycleKey = sanctoral ? 'sanctoral' : occasionKey

    const data = await fetchDate(current)
    if (data) {
      checkpoint.fetched[dateStr] = { occasionKey, cycleKey }
      checkpoint.responses[dateStr] = data
      stats.fetched++
    } else {
      stats.failed++
      failedDates.push(dateStr)
    }

    // Progress every 20 fetches
    if ((stats.fetched + stats.failed) % 20 === 0) {
      const elapsed = (Date.now() - startTime) / 1000
      const done = stats.fetched + stats.failed + stats.skipped
      const rate = (stats.fetched + stats.failed) / elapsed
      const eta = rate > 0 ? (totalDays - done) / rate : 0
      const pct = ((done / totalDays) * 100).toFixed(1)
      process.stdout.write(
        `\r  [${pct}%] ${stats.fetched} ok, ${stats.failed} gaps, ${stats.skipped} cached | ${rate.toFixed(1)} req/s | ETA ${formatDuration(eta)}   `,
      )
    }

    current = addDays(current, 1)
  }

  if (failedDates.length > 0) {
    console.log(`\n  ${year}: ${daysInYear - failedDates.length}/${daysInYear} days fetched (${failedDates.length} gaps)`)
  } else {
    console.log(`\n  ${year}: all ${daysInYear} days fetched`)
  }
}

async function fetchYears(
  selectedYears: number[],
  entries: LiturgicalEntry[],
): Promise<CheckpointData> {
  const checkpoint = loadCheckpoint()
  const stats = { fetched: 0, skipped: 0, failed: 0, processed: 0 }

  let totalDays = 0
  for (const y of selectedYears) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
    totalDays += isLeap ? 366 : 365
  }

  const startTime = Date.now()
  console.log(`\nFetching ${selectedYears.length} years in parallel: [${selectedYears.join(', ')}]\n`)

  // Fetch all years concurrently
  await Promise.all(
    selectedYears.map((year) => fetchYear(year, entries, checkpoint, stats, totalDays, startTime)),
  )

  saveCheckpoint(checkpoint)
  const totalElapsed = (Date.now() - startTime) / 1000
  console.log(`\n✓ Fetching complete in ${formatDuration(totalElapsed)}`)
  console.log(`  ${stats.fetched} fetched, ${stats.skipped} from checkpoint, ${stats.failed} gaps`)

  return checkpoint
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m${secs}s`
}

// ── Phase 3: Output generation ──

type TemporalOutput = {
  occasion: string
  variants: Record<string, {
    dayName: string
    color: string
    propers: ProperDay
  }>
}

type SanctoralOutput = {
  occasion: string
  dayName: string
  color: string
  propers: ProperDay
}

function generateOutput(
  checkpoint: CheckpointData,
  entries: LiturgicalEntry[],
  universe: Set<string>,
  sanctoralOccasions: Set<string>,
) {
  console.log('\nGenerating output...')

  // Group results by occasion
  const temporalMap = new Map<string, TemporalOutput>()
  const sanctoralMap = new Map<string, SanctoralOutput>()

  for (const [dateStr, meta] of Object.entries(checkpoint.fetched)) {
    const response = checkpoint.responses[dateStr]
    if (!response) continue

    const date = new Date(dateStr)
    const pos = getOfLiturgicalPosition(date)
    const litYear = getLiturgicalYear(date)
    const isSunday = pos.dayOfWeek === 0

    // Determine cycle variant
    let cycleVariant: string | undefined
    if (pos.key.startsWith('fixed/')) {
      cycleVariant = undefined
    } else if (isSunday) {
      cycleVariant = getSundayCycle(litYear)
    } else if (pos.season === 'ordinary') {
      cycleVariant = getWeekdayCycle(litYear)
    }

    const propers = normalizeLiturgiaDiaria(response)

    // Check if this is a sanctoral date
    const calendar = buildYearCalendar({ year: date.getFullYear(), form: 'of', entries, jurisdiction: 'BR' })
    const dayDateStr = format(date, 'yyyy-MM-dd')
    const sanctoral = isSuppressed(dayDateStr, calendar)

    if (sanctoral) {
      const month = date.getMonth() + 1
      const day = date.getDate()
      const sanctKey = `sanctoral/${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      if (!sanctoralMap.has(sanctKey)) {
        sanctoralMap.set(sanctKey, {
          occasion: sanctKey,
          dayName: response.liturgia,
          color: response.cor,
          propers,
        })
      }
    } else {
      const base = pos.key
      if (!temporalMap.has(base)) {
        temporalMap.set(base, { occasion: base, variants: {} })
      }

      const entry = temporalMap.get(base)!
      const variantKey = cycleVariant ?? 'common'

      if (!entry.variants[variantKey]) {
        entry.variants[variantKey] = {
          dayName: response.liturgia,
          color: response.cor,
          propers,
        }
      }
    }
  }

  // Write temporal files
  let temporalCount = 0
  for (const [key, data] of temporalMap) {
    const filePath = path.join(contentDir, 'temporal', `${key}.json`)
    const dir = path.dirname(filePath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    temporalCount++
  }

  // Write sanctoral files
  let sanctoralCount = 0
  for (const [key, data] of sanctoralMap) {
    const filePath = path.join(contentDir, `${key}.json`)
    const dir = path.dirname(filePath)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    sanctoralCount++
  }

  // Write metadata
  const coveredTemporal = new Set<string>()
  for (const [, data] of temporalMap) {
    for (const variant of Object.keys(data.variants)) {
      const full = variant === 'common' ? data.occasion : `${data.occasion}/${variant}`
      coveredTemporal.add(full)
    }
  }

  const missing = [...universe].filter((k) => !coveredTemporal.has(k))

  const metadata = {
    generatedAt: new Date().toISOString(),
    temporalFiles: temporalCount,
    sanctoralFiles: sanctoralCount,
    temporalUniverse: universe.size,
    temporalCovered: coveredTemporal.size,
    temporalMissing: missing.length,
    missingOccasions: missing,
  }

  fs.mkdirSync(contentDir, { recursive: true })
  fs.writeFileSync(path.join(contentDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8')

  console.log(`\nOutput written to ${contentDir}`)
  console.log(`  Temporal files: ${temporalCount}`)
  console.log(`  Sanctoral files: ${sanctoralCount}`)
  console.log(`  Coverage: ${coveredTemporal.size}/${universe.size} temporal occasions`)
  if (missing.length > 0) {
    console.log(`  Missing ${missing.length} occasions:`)
    for (const m of missing.slice(0, 20)) console.log(`    - ${m}`)
    if (missing.length > 20) console.log(`    ... and ${missing.length - 20} more`)
  }
}

// ── Helpers ──


// ── Main ──

async function main() {
  console.log('=== OF Lectionary Reconstruction ===\n')

  const entries = loadEntries()
  console.log(`Loaded ${entries.length} liturgical entries`)

  // Phase 1: Compute optimal years
  const { selectedYears, universe, sanctoralOccasions } = computeYearSelection(entries)

  if (planOnly) {
    console.log('\n--plan-only: stopping before fetch.')
    return
  }

  // Phase 2: Fetch from API
  const apiOk = await testApiAvailability(selectedYears)
  if (!apiOk) {
    console.log('\nAborting: API not available for selected years.')
    process.exit(1)
  }

  const checkpoint = await fetchYears(selectedYears, entries)

  // Phase 3: Generate output
  generateOutput(checkpoint, entries, universe, sanctoralOccasions)

  console.log('\nDone!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
