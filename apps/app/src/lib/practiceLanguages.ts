import type { ContentLanguage } from '@ember/content-engine'

// Which language a prayer is prayed in, and which one keeps it company. One
// stance on Latin decides every prayer's default; a prayer the reader changes
// keeps its own choice (an override) until they send it back to the default
// or make it the default for every prayer. Plain module: the website can read
// the same rules.

export const contentLanguages: readonly ContentLanguage[] = ['en-US', 'pt-BR', 'la']

/** How much of the praying is in Latin. */
export type LatinStance = 'vernacular' | 'tradition' | 'always'
export const latinStances: readonly LatinStance[] = ['vernacular', 'tradition', 'always']

/**
 * How two languages share the page. `auto` interleaves on a phone and sets
 * columns where the window is wide enough for them.
 */
export type BilingualLayout = 'auto' | 'interleaved' | 'columns' | 'tap'
export const bilingualLayouts: readonly BilingualLayout[] = [
  'auto',
  'interleaved',
  'columns',
  'tap',
]

export type LanguageDefaults = {
  stance: LatinStance
  /** The reader's own language: what a prayer is prayed in when not in Latin. */
  vernacular: ContentLanguage
  layout: BilingualLayout
}

/** What the manifest says about a practice's languages. */
export type LanguageTraits = {
  /** The language the practice is prayed in by tradition (the Latin Mass, the hymns). */
  prayedIn?: ContentLanguage
  /** The languages it can be prayed in; absent, all of them. */
  languages?: ContentLanguage[]
  /**
   * Which pairings its text has. `false`: none (one language at a time);
   * `'la'`: only a language with Latin, the way the missals set it. Absent: any.
   */
  parallel?: false | 'la'
}

/** One prayer's own choice. `follow: 'none'` is a choice too: no companion. */
export type LanguageOverride = {
  pray?: ContentLanguage
  follow?: ContentLanguage | 'none'
  layout?: BilingualLayout
  /** Kept as is when the defaults change: set by "only this prayer" with nothing else changed. */
  pinned?: true
}

export type ResolvedLanguages = {
  pray: ContentLanguage
  follow: ContentLanguage | undefined
  layout: BilingualLayout
  prayOptions: ContentLanguage[]
  followOptions: ContentLanguage[]
  overridden: boolean
}

function prayable(traits: LanguageTraits): ContentLanguage[] {
  return traits.languages?.length ? traits.languages : [...contentLanguages]
}

export function companionOptions(traits: LanguageTraits, pray: ContentLanguage): ContentLanguage[] {
  if (traits.parallel === false) return []
  const languages = prayable(traits)
  if (traits.parallel === 'la') {
    if (pray === 'la') return languages.filter((l) => l !== 'la')
    return languages.includes('la') ? ['la'] : []
  }
  return languages.filter((l) => l !== pray)
}

function stancePray(traits: LanguageTraits, defaults: LanguageDefaults): ContentLanguage {
  const languages = prayable(traits)
  const latin = languages.includes('la')
  if (latin && defaults.stance === 'always') return 'la'
  if (latin && defaults.stance === 'tradition' && traits.prayedIn === 'la') return 'la'
  if (languages.includes(defaults.vernacular)) return defaults.vernacular
  return languages.find((l) => l !== 'la') ?? languages[0]
}

// A prayer in a language not the reader's own has their language beside it.
function defaultFollow(traits: LanguageTraits, pray: ContentLanguage, defaults: LanguageDefaults) {
  if (pray === defaults.vernacular) return undefined
  return companionOptions(traits, pray).includes(defaults.vernacular)
    ? defaults.vernacular
    : undefined
}

export function resolveLanguages(
  traits: LanguageTraits,
  defaults: LanguageDefaults,
  override?: LanguageOverride,
): ResolvedLanguages {
  const prayOptions = prayable(traits)
  const pray =
    override?.pray && prayOptions.includes(override.pray)
      ? override.pray
      : stancePray(traits, defaults)
  const followOptions = companionOptions(traits, pray)
  const chosen = override?.follow
  const follow = (() => {
    if (chosen === 'none') return undefined
    if (chosen && followOptions.includes(chosen)) return chosen
    return defaultFollow(traits, pray, defaults)
  })()
  return {
    pray,
    follow,
    layout: override?.layout ?? defaults.layout,
    prayOptions,
    followOptions,
    overridden: override !== undefined,
  }
}

