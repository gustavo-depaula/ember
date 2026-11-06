export type PsalmNumbering = 'mt' | 'lxx'

export type Translation = {
  code: string
  name: string
  language: string
  description: string
  numbering: PsalmNumbering
  /**
   * Directory under `bible/` for a translation built into the corpus. Absent
   * for one read from its publisher by the matching entry in `sources/bible`.
   */
  corpus?: string
  /**
   * The corpus edition is numbered otherwise than the Vulgate in places, and
   * ships `versification.json` mapping its verses onto the shared address.
   */
  versification?: true
  /** The corpus edition ships `words/<book>.json`: each word's lemma and parsing. */
  words?: true
  /** The edition the books this one lacks are read from, so a Testament reads as a whole Bible. */
  completes?: string
}

export const translations: Translation[] = [
  {
    code: 'DRB',
    name: 'Douay-Rheims Bible',
    language: 'EN',
    description: 'Bishop Challoner’s revision (1749–52), the classic English Catholic Bible.',
    numbering: 'lxx',
    corpus: 'drb',
  },
  {
    code: 'CPDV',
    name: 'Catholic Public Domain Version',
    language: 'EN',
    description: 'Ronald Conte’s modern English translation of the Vulgate (2009).',
    numbering: 'lxx',
    corpus: 'cpdv',
  },
  {
    code: 'KNOX',
    name: 'Knox Bible',
    language: 'EN',
    description: 'Mgr Ronald Knox’s literary translation of the Vulgate (1945–50).',
    numbering: 'lxx',
    corpus: 'knox',
  },
  {
    code: 'AM',
    name: 'Bíblia Ave Maria',
    language: 'PT',
    description:
      'A tradução dos Missionários Claretianos, a mais lida no Brasil. Lida dos Claretianos.',
    numbering: 'lxx',
  },
  {
    code: 'MS',
    name: 'Bíblia Matos Soares',
    language: 'PT',
    description: 'A tradução portuguesa do Pe. Matos Soares, na edição de 1956.',
    numbering: 'lxx',
    corpus: 'matos-soares',
  },
  {
    code: 'VULG',
    name: 'Vulgata Clementina',
    language: 'LA',
    description: 'The Clementine Vulgate, the Church’s Latin Bible from 1592.',
    numbering: 'lxx',
    corpus: 'vulgate',
  },
  {
    code: 'LXX',
    name: 'Septuagint',
    language: 'GRC',
    description:
      'The Greek Old Testament of the Apostles and the Fathers, in the text of Brenton’s edition (1851), after Codex Vaticanus. Its words are tagged from OpenScriptorium (CC BY 4.0) and GLAUx (CC BY-SA), with glosses from STEPBible.',
    numbering: 'lxx',
    corpus: 'greek-brenton',
    versification: true,
    words: true,
    completes: 'N1904',
  },
  {
    code: 'N1904',
    name: 'Nestle 1904',
    language: 'GRC',
    description:
      'Eberhard Nestle’s Greek New Testament (1904), the critical text of the British and Foreign Bible Society.',
    numbering: 'lxx',
    corpus: 'greek-nestle-1904',
    versification: true,
    words: true,
    completes: 'LXX',
  },
  {
    code: 'SBLGNT',
    name: 'SBL Greek New Testament',
    language: 'GRC',
    description:
      'Michael Holmes’s critical text (2010), © Society of Biblical Literature and Logos Bible Software, CC BY 4.0; parsing from MorphGNT, CC BY-SA.',
    numbering: 'lxx',
    corpus: 'greek-sblgnt',
    versification: true,
    words: true,
    completes: 'LXX',
  },
  {
    code: 'TISCH',
    name: 'Tischendorf',
    language: 'GRC',
    description:
      'Constantin von Tischendorf’s eighth critical edition (1869–72), weighted to Codex Sinaiticus, which he found.',
    numbering: 'lxx',
    corpus: 'greek-tischendorf',
    versification: true,
    words: true,
    completes: 'LXX',
  },
  {
    code: 'RP',
    name: 'Byzantine Text',
    language: 'GRC',
    description:
      'The majority text of the Greek manuscripts, as Robinson and Pierpont edited it (2018): the text the Greek Church reads.',
    numbering: 'lxx',
    corpus: 'greek-byzantine',
    versification: true,
    words: true,
    completes: 'LXX',
  },
  {
    code: 'WLC',
    name: 'Westminster Leningrad Codex',
    language: 'HBO',
    description:
      'The Hebrew Bible as the Leningrad Codex (1008) gives it, the oldest complete manuscript, with its vowels and cantillation.',
    numbering: 'mt',
    corpus: 'hebrew-wlc',
    completes: 'LXX',
  },
]

export const defaultTranslationForLanguage: Record<string, string> = {
  'en-US': 'DRB',
  'pt-BR': 'AM',
}

/**
 * The registry with the editions in the app's own language first, the rest in
 * registry order. `appLanguage` is a locale such as `pt-BR`.
 */
export function translationsFor(appLanguage: string): Translation[] {
  const own = appLanguage.slice(0, 2).toUpperCase()
  return [
    ...translations.filter((tr) => tr.language === own),
    ...translations.filter((tr) => tr.language !== own),
  ]
}

export function findTranslation(code: string): Translation | undefined {
  return translations.find((t) => t.code === code)
}

// The tag the reading components hyphenate and choose a face by.
const readingLanguages: Record<string, string> = {
  EN: 'en-US',
  PT: 'pt-BR',
  LA: 'la',
  GRC: 'grc',
  HBO: 'hbo',
}

/** The language an edition's text is set in, as `ReadingLanguage` takes it. */
export function editionLanguage(code: string): string {
  return readingLanguages[findTranslation(code)?.language ?? 'EN'] ?? 'en-US'
}

export function getPsalmNumbering(code: string): PsalmNumbering {
  return findTranslation(code)?.numbering ?? 'lxx'
}
