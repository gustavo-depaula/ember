import { z } from 'zod'
import { liturgicalColorSchema, rankSchema, seasonSchema } from './formulary'
import { localizedSchema } from './lang'
import { structureSchema } from './structure'

export const weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const
export type Weekday = (typeof weekdays)[number]

/**
 * Temporal slot map: how the calendar engine finds the formulary for a
 * computed temporal position. `movableCode` names Easter-relative anchors
 * (e.g. 'ascension', 'pentecost-vigil') resolved in code, not data.
 */
export const temporalEntrySchema = z.object({
  formularyRef: z.string().min(1),
  season: seasonSchema,
  week: z.number().int().min(0).optional(),
  weekday: z.enum(weekdays).optional(),
  /** Fixed-date temporal slots (Dec 17-24, Christmas octave, Jan 2-13…). */
  fixedDate: z
    .object({ month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) })
    .optional(),
  movableCode: z.string().optional(),
  structure: structureSchema,
})
export type TemporalEntry = z.infer<typeof temporalEntrySchema>

/**
 * Sanctoral date rules: fixed month/day or Easter-relative (Immaculate Heart =
 * Easter+69, Mary Mother of the Church = Easter+50).
 */
export const dateRuleSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('fixed'),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
  }),
  z.object({
    type: z.literal('easter-relative'),
    offsetDays: z.number().int(),
  }),
])
export type DateRule = z.infer<typeof dateRuleSchema>

export const sanctoralEntrySchema = z.object({
  formularyRef: z.string().min(1),
  dateRule: dateRuleSchema,
  rank: rankSchema,
  color: liturgicalColorSchema.optional(),
  scope: z.string().min(1).default('universal'),
  /** Set on vigil-mass entries: the formularyRef of the day Mass they belong to. */
  vigilOf: z.string().optional(),
  title: localizedSchema,
})
export type SanctoralEntry = z.infer<typeof sanctoralEntrySchema>

export const ofCalendarStaticsSchema = z.object({
  temporal: z.array(temporalEntrySchema),
  sanctoral: z.array(sanctoralEntrySchema),
})
export type OfCalendarStatics = z.infer<typeof ofCalendarStaticsSchema>
