import type { ChapterId, Lang } from './types'

export type ChapterSpec = {
  id: ChapterId
  title: { 'en-US': string; 'pt-BR': string }
  questionRange?: [number, number]
}

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

export const chapters: Record<ChapterId, ChapterSpec> = {
  'motu-proprio': {
    id: 'motu-proprio',
    title: { 'en-US': 'Motu Proprio', 'pt-BR': 'Motu Proprio' },
  },
  introduction: {
    id: 'introduction',
    title: { 'en-US': 'Introduction', 'pt-BR': 'Introdução' },
  },
  'part-1': {
    id: 'part-1',
    title: {
      'en-US': 'Part One — The Profession of Faith',
      'pt-BR': 'Primeira Parte — A Profissão de Fé',
    },
    questionRange: [1, 217],
  },
  'part-2': {
    id: 'part-2',
    title: {
      'en-US': 'Part Two — The Celebration of the Christian Mystery',
      'pt-BR': 'Segunda Parte — A Celebração do Mistério Cristão',
    },
    questionRange: [218, 356],
  },
  'part-3': {
    id: 'part-3',
    title: {
      'en-US': 'Part Three — Life in Christ',
      'pt-BR': 'Terceira Parte — A Vida em Cristo',
    },
    questionRange: [357, 533],
  },
  'part-4': {
    id: 'part-4',
    title: {
      'en-US': 'Part Four — Christian Prayer',
      'pt-BR': 'Quarta Parte — A Oração Cristã',
    },
    questionRange: [534, 598],
  },
  'appendix-a': {
    id: 'appendix-a',
    title: { 'en-US': 'A. Common Prayers', 'pt-BR': 'A. Orações Comuns' },
  },
  'appendix-b': {
    id: 'appendix-b',
    title: {
      'en-US': 'B. Formulas of Catholic Doctrine',
      'pt-BR': 'B. Fórmulas de Doutrina Católica',
    },
  },
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

const langToSlug: Record<Lang, 'en' | 'po'> = { 'en-US': 'en', 'pt-BR': 'po' }

export const sourceHomepage = 'https://www.vatican.va/archive/compendium_ccc/'

export function sourceUrl(lang: Lang): string {
  const slug = langToSlug[lang]
  return `https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_${slug}.html`
}

export function buildAnchorIndex(): Record<string, { chapter: ChapterId }> {
  const out: Record<string, { chapter: ChapterId }> = {}
  for (const id of chapterOrder) out[id] = { chapter: id }
  for (const id of chapterOrder) {
    const range = chapters[id].questionRange
    if (!range) continue
    for (let n = range[0]; n <= range[1]; n++) {
      out[String(n)] = { chapter: id }
    }
  }
  return out
}
