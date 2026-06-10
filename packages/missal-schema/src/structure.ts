import { z } from 'zod'

/**
 * The liturgical-structure census contract: every formulary the pipeline
 * emits is classified as one of these, and the renderer's dispatch is an
 * exhaustive switch over the same enum. An upstream liturgy that fits none
 * of them fails the build (census error) instead of rendering as a broken
 * plain Mass.
 */
export const structures = [
  'mass',
  'mass-with-blessing-and-procession', // Palm Sunday, Candlemas
  'mass-with-ashes', // Ash Wednesday
  'chrism-mass',
  'lords-supper',
  'good-friday', // Celebration of the Passion — not a Mass
  'easter-vigil',
  'vigil-mass', // Christmas/Pentecost/Epiphany/Assumption/John Baptist/Peter&Paul vigils
] as const
export type Structure = (typeof structures)[number]
export const structureSchema = z.enum(structures)
