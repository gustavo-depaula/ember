import type { MassFormulary, Rank } from '@ember/missal-schema'
import type { CalloutPrimitive, Primitive } from '@/content/primitives'
import { bt, collapsible, type LangPrefs, text } from '../helpers'

const rankLabel: Record<Rank, { pt: string; en: string }> = {
  solemnity: { pt: 'Solenidade', en: 'Solemnity' },
  feast: { pt: 'Festa', en: 'Feast' },
  memorial: { pt: 'Memória', en: 'Memorial' },
  'optional-memorial': { pt: 'Memória facultativa', en: 'Optional Memorial' },
  sunday: { pt: 'Domingo', en: 'Sunday' },
  weekday: { pt: 'Féria', en: 'Weekday' },
}

/** The celebration banner: title + liturgical colour + rank. The schema's
 * `LiturgicalColor` values are exactly the callout's colour union. */
export function banner(f: MassFormulary, lang: LangPrefs): CalloutPrimitive {
  const out: CalloutPrimitive = {
    type: 'callout',
    variant: 'celebration-banner',
    title: bt(f.title, lang) ?? { primary: f.id },
  }
  if (f.color) out.color = f.color
  if (f.rank) out.rank = bt({ 'pt-BR': rankLabel[f.rank].pt, 'en-US': rankLabel[f.rank].en }, lang)
  return out
}

/** "About this saint/feast" — a collapsible biographical sketch. */
export function saintDescription(f: MassFormulary, lang: LangPrefs): Primitive | undefined {
  const desc = bt(f.description, lang)
  if (!desc) return undefined
  const title = bt(
    { 'pt-BR': 'Sobre esta celebração', 'en-US': 'About this celebration' },
    lang,
  ) ?? { primary: 'Sobre' }
  return collapsible(title, [text(desc)])
}
