// Assembling the Mass of a day from the corpus, the way the Missal itself is
// used: the proper of the celebration first, then the common it draws on, then
// the day of the temporal cycle. Every source that has a part is kept as an
// option, so nothing the Missal permits is hidden.

import type { Celebration, OfDay } from './calendar/resolve'
import type { MassRef } from './calendar/temporal'
import type { Cycle, Doc, Formulary, Item, Lectionary, Localized, Part } from './types'

export interface MissalSource {
  formulary(id: string): Promise<Formulary | undefined>
  lectionary(id: string): Promise<Lectionary | undefined>
  prefaces(): Promise<Record<string, Doc>>
}

export interface PartOption {
  // Where the text comes from: the celebration itself, a common, or the day.
  source: 'proper' | 'common' | 'tempore'
  from: string
  title?: Localized
  // For a common: which of its Masses this is.
  subtitle?: Localized
  items: Item[]
}

export interface PrefaceOption {
  id: string
  title?: Localized
  items: Item[]
}

// A passage of the day's own rite that is not one of the Mass's standard
// parts: a procession, the washing of feet, the Exsultet.
export interface Rite {
  // The standard part it comes before, when one follows it.
  before?: Part
  items: Item[]
}

export interface MassPlan {
  day: OfDay
  celebration: Celebration
  mass: MassRef
  formulary?: Formulary
  lectionary?: Lectionary
  gloria: boolean
  creed: boolean
  // Each part's sources, the default first.
  parts: Partial<Record<Part, PartOption[]>>
  // A preface printed in full with the formulary is in `parts.preface`; these
  // are the prefaces the formulary names, or failing both the season's.
  prefaces: PrefaceOption[]
  rites: Rite[]
  sequence?: { required: boolean }
  // Conditions that hold today, for words said only on certain days.
  conditions: string[]
}

export const prayerParts = [
  'entranceAntiphon',
  'gloria',
  'collect',
  'creed',
  'beforeUniversalPrayer',
  'prayerOverOfferings',
  'preface',
  'communionAntiphon',
  'postcommunion',
  'prayerOverPeople',
] as const satisfies readonly Part[]

export const readingParts = [
  'firstReading',
  'psalm',
  'secondReading',
  'sequence',
  'acclamation',
  'gospel',
] as const satisfies readonly Part[]

function ofPart(doc: Doc | undefined, part: Part, cycles: ReadonlySet<Cycle>): Item[] {
  const all = (doc?.items ?? []).filter((item) => item.part === part)
  const today = all.filter((item) => !item.cycle || cycles.has(item.cycle))
  if (today.length > 0 || all.length === 0) return today
  // The lectionary sometimes gives one text for a single year and another for
  // "the other years", which the corpus files under the last of them.
  const last = all
    .map((item) => item.cycle)
    .sort()
    .at(-1)
  return all.filter((item) => item.cycle === last)
}

// A part that holds only its own heading ("Collect") has no text to pray.
function hasText(items: Item[]): boolean {
  return items.some((item) =>
    Object.values(item.text ?? {}).some((blocks) => blocks.some((b) => b.k === 'p')),
  )
}

function prefaceNumbers(day: OfDay): number[] {
  const { season, week, weekday, date } = day
  switch (season) {
    case 'advent':
      return date.getMonth() === 11 && date.getDate() >= 17 ? [2] : [1]
    case 'christmas':
      return [5, 6, 7]
    case 'lent':
      return [9, 10, 11, 12]
    case 'holy-week':
      return [15]
    case 'easter':
      // From the Ascension to the Saturday before Pentecost.
      return week >= 7 || (week === 6 && weekday >= 4)
        ? [21, 22, 16, 17, 18, 19, 20]
        : [16, 17, 18, 19, 20]
    default:
      return weekday === 0 ? [24, 25, 26, 27, 28, 29, 30, 31] : [58, 59, 60, 61, 62, 63]
  }
}

function conditionsOf(day: OfDay, mass: MassRef, kind?: string): string[] {
  const conditions: string[] = []
  const of = (prefix: string) => mass.formulary?.startsWith(prefix) ?? false
  // The octave runs to the Second Sunday of Easter, and begins at the Vigil.
  const easterOctave =
    day.season === 'easter' && (day.week === 1 || (day.week === 2 && day.weekday === 0))
  if (easterOctave || of('tempore.holy-week.easter-vigil')) conditions.push('easter-octave')
  if (day.season === 'christmas' && day.date.getMonth() === 11) conditions.push('christmas-octave')
  if (day.key === 'mary-mother-of-god' || of('tempore.christmas.nativity')) {
    conditions.push('christmas-octave')
  }
  if (day.key === 'pentecost' || of('tempore.easter.pentecost')) conditions.push('pentecost')
  if (day.key === 'epiphany' || of('tempore.christmas.epiphany')) conditions.push('epiphany')
  if (day.key === 'ascension' || of('tempore.easter.ascension')) conditions.push('ascension')
  if (of('tempore.holy-week.lords-supper')) conditions.push('lords-supper')
  // The dismissal carries a double alleluia through the octave and at Pentecost.
  if (conditions.includes('easter-octave') || conditions.includes('pentecost')) {
    conditions.push('double-alleluia')
  }
  if (kind === 'for-the-dead' || of('sanctorale.11-02')) conditions.push('for-the-dead')
  return [...new Set(conditions)]
}

