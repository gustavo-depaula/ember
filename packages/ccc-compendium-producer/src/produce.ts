import { fetchPage } from './fetchPage'
import { parseChapter } from './parse'
import type { ProduceContext, ProduceResult } from './types'

export const producerId = 'producer/ccc-compendium'

export async function produce(ctx: ProduceContext): Promise<ProduceResult> {
  const raw = await fetchPage(ctx.lang, ctx.fetch ?? fetch)
  return parseChapter(raw, ctx.chapter, ctx.lang)
}
