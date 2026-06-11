import { z } from 'zod'
import { type Lang, langs, localizedSchema } from './lang'

/**
 * Segment types are purely semantic — no presentational types, no HTML.
 * `voice` is reserved for Passion-narrative voicing (narrator / christ /
 * crowd); the extractor populates it only where upstream typography marks it.
 */
export const segmentSchema = z.object({
  type: z.enum(['text', 'rubric', 'reference', 'italic', 'response', 'signOfCross', 'dropCap']),
  text: z.string(),
  voice: z.enum(['narrator', 'christ', 'crowd']).optional(),
})
export type Segment = z.infer<typeof segmentSchema>

export const lineSchema = z.array(segmentSchema)
export type Line = Segment[]

const linesByLangSchema = z
  .object(Object.fromEntries(langs.map((l) => [l, z.array(lineSchema).optional()])))
  .partial()

/**
 * The only text shape in the corpus. No `plain` denormalization — consumers
 * join lines on demand. Citation lives inline (no Antiphon-style
 * body/citation bifurcation).
 */
export const richTextSchema = z.object({
  lines: linesByLangSchema,
  citation: localizedSchema.optional(),
})
export type RichText = {
  lines: Partial<Record<Lang, Line[]>>
  citation?: Partial<Record<Lang, string>>
}