/** The Gloria is said on Sundays outside Advent and Lent, on solemnities and feasts (GIRM 53). */
function saysGloria(day: OfDay, celebration: Celebration): boolean {
  if (day.key === 'holy-thursday' || day.key === 'holy-saturday') return true
  const penitential = day.season === 'advent' || day.season === 'lent' || day.season === 'holy-week'
  if (celebration.kind === 'tempore' && penitential) return false
  if (celebration.precedence <= 8) return true
  // The days within the octave of Christmas.
  return day.season === 'christmas' && day.date.getMonth() === 11 && celebration.kind === 'tempore'
}

/** The Creed is said on Sundays and solemnities (GIRM 68). */
function saysCreed(day: OfDay, celebration: Celebration): boolean {
  if (celebration.precedence <= 1) return false
  return day.weekday === 0 || celebration.precedence <= 4
}

export async function assembleMass(
  day: OfDay,
  celebration: Celebration,
  mass: MassRef,
  source: MissalSource,
): Promise<MassPlan> {
  const cycles: ReadonlySet<Cycle> = new Set([day.cycle, day.weekdayCycle])
  const ownDay = celebration.kind === 'tempore'
  const temporalMass = day.temporal.masses[0]

  const [formulary, lectionary, temporalFormulary, temporalLectionary, prefaces] =
    await Promise.all([
      mass.formulary ? source.formulary(mass.formulary) : undefined,
      source.lectionary(mass.lectionary),
      !ownDay && temporalMass?.formulary ? source.formulary(temporalMass.formulary) : undefined,
      !ownDay && temporalMass ? source.lectionary(temporalMass.lectionary) : undefined,
      source.prefaces(),
    ])
  const commons = (
    await Promise.all((formulary?.commons ?? []).map((id) => source.formulary(id)))
  ).filter((doc): doc is Formulary => doc !== undefined)

  const parts: MassPlan['parts'] = {}
  const add = (part: Part, option: PartOption) => {
    if (option.items.length === 0) return
    parts[part] = [...(parts[part] ?? []), option]
  }

  // A memorial may take what it lacks from the weekday; a feast or solemnity
  // has everything of its own or from its common.
  const mayUseWeekday = celebration.precedence >= 10
  for (const part of prayerParts) {
    const proper = ofPart(formulary, part, cycles)
    if (hasText(proper)) {
      add(part, {
        source: 'proper',
        from: formulary?.id ?? mass.lectionary,
        title: formulary?.title,
        items: proper,
      })
    }
    for (const common of commons) {
      const items = ofPart(common, part, cycles)
      if (hasText(items))
        add(part, {
          source: 'common',
          from: common.id,
          title: common.title,
          subtitle: common.subtitle,
          items,
        })
    }
    if (mayUseWeekday || !parts[part]) {
      const items = ofPart(temporalFormulary, part, cycles)
      if (hasText(items)) {
        add(part, {
          source: 'tempore',
          from: temporalFormulary?.id ?? '',
          title: temporalFormulary?.title,
          items,
        })
      }
    }
  }

  // Readings: a feast or solemnity reads its own; a memorial reads the weekday
  // unless its readings are proper, and offers its own as the alternative.
  const ownReadingsFirst =
    ownDay ||
    celebration.precedence <= 8 ||
    formulary?.properReadings === true ||
    lectionary?.properReadings === true
  for (const part of readingParts) {
    const proper: PartOption = {
      source: ownDay ? 'tempore' : 'proper',
      from: lectionary?.id ?? mass.lectionary,
      title: lectionary?.title,
      items: ofPart(lectionary, part, cycles),
    }
    const weekday: PartOption = {
      source: 'tempore',
      from: temporalLectionary?.id ?? '',
      title: temporalLectionary?.title,
      items: ofPart(temporalLectionary, part, cycles),
    }
    for (const option of ownReadingsFirst ? [proper, weekday] : [weekday, proper]) add(part, option)
  }
  // A sequence belongs to its own readings only.
  if (parts.sequence) parts.sequence = parts.sequence.filter((o) => o.from === lectionary?.id)
  if (parts.sequence?.length === 0) delete parts.sequence

  const prefaceIds = [
    ...(formulary?.prefaces ?? []),
    ...commons.flatMap((c) => c.prefaces ?? []),
    ...(temporalFormulary?.prefaces ?? []),
  ]
  const fallback = prefaceNumbers(day).map((n) => `preface.${n}`)
  const printed = hasText(parts.preface?.[0]?.items ?? [])
  const chosen = prefaceIds.length > 0 ? prefaceIds : printed ? [] : fallback
  const prefaceOptions = [...new Set(chosen)]
    .map((id) => prefaces[id])
    .filter((doc): doc is Doc => doc !== undefined)
    .map((doc) => ({ id: doc.id, title: doc.title, items: doc.items }))

  // Everything in the formulary that is not a standard part, kept where it stands.
  const rites: Rite[] = []
  let open: Item[] = []
  for (const item of formulary?.items ?? []) {
    if (item.cycle && !cycles.has(item.cycle)) continue
    if (!item.part) {
      if (item.text) open.push(item)
      continue
    }
    if (item.part === 'title') continue
    if (open.length > 0) {
      rites.push({ before: item.part, items: open })
      open = []
    }
  }
  if (open.length > 0) rites.push({ items: open })

  return {
    day,
    celebration,
    mass,
    formulary,
    lectionary,
    gloria: saysGloria(day, celebration),
    creed: saysCreed(day, celebration),
    parts,
    prefaces: prefaceOptions,
    rites,
    ...(lectionary?.sequence && parts.sequence ? { sequence: lectionary.sequence } : {}),
    conditions: conditionsOf(day, mass, formulary?.kind),
  }
}
