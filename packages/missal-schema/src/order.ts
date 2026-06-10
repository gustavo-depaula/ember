import { z } from 'zod'
import { localizedSchema } from './lang'
import { richTextSchema } from './richtext'

/** A generic Order-of-Mass slot: one prayer/chant/exchange, one small file. */
export const orderItemSchema = z.object({
  id: z.string().min(1), // 'order.gloria', 'order.penitential-act.a'
  title: localizedSchema.optional(),
  body: richTextSchema,
})
export type OrderItem = z.infer<typeof orderItemSchema>

/**
 * Eucharistic Prayer. `preface` present = intrinsic preface (EP IV, the four
 * VN EPs = Brazil's "OE V a/b/c/d", Reconciliation I-II): the renderer hides
 * the day-preface picker structurally, making the EP IV/V duplication bug
 * unrepresentable.
 */
export const eucharisticPrayerSchema = z.object({
  id: z.string().min(1), // 'order.eucharistic-prayer.iv'
  label: localizedSchema, // 'Oração Eucarística IV'
  /** Opening words the faithful actually hear — picker card preview. */
  excerpt: localizedSchema.optional(),
  preface: richTextSchema.optional(),
  /** The anaphora proper (post-Sanctus). Rubrics/responses live in the lines. */
  body: richTextSchema,
})
export type EucharisticPrayer = z.infer<typeof eucharisticPrayerSchema>

export const solemnBlessingSchema = z.object({
  id: z.string().min(1), // 'order.solemn-blessing.advent'
  title: localizedSchema.optional(),
  body: richTextSchema,
})
export type SolemnBlessing = z.infer<typeof solemnBlessingSchema>

/** Season → default solemn-blessing id (full picker still offers all). */
export const solemnBlessingDefaultsSchema = z.record(z.string(), z.string())
export type SolemnBlessingDefaults = z.infer<typeof solemnBlessingDefaultsSchema>

/**
 * The bundled delivery shape (one Hearth catalog item): every order slot keyed
 * by its id. Source files stay one-per-slot; build-corpus bundles them.
 */
export const orderOfMassSchema = z.object({
  items: z.record(z.string(), orderItemSchema),
  eucharisticPrayers: z.array(eucharisticPrayerSchema),
  solemnBlessings: z.array(solemnBlessingSchema),
  prayersOverThePeople: z.array(orderItemSchema),
  solemnBlessingDefaults: solemnBlessingDefaultsSchema,
})
export type OrderOfMass = z.infer<typeof orderOfMassSchema>