/**
 * The pair to fetch the text in, and whether the page shows it the other way
 * round. Every source that sets a text beside the Latin (both Masses, the
 * breviary) puts the vernacular first, so a prayer in Latin with a companion
 * is fetched vernacular-first and turned at the page; rubrics and headings,
 * which show the first language only, stay in the reader's language.
 */
export function fetchLanguages({ pray, follow }: Pick<ResolvedLanguages, 'pray' | 'follow'>): {
  primary: ContentLanguage
  secondary: ContentLanguage | undefined
  swapped: boolean
} {
  if (pray === 'la' && follow) return { primary: follow, secondary: 'la', swapped: true }
  return { primary: pray, secondary: follow, swapped: false }
}

function withoutUndefined(override: LanguageOverride): LanguageOverride | undefined {
  const entries = Object.entries(override).filter(([, v]) => v !== undefined)
  return entries.length ? (Object.fromEntries(entries) as LanguageOverride) : undefined
}

/**
 * A prayer's override after the reader changes one thing in its sheet. A field
 * equal to what the defaults already give is no override at all, unless the
 * prayer is pinned.
 */
export function patchOverride(
  traits: LanguageTraits,
  defaults: LanguageDefaults,
  current: LanguageOverride | undefined,
  patch: LanguageOverride,
): LanguageOverride | undefined {
  const next: LanguageOverride = { ...current, ...patch }
  if (next.pinned) return withoutUndefined(next)
  if (next.pray === resolveLanguages(traits, defaults).pray) next.pray = undefined
  if (next.follow !== undefined) {
    const unset = resolveLanguages(traits, defaults, { ...next, follow: undefined }).follow
    if ((next.follow === 'none' ? undefined : next.follow) === unset) next.follow = undefined
  }
  if (next.layout === defaults.layout) next.layout = undefined
  return withoutUndefined(next)
}

/**
 * The patch for picking the language to pray in. Picking the companion's
 * language turns the two round; otherwise the companion goes back to what the
 * defaults give beside the new language.
 */
export function prayPatch(resolved: ResolvedLanguages, pray: ContentLanguage): LanguageOverride {
  if (pray === resolved.follow) return { pray, follow: resolved.pray }
  return { pray, follow: undefined }
}

/** "Only this prayer" before anything was changed: freeze what it shows now. */
export function pinnedOverride(resolved: ResolvedLanguages): LanguageOverride {
  return {
    pinned: true,
    pray: resolved.pray,
    follow: resolved.follow ?? 'none',
    layout: resolved.layout,
  }
}

/**
 * "Every prayer": the defaults that make this prayer's choice everyone's. Latin
 * becomes the stance for every prayer; a vernacular becomes the reader's
 * language with no Latin. A companion turned off has no default to become.
 */
export function promotedDefaults(
  defaults: LanguageDefaults,
  resolved: ResolvedLanguages,
): LanguageDefaults {
  const pray = resolved.pray
  return {
    stance: pray === 'la' ? 'always' : 'vernacular',
    vernacular: pray === 'la' ? (resolved.follow ?? defaults.vernacular) : pray,
    layout: resolved.layout,
  }
}

/**
 * The layout the page sets: `single` without a companion; `auto` becomes
 * columns where the window is wide (landscape, a tablet, a desktop).
 */
export function pageLayout(
  layout: BilingualLayout,
  follow: ContentLanguage | undefined,
  wide: boolean,
): 'single' | Exclude<BilingualLayout, 'auto'> {
  if (!follow) return 'single'
  if (layout === 'auto') return wide ? 'columns' : 'interleaved'
  return layout
}

export function parseOverrides(raw: string | undefined): Record<string, LanguageOverride> {
  if (!raw) return {}
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') return {}
  const isLanguage = (v: unknown): v is ContentLanguage =>
    contentLanguages.includes(v as ContentLanguage)
  const out: Record<string, LanguageOverride> = {}
  for (const [id, value] of Object.entries(parsed as Record<string, LanguageOverride>)) {
    const override = withoutUndefined({
      pray: isLanguage(value?.pray) ? value.pray : undefined,
      follow: value?.follow === 'none' || isLanguage(value?.follow) ? value.follow : undefined,
      layout: bilingualLayouts.includes(value?.layout as BilingualLayout)
        ? value.layout
        : undefined,
      pinned: value?.pinned === true ? true : undefined,
    })
    if (override) out[id] = override
  }
  return out
}
