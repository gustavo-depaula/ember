import { z } from 'zod'
import { type Lang, langs, localizedSchema } from './lang'
import { lineSchema, richTextSchema } from './richtext'

/**
 * Slot provenance: where a baked option came from. `common:<key>` marks
 * commons fill-in (e.g. `common:pastors`) so the missal's offered choices are
 * visible, never silently merged.
 */
export const slotSourceSchema = z.union([
  z.literal('proper'),
  z.string().regex(/^common:[a-z0-9-]+$/),
])
export type SlotSource = z.infer<typeof slotSourceSchema>

/**
 * Every prayer-like slot is `{ options: [...] }` — single-option slots get a
 * one-element array. This kills the `T | { alternatives: T[] }` branching.
 */
export const prayerOptionSchema = z.object({
  body: richTextSchema,
  label: localizedSchema.optional(),
  source: slotSourceSchema.optional(),
})
export const prayerSchema = z.object({
  options: z.array(prayerOptionSchema).min(1),
})
export type PrayerOption = z.infer<typeof prayerOptionSchema>
export type Prayer = z.infer<typeof prayerSchema>

export const readingOptionSchema = z.object({
  label: localizedSchema.optional(),
  citation: localizedSchema.optional(),
  /** "Leitura do Livro de Isaías" */
  introduction: localizedSchema.optional(),
  /** Italic one-line summary where upstream carries one. */
  summary: localizedSchema.optional(),
  body: richTextSchema,
  /** "Palavra do Senhor." */
  conclusion: localizedSchema.optional(),
  /** "Graças a Deus." */
  response: localizedSchema.optional(),
  source: slotSourceSchema.optional(),
})
export const readingSchema = z.object({
  options: z.array(readingOptionSchema).min(1),
})
export type ReadingOption = z.infer<typeof readingOptionSchema>
export type Reading = z.infer<typeof readingSchema>

const versesByLangSchema = z
  .object(Object.fromEntries(langs.map((l) => [l, z.array(z.array(lineSchema)).optional()])))
  .partial()

export const responsorialPsalmOptionSchema = z.object({
  label: localizedSchema.optional(),
  citation: localizedSchema.optional(),
  /** Refrains: first is the primary responsory, the rest are `vel`/`Or:` alternates. */
  responses: z.array(richTextSchema).min(1),
  /** Per language: list of verse blocks, each a list of lines. */
  verses: versesByLangSchema,
  source: slotSourceSchema.optional(),
})
export const responsorialPsalmSchema = z.object({
  options: z.array(responsorialPsalmOptionSchema).min(1),
})
export type ResponsorialPsalmOption = z.infer<typeof responsorialPsalmOptionSchema>
export type ResponsorialPsalm = z.infer<typeof responsorialPsalmSchema>

export const gospelAcclamationOptionSchema = z.object({
  /** versus-ante-evangelium = Lent (no Alleluia); alleluia-or-versus = either. */
  mode: z.enum(['alleluia', 'versus-ante-evangelium', 'alleluia-or-versus']),
  /** People's refrain — omitted in versus-ante-evangelium mode. */
  acclamation: richTextSchema.optional(),
  /** Cantor's scripture verse. */
  verse: richTextSchema,
  citation: localizedSchema.optional(),
  source: slotSourceSchema.optional(),
})
export const gospelAcclamationSchema = z.object({
  options: z.array(gospelAcclamationOptionSchema).min(1),
})
export type GospelAcclamationOption = z.infer<typeof gospelAcclamationOptionSchema>
export type GospelAcclamation = z.infer<typeof gospelAcclamationSchema>

/**
 * Victimae Paschali (required on Easter Sunday, optional in the octave),
 * Veni Sancte Spiritus (required), Lauda Sion / Stabat Mater (optional).
 * The bake stamps `required` per formulary, not per sequence text.
 */
export const sequenceSchema = z.object({
  label: localizedSchema.optional(),
  body: richTextSchema,
  required: z.boolean(),
})
export type Sequence = z.infer<typeof sequenceSchema>

export const readingSetSchema = z.object({
  firstReading: readingSchema.optional(),
  psalm: responsorialPsalmSchema.optional(),
  secondReading: readingSchema.optional(),
  sequence: sequenceSchema.optional(),
  gospelAcclamation: gospelAcclamationSchema.optional(),
  gospel: readingSchema.optional(),
})
export type ReadingSet = z.infer<typeof readingSetSchema>

export const cycleKeys = ['A', 'B', 'C', 'I', 'II', 'default'] as const
export type CycleKey = (typeof cycleKeys)[number]

export const readingsSchema = z
  .object(Object.fromEntries(cycleKeys.map((k) => [k, readingSetSchema.optional()])))
  .partial()
export type Readings = Partial<Record<CycleKey, ReadingSet>>

/** A pre-resolved preface: label + excerpt + full body baked at build time. */
export const prefaceEntrySchema = z.object({
  id: z.string().min(1),
  label: localizedSchema,
  /** The actual prayed words past the universal incipit — card preview text. */
  excerpt: localizedSchema.optional(),
  body: richTextSchema,
})
export type PrefaceEntry = z.infer<typeof prefaceEntrySchema>

export type { Lang }
