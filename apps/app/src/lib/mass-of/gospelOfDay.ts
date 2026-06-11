import type { ContentLanguage } from '@ember/content-engine'
import { resolveOfDay } from '@ember/mass'
import type { Lang, ReadingSet } from '@ember/missal-schema'
import { cycleKeyFor, loadMassFormulary, loadOfCalendar, scopeForContentLang } from './loaders'

export type EmberLang = 'la' | 'es' | 'en' | 'pt-BR' | 'it' | 'fr' | 'de'

export function emberLang(lang: ContentLanguage): EmberLang {
  return (lang === 'en-US' ? 'en' : lang) as EmberLang
}

const toSchemaLang = (l: EmberLang): Lang => (l === 'en' ? 'en-US' : l) as Lang

function gospelFrom(set: ReadingSet | undefined, lang: Lang): { text?: string; citation?: string } {
  const opt = set?.gospel?.options[0]
  if (!opt) return {}
  const lines = opt.body.lines[lang] ?? opt.body.lines['pt-BR']
  const text = lines?.map((line) => line.map((s) => s.text).join(' ')).join('\n')
  return { text, citation: opt.citation?.[lang] ?? opt.body.citation?.[lang] }
}

export type GospelOfDay = {
  text: string
  citation?: string
}

/**
 * Today's Gospel from the rebuilt OF corpus — the offline, computed reading.
 * Resolves the day, then walks its celebrations (falling back to the temporal
 * formulary for memorials with no proper readings) for the first Gospel.
 * Shared by the Explore `useGospelOfTheDay` hook and the Vatican News producer's
 * offline/web fallback.
 */
export async function loadGospelOfDay(
  date: Date,
  lang: EmberLang,
): Promise<GospelOfDay | undefined> {
  const calendar = await loadOfCalendar()
  if (!calendar) return undefined
  const schemaLang = toSchemaLang(lang)
  const day = resolveOfDay(date, calendar, { scope: scopeForContentLang(lang) })

  const refs = day.celebrations.map((c) => c.ref)
  if (day.temporalRef && !refs.includes(day.temporalRef)) refs.push(day.temporalRef)

  for (const ref of refs) {
    const f = await loadMassFormulary(ref)
    if (!f?.readings) continue
    const ck = cycleKeyFor(f, day.cycle, day.weekdayCycle)
    const g = gospelFrom(ck ? f.readings[ck] : undefined, schemaLang)
    if (g.text) return { text: g.text, citation: g.citation }
  }
  return undefined
}
