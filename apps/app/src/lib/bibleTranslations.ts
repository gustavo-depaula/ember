export type PsalmNumbering = 'mt' | 'lxx'

export type Translation = {
  code: string
  name: string
  language: string
  description: string
  numbering: PsalmNumbering
  /**
   * Directory under `bible/` for a public-domain translation built into the
   * corpus. Absent for an in-copyright one, read from its publisher by the
   * matching entry in `sources/bible`.
   */
  corpus?: string
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
    description: 'Mgr Ronald Knox’s literary translation of the Vulgate. Read from Baronius Press.',
    numbering: 'lxx',
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
    description:
      'A tradução portuguesa do Pe. Matos Soares (edição de 1956). Lida no Lírio Católico.',
    numbering: 'lxx',
  },
  {
    code: 'VULG',
    name: 'Vulgata Clementina',
    language: 'LA',
    description: 'The Clementine Vulgate, the Church’s Latin Bible from 1592.',
    numbering: 'lxx',
    corpus: 'vulgate',
  },
]

export const defaultTranslationForLanguage: Record<string, string> = {
  'en-US': 'DRB',
  'pt-BR': 'AM',
}

export function findTranslation(code: string): Translation | undefined {
  return translations.find((t) => t.code === code)
}

export function getPsalmNumbering(code: string): PsalmNumbering {
  return findTranslation(code)?.numbering ?? 'lxx'
}
