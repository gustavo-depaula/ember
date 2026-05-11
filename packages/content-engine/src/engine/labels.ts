import type { ContentLanguage, LocalizedText } from '../types'

export type RenderedLiturgicalColor =
  | 'white'
  | 'red'
  | 'green'
  | 'violet'
  | 'rose'
  | 'black'
  | 'gold'

export const RANK_LABELS: Record<string, LocalizedText> = {
  solemnity: { 'en-US': 'Solemnity', 'pt-BR': 'Solenidade' },
  feast: { 'en-US': 'Feast', 'pt-BR': 'Festa' },
  memorial: { 'en-US': 'Memorial', 'pt-BR': 'Memória' },
  'optional-memorial': {
    'en-US': 'Optional Memorial',
    'pt-BR': 'Memória facultativa',
  },
}

export const CYCLE_LABEL_RE = /^(A|B|C|I|II)$/

export const LITURGICAL_COLOR_LABELS: Record<string, LocalizedText> = {
  white: { 'en-US': 'White', 'pt-BR': 'Branca' },
  red: { 'en-US': 'Red', 'pt-BR': 'Vermelha' },
  green: { 'en-US': 'Green', 'pt-BR': 'Verde' },
  violet: { 'en-US': 'Violet', 'pt-BR': 'Roxa' },
  rose: { 'en-US': 'Rose', 'pt-BR': 'Rosa' },
  black: { 'en-US': 'Black', 'pt-BR': 'Preta' },
  gold: { 'en-US': 'Gold', 'pt-BR': 'Dourada' },
}

export const SOURCE_LABELS: Record<string, LocalizedText> = {
  tempore: { 'en-US': 'Tmp', 'pt-BR': 'Tmp' },
  sanctoral: { 'en-US': 'Snt', 'pt-BR': 'Snt' },
  common: { 'en-US': 'Com', 'pt-BR': 'Com' },
  ritual: { 'en-US': 'Rit', 'pt-BR': 'Rit' },
  votive: { 'en-US': 'Vot', 'pt-BR': 'Vot' },
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export type SourceFormulary = {
  source?: string
  [slot: string]: unknown
}

export type CelebrationLike = {
  primary?: SourceFormulary
  alternates?: SourceFormulary[]
}

/** Map ContentLanguage to ember-extra's language tags (en-US → en, others identical). */
export function emberExtraLang(lang: ContentLanguage): string {
  return lang === 'en-US' ? 'en' : lang
}

/** Pick a language fallback for the secondary text (Latin if available, else English). */
export function emberExtraSecondaryLang(primary: string): string {
  return primary === 'la' ? 'en' : 'la'
}
