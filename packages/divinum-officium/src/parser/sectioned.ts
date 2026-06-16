// Parses Divinum Officium's sectioned data-file format ([Section] headers)
// into an ordered, lossless structure. Mirrors setupstring_parse_file in
// SetupString.pl with one deliberate difference: Perl evaluates section-header
// conditionals and conditional lines at parse time; we preserve them so a
// single parsed file serves every rubric version (evaluation happens in the
// engine at runtime).

import type { ParsedDoFile } from '../types'
import { matchSectionHeader } from './conditions'

export type DoSection = {
  name: string
  // Raw condition expression from a `[Name] (condition)` header.
  condition?: string
  lines: string[]
}

export type SectionedDoFile = {
  // Ordered as in the source file. Duplicate names are possible (typically
  // alternatives gated by header conditions); the engine replicates Perl's
  // behavior where the last section whose condition holds wins.
  sections: DoSection[]
}

// Mirrors FileIO::do_read: strip BOM, split on \r?\n. Perl's split drops all
// trailing empty fields, so trailing blank lines at EOF disappear.
export function splitDoLines(text: string): string[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  return lines
}

export function parseSectionedFile(text: string): SectionedDoFile {
  const sections: DoSection[] = []
  let current: DoSection = { name: '__preamble', lines: [] }

  for (const line of splitDoLines(text)) {
    const header = matchSectionHeader(line)
    if (header) {
      sections.push(current)
      current = header.condition
        ? { name: header.name, condition: header.condition, lines: [] }
        : { name: header.name, lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)

  // A preamble exists only to host whole-file @-inclusions; drop it when blank.
  if (sections[0].name === '__preamble' && sections[0].lines.every((l) => !l.trim())) {
    sections.shift()
  }
  return { sections }
}

// Which DO files the Perl reads with `do_read` (flat lines) rather than
// `setupstring` (sections). Operates on the loader/import path — works on both
// the import-time relPath (`…/Mobile.txt`) and the runtime engine path
// (`…/Mobile`). Single source of truth for build-do-content, the corpus
// loader, and the filesystem loader.
export function isPlainPath(path: string): boolean {
  return (
    path.startsWith('Tabulae/') ||
    path.startsWith('horas/Ordinarium/') ||
    path.includes('/Psalterium/Psalmorum/') ||
    path.includes('/Regula/') ||
    (/\/Martyrologium[^/]*\//.test(path) && !/\/Mobile(\.txt)?$/.test(path))
  )
}

// Parse a raw DO file into the engine's structured form, choosing the shape
// from the path. This is what lets the corpus ship raw `.txt` and parse at
// load time instead of baking JSON at build time.
export function parseDoFile(path: string, text: string): ParsedDoFile {
  return isPlainPath(path) ? { lines: splitDoLines(text) } : parseSectionedFile(text)
}
