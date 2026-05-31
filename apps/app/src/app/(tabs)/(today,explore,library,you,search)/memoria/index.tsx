import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { useRouter } from 'expo-router'
import { BookOpen, ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import {
  EntryRow,
  getEntryBody,
  getEntryIcon,
  type MemoriaEntry,
  useMemoriaEntries,
  useOnThisDayEntries,
} from '@/features/memoria'
import { useToday } from '@/hooks/useToday'
import { getDateLocale } from '@/lib/i18n/dateLocale'

type Filter = 'all' | 'prayers' | 'intentions' | 'gratitudes'
const filters: Filter[] = ['all', 'prayers', 'intentions', 'gratitudes']

function matchesFilter(entry: MemoriaEntry, filter: Filter): boolean {
  if (filter === 'all') return true
  const kinds: Record<Exclude<Filter, 'all'>, ReadonlySet<MemoriaEntry['kind']>> = {
    prayers: new Set(['completion', 'day-offered']),
    intentions: new Set(['intention-raised', 'intention-closed']),
    gratitudes: new Set(['thanksgiving']),
  }
  return kinds[filter].has(entry.kind)
}

export default function MemoriaScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const entries = useMemoriaEntries()
  const now = useToday()
  const onThisDay = useOnThisDayEntries(now)
  const locale = getDateLocale()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => matchesFilter(e, filter))),
    [entries, filter],
  )

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.goBack')}
          >
            <ChevronLeft size={24} color={theme.color?.val} />
          </Pressable>
          <YStack flex={1}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {t('memoria.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('memoria.subtitle')}
            </Text>
          </YStack>
        </XStack>

        {entries.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((f) => {
              const selected = filter === f
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  hitSlop={8}
                  accessibilityRole="radio"
                  accessibilityLabel={t(`memoria.filter.${f}`)}
                  accessibilityState={{ selected }}
                >
                  <XStack
                    paddingHorizontal="$md"
                    paddingVertical="$xs"
                    borderRadius={999}
                    borderWidth={1}
                    borderColor={selected ? '$accent' : '$borderColor'}
                    backgroundColor={selected ? '$accent' : 'transparent'}
                  >
                    <Text
                      fontFamily="$heading"
                      fontSize="$1"
                      color={selected ? '$backgroundSurface' : '$colorSecondary'}
                      letterSpacing={1}
                    >
                      {t(`memoria.filter.${f}`).toUpperCase()}
                    </Text>
                  </XStack>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

        {(() => {
          if (entries.length === 0) {
            return (
              <YStack paddingVertical="$xl" alignItems="center" gap="$md">
                <BookOpen size={32} color={theme.colorSecondary?.val} />
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color="$colorSecondary"
                  textAlign="center"
                  fontStyle="italic"
                  paddingHorizontal="$lg"
                >
                  {t('memoria.emptyState')}
                </Text>
              </YStack>
            )
          }
          if (filtered.length === 0) {
            return (
              <YStack paddingVertical="$lg" alignItems="center">
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color="$colorSecondary"
                  textAlign="center"
                  fontStyle="italic"
                  paddingHorizontal="$lg"
                >
                  {t('memoria.noneInFilter')}
                </Text>
              </YStack>
            )
          }
          return (
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$sm">
                {filter === 'all' && onThisDay.length > 0 && (
                  <YStack
                    gap="$xs"
                    padding="$md"
                    borderRadius="$md"
                    borderLeftWidth={3}
                    borderLeftColor="$accent"
                    backgroundColor="$backgroundSurface"
                  >
                    <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
                      {t('memoria.onThisDay').toUpperCase()}
                    </Text>
                    {onThisDay.map((entry) => (
                      <OnThisDayRow key={entry.id} entry={entry} locale={locale} now={now} />
                    ))}
                  </YStack>
                )}
                {renderGroupedEntries(filtered, t, locale)}
              </YStack>
            </ScrollView>
          )
        })()}
      </YStack>
    </ScreenLayout>
  )
}

function renderGroupedEntries(
  entries: MemoriaEntry[],
  t: ReturnType<typeof useTranslation>['t'],
  locale: ReturnType<typeof getDateLocale>,
) {
  const nodes: React.ReactNode[] = []
  let lastDay: Date | undefined

  for (const entry of entries) {
    const day = new Date(entry.timestamp)
    if (!lastDay || !isSameDay(day, lastDay)) {
      nodes.push(
        <DayHeading key={`h:${entry.id}`} date={day} label={formatDayLabel(day, t, locale)} />,
      )
      lastDay = day
    }
    nodes.push(<EntryRow key={entry.id} entry={entry} locale={locale} />)
  }

  return nodes
}

function formatDayLabel(
  date: Date,
  t: ReturnType<typeof useTranslation>['t'],
  locale: ReturnType<typeof getDateLocale>,
): string {
  if (isToday(date)) return t('memoria.today')
  if (isYesterday(date)) return t('memoria.yesterday')
  return format(date, 'EEEE, MMMM d', { locale })
}

function DayHeading({ label }: { date: Date; label: string }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.duration(200)}>
      <YStack paddingTop="$md" paddingBottom="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
          {label.toUpperCase()}
        </Text>
      </YStack>
    </Animated.View>
  )
}

function OnThisDayRow({
  entry,
  locale,
  now,
}: {
  entry: MemoriaEntry
  locale: ReturnType<typeof getDateLocale>
  now: Date
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const years = now.getFullYear() - new Date(entry.timestamp).getFullYear()
  const body = getEntryBody(entry, t)
  const icon = getEntryIcon(entry.kind, theme.accent?.val ?? '#888')
  const yearsLabel = years === 1 ? t('memoria.oneYearAgo') : t('memoria.yearsAgo', { count: years })

  return (
    <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.duration(200)}>
      <XStack gap="$md" alignItems="flex-start" paddingVertical={2}>
        <YStack width={20} paddingTop={2} alignItems="center">
          {icon}
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontFamily="$body" fontSize="$2" color="$color">
            {body}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
            {yearsLabel} · {format(entry.timestamp, 'yyyy', { locale })}
          </Text>
        </YStack>
      </XStack>
    </Animated.View>
  )
}
