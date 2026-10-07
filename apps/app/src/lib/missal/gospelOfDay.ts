import { assembleMass, type Lang, readingOf, resolveOfDay } from '@ember/missal'
import { corpusMissal, loadMissalCalendar, regionsForJurisdiction } from './loaders'

export type GospelOfDay = {
  text: string
  citation?: string
}

/**
 * The Gospel of the day's principal Mass, from the same calendar and assembly
 * the Mass practice uses, so the two can never name different Gospels.
 */
export async function loadGospelOfDay(
  date: Date,
  lang: Lang,
  jurisdiction: string | undefined,
): Promise<GospelOfDay | undefined> {
  const calendar = await loadMissalCalendar()
  if (!calendar) return undefined
  const day = resolveOfDay(date, calendar, { regions: regionsForJurisdiction(jurisdiction) })
  const celebration = day.celebrations[0]
  if (!celebration) return undefined
  const plan = await assembleMass(day, celebration, celebration.masses[0], corpusMissal)
  // The first alternative only, where the lectionary offers a choice of Gospels.
  const items = plan.parts.gospel?.[0]?.items ?? []
  const first = items.find((item) => item.alt)?.alt?.option
  const gospel = readingOf(
    items.filter((item) => !item.alt || item.alt.option === first),
    lang,
  )
  return gospel.text ? gospel : undefined
}
