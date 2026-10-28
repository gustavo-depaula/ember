import { lookupMap } from '@ember/content-engine'
import { useQuery } from '@tanstack/react-query'

import { minutesText, practiceMinutes } from '@/content/duration'
import { getHourSelect } from '@/content/pins'
import { getManifest, loadFlow } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { localizeContent } from '@/lib/i18n'

/** The offices the Divine Office page lists, in its order. */
export const offices = ['liturgy-of-the-hours', 'breviary', 'breviary-monastic'] as const
export type OfficeId = (typeof offices)[number]

export type OfficeNow = {
  id: OfficeId
  /** The variant the person prays, which Pray opens. */
  variant: string
  name: string
  hour?: string
  minutes?: string
}

/**
 * Each office as it would open now: the hour its flow picks from the clock and
 * how long that hour takes, read from the variant the person prays (a breviary
 * of 1955 has its own hours and minutes). Pray opens the same flow, so the
 * hour named here is the hour that opens.
 */
export function useOfficesNow(): OfficeNow[] {
  const practices = useEventStore((s) => s.practices)
  const variants = offices.map((id) => practices.get(id)?.active_variant ?? id)
  // The real clock, as the flow reads it; the query re-runs when the hour turns.
  const clockHour = new Date().getHours()
  const { data } = useQuery({
    queryKey: ['offices-now', variants, clockHour] as const,
    queryFn: () =>
      Promise.all(
        variants.map(async (variant) => {
          const select = getHourSelect(await loadFlow(variant))
          const hourId = select?.map ? lookupMap(select.map, String(clockHour)) : undefined
          const option = select?.options.find((o) => o.id === hourId)
          return {
            hour: option && localizeContent(option.label),
            minutes: minutesText(practiceMinutes(getManifest(variant), { hour: option?.id })),
          }
        }),
      ),
  })
  return offices.map((id, i) => ({
    id,
    variant: variants[i],
    name: localizeContent(getManifest(id)?.name ?? {}),
    ...data?.[i],
  }))
}
