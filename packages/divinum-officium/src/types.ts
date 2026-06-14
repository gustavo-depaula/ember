import type { SectionedDoFile } from './parser/sectioned'

// Shape of a file under content/do/. Sectioned files ([Section] format —
// Tempora, Sancti, Commune, most of Psalterium, missa, Appendix) carry
// `sections`; plain files (Psalterium/Psalmorum psalms, Ordinarium hour
// scripts, Tabulae calendar/transfer tables) carry `lines`.
export type PlainDoFile = { lines: string[] }
export type ParsedDoFile = SectionedDoFile | PlainDoFile

export function isSectioned(file: ParsedDoFile): file is SectionedDoFile {
  return 'sections' in file
}

// Identifies a DO data file relative to web/www, without extension —
// e.g. 'horas/Latin/Sancti/01-25', 'missa/Latin/Ordo/Ordo',
// 'horas/Ordinarium/Laudes', 'Tabulae/Kalendaria/1960'.
export type DoPath = string
