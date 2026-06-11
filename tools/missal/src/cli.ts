import { writeFileSync } from 'node:fs'
import { runCensus, formatCensus } from './census'
import { buildCalendarStatics } from './enrich/calendar'
import { buildFormulary } from './enrich/formulary'
import { buildOrderOfMass } from './enrich/order'
import { loadPrefaceLibrary } from './enrich/prefaces'
import { emitCorpus, loadBaselineMassDicts } from './emit'
import { parseCorpus } from './parse'
import type { BaselineLang } from './parity/baseline'
import { runParity } from './parity'
import { loadPatches, patchSummary } from './patches'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function usage(): never {
  console.error(`Usage:
  missal parse  --source <Missale_romanum clone>
  missal parity --source <Missale_romanum clone> --baseline <ember-extra novus-ordo-missae dir>
                [--langs pt-BR,la,en] [--out report.json]
  missal build  --baseline <ember-extra novus-ordo-missae dir> --out <content/of dir>`)
  process.exit(2)
}

const command = process.argv[2]
const source = arg('source')
const patchesDir = new URL('../patches', import.meta.url).pathname

if (command === 'build') {
  const baseline = arg('baseline')
  const out = arg('out')
  if (!baseline || !out) usage()
  const dataDir = `${baseline}/data`

  const patches = loadPatches(patchesDir)
  const lib = loadPrefaceLibrary(dataDir)
  const rawById = loadBaselineMassDicts(dataDir)

  console.log(`Building formularies from ${rawById.size} baseline masses…`)
  const formularies = [...rawById.values()]
    .map((d) => buildFormulary(d, lib, patches))
    .filter((f): f is NonNullable<typeof f> => Boolean(f))

  // The Order of Mass is carved from the upstream `ordinario` (aligned blocks)
  // when --source points at a Missale_romanum clone; otherwise the baseline
  // mono-blob frame is used.
  const ordinario = source
    ? parseCorpus(source).files.find((f) => f.basename === 'ordinario')
    : undefined
  if (source && !ordinario) console.warn('⚠ --source given but no ordinario file found; using baseline frame')
  const order = buildOrderOfMass(dataDir, patches, ordinario)
  const calendar = buildCalendarStatics(formularies, rawById)

  const census = runCensus(formularies)
  console.log(formatCensus(census))
  console.log(`Order of Mass: EPs=${order.eucharisticPrayers.length} items=${Object.keys(order.items).length}`)
  console.log(`Calendar: temporal=${calendar.temporal.length} sanctoral=${calendar.sanctoral.length}`)

  // The scanno patches target raw upstream HTML; the baseline is already
  // refine.py-clean, so most are inert here. The stale-patch gate belongs to
  // the parity (HTML) path, not this baseline transform.
  console.log(`Patches: ${patchSummary(patches)}`)

  const result = emitCorpus(out, formularies, order, calendar)
  console.log(`\nEmitted ${result.formularies} formularies to ${out}`)
  if (census.chipCollisions.length > 0) {
    console.warn(`\n⚠ ${census.chipCollisions.length} chip collision(s):`)
    for (const c of census.chipCollisions.slice(0, 10)) console.warn(`  ${c.key}: ${c.ids.join(', ')}`)
  }
  if (result.errors.length > 0) {
    console.error(`\n✗ ${result.errors.length} validation error(s):`)
    for (const e of result.errors.slice(0, 20)) console.error(`  ${e.id}: ${e.issue}`)
    process.exit(1)
  }
  console.log('\n✓ All formularies valid against the schema.')
  process.exit(0)
}

if (!command || !source) usage()

if (command === 'parse') {
  const corpus = parseCorpus(source, (msg) => console.log(msg))
  const dayCount = corpus.files.reduce((acc, f) => acc + f.days.length, 0)
  console.log(`\nParsed ${corpus.files.length} aligned files, ${dayCount} days.`)
} else if (command === 'parity') {
  const baseline = arg('baseline')
  if (!baseline) usage()

  console.log('Parsing upstream HTML…')
  const corpus = parseCorpus(source)
  console.log('Classifying against the old corpus…')
  const langs = arg('langs')?.split(',') as BaselineLang[] | undefined
  const report = runParity(corpus, `${baseline}/data`, { langs, patchesDir })

  const { masses, strings } = report.summary
  console.log(`\nMasses : ok=${masses.ok} partial=${masses.partial} missing-day=${masses['missing-day']} no-provenance=${masses['no-provenance']}`)
  console.log(
    `Strings: matched=${strings.matched} casing=${strings.casing} punct=${strings.punct} spacing=${strings.spacing} cross-file=${strings['cross-file']} derived=${strings.derived} composed=${strings.composed} NOT-FOUND=${strings['not-found']}`,
  )

  const out = arg('out')
  if (out) {
    writeFileSync(out, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`Report written to ${out}`)
  }

  const worst = report.masses
    .filter((m) => m.status === 'partial')
    .sort((a, b) => b.buckets['not-found'] - a.buckets['not-found'])
    .slice(0, 10)
  if (worst.length > 0) {
    console.log('\nWorst partial masses:')
    for (const m of worst) {
      console.log(`  ${m.massId}: ${m.buckets['not-found']}/${m.total} not found`)
      for (const miss of m.misses.slice(0, 2)) {
        console.log(`    [${miss.lang}] ${miss.text.slice(0, 100)}`)
      }
    }
  }

  process.exit(strings['not-found'] > 0 || masses['missing-day'] > 0 ? 1 : 0)
} else {
  usage()
}
