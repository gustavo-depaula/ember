import { getDate, getDay } from 'date-fns'
import type { RenderedSection } from '../../types'
import { bilingualOf, type EngineContext, type FlowContext } from '../context'

export function getCycleIndex(
  indexBy: string,
  date: Date,
  length: number,
  context: FlowContext,
): number {
  if (indexBy === 'program-day') return (context.programDay ?? 0) % length
  if (indexBy === 'day-of-month') return (getDate(date) - 1) % length
  if (indexBy === 'day-of-week') return getDay(date)
  if (indexBy === 'fixed') return 0
  return 0
}

export function mapCycleOutput(as: string, raw: unknown, ec: EngineContext): RenderedSection[] {
  if (as === 'psalmody') {
    // Cycle's psalmody shortcut: emit an include of the host's psalmody
    // source with the entry's psalm refs as params.
    const psalms = (raw as (number | string)[]).map(ec.parsePsalmRef)
    return [{ type: 'include', ref: ec.contentSources.psalmody, params: { psalms } }]
  }
  if (as === 'hymn') {
    const data = raw as {
      title: string
      la?: string
      text: { 'en-US'?: string; 'pt-BR'?: string; la?: string }
    }
    return [
      {
        type: 'hymn',
        title: bilingualOf(data.title),
        text: ec.localize({ ...data.text, la: data.la }),
      },
    ]
  }
  return []
}
