import { readFileSync, writeFileSync } from 'node:fs'
import type { ChurchDump } from '@ember/api'
import { buildRows, type IdMapping, mappingToJsonl, rowsToSql } from '../src/lib/import'

// CLI shell: JSONL dump → `.sql` for wrangler, plus a `sourceId -> generated id` mapping sidecar for
// any records that carried a `sourceId`. Pure logic lives in src/lib/import.ts (worker-safe +
// unit-tested). The dump's provenance is out of scope.
//
//   tsx scripts/import.ts <dump.jsonl> [--sql out] [--map out] [--prior in] [--upsert]
//
// Initial bulk load: no flags → plain INSERTs for `wrangler d1 import` into an empty DB.
// Re-import:         --prior <last mapping> --upsert → reuse prior ids (stable identity) + emit
//                    idempotent upsert/replace SQL, applied with `wrangler d1 execute --file`.
const args = process.argv.slice(2)
const inputPath = args[0]
if (!inputPath || inputPath.startsWith('-')) {
  throw new Error(
    'usage: tsx scripts/import.ts <dump.jsonl> [--sql out] [--map out] [--prior in] [--upsert]',
  )
}
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const outputPath = flag('--sql') ?? 'dump.sql'
const mappingPath = flag('--map') ?? `${outputPath.replace(/\.sql$/, '')}.mapping.jsonl`
const priorPath = flag('--prior')
const upsert = args.includes('--upsert')

const readJsonl = <T>(path: string): T[] =>
  readFileSync(path, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)

const dump = readJsonl<ChurchDump>(inputPath)
const prior = priorPath ? readJsonl<IdMapping>(priorPath) : []

const rows = buildRows(dump, prior)
writeFileSync(outputPath, rowsToSql(rows, { upsert }))

const total = rows.churches.length + rows.services.length + rows.texts.length + rows.links.length
process.stdout.write(`Wrote ${total} rows (${rows.churches.length} churches) → ${outputPath}\n`)

if (rows.mapping.length) {
  writeFileSync(mappingPath, mappingToJsonl(rows.mapping))
  process.stdout.write(`Wrote ${rows.mapping.length} id mappings → ${mappingPath}\n`)
}
