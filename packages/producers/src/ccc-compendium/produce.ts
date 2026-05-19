import { chapterForQuestion, extractQuestion, TOTAL_QUESTIONS } from './extract'
import { fetchPage } from './fetchPage'
import { parseChapter } from './parse'
import type { ChapterId, Lang } from './types'

// Structural-only typing — the package doesn't depend on the app's Primitive
// union, but the shape it returns must satisfy `ProsePrimitive` over there.
type ProsePrimitive = {
  type: 'prose'
  html: string
  anchors?: Record<string, { chapter: string }>
}

type SourceFetchContext = {
  date: Date
  prefs: { lang: string; translation: string }
  programDay?: number
  params: Record<string, unknown>
  sources: unknown
}

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function requireQNum(params: Record<string, unknown>, key: string): number {
  const raw = params[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_QUESTIONS)
    throw new Error(
      `ccc-compendium: param "${key}" must be 1..${TOTAL_QUESTIONS} (got ${String(raw)})`,
    )
  return n
}

// Returns the Compendium passage as a `prose` primitive: the renderer's
// ProseBlock handles the rendering. Practices divide the 598 Qs across days
// via cycle + per-day data files; this source is a pure fetch.
export const cccCompendiumSource = {
  id: 'producer/ccc-compendium',
  version: '2',
  prefsDeps: ['lang' as const],
  async fetch(ctx: SourceFetchContext): Promise<ProsePrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    const first = requireQNum(ctx.params, 'first')
    const last = requireQNum(ctx.params, 'last')
    if (first > last) throw new Error(`ccc-compendium: first (${first}) must be <= last (${last})`)

    const raw = await fetchPage(lang)
    // Q ranges can span chapter boundaries (e.g. Q217 closes Part 1, Q218
    // opens Part 2). Parse each chapter we touch exactly once.
    const chaptersTouched = new Set<ChapterId>()
    for (let q = first; q <= last; q++) chaptersTouched.add(chapterForQuestion(q))

    const parsedByChapter = new Map<ChapterId, string>()
    for (const chapter of chaptersTouched) {
      parsedByChapter.set(chapter, parseChapter(raw, chapter, lang).html)
    }

    const parts: string[] = []
    const anchors: Record<string, { chapter: string }> = {}
    for (let q = first; q <= last; q++) {
      const chapter = chapterForQuestion(q)
      const chapterHtml = parsedByChapter.get(chapter)
      if (!chapterHtml) continue
      parts.push(extractQuestion(chapterHtml, q))
      anchors[String(q)] = { chapter }
    }

    return { type: 'prose', html: parts.join('\n'), anchors }
  },
}

