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
  // A letter typed for the figure one in a citation.
  [/\b[lI](Cor|Pd|Sm)\b/g, '1$1'],
  [/\bPG 6l,/g, 'PG 61,'],
  [/\b(dê a sua graça) a (sua bênção)/g, '$1 e $2'],
  // The name of a source file, left in the middle of the hour.
  [/(strict\.dtd">\s*)3 janeiro(\s*<)/g, '$1$2'],
  [/\bagor a e sempre\b/g, 'agora e sempre'],
  // The versicle that opens an hour, a comma short and its signs typed as
  // letters.
  [/\bVinde,?(\s+)ó(\s+)Deus,?(\s+)em(\s+)meu(\s+)auxílio/g, 'Vinde,$1ó$2Deus,$3em$4meu$5auxílio'],
  [/\bV\.((?:\s|<[^>]*>)*Vinde,?\s+ó\s+Deus,?\s+em\s+meu\s+aux)/g, '℣.$1'],
  [/\bR\.((?:\s|<[^>]*>)*Socorrei-me\s+sem\s+demora)/g, '℟.$1'],
  // The doxology that opens an hour, its Amen left out.
  [/(agora e sempre\.)(\s*Aleluia)/g, '$1 Amém.$2'],
  // And its "Aleluia" left without the full stop.
  [/(agora\s+e\s+sempre\.\s*Amém\.(?:\s|&nbsp;)*Aleluia)(?!\.)/g, '$1.'],
]

export const withoutSlips = (html: string): string => slips.reduce((text, [slip, right]) => text.replace(slip, right), html)
