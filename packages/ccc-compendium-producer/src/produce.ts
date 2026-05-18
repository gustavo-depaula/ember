import {
  chapterForQuestion,
  extractQuestion,
  programDayToQuestionRange,
  totalProgramDays,
} from './extract'
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

const DEFAULT_Q_PER_DAY = 6

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function paramNumber(params: ProducerContext['params'], key: string, fallback: number): number {
  const raw = params?.[key]
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0) return raw
  if (typeof raw === 'string') {
    const n = Number(raw)
    if (Number.isInteger(n) && n > 0) return n
  }
  return fallback
}

export const cccCompendiumProgramProducer = {
  id: 'producer/ccc-compendium-program',
  kind: 'reader' as const,
  // Bump when produce()'s output shape changes in a way that invalidates
  // previously-cached payloads (anchor scheme change, html cleanup change…).
  version: '1',
  cacheKey: (ctx: ProducerContext) => {
    const day = ctx.programDay ?? 0
    const qPerDay = paramNumber(ctx.params, 'qPerDay', DEFAULT_Q_PER_DAY)
    return `${day}@${qPerDay}`
  },
  async produce(ctx: ProducerContext): Promise<ReaderResult> {
    const lang = narrowLang(ctx.lang)
    const day = ctx.programDay ?? 0
    const qPerDay = paramNumber(ctx.params, 'qPerDay', DEFAULT_Q_PER_DAY)
    const [first, last] = programDayToQuestionRange(day, qPerDay)

    const raw = await fetchPage(lang)
    // Q ranges can span chapter boundaries (e.g. day 37 = Q217–Q222 straddles
    // Part 1 → Part 2). Parse each chapter we touch exactly once.
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

export { totalProgramDays }
