import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, Flame, Heart, Sparkles } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { getManifest, parseQualifiedId } from '@/content/registry'
import { type MemoriaEntry, useMemoriaEntries, useOnThisDayEntries } from '@/features/memoria'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { getDateLocale } from '@/lib/i18n/dateLocale'

type Filter = 'all' | 'prayers' | 'intentions' | 'gratitudes'
const filters: Filter[] = ['all', 'prayers', 'intentions', 'gratitudes']

function matchesFilter(entry: MemoriaEntry, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'prayers') return entry.kind === 'completion'
  if (filter === 'intentions')
    return entry.kind === 'intention-added' || entry.kind === 'intention-answered'
  return entry.kind === 'gratitude'
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
          <Pressable onPress={() => router.back()} hitSlop={8}>
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
                <Pressable key={f} onPress={() => setFilter(f)} hitSlop={4}>
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

        {entries.length === 0 ? (
          <YStack paddingVertical="$xl" alignItems="center">
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
        ) : (
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
        )}
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
    <YStack paddingTop="$md" paddingBottom="$xs">
      <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
        {label.toUpperCase()}
      </Text>
    </YStack>
  )
}

function EntryRow({
  entry,
  locale,
}: {
  entry: MemoriaEntry
  locale: ReturnType<typeof getDateLocale>
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const time = format(entry.timestamp, 'p', { locale })
  const icon = getEntryIcon(entry.kind, theme.accent?.val ?? '#888')
  const body = getEntryBody(entry, t)

  return (
    <XStack gap="$md" alignItems="flex-start" paddingVertical="$xs">
      <YStack width={20} paddingTop={2} alignItems="center">
        {icon}
      </YStack>
      <YStack flex={1} gap={2}>
        <Text fontFamily="$body" fontSize="$2" color="$color">
          {body}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
          {time}
        </Text>
      </YStack>
    </XStack>
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
  )
}

function getEntryIcon(kind: MemoriaEntry['kind'], color: string): React.ReactNode {
  if (kind === 'completion') return <Check size={14} color={color} />
  if (kind === 'intention-added') return <Heart size={14} color={color} />
  if (kind === 'gratitude') return <Flame size={14} color={color} />
  return <Sparkles size={14} color={color} fill={color} />
}

function getEntryBody(entry: MemoriaEntry, t: ReturnType<typeof useTranslation>['t']): string {
  if (entry.kind === 'completion') {
    return t('memoria.completion', {
      name: getPracticeDisplayName(entry.completion.practice_id, t),
    })
  }
  if (entry.kind === 'intention-added') {
    return t('memoria.intentionOffered', { text: entry.intention.text })
  }
  if (entry.kind === 'gratitude') {
    return t('memoria.gratitude', { text: entry.gratitude.text })
  }
  return t('memoria.intentionAnswered', { text: entry.intention.text })
}

function getPracticeDisplayName(
  practiceId: string,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const manifest = getManifest(practiceId)
  if (!manifest) return practiceId
  const { practiceId: unqualified } = parseQualifiedId(practiceId)
  const key = `practice.${unqualified}`
  const translated = t(key)
  if (translated !== key) return translated
  return localizeContent(manifest.name)
}
