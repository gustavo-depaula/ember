import { z } from 'zod'
import { type Localized, localizedSchema } from './lang'
import { type RichText, richTextSchema } from './richtext'

/**
 * An order piece is an ordered list of segments: fixed `text` runs and
 * pick-one `choice` sets. A choice's options carry their own `segments`, so a
 * choice can nest — e.g. the Penitential Act's three forms, each of which has
 * its own pick-one set of opening invitations. The renderer shows one option
 * at a time with a chip picker, so the prayer never faces a wall of every
 * alternative at once.
 */
export interface OrderText {
  kind: 'text'
  body: RichText
}
export interface OrderChoice {
  kind: 'choice'
  label: Localized // chip-group heading, e.g. 'Fórmula'
  options: OrderChoiceOption[]
}
export interface OrderChoiceOption {
  label: Localized
  segments: OrderSegment[]
}
export type OrderSegment = OrderText | OrderChoice

export const orderChoiceOptionSchema: z.ZodType<OrderChoiceOption> = z.lazy(() =>
  z.object({ label: localizedSchema, segments: z.array(orderSegmentSchema) }),
)

export const orderSegmentSchema: z.ZodType<OrderSegment> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('text'), body: richTextSchema }),
    z.object({
      kind: z.literal('choice'),
      label: localizedSchema,
      options: z.array(orderChoiceOptionSchema).min(1),
    }),
  ]),
)

/** A generic Order-of-Mass slot: one prayer/chant/exchange, one small file. */
export const orderItemSchema = z.object({
  id: z.string().min(1), // 'order.gloria', 'order.penitential-act.a'
  title: localizedSchema.optional(),
  body: richTextSchema, // full inline text — the fallback and search source
  // When present, the renderer walks these instead of `body`, turning pick-one
  // sets (Penitential Act forms, greeting formulas) into chip selectors.
  segments: z.array(orderSegmentSchema).optional(),
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
