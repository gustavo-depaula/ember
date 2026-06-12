#!/usr/bin/env tsx
/**
 * Parses the pinned Divinum Officium checkout into content/do/ (generated,
 * committed, never hand-edited). Lossless: sectioned files keep every section
 * (header conditions preserved, not evaluated); plain files keep raw lines.
 *
 * Also runs a validation/inventory pass with the same tokenizer the runtime
 * engine uses, so format surprises fail here — not on a user's device.
 *
 * Run: pnpm import:do && pnpm build:do
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import {
  parseSectionedFile,
  splitDoLines,
  tokenizeLine,
  type ParsedDoFile,
} from '../packages/divinum-officium/src'
import { doCloneDir, ensureDoCheckout } from './import-do'

const repoRoot = resolve(__dirname, '..')
const sourceRoot = join(doCloneDir, 'web', 'www')
const outRoot = join(repoRoot, 'content', 'do')

const languages = ['Latin', 'English', 'Portugues']
const horasDirs = [
  'Tempora',
  'Sancti',
  'Commune',
  'TemporaM',
  'SanctiM',
  'CommuneM',
  'Psalterium',
  'Appendix',
  'Regula',
]
const missaDirs = ['Tempora', 'Sancti', 'Commune', 'Ordo']
const tabulaeEntries = ['data.txt', 'Kalendaria', 'Transfer', 'Stransfer', 'Tempora']

// NOTE: the dataset routing below (which paths land in which do-data
// dataset) is mirrored by build_do() in scripts/build-corpus.py — change
// both together.
// Plain (non-sectioned) files, by how the Perl engine reads them:
// psalms via do_read in &psalm, Ordinarium scripts via getordinarium,
// Tabulae tables via Directorium.pm, Regula chapters via do_read in regula().
function isPlain(relPath: string): boolean {
  return (
    relPath.startsWith('Tabulae/') ||
    relPath.startsWith('horas/Ordinarium/') ||
    relPath.includes('/Psalterium/Psalmorum/') ||
    relPath.includes('/Regula/')
  )
}

function listTxtFiles(dir: string): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return []
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listTxtFiles(full))
    else if (entry.name.endsWith('.txt')) out.push(full)
  }
  return out.sort()
}

function collectSourceFiles(): string[] {
  const files: string[] = []
  for (const lang of languages) {
    for (const dir of horasDirs) files.push(...listTxtFiles(join(sourceRoot, 'horas', lang, dir)))
    for (const dir of missaDirs) files.push(...listTxtFiles(join(sourceRoot, 'missa', lang, dir)))
  }
  files.push(...listTxtFiles(join(sourceRoot, 'horas', 'Ordinarium')))
  // Language-independent dialog data (communes names, version lists, …) and
  // runtime defaults (pope/bishop names, fonts — the engine reads a few).
  files.push(join(sourceRoot, 'horas', 'horas.dialog'))
  files.push(join(sourceRoot, 'horas', 'horas.setup'))
  files.push(join(sourceRoot, 'missa', 'missa.dialog'))
  files.push(join(sourceRoot, 'missa', 'missa.setup'))
  for (const entry of tabulaeEntries) {
    const full = join(sourceRoot, 'Tabulae', entry)
    if (entry.endsWith('.txt')) files.push(full)
    else files.push(...listTxtFiles(full))
  }
  return files
}

// Decode strictly: a non-UTF-8 byte sequence upstream must fail the import,
// not ship mojibake.
const decoder = new TextDecoder('utf-8', { fatal: true })

type Inventory = {
  files: number
  sectioned: number
  plain: number
  lines: number
  calls: Map<string, number>
  macros: Map<string, number>
  conditionExprs: Map<string, number>
  scopes: Map<string, number>
  sectionNames: Map<string, number>
  inclusionFiles: Map<string, number>
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function inventoryLines(lines: string[], inv: Inventory) {
  for (const line of lines) {
    inv.lines++
    const token = tokenizeLine(line)
    if (token.kind === 'conditional') {
      bump(inv.conditionExprs, token.directive.expr.trim())
      if (token.directive.scope.trim()) bump(inv.scopes, token.directive.scope.trim())
    } else if (token.kind === 'call') {
      bump(inv.calls, token.name)
    } else if (token.kind === 'macro') {
      bump(inv.macros, token.name)
    } else if (token.kind === 'inclusion' && token.file) {
      bump(inv.inclusionFiles, token.file)
    }
  }
}

function sortedRecord(map: Map<string, number>): Record<string, number> {
  return Object.fromEntries([...map.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}

function main() {
  const { commit, commitDate } = ensureDoCheckout()
  const files = collectSourceFiles()
  if (files.length === 0) throw new Error(`no source files found under ${sourceRoot}`)

  rmSync(outRoot, { recursive: true, force: true })

  const inv: Inventory = {
    files: 0,
    sectioned: 0,
    plain: 0,
    lines: 0,
    calls: new Map(),
    macros: new Map(),
    conditionExprs: new Map(),
    scopes: new Map(),
    sectionNames: new Map(),
    inclusionFiles: new Map(),
  }
  const errors: string[] = []

  for (const file of files) {
    const relPath = relative(sourceRoot, file)
    let text: string
    try {
      text = decoder.decode(readFileSync(file))
    } catch {
      errors.push(`${relPath}: not valid UTF-8`)
      continue
    }

    let parsed: ParsedDoFile
    if (isPlain(relPath)) {
      parsed = { lines: splitDoLines(text) }
      inv.plain++
      inventoryLines(parsed.lines, inv)
    } else {
      parsed = parseSectionedFile(text)
      inv.sectioned++
      for (const section of parsed.sections) {
        if (section.name === '__preamble') continue
        bump(inv.sectionNames, section.name)
        inventoryLines(section.lines, inv)
      }
    }
    inv.files++

    const outPath = join(
      outRoot,
      relPath.endsWith('.txt') ? relPath.replace(/\.txt$/, '.json') : `${relPath}.json`,
    )
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, `${JSON.stringify(parsed, null, 1)}\n`)
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} file(s) failed to import:`)
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }

  writeFileSync(
    join(outRoot, 'meta.json'),
    `${JSON.stringify({ repo: 'DivinumOfficium/divinum-officium', commit, commitDate }, null, 2)}\n`,
  )
  writeFileSync(
    join(outRoot, 'inventory.json'),
    `${JSON.stringify(
      {
        files: inv.files,
        sectioned: inv.sectioned,
        plain: inv.plain,
        lines: inv.lines,
        calls: sortedRecord(inv.calls),
        macros: sortedRecord(inv.macros),
        scopes: sortedRecord(inv.scopes),
        sectionNames: sortedRecord(inv.sectionNames),
        conditionExprs: sortedRecord(inv.conditionExprs),
      },
      null,
      1,
    )}\n`,
  )

  console.log(
    `Imported ${inv.files} files (${inv.sectioned} sectioned, ${inv.plain} plain, ${inv.lines} lines) → ${relative(repoRoot, outRoot)}`,
  )
  console.log(
    `Inventory: ${inv.calls.size} &calls, ${inv.macros.size} $macros, ${inv.conditionExprs.size} condition exprs, ${inv.sectionNames.size} section names`,
  )
}

main()
