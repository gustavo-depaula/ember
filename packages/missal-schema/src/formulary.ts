import { z } from 'zod'
import { localizedSchema } from './lang'
import { richTextSchema } from './richtext'
import {
  gospelAcclamationSchema,
  prayerSchema,
  prefaceEntrySchema,
  readingSchema,
  readingsSchema,
  responsorialPsalmSchema,
  sequenceSchema,
} from './slots'
import { structureSchema } from './structure'

export const seasons = [
  'advent',
  'christmas',
  'lent',
  'holy-week',
  'easter',
  'ordinary-time',
] as const
export type Season = (typeof seasons)[number]
export const seasonSchema = z.enum(seasons)

export const liturgicalColors = [
  'green',
  'white',
  'red',
  'violet',
  'rose',
  'black',
  'gold',
] as const
export type LiturgicalColor = (typeof liturgicalColors)[number]
export const liturgicalColorSchema = z.enum(liturgicalColors)

export const ranks = [
  'solemnity',
  'feast',
  'memorial',
  'optional-memorial',
  'sunday',
  'weekday',
] as const
export type Rank = (typeof ranks)[number]
export const rankSchema = z.enum(ranks)

/**
 * Special-rite content tree: ordered blocks, nesting by source heading level.
 * Typed sub-structures (intercessions, vigil readings, baptismal Q&A) hang off
 * the part itself so consumers never dig through the tree for them.
 */
export type ContentBlock =
  | { kind: 'richtext'; body: z.infer<typeof richTextSchema> }
  | { kind: 'section'; heading: z.infer<typeof localizedSchema>; content: ContentBlock[] }

export const contentBlockSchema: z.ZodType<ContentBlock> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('richtext'), body: richTextSchema }),
    z.object({
      kind: z.literal('section'),
      heading: localizedSchema,
      content: z.array(contentBlockSchema),
    }),
  ]),
) as z.ZodType<ContentBlock>

export const solemnIntercessionSchema = z.object({
  ordinal: z.string().min(1), // 'I' … 'X'
  forWhom: localizedSchema,
  invitation: localizedSchema,
  silenceRubric: localizedSchema.optional(),
  collect: localizedSchema,
  response: localizedSchema.optional(),
})
export type SolemnIntercession = z.infer<typeof solemnIntercessionSchema>

export const vigilReadingUnitSchema = z.object({
  ordinal: z.number().int().min(1),
  rubric: localizedSchema.optional(),
  reading: readingSchema.optional(),
  psalm: responsorialPsalmSchema.optional(),
  collect: prayerSchema.optional(),
})
export type VigilReadingUnit = z.infer<typeof vigilReadingUnitSchema>

export const baptismalPromiseSchema = z.object({
  question: localizedSchema,
  response: localizedSchema,
})
export type BaptismalPromise = z.infer<typeof baptismalPromiseSchema>

export const specialPartSchema = z.object({
  heading: localizedSchema,
  content: z.array(contentBlockSchema),
  solemnIntercessions: z.array(solemnIntercessionSchema).optional(), // Good Friday
  oldTestamentReadings: z.array(vigilReadingUnitSchema).optional(), // Easter Vigil / Pentecost Vigil
  renewalOfBaptismalPromises: z.array(baptismalPromiseSchema).optional(), // Easter Vigil
})
export type SpecialPart = z.infer<typeof specialPartSchema>

export const formularyKinds = ['temporal', 'sanctoral', 'common', 'ritual', 'votive'] as const
export type FormularyKind = (typeof formularyKinds)[number]

export const cycleSchemes = ['sunday', 'weekday', 'fixed'] as const
export type CycleScheme = (typeof cycleSchemes)[number]

export const massFormularySchema = z.object({
  id: z.string().min(1), // 'tempore.advent.week-1.sunday'
  kind: z.enum(formularyKinds),
  scope: z.string().min(1).default('universal'),
  structure: structureSchema,

  /** Display-ready at rest: cased, de-prefixed, vigil/day disambiguated. */
  title: localizedSchema,
  /** e.g. 'Missa da Vigília' — merged into the picker chip where titles collide. */
  subtitle: localizedSchema.optional(),
  /** Saint/feast biographical sketch (sanctoral). */
  description: localizedSchema.optional(),

  season: seasonSchema.optional(),
  color: liturgicalColorSchema.optional(),
  rank: rankSchema.optional(),

  cycleScheme: z.enum(cycleSchemes),
  includeGloria: z.boolean(),
  /** OT ferials: orations come from the governing Sunday's formulary. */
  inheritsOrationsFrom: z.string().optional(),

  entranceAntiphon: prayerSchema.optional(),
  collect: prayerSchema.optional(),
  readings: readingsSchema.optional(),
  prayerOverOfferings: prayerSchema.optional(),
  /** Pre-resolved: proper first, then legitimate alternatives. */
  prefaces: z.array(prefaceEntrySchema).optional(),
  communionAntiphon: prayerSchema.optional(),
  postcommunion: prayerSchema.optional(),
  /** Proper in Lent (super populum — mandatory there), optional elsewhere. */
  prayerOverPeople: prayerSchema.optional(),

  /** Present only when structure !== 'mass': typed special-rite parts. */
  parts: z.record(z.string(), specialPartSchema).optional(),
})
export type MassFormulary = z.infer<typeof massFormularySchema>

// Referenced for completeness; gospel acclamations and sequences live inside
// readingSetSchema but are re-exported here for consumers of formulary types.
export { gospelAcclamationSchema, sequenceSchema }
