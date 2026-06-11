import type { MassFormulary, Rank, Season } from '@ember/missal-schema'

/**
 * The Ordo spine: the fixed structure of the Roman-Rite OF Mass as an ordered
 * list of steps, walked once to weave the Ordinary (fixed `order.*` pieces)
 * with the day's propers in true liturgical order. `when` predicates make it
 * smart — Gloria only when said, Creed on Sundays/solemnities, the Sprinkling
 * Rite on Sundays, the Prayer over the People only when proper, etc.
 *
 * The structure is the same every day; only the propers and the active steps
 * vary. Special rites (Easter Vigil, Good Friday…) have their own renderer.
 */

export type ProperSlot =
  | 'entranceAntiphon'
  | 'collect'
  | 'prayerOverOfferings'
  | 'communionAntiphon'
  | 'postcommunion'
  | 'prayerOverPeople'

export interface SpineCtx {
  formulary: MassFormulary
  /** Orations source (== formulary unless it inherits from the Sunday). */
  orations: MassFormulary
  season: Season | undefined
  rank: Rank | undefined
  hasOrder: (id: string) => boolean
}

export type SpineStep =
  | { kind: 'section'; pt: string; en: string }
  | { kind: 'order'; id: string; collapsed?: boolean }
  | { kind: 'proper'; slot: ProperSlot; cards?: boolean }
  | { kind: 'readings' }
  | { kind: 'preface' }
  | { kind: 'eucharistic-prayer' }
  | { kind: 'rubric'; pt: string; en: string }

interface SpineEntry {
  step: SpineStep
  when?: (c: SpineCtx) => boolean
}

const isSundayOrSolemnity = (c: SpineCtx) => c.rank === 'sunday' || c.rank === 'solemnity'

/**
 * The Roman-Rite OF Mass spine. `order` steps carry no existence guard — a
 * missing piece is skipped automatically (see {@link activeSpine}); a `when`
 * on an `order` step is reserved for the *additional* liturgical condition
 * (Gloria when said, Creed on Sundays/solemnities, the Sprinkling Rite on
 * Sundays/Easter).
 */
export const massSpine: SpineEntry[] = [
  // ── Introductory Rites ──
  { step: { kind: 'section', pt: 'Ritos Iniciais', en: 'Introductory Rites' } },
  // The Entrance Antiphon accompanies the procession, before the Sign of the
  // Cross. Proper to the day; rendered only when the formulary carries one.
  {
    step: { kind: 'proper', slot: 'entranceAntiphon' },
    when: (c) => Boolean(c.formulary.entranceAntiphon),
  },
  { step: { kind: 'order', id: 'order.sign-of-the-cross' } },
  { step: { kind: 'order', id: 'order.greeting' } },
  // Sprinkling Rite replaces the Penitential Act on Sundays (esp. Easter).
  {
    step: { kind: 'order', id: 'order.sprinkling-rite', collapsed: true },
    when: (c) => c.rank === 'sunday' || c.season === 'easter',
  },
  { step: { kind: 'order', id: 'order.penitential-act' } },
  { step: { kind: 'order', id: 'order.kyrie' } },
  { step: { kind: 'order', id: 'order.gloria' }, when: (c) => c.formulary.includeGloria },
  { step: { kind: 'proper', slot: 'collect' } },

  // ── Liturgy of the Word ──
  { step: { kind: 'section', pt: 'Liturgia da Palavra', en: 'Liturgy of the Word' } },
  { step: { kind: 'readings' } },
  { step: { kind: 'rubric', pt: 'Homilia.', en: 'Homily.' } },
  { step: { kind: 'order', id: 'order.credo-nicene' }, when: isSundayOrSolemnity },
  { step: { kind: 'order', id: 'order.universal-prayer', collapsed: true } },

  // ── Liturgy of the Eucharist ──
  { step: { kind: 'section', pt: 'Liturgia Eucarística', en: 'Liturgy of the Eucharist' } },
  { step: { kind: 'order', id: 'order.preparation-of-gifts', collapsed: true } },
  { step: { kind: 'proper', slot: 'prayerOverOfferings' } },
  { step: { kind: 'order', id: 'order.preface-dialogue' } },
  { step: { kind: 'preface' } },
  { step: { kind: 'order', id: 'order.sanctus' } },
  { step: { kind: 'eucharistic-prayer' } },

  // ── Communion Rite ──
  { step: { kind: 'section', pt: 'Rito da Comunhão', en: 'Communion Rite' } },
  { step: { kind: 'order', id: 'order.our-father' } },
  { step: { kind: 'order', id: 'order.sign-of-peace' } },
  { step: { kind: 'order', id: 'order.agnus-dei' } },
  { step: { kind: 'order', id: 'order.communion-invitation' } },
  { step: { kind: 'proper', slot: 'communionAntiphon', cards: true } },
  { step: { kind: 'order', id: 'order.communion-silent', collapsed: true } },
  { step: { kind: 'proper', slot: 'postcommunion' } },

  // ── Concluding Rites ──
  { step: { kind: 'section', pt: 'Ritos Finais', en: 'Concluding Rites' } },
  {
    step: { kind: 'proper', slot: 'prayerOverPeople' },
    when: (c) => Boolean(c.formulary.prayerOverPeople),
  },
  { step: { kind: 'order', id: 'order.simple-blessing' } },
  { step: { kind: 'order', id: 'order.dismissal' } },
]

/** The steps active for a given day/formulary. A missing `order` piece is
 * dropped automatically; explicit `when`s apply the extra liturgical condition. */
export function activeSpine(ctx: SpineCtx): SpineStep[] {
  return massSpine
    .filter((e) => {
      if (e.step.kind === 'order' && !ctx.hasOrder(e.step.id)) return false
      return !e.when || e.when(ctx)
    })
    .map((e) => e.step)
}
