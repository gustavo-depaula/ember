import { format } from 'date-fns'
import { Check, Flame, Heart, type LucideIcon, Sparkles, Sunrise } from 'lucide-react-native'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { getManifest } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import type { getDateLocale } from '@/lib/i18n/dateLocale'

import type { MemoriaEntry } from '../hooks'

export function EntryRow({
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
    <Animated.View entering={FadeIn.duration(200)} layout={LinearTransition.duration(200)}>
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
    </Animated.View>
  )
}

export function getEntryIcon(kind: MemoriaEntry['kind'], color: string): React.ReactNode {
  const icons: Record<MemoriaEntry['kind'], LucideIcon> = {
    completion: Check,
    'intention-raised': Heart,
    'intention-closed': Sparkles,
    thanksgiving: Flame,
    'day-offered': Sunrise,
  }
  const Icon = icons[kind]
  const fill = kind === 'intention-closed' ? color : undefined
  return <Icon size={14} color={color} fill={fill} />
}

export function getEntryBody(
  entry: MemoriaEntry,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  switch (entry.kind) {
    case 'completion':
      return t('memoria.completion', {
        name: getPracticeDisplayName(entry.completion.practice_id),
      })
    case 'intention-raised':
      return t('memoria.intentionOffered', { text: entry.movement.text })
    case 'intention-closed':
      return t('memoria.intentionAnswered', { text: entry.movement.text })
    case 'thanksgiving':
      return t('memoria.gratitude', { text: entry.movement.text })
    case 'day-offered':
      return t('memoria.dayOffered')
  }
}

function getPracticeDisplayName(practiceId: string): string {
  const manifest = getManifest(practiceId)
  return manifest ? localizeContent(manifest.name) : practiceId
}
