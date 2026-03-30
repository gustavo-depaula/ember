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

import complinePsalmsData from '@/content/practices/divine-office/data/compline-psalms.json'
import psalter30DayData from '@/content/practices/divine-office/data/psalter-30-day.json'
import type { CycleData } from '@/content/types'
import type { ReadingTrack } from '@/db/schema'
import { useAllReadingProgress } from '@/features/divine-office'
import { formatPsalmRefs, parsePsalmRef } from '@/features/divine-office/psalter'
import { useCompletionsForPractice } from '@/features/plan-of-life'
import { getPsalmNumbering } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import type { OfficeHour } from '@/lib/liturgical'
import { readingTypeForHour } from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

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

function getReadingLabel(hour: OfficeHour, progressMap: Map<string, ReadingTrack>): string {
  const type = readingTypeForHour[hour]
  const progress = progressMap.get(type)
  if (!progress) return ''

  if (type === 'catechism') {
    return `CCC ${progress.current_chapter}-${progress.current_chapter + 7}`
  }

  const books = getDrbBooks()
  const book = books.find((b) => b.id === progress.current_book)
  return `${book?.name ?? progress.current_book} ${progress.current_chapter}`
}

export default function OfficeScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  const todayDate = useMemo(() => new Date(), [])
  const today = useMemo(() => format(todayDate, 'yyyy-MM-dd'), [todayDate])
  const translation = usePreferencesStore((s) => s.translation)
  const numbering = getPsalmNumbering(translation)

  const { data: completions = [] } = useCompletionsForPractice('divine-office', today)
  const { data: allProgress = [] } = useAllReadingProgress()

  const completedHours = useMemo(() => new Set(completions.map((c) => c.detail)), [completions])

  const progressMap = useMemo(
    () => new Map(allProgress.map((p): [string, ReadingTrack] => [p.type, p])),
    [allProgress],
  )

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
          const readingLabel = getReadingLabel(hour, progressMap)
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
