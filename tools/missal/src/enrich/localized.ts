import type { Lang, Localized } from '@ember/missal-schema'
import { applyUniversalFixes } from '../fixes/universal'
import { type LoadedPatch, applyPatches } from '../patches'

/** Old-corpus language keys → normalized schema keys (en → en-US). */
const langMap: Record<string, Lang> = {
  la: 'la',
  es: 'es',
  en: 'en-US',
  'pt-BR': 'pt-BR',
  it: 'it',
  fr: 'fr',
  de: 'de',
}

export interface EnrichCtx {
  patches: LoadedPatch[]
  /** Formulary/order id, for scope-restricted patches. */
  id: string
}

function clean(text: string, lang: Lang, ctx: EnrichCtx): string {
  return applyPatches(ctx.patches, applyUniversalFixes(text), { lang, id: ctx.id })
}

/** Remap a baseline localized object to the normalized schema shape + fixes. */
export function toLocalized(raw: unknown, ctx: EnrichCtx): Localized | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Localized = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const lang = langMap[k]
    if (!lang || typeof v !== 'string') continue
    const text = clean(v, lang, ctx).trim()
    if (text) out[lang] = text
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export { langMap }
