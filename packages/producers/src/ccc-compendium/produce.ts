import { chapterForQuestion, extractQuestion, TOTAL_QUESTIONS } from './extract'
import { fetchPage } from './fetchPage'
import { parseChapter } from './parse'
import type { ChapterId, Lang } from './types'

type ProducerContext = {
  date: Date
  lang: string
  programDay?: number
  params?: Record<string, unknown>
}

type ReaderResult = {
  html: string
  anchors: Record<string, { chapter: string }>
}

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function requireQNum(params: ProducerContext['params'], key: string): number {
  const raw = params?.[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_QUESTIONS)
    throw new Error(
      `producer/ccc-compendium: param "${key}" must be 1..${TOTAL_QUESTIONS} (got ${String(raw)})`,
    )
  return n
}

// "Give me the HTML for Compendium questions {first}..{last}." Program-shape
// decisions (how the practice divides the 598 Qs across days) live in the
// practice's flow + data; this producer is a pure content-fetch service.
export const cccCompendiumProducer = {
  id: 'producer/ccc-compendium',
  kind: 'reader' as const,
  // Bump when output shape changes in a way that invalidates previously
  // cached payloads (anchor scheme change, html cleanup change…).
  version: '1',
  cacheKey: (ctx: ProducerContext) => {
    const first = requireQNum(ctx.params, 'first')
    const last = requireQNum(ctx.params, 'last')
    return `${first}-${last}`
  },
  async produce(ctx: ProducerContext): Promise<ReaderResult> {
    const lang = narrowLang(ctx.lang)
    const first = requireQNum(ctx.params, 'first')
    const last = requireQNum(ctx.params, 'last')
    if (first > last)
      throw new Error(`producer/ccc-compendium: first (${first}) must be <= last (${last})`)

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

    return { html: parts.join('\n'), anchors }
  },
}
