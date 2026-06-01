/**
 * Merge the Mass practice's content fragments into one fetchable artifact for
 * `producer/mass`. The producer computes the assembly (buildMassFlow) but the
 * Order-of-Mass *text* stays declarative — it lives in these fragments, which
 * the producer loads and supplies as `flow.fragments` when it resolves the
 * computed flow.
 *
 * Sources: content/practices/mass/flow.json's inline `fragments` + every
 * content/practices/mass/fragments/*.json file (each `{ fragments: {…} }`).
 *
 * Output: content/liturgical/mass-fragments.json — `{ fragments: { <name>: [...] } }`,
 * served at `liturgical/mass-fragments.json`.
 *
 * Usage: node scripts/build-mass-fragments.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const massDir = resolve(root, 'content/practices/mass')
const fragDir = resolve(massDir, 'fragments')
const outPath = resolve(root, 'content/liturgical/mass-fragments.json')

const fragments = {}

function merge(obj) {
  if (obj && typeof obj === 'object') Object.assign(fragments, obj)
}

// 1) The flow's inline fragments (of-lord-be-with-you, of-sanctus, …).
const flow = JSON.parse(readFileSync(resolve(massDir, 'flow.json'), 'utf-8'))
merge(flow.fragments)

// 2) Every fragment file.
for (const file of readdirSync(fragDir)) {
  if (!file.endsWith('.json')) continue
  const body = JSON.parse(readFileSync(resolve(fragDir, file), 'utf-8'))
  merge(body.fragments)
}

const sorted = Object.fromEntries(Object.entries(fragments).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(outPath, `${JSON.stringify({ fragments: sorted })}\n`, 'utf-8')
console.log(`Wrote ${Object.keys(sorted).length} Mass fragments → ${outPath}`)
