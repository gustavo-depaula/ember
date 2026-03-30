import { format, getDate, getDay } from 'date-fns'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'
import {
  AnimatedPressable,
  FadeInView,
  HeaderFlourish,
  ManuscriptFrame,
  ScreenLayout,
  WatercolorIcon,
} from '@/components'
import { loadPracticeTracks } from '@/content/practices'
import complinePsalmsData from '@/content/practices/divine-office/data/compline-psalms.json'
import psalter30DayData from '@/content/practices/divine-office/data/psalter-30-day.json'
import type { CycleData } from '@/content/types'
import { useTracksForPractice } from '@/features/divine-office'
import { formatPsalmRefs, parsePsalmRef } from '@/features/divine-office/psalter'
import { useCompletionsForPractice } from '@/features/plan-of-life'
import { getPsalmNumbering } from '@/lib/bolls'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { formatTrackEntry } from '@/lib/lectio'
import type { OfficeHour } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

const hourToTrack: Record<OfficeHour, string> = {
  morning: 'ot-readings',
  evening: 'nt-readings',
  compline: 'ccc-readings',
}

const hourConfig = [
  {
    hour: 'morning' as const,
    labelKey: 'office.morningPrayer',
    sublabelKey: 'office.lauds',
    route: '/pray/divine-office?hour=morning',
    icon: 'sunrise' as const,
  },
  {
    hour: 'evening' as const,
    labelKey: 'office.eveningPrayer',
    sublabelKey: 'office.vespers',
    route: '/pray/divine-office?hour=evening',
    icon: 'book' as const,
  },
  {
    hour: 'compline' as const,
    labelKey: 'office.nightPrayer',
    sublabelKey: 'office.compline',
    route: '/pray/divine-office?hour=compline',
    icon: 'moon' as const,
  },
]

export default function OfficeScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  const todayDate = useMemo(() => new Date(), [])
  const today = useMemo(() => format(todayDate, 'yyyy-MM-dd'), [todayDate])
  const translation = usePreferencesStore((s) => s.translation)
  const numbering = getPsalmNumbering(translation)

  const { data: completions = [] } = useCompletionsForPractice('divine-office', today)
  const trackDefs = useMemo(() => loadPracticeTracks('divine-office'), [])
  const { data: trackRows = [] } = useTracksForPractice('divine-office')

  const completedHours = useMemo(() => new Set(completions.map((c) => c.detail)), [completions])

  const psalmsForDay = useMemo(() => {
    const cycle = psalter30DayData as unknown as CycleData
    const entries = (cycle.entries[numbering] ?? Object.values(cycle.entries)[0]) as Array<
      Record<string, (number | string)[]>
    >
    const index = (getDate(todayDate) - 1) % entries.length
    const entry = entries[index]
    return {
      morning: (entry.morning as (number | string)[]).map(parsePsalmRef),
      evening: (entry.evening as (number | string)[]).map(parsePsalmRef),
    }
  }, [todayDate, numbering])

  const complinePsalms = useMemo(() => {
    const cycle = complinePsalmsData as unknown as CycleData
    const entries = (cycle.entries[numbering] ?? Object.values(cycle.entries)[0]) as (
      | number
      | string
    )[][]
    const index = getDay(todayDate)
    return entries[index].map(parsePsalmRef)
  }, [todayDate, numbering])

  function getPsalmLabel(hour: OfficeHour): string {
    if (hour === 'morning') return formatPsalmRefs(psalmsForDay.morning)
    if (hour === 'evening') return formatPsalmRefs(psalmsForDay.evening)
    return formatPsalmRefs(complinePsalms)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack gap="$xs" alignItems="center">
          <HeaderFlourish />
          <Text fontFamily="$display" fontSize={32} lineHeight={38} color="$color">
            {t('office.title')}
          </Text>
          <Text fontFamily="$script" fontSize="$3" color="$colorSecondary">
            {formatLocalized(todayDate, 'EEEE, MMMM d')}
          </Text>
        </YStack>

        {hourConfig.map(({ hour, labelKey, sublabelKey, route, icon }, i) => {
          const completed = completedHours.has(hour)
          const readingLabel = (() => {
            const trackName = hourToTrack[hour]
            const def = trackDefs?.[trackName]
            const state = trackRows.find((r) => r.track === trackName)
            if (!def || !state) return ''
            const entry = def.entries[state.current_index % def.entries.length]
            const resolveBookName = (slug: string) => t(`bookName.${slug}`, { defaultValue: slug })
            return formatTrackEntry(def.source, entry, resolveBookName)
          })()
          const psalmLabel = getPsalmLabel(hour)

          return (
            <FadeInView key={hour} index={i}>
              <AnimatedPressable onPress={() => router.push(route as never)}>
                <ManuscriptFrame light>
                  <XStack gap="$md" alignItems="center">
                    <WatercolorIcon name={icon} size={44} />
                    <YStack gap="$xs" flex={1}>
                      <XStack alignItems="center" justifyContent="space-between">
                        <YStack>
                          <Text fontFamily="$heading" fontSize="$3" color="$colorBurgundy">
                            {t(labelKey)}
                          </Text>
                          <Text fontFamily="$script" fontSize="$2" color="$colorSecondary">
                            {t(sublabelKey)}
                          </Text>
                        </YStack>
                        {completed ? (
                          <Text fontFamily="$heading" fontSize="$1" color="$colorGreen">
                            {'\u2720'}
                          </Text>
                        ) : undefined}
                      </XStack>

                      {readingLabel ? (
                        <Text fontFamily="$body" fontSize="$2" color="$color">
                          {readingLabel}
                        </Text>
                      ) : undefined}
                      {psalmLabel ? (
                        <Text
                          fontFamily="$body"
                          fontSize="$1"
                          color="$colorMutedBlue"
                          numberOfLines={1}
                        >
                          {psalmLabel}
                        </Text>
                      ) : undefined}
                    </YStack>
                  </XStack>
                </ManuscriptFrame>
              </AnimatedPressable>
            </FadeInView>
          )
        })}
      </YStack>
    </ScreenLayout>
  )
}
