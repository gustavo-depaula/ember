import { readFileSync, writeFileSync } from 'node:fs'
import type { ChurchDump } from '@ember/api'
import { buildRows, mappingToJsonl, rowsToSql } from '../src/lib/import'

// CLI shell: JSONL dump → `dump.sql` for `wrangler d1 import`, plus a `sourceId -> generated id`
// mapping sidecar for any records that carried a `sourceId`. The pure logic lives in
// src/lib/import.ts (worker-safe + unit-tested). The dump's provenance is out of scope.
//   tsx scripts/import.ts <dump.jsonl> [dump.sql] [mapping.jsonl]
const [inputPath, outputPath = 'dump.sql', mappingPath = deriveMappingPath(outputPath)] =
  process.argv.slice(2)
if (!inputPath) {
  throw new Error('usage: tsx scripts/import.ts <dump.jsonl> [dump.sql] [mapping.jsonl]')
}

const dump = readFileSync(inputPath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line) as ChurchDump)

const rows = buildRows(dump)
writeFileSync(outputPath, rowsToSql(rows))

const total = rows.churches.length + rows.services.length + rows.texts.length + rows.links.length
process.stdout.write(`Wrote ${total} rows (${rows.churches.length} churches) → ${outputPath}\n`)

if (rows.mapping.length) {
  writeFileSync(mappingPath, mappingToJsonl(rows.mapping))
  process.stdout.write(`Wrote ${rows.mapping.length} id mappings → ${mappingPath}\n`)
}

// `dump.sql` → `dump.mapping.jsonl` (sits next to the SQL, distinct extension).
function deriveMappingPath(sqlPath: string): string {
  return `${sqlPath.replace(/\.sql$/, '')}.mapping.jsonl`
}
