import { format } from 'date-fns'
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
import type { ReadingProgress } from '@/db/schema'
import { useAllReadingProgress, useDailyOfficeStatus } from '@/features/divine-office'
import { type OfficeHour, readingTypeForHour } from '@/features/divine-office/engine'
import {
  formatPsalmRefs,
  getComplinePsalms,
  getPsalmsForDay,
} from '@/features/divine-office/psalter'
import { getPsalmNumbering } from '@/lib/bolls'
import { getDrbBooks } from '@/lib/content'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { usePreferencesStore } from '@/stores/preferencesStore'

const hourConfig = [
  {
    hour: 'morning' as const,
    labelKey: 'office.morningPrayer',
    sublabelKey: 'office.lauds',
    route: '/office/morning',
    icon: 'sunrise' as const,
  },
  {
    hour: 'evening' as const,
    labelKey: 'office.eveningPrayer',
    sublabelKey: 'office.vespers',
    route: '/office/evening',
    icon: 'book' as const,
  },
  {
    hour: 'compline' as const,
    labelKey: 'office.nightPrayer',
    sublabelKey: 'office.compline',
    route: '/office/compline',
    icon: 'moon' as const,
  },
]

function getReadingLabel(hour: OfficeHour, progressMap: Map<string, ReadingProgress>): string {
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

  const { data: status } = useDailyOfficeStatus(today)
  const { data: allProgress = [] } = useAllReadingProgress()

  const progressMap = useMemo(
    () => new Map(allProgress.map((p): [string, ReadingProgress] => [p.type, p])),
    [allProgress],
  )

  const psalmsForDay = useMemo(() => getPsalmsForDay(todayDate, numbering), [todayDate, numbering])
  const complinePsalms = useMemo(
    () => getComplinePsalms(todayDate, numbering),
    [todayDate, numbering],
  )

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
          const completed = status?.[hour] ?? false
          const readingLabel = getReadingLabel(hour, progressMap)
          const psalmLabel = getPsalmLabel(hour)

          return (
            <FadeInView key={hour} index={i}>
              <AnimatedPressable onPress={() => router.push(route as never)}>
                <ManuscriptFrame ornate={false}>
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
                            \u2720
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
