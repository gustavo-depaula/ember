import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, Heart, Sparkles } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { getManifest, parseQualifiedId } from '@/content/registry'
import { type MemoriaEntry, useMemoriaEntries } from '@/features/memoria'
import { localizeContent } from '@/lib/i18n'
import { getDateLocale } from '@/lib/i18n/dateLocale'

export default function MemoriaScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const entries = useMemoriaEntries()
  const locale = getDateLocale()

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
            <YStack gap="$sm">{renderGroupedEntries(entries, t, locale)}</YStack>
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

function getEntryIcon(kind: MemoriaEntry['kind'], color: string): React.ReactNode {
  if (kind === 'completion') return <Check size={14} color={color} />
  if (kind === 'intention-added') return <Heart size={14} color={color} />
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
