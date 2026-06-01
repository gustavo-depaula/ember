/**
 * Extract the 1962 (rubrica 1960) precedence value of every Divinum Officium
 * Mass day — temporal and sanctoral — from its `[Rank]` section, and emit a flat
 * id→number index. This is DO's *own* occurrence value (Feria 1, Duplex 3,
 * Semiduplex Sunday 6.9, Duplex I classis 6.5–7), so EF precedence becomes
 * data-driven (higher number wins) rather than guessed rubrics.
 *
 * Output: content/propers/ef-ranks.json — { "<doId>": number }, keyed exactly as
 * `getDoTemporaId` / `getDoSanctiId` produce (Tempora ids like `Pent01-1`,
 * Sancti ids like `08-15`).
 *
 * Requires the Divinum Officium clone at .divinum-officium (the same one
 * scripts/parse-do-propers.ts uses).
 *
 * Usage: node scripts/build-ef-ranks.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const doLatin = resolve(root, '.divinum-officium/web/www/missa/Latin')
const outPath = resolve(root, 'content/propers/ef-ranks.json')

/** Extract the `[Rank]` section's lines from a DO Mass file. */
function rankSection(text) {
  const lines = text.split(/\r?\n/)
  const out = []
  let inRank = false
  for (const line of lines) {
    if (line.startsWith('[Rank]')) {
      inRank = true
      continue
    }
    if (inRank && line.startsWith('[')) break
    if (inRank) out.push(line)
  }
  return out
}

/**
 * The precedence number for the 1962 rubrics. A `[Rank]` section is one or more
 * `Title;;Class;;Number;;…` lines; when a `(sed rubrica 1960)` marker appears the
 * line(s) after it override the base for 1960/1962. We take the chosen data
 * line's third `;;`-field.
 */
function rankNumber(section) {
  let chosen
  let afterRubric1960 = false
  for (const raw of section) {
    const line = raw.trim()
    if (!line) continue
    if (/^\(.*rubrica 1960/i.test(line)) {
      afterRubric1960 = true
      continue
    }
    if (line.startsWith('(')) continue // other conditional — ignore
    const parts = line.split(';;')
    if (parts.length < 3) continue
    const n = Number.parseFloat(parts[2])
    if (Number.isNaN(n)) continue
    // First data line is the base; a line after `(sed rubrica 1960)` overrides.
    if (chosen === undefined || afterRubric1960) chosen = n
    if (afterRubric1960) break
  }
  return chosen
}

function collect(subdir) {
  const dir = resolve(doLatin, subdir)
  const ranks = {}
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.txt')) continue
    const id = file.slice(0, -4)
    // Skip reading-variant stubs (e.g. `05-31o`, `12-25r`) and commons (`C*`).
    if (/[a-z]$/.test(id) && !/^\d/.test(id)) continue
    if (id.startsWith('C')) continue
    const n = rankNumber(rankSection(readFileSync(resolve(dir, file), 'utf-8')))
    if (n !== undefined) ranks[id] = n
  }
  return ranks
}

const ranks = { ...collect('Tempora'), ...collect('Sancti') }
const sorted = Object.fromEntries(Object.entries(ranks).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(outPath, `${JSON.stringify(sorted)}\n`, 'utf-8')
console.log(`Wrote ${Object.keys(sorted).length} EF rank values → ${outPath}`)
for (const probe of ['08-15', '01-21', '12-08', 'Adv1-0', 'Pent01-1', 'Pent01-0']) {
  console.log(`  ${probe.padEnd(10)} → ${sorted[probe]}`)
}
