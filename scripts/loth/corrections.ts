// The archive's slips of the pen: a word misspelt in some of its hours and
// right in the others. Each is put right in the HTML before anything reads
// it, the importer and the comparisons alike, so the reference is the archive
// as corrected here and nothing else.
//
// Only what cannot be another reading belongs in this list. Where two hours
// have the same text with a different word, and both are words, it is a
// question for the book (`variants.py` lists them), not for this file.
const slips: [RegExp, string][] = [
  [/\bInvitatário\b/g, 'Invitatório'],
  [/\bimediatamente(\s+)ào\b/g, 'imediatamente$1ao'],
  [/\blgreja\b/g, 'Igreja'],
  [/\bdipersastes\b/g, 'dispersastes'],
  [/\bsarcedotes\b/g, 'sacerdotes'],
  [/\bminhíalma\b/g, "minh'alma"],
]

export const withoutSlips = (html: string): string => slips.reduce((text, [slip, right]) => text.replace(slip, right), html)
