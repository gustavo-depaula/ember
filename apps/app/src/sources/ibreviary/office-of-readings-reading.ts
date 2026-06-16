import type { Primitive, TextPrimitive } from '@/content/primitives'
import type { SourceFetchContext } from '../types'
import { breviarySource } from './breviary'
import { type IbLang, ibLangFor } from './config'

// iBreviary's Office of Readings carries two readings: a scriptural first
// reading and a patristic/hagiographic second reading (the Fathers, councils,
// popes, or saints). Each edition opens the second reading with its own rubric
// and closes it with a responsory rubric — so the reading is the slice between
// them. Labels verified against the __fixtures__ for all three editions.
const secondReadingLabel: Record<IbLang, RegExp> = {
  en: /^SECOND READING/i,
  pt: /^SEGUNDA LEITURA/i,
  la: /^LECTIO ALTERA/i,
}
const responsoryLabel: Record<IbLang, RegExp> = {
  en: /^RESPONSORY/i,
  pt: /^RESPONS[ÓO]RIO/i,
  la: /^RESPONSORIUM/i,
}

const rubricFirstLine = (p: Primitive): string =>
  p.type === 'rubric' ? p.text.primary.split('\n')[0].trim() : ''

// Slice the patristic second reading out of a parsed Office of Readings. Drops
// the bare "SECOND READING" label (the practice already titles the card),
// keeping the source attribution → citation → theme → reading body. Stops
// before the responsory, so neither responsory nor the scriptural first reading
// leaks in. Throws if the reading can't be located (a parse/layout change),
// which surfaces preprocessFlow's retryable placeholder rather than caching junk.
export function extractSecondReading(primitives: Primitive[], appLang: string): Primitive[] {
  const ibLang = ibLangFor(appLang)
  const startRe = secondReadingLabel[ibLang]
  const endRe = responsoryLabel[ibLang]

  const start = primitives.findIndex((p) => startRe.test(rubricFirstLine(p)))
  if (start === -1) throw new Error('ibreviary: Office of Readings second reading not found')

  let end = primitives.length
  for (let i = start + 1; i < primitives.length; i++) {
    if (endRe.test(rubricFirstLine(primitives[i]))) {
      end = i
      break
    }
  }

  const slice = primitives.slice(start, end)
  // Drop the label line from the opening rubric; keep any merged-in remainder.
  const first = slice[0]
  if (first?.type === 'rubric') {
    const rest = first.text.primary.split('\n').slice(1).join('\n').trim()
    if (rest) slice[0] = { ...first, text: { ...first.text, primary: rest } }
    else slice.shift()
  }
  if (slice.length === 0) throw new Error('ibreviary: Office of Readings second reading empty')
  return slice
}

// Today's patristic / second reading from the modern Liturgy of the Hours
// Office of Readings. Composes producer/breviary-of-the-day (reusing its
// iBreviary session queue + per-day cache) and returns just the second reading.
// On web the breviary source yields a placeholder TextPrimitive (no CORS); it
// passes straight through.
export const officeOfReadingsReadingSource = {
  id: 'producer/office-of-readings-reading',
  version: '1',
  prefsDeps: ['lang' as const],
  dateScoped: true,
  async fetch(ctx: SourceFetchContext): Promise<Primitive[] | TextPrimitive> {
    const full = await ctx.sources.fetch(breviarySource, { hour: 'office-of-readings' })
    if (!Array.isArray(full)) return full
    return extractSecondReading(full, ctx.prefs.lang)
  },
}
