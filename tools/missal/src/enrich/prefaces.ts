import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Lang, Localized, PrefaceEntry } from '@ember/missal-schema'
import { type EnrichCtx, toLocalized } from './localized'
import { toRichText } from './richtext'
import { prettifyTitle } from './title'

/**
 * A preface title is "<HEADING IN CAPS> <Subtitle in Title Case>", e.g.
 * "PREFÁCIO DA PÁSCOA I O mistério pascal". Split the all-caps liturgical
 * heading (→ label) from the trailing mixed-case theme (→ excerpt). This is
 * the journal's iteration-1 finding: the subtitle is the discriminator.
 */
function splitPrefaceTitle(title: Localized): { label: Localized; excerpt: Localized } {
  const label: Localized = {}
  const excerpt: Localized = {}
  for (const [lang, text] of Object.entries(title) as Array<[Lang, string]>) {
    if (!text) continue
    const words = text.split(/\s+/)
    let cut = words.length
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      const letters = [...w].filter((c) => /\p{L}/u.test(c))
      const hasLower = letters.some((c) => c === c.toLowerCase() && c !== c.toUpperCase())
      // First word that carries a lowercase letter and isn't a roman numeral
      // marks the start of the subtitle.
      if (hasLower && !/^[IVX]+$/.test(w) && i > 0) {
        cut = i
        break
      }
    }
    label[lang] = words.slice(0, cut).join(' ')
    const sub = words.slice(cut).join(' ')
    if (sub) excerpt[lang] = sub
  }
  return { label: prettifyTitle(label), excerpt }
}

export type PrefaceLibrary = Map<string, { title: Localized; body: unknown }>

export function loadPrefaceLibrary(dataDir: string): Map<string, { titleRaw: unknown; body: unknown }> {
  const dir = join(dataDir, 'library', 'preface')
  const map = new Map<string, { titleRaw: unknown; body: unknown }>()
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json') || f.startsWith('_')) continue
    const d = JSON.parse(readFileSync(join(dir, f), 'utf-8')) as { id?: string; ordinal?: string; title?: unknown; body?: unknown }
    const ordinal = d.ordinal ?? f.replace(/\.json$/, '')
    const entry = { titleRaw: d.title, body: d.body }
    map.set(ordinal, entry)
    map.set(`preface.${ordinal}`, entry)
    if (d.id) map.set(d.id, entry)
  }
  return map
}

function buildEntry(
  id: string,
  titleRaw: unknown,
  body: unknown,
  ctx: EnrichCtx,
): PrefaceEntry | undefined {
  const rt = toRichText(body, ctx)
  if (!rt) return undefined
  const title = toLocalized(titleRaw, ctx) ?? {}
  const { label, excerpt } = splitPrefaceTitle(title)
  const entry: PrefaceEntry = { id, label: Object.keys(label).length ? label : { 'pt-BR': 'Prefácio' }, body: rt }
  if (Object.keys(excerpt).length > 0) entry.excerpt = excerpt
  return entry
}

/**
 * Resolve a baseline mass `preface` field into ordered PrefaceEntry[].
 * Handles both inline prefaces (`{ body, label }`) and library refs
 * (`{ prefaceRefs: [...] }`). Pre-resolution kills the runtime double-prefix
 * and dropped-alternatives bugs.
 */
export function resolvePrefaces(
  raw: unknown,
  lib: ReturnType<typeof loadPrefaceLibrary>,
  ctx: EnrichCtx,
): PrefaceEntry[] | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const field = raw as { prefaceRefs?: string[]; body?: unknown; title?: unknown; label?: unknown }
  const out: PrefaceEntry[] = []

  if (Array.isArray(field.prefaceRefs)) {
    for (const ref of field.prefaceRefs) {
      const found = lib.get(ref)
      if (!found) continue
      const entry = buildEntry(ref.replace(/^preface\./, ''), found.titleRaw, found.body, ctx)
      if (entry) out.push(entry)
    }
  } else if (field.body) {
    // Inline proper preface — title may live under `label`.
    const entry = buildEntry(`${ctx.id}.proper`, field.title ?? field.label, field.body, ctx)
    if (entry) out.push(entry)
  }

  return out.length > 0 ? out : undefined
}
