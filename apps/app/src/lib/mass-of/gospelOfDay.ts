import type { ContentLanguage } from '@ember/content-engine'
import { getDataSource } from '@ember/content-engine'
import type { Celebration, DayLiturgies, Formulary } from '@ember/mass'

export type EmberLang = 'la' | 'es' | 'en' | 'pt-BR' | 'it' | 'fr' | 'de'

export function emberLang(lang: ContentLanguage): EmberLang {
  return (lang === 'en-US' ? 'en' : lang) as EmberLang
}

// Readings are keyed by lectionary cycle ('A'/'B'/'C' Sundays, 'I'/'II'
// weekdays, 'default' fixed feasts), and mass-of doesn't pre-filter to the
// day's cycle. Iterate whatever keys are present and take the first with a
// gospel — robust to all three shapes.
export function pickGospelText(formulary: Formulary, lang: EmberLang): string | undefined {
  const readings = formulary.readings as Record<string, unknown> | undefined
  if (!readings) return undefined
  for (const cycle of Object.keys(readings)) {
    const cycleEntry = readings[cycle] as Record<string, unknown> | undefined
    const gospel = cycleEntry?.gospel as
      | {
          body?: { plain?: Record<string, string>; lines?: Record<string, unknown> }
          alternatives?: Array<{ body?: { plain?: Record<string, string> } }>
        }
      | undefined
    if (!gospel) continue
    const direct = gospel.body?.plain?.[lang]
    if (typeof direct === 'string' && direct.trim()) return direct
    const alt = gospel.alternatives?.[0]?.body?.plain?.[lang]
    if (typeof alt === 'string' && alt.trim()) return alt
  }
  return undefined
}

export function pickGospelCitation(formulary: Formulary, lang: EmberLang): string | undefined {
  const readings = formulary.readings as Record<string, unknown> | undefined
  if (!readings) return undefined
  for (const cycle of Object.keys(readings)) {
    const gospel = (readings[cycle] as Record<string, unknown> | undefined)?.gospel as
      | {
          citation?: Record<string, string>
          alternatives?: Array<{ citation?: Record<string, string> }>
        }
      | undefined
    if (!gospel) continue
    const direct = gospel.citation?.[lang]
    if (typeof direct === 'string' && direct.trim()) return direct
    const alt = gospel.alternatives?.[0]?.citation?.[lang]
    if (typeof alt === 'string' && alt.trim()) return alt
  }
  return undefined
}

export type GospelOfDay = {
  text: string
  citation?: string
  celebration?: Celebration
}

// Loads today's Gospel from the registered `mass-of` DataSource — the offline,
// corpus-computed reading. Shared by the Explore `useGospelOfTheDay` hook and
// the Vatican News gospel producer's offline/web fallback.
export async function loadGospelOfDay(
  date: Date,
  lang: EmberLang,
): Promise<GospelOfDay | undefined> {
  const source = getDataSource('mass-of')
  if (!source) return undefined
  const day = (await source.load(
    { calendar: 'of' },
    {
      fetchOwnAsset: async () => undefined,
      localize: (text) => ({
        primary: typeof text === 'string' ? text : ((text as Record<string, string>)[lang] ?? ''),
      }),
      t: (key) => key,
      now: () => date,
    },
  )) as DayLiturgies | undefined
  const celebration = day?.celebrations?.[0]
  if (!celebration) return undefined
  const text = pickGospelText(celebration.primary, lang)
  if (!text) return undefined
  return { text, citation: pickGospelCitation(celebration.primary, lang), celebration }
}
