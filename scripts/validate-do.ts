#!/usr/bin/env tsx
/**
 * Validates the Divinum Officium submodule (content/do) with the same parser
 * and tokenizer the runtime engine uses, so format surprises upstream fail
 * here — not on a user's device. Writes nothing: the corpus ships the
 * upstream files verbatim (build_do() in scripts/build-corpus.py reads the
 * submodule directly).
 *
 * Run after moving the submodule pin: pnpm validate:do
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import {
  isPlainPath,
  parseSectionedFile,
  splitDoLines,
  tokenizeLine,
} from '../packages/divinum-officium/src'

const sourceRoot = resolve(__dirname, '..', 'content', 'do', 'web', 'www')

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
  'Martyrologium',
  'Martyrologium1570',
  'Martyrologium1955R',
  'Martyrologium1960',
]
const missaDirs = ['Tempora', 'Sancti', 'Commune', 'Ordo']
const tabulaeEntries = ['data.txt', 'Kalendaria', 'Transfer', 'Stransfer', 'Tempora']

// NOTE: this import scope (which upstream paths ship) is mirrored by
// build_do() in scripts/build-corpus.py — change both together.
// Plain (non-sectioned) files, by how the Perl engine reads them:
// psalms via do_read in &psalm, Ordinarium scripts via getordinarium,
// Tabulae tables via Directorium.pm, Regula chapters via do_read in regula(),
// Martyrologium day files via do_read in martyrologium() (Mobile.txt is the
// one sectioned file in those dirs). The predicate lives in the engine
// (`isPlainPath`) so this validator, the corpus loader, and the filesystem
// loader all classify identically.

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

// Decode strictly: a non-UTF-8 byte sequence upstream must fail validation,
// not ship mojibake.
const decoder = new TextDecoder('utf-8', { fatal: true })

type Inventory = {
  files: number
  sectioned: number
  plain: number
  lines: number
  calls: Set<string>
  macros: Set<string>
  conditionExprs: Set<string>
  sectionNames: Set<string>
}

function inventoryLines(lines: string[], inv: Inventory) {
  for (const line of lines) {
    inv.lines++
    const token = tokenizeLine(line)
    if (token.kind === 'conditional') inv.conditionExprs.add(token.directive.expr.trim())
    else if (token.kind === 'call') inv.calls.add(token.name)
    else if (token.kind === 'macro') inv.macros.add(token.name)
  }
}

function main() {
  const files = collectSourceFiles()
  if (!statSync(join(sourceRoot, 'Tabulae'), { throwIfNoEntry: false })) {
    throw new Error(`${sourceRoot} is empty — initialize the content/do submodule first`)
  }

  const inv: Inventory = {
    files: 0,
    sectioned: 0,
    plain: 0,
    lines: 0,
    calls: new Set(),
    macros: new Set(),
    conditionExprs: new Set(),
    sectionNames: new Set(),
  }
  const errors: string[] = []

  for (const file of files) {
    const relPath = relative(sourceRoot, file)
    let text: string
    try {
      text = decoder.decode(readFileSync(file))
    } catch {
      errors.push(`${relPath}: missing or not valid UTF-8`)
      continue
    }

    if (isPlainPath(relPath)) {
      inv.plain++
      inventoryLines(splitDoLines(text), inv)
    } else {
      inv.sectioned++
      for (const section of parseSectionedFile(text).sections) {
        if (section.name === '__preamble') continue
        inv.sectionNames.add(section.name)
        inventoryLines(section.lines, inv)
      }
    }
    inv.files++
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} file(s) failed validation:`)
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }

  console.log(
    `Validated ${inv.files} files (${inv.sectioned} sectioned, ${inv.plain} plain, ${inv.lines} lines)`,
  )
  console.log(
    `Inventory: ${inv.calls.size} &calls, ${inv.macros.size} $macros, ${inv.conditionExprs.size} condition exprs, ${inv.sectionNames.size} section names`,
  )
}

main()
