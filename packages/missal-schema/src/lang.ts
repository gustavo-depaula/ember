import { z } from 'zod'

/**
 * BCP-47 codes used across the OF corpus. Upstream uses directory names
 * (latin/cast/engl/port/ital/fran/germ); the build pipeline normalizes to
 * these at parse time so `en` vs `en-US` mismatches can never reach the app.
 */
export const langs = ['la', 'es', 'en-US', 'pt-BR', 'it', 'fr', 'de'] as const
export type Lang = (typeof langs)[number]
export const langSchema = z.enum(langs)

/** The languages that drive design: validation requires these where coverage exists. */
export const driverLangs = ['pt-BR', 'la', 'en-US'] as const satisfies readonly Lang[]

export const localizedSchema = z
  .object(Object.fromEntries(langs.map((l) => [l, z.string().min(1).optional()])))
  .partial()
export type Localized = Partial<Record<Lang, string>>
