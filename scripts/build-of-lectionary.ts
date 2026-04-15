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
const rateLimitMs = 1000
const maxRetries = 3
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
  console.log(`Estimated time: ${Math.ceil(totalDays * rateLimitMs / 60000)} minutes`)

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

async function fetchWithRetry(date: Date): Promise<LiturgiaDiariaResponse | undefined> {
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const ano = String(date.getFullYear())
  const url = `https://liturgia.up.railway.app/v2/?dia=${dia}&mes=${mes}&ano=${ano}`

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (attempt < maxRetries) {
          const delay = 2000 * 2 ** attempt
          console.log(`  HTTP ${res.status} for ${ano}-${mes}-${dia}, retrying in ${delay}ms...`)
          await sleep(delay)
          continue
        }
        console.log(`  FAILED: HTTP ${res.status} for ${ano}-${mes}-${dia} after ${maxRetries + 1} attempts`)
        return undefined
      }
      return await res.json()
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = 2000 * 2 ** attempt
        console.log(`  Error for ${ano}-${mes}-${dia}: ${err}, retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }
      console.log(`  FAILED: ${err} for ${ano}-${mes}-${dia} after ${maxRetries + 1} attempts`)
      return undefined
    }
  }
  return undefined
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
  const data = await fetchWithRetry(testDate)

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
    const data2 = await fetchWithRetry(new Date(lastYear, 0, 1))
    if (!data2) {
      console.log(`  WARNING: API did not return data for ${lastYear}-01-01`)
      console.log('  Some years in the selection may not be available.')
    } else {
      console.log(`  OK: API returned data for ${lastYear}-01-01 ("${data2.liturgia}")`)
    }
  }

  return true
}

async function fetchYears(
  selectedYears: number[],
  entries: LiturgicalEntry[],
): Promise<CheckpointData> {
  const checkpoint = loadCheckpoint()
  let fetched = 0
  let skipped = 0

  for (const year of selectedYears) {
    console.log(`\nFetching ${year}...`)
    const calendar = buildYearCalendar({ year, form: 'of', entries, jurisdiction: 'BR' })

    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    let current = start

    while (current <= end) {
      const dateStr = format(current, 'yyyy-MM-dd')

      if (checkpoint.fetched[dateStr]) {
        skipped++
        current = addDays(current, 1)
        continue
      }

      const { full: occasionKey } = getOccasionKey(current)
      const isSanctoral = isSuppressed(dateStr, calendar)
      const cycleKey = isSanctoral ? 'sanctoral' : occasionKey

      const data = await fetchWithRetry(current)
      if (data) {
        checkpoint.fetched[dateStr] = { occasionKey, cycleKey }
        checkpoint.responses[dateStr] = data
        fetched++

        if (fetched % 50 === 0) {
          saveCheckpoint(checkpoint)
          console.log(`  Checkpoint saved (${fetched} fetched, ${skipped} skipped)`)
        }
      }

      await sleep(rateLimitMs)
      current = addDays(current, 1)
    }
  }

  saveCheckpoint(checkpoint)
  console.log(`\nFetching complete: ${fetched} new, ${skipped} from checkpoint`)

  return checkpoint
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

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
