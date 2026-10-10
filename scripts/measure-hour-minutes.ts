#!/usr/bin/env tsx
/**
 * How long each hour of an engine-assembled Office takes to pray: every hour
 * on a spread of days through a year, its words counted and read at the
 * recitation pace `build-corpus.py` uses for written-out flows. The median is
 * the manifest's `hourMinutes`. Each form of the breviary is measured under
 * its own rubrics and votive office, since Matins of 1570 is half as long
 * again as Matins of 1960.
 *
 * Run: pnpm tsx scripts/measure-hour-minutes.ts            # print
 *      pnpm tsx scripts/measure-hour-minutes.ts --write    # update the manifests
 * Re-run with --write when an engine or its corpus changes enough to move them.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { assembleHour as assembleDoHour, officeVersion } from '../packages/divinum-officium/src'
import { createFsLoader } from '../packages/divinum-officium/src/node/fsLoader'
import { toWords } from '../packages/divinum-officium/src/node/wordStream'
import { calendar, corpus } from '../packages/loth/src/__tests__/corpus'
import { assembleHour as assembleLothHour, formsOf } from '../packages/loth/src/hour'
import { type Hour as LothHour, officeOf } from '../packages/loth/src/office'
import { blockText } from '../packages/loth/src/text'

const repoRoot = resolve(__dirname, '..')
const practicesRoot = join(repoRoot, 'content', 'practices')

// Words a minute, as in build-corpus.py: Latin says the same prayer in about
// three quarters of the words.
const pace = { latin: 115, vernacular: 150 }
const year = 2026
const everyNthDay = 9

type DoHora = Parameters<typeof assembleDoHour>[0]['hora']
type Include = { type: 'include'; ref: string; params?: Record<string, string> }
type HourOption = { id: string; sections?: Include[] }
type Manifest = { flow?: unknown; vars?: Record<string, string>; hourMinutes?: unknown }

const dates = (() => {
  const all: Date[] = []
  let dayOfYear = 0
  for (let d = new Date(year, 0, 1, 12); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    if (dayOfYear++ % everyNthDay === 0) all.push(new Date(d))
  }
  return all
})()

function medianMinutes(words: number[], wpm: number): number {
  const sorted = [...words].sort((a, b) => a - b)
  return Math.max(1, Math.round(sorted[Math.floor(sorted.length / 2)] / wpm))
}

const doLoader = createFsLoader(join(repoRoot, 'content', 'do', 'web', 'www'))

async function doMinutes(hora: string, version: string, votive: string): Promise<number> {
  const words: number[] = []
  for (const date of dates) {
    const hour = await assembleDoHour({
      loader: doLoader,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year,
      version: officeVersion(version),
      hora: hora as DoHora,
      votive,
    })
    words.push(toWords(hour.latin.join('\n')).length)
  }
  return medianMinutes(words, pace.latin)
}

async function lothMinutes(hour: string): Promise<number> {
  // The flow's name for the one hour the engine calls otherwise.
  const engineHour = (hour === 'office-of-readings' ? 'readings' : hour) as LothHour
  const words: number[] = []
  for (const date of dates) {
    const office = officeOf(date, engineHour, calendar)
    const parts = await assembleLothHour(office, formsOf(office)[0], corpus)
    const text = parts.flatMap((p) => p.blocks.map(blockText)).join('\n')
    words.push(text.split(/\s+/).filter(Boolean).length)
  }
  return medianMinutes(words, pace.vernacular)
}

/** The hours of a flow whose every hour is one engine include, with that include. */
function engineHours(flowPath: string): { id: string; include: Include }[] {
  const flow = JSON.parse(readFileSync(flowPath, 'utf-8')) as {
    sections: { type: string; on?: string; pin?: boolean; options?: HourOption[] }[]
  }
  const select = flow.sections.find((s) => s.type === 'select' && s.pin && s.on === 'hour')
  return (select?.options ?? []).flatMap((o) => {
    const include = o.sections?.length === 1 ? o.sections[0] : undefined
    const engine = include?.ref === 'producer/do-hour' || include?.ref === 'producer/loth-hour'
    return include && engine ? [{ id: o.id, include }] : []
  })
}

async function main() {
  const write = process.argv.includes('--write')
  for (const pid of readdirSync(practicesRoot).sort()) {
    const manifestPath = join(practicesRoot, pid, 'manifest.json')
    const text = (() => {
      try {
        return readFileSync(manifestPath, 'utf-8')
      } catch {
        return undefined
      }
    })()
    if (!text) continue
    const manifest = JSON.parse(text) as Manifest
    if (typeof manifest.flow !== 'string') continue
    const hours = engineHours(join(practicesRoot, pid, manifest.flow))
    if (hours.length === 0) continue

    const fill = (value = '') => value.replace(/\{\{(\w+)\}\}/g, (_, k) => manifest.vars?.[k] ?? '')
    const hourMinutes: Record<string, number> = {}
    for (const { id, include } of hours) {
      const { hour = id, version, votive } = include.params ?? {}
      hourMinutes[id] =
        include.ref === 'producer/loth-hour'
          ? await lothMinutes(hour)
          : await doMinutes(hour, fill(version), fill(votive) || 'Hodie')
    }
    console.log(pid, JSON.stringify(hourMinutes))
    if (!write) continue

    // Kept beside the practice's own minutes, in the file's own indentation.
    const { hourMinutes: _, ...rest } = manifest as Record<string, unknown>
    const entries = Object.entries(rest)
    const at = entries.findIndex(([k]) => k === 'estimatedMinutes') + 1
    entries.splice(at || entries.length, 0, ['hourMinutes', hourMinutes])
    const indent = /^(\s+)"/m.exec(text)?.[1] ?? '  '
    writeFileSync(manifestPath, `${JSON.stringify(Object.fromEntries(entries), null, indent)}\n`)
  }
}

void main()
