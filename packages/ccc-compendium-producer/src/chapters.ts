import type { ChapterId, Lang } from './types'

export const chapterOrder: ChapterId[] = [
  'motu-proprio',
  'introduction',
  'part-1',
  'part-2',
  'part-3',
  'part-4',
  'appendix-a',
  'appendix-b',
]

// Question-number range per chapter. Used to build the anchor index that maps
// each of the 598 Q numbers to its chapter. Chapters without questions
// (motu-proprio, introduction, appendices) are absent.
const questionRanges: Partial<Record<ChapterId, [number, number]>> = {
  'part-1': [1, 217],
  'part-2': [218, 356],
  'part-3': [357, 533],
  'part-4': [534, 598],
}

// The defining `<a name="…">` for each chapter, per language. The parser
// slices the source HTML on these anchor positions.
export const chapterAnchorNames: Record<Lang, Record<ChapterId, string>> = {
  'en-US': {
    'motu-proprio': 'MOTU PROPRIO',
    introduction: 'INTRODUCTION',
    'part-1': 'The Profession of Faith',
    'part-2': 'The Celebration of the Christian Mystery',
    'part-3': 'Life in Christ',
    'part-4': 'Christian Prayer',
    'appendix-a': 'APPENDIX',
    'appendix-b': 'B) FORMULAS OF CATHOLIC DOCTRINE',
  },
  'pt-BR': {
    'motu-proprio': 'MOTU PROPRIO',
    introduction: 'INTRODUÇÃO',
    'part-1': 'A PROFISSÃO DA FÉ',
    'part-2': 'A CELEBRAÇÃO DO MISTÉRIO CRISTÃO',
    'part-3': 'A VIDA EM CRISTO',
    'part-4': 'A ORAÇÃO CRISTÃ',
    'appendix-a': 'APÊNDICE',
    'appendix-b': 'B) FÓRMULAS DE DOUTRINA CATÓLICA',
  },
}

export const sourceHomepage = 'https://www.vatican.va/archive/compendium_ccc/'

export function sourceUrl(lang: Lang): string {
  const slug = lang === 'en-US' ? 'en' : 'po'
  return `https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_${slug}.html`
}

export function buildAnchorIndex(): Record<string, { chapter: ChapterId }> {
  const out: Record<string, { chapter: ChapterId }> = {}
  for (const id of chapterOrder) out[id] = { chapter: id }
  for (const [id, range] of Object.entries(questionRanges)) {
    for (let n = range[0]; n <= range[1]; n++) {
      out[String(n)] = { chapter: id as ChapterId }
    }
  }
  return out
}
