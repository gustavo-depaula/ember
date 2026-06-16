// Line-level tokenizer for Divinum Officium content lines. Classification
// mirrors where each syntax is interpreted in the Perl engine: conditionals
// (process_conditional_lines), @-inclusions (InclusionRegex), $-macros and
// &-calls (the specials loop), '!' rubric/citation lines, '_' blank markers.
// Everything else is text — exactly like Perl, which has no "unknown token".
// Used by the importer as a validation/inventory pass and by the engine at
// assembly time.

import { type LineConditional, matchLineConditional } from './conditions'

export type DoLineToken =
  | { kind: 'conditional'; directive: LineConditional }
  | { kind: 'inclusion'; file: string; section: string; substitutions: string }
  | { kind: 'macro'; name: string }
  | { kind: 'call'; name: string; args: string }
  | { kind: 'rubric'; text: string }
  | { kind: 'blank' }
  | { kind: 'text'; text: string }

// Port of SetupString.pl's $InclusionRegex (without the /m multiline aspect —
// we operate line by line). All three parts are optional: a bare '@' is a
// self-reference resolved against the enclosing file and section.
const inclusionRegex = /^\s*@([^\n:]+)?(?::([^\n:]+?))?[^\S\n\r]*(?::(.*))?$/

const callRegex = /^&([a-zA-Z_][\w]*)(?:\((.*)\))?\s*$/
const macroRegex = /^\$(.+)$/

// Port of $blankline_regex.
const blankRegex = /^\s*_?\s*$/

export function tokenizeLine(line: string): DoLineToken {
  const directive = matchLineConditional(line)
  if (directive) return { kind: 'conditional', directive }

  if (line.trimStart().startsWith('@')) {
    const m = inclusionRegex.exec(line)
    if (m) {
      return { kind: 'inclusion', file: m[1] ?? '', section: m[2] ?? '', substitutions: m[3] ?? '' }
    }
  }

  if (line.startsWith('&')) {
    const m = callRegex.exec(line)
    if (m) return { kind: 'call', name: m[1], args: m[2] ?? '' }
  }

  if (line.startsWith('$')) {
    const m = macroRegex.exec(line)
    if (m) return { kind: 'macro', name: m[1].trim() }
  }

  if (line.startsWith('!')) return { kind: 'rubric', text: line.slice(1) }
  if (blankRegex.test(line)) return { kind: 'blank' }
  return { kind: 'text', text: line }
}
