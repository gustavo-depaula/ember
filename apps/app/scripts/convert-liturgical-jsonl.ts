/**
 * Converts liturgical-entries.jsonl → src/lib/liturgical/calendar-data.ts
 *
 * Usage: npx tsx scripts/convert-liturgical-jsonl.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('.', import.meta.url).pathname, '..')
const inputPath = resolve(root, 'liturgical-entries.jsonl')
const outputPath = resolve(root, 'src/lib/liturgical/calendar-data.ts')

const lines = readFileSync(inputPath, 'utf-8')
  .split('\n')
  .filter((line) => line.trim().length > 0)

const entries = lines.map((line, i) => {
  try {
    return JSON.parse(line)
  } catch {
    throw new Error(`Invalid JSON at line ${i + 1}: ${line.slice(0, 80)}...`)
  }
})

const output = `// Auto-generated from liturgical-entries.jsonl — do not edit manually.
// Regenerate with: npx tsx scripts/convert-liturgical-jsonl.ts

import type { LiturgicalEntry } from './calendar-types'

const entries: LiturgicalEntry[] = ${JSON.stringify(entries, null, 2)}

export function getAllEntries(): LiturgicalEntry[] {
  return entries
}

export function getEntriesForForm(form: 'of' | 'ef'): LiturgicalEntry[] {
  return entries.filter((e) => (form === 'of' ? e.of : e.ef))
}
`

writeFileSync(outputPath, output, 'utf-8')
console.log(`Wrote ${entries.length} entries to ${outputPath}`)
