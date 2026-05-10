import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import {
  ColdCard,
  CuedCard,
  LettersCard,
  type MemorizationCardState,
  type MemorizeCardProps,
  type Mode,
  useCardContent,
  useMemorizeSession,
} from '@/features/memorize'
import { getTodayString } from '@/hooks/useToday'

const CLOSE_ICON_SIZE = 22

export default function MemorizeScreen() {
  const [today] = useState(getTodayString)
  const { currentCard, currentMode, currentIndex, totalCount, isComplete, record } =
    useMemorizeSession({ today })

  if (totalCount === 0)
    return (
      <Shell>
        <EmptyState />
      </Shell>
    )
  if (isComplete)
    return (
      <Shell>
        <DoneState />
      </Shell>
    )

  return (
    <Shell progress={{ n: currentIndex + 1, total: totalCount }}>
      {currentCard && currentMode ? (
        <CurrentCard card={currentCard} mode={currentMode} onOutcome={record} />
      ) : null}
    </Shell>
  )
}

function Shell({
  children,
  progress,
}: {
  children: React.ReactNode
  progress?: { n: number; total: number }
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const theme = useTheme()
  const iconColor = theme.colorSubtle?.val ?? '#888'

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top + 12}
      paddingBottom={insets.bottom + 24}
    >
      <XStack
        paddingHorizontal="$lg"
        justifyContent="space-between"
        alignItems="center"
        height={32}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('memorize.close')}
        >
          <X size={CLOSE_ICON_SIZE} color={iconColor} accessibilityElementsHidden />
        </Pressable>
        {progress ? (
          <Text fontFamily="$body" fontSize="$2" color="$colorSubtle">
            {t('memorize.progress', progress)}
          </Text>
        ) : null}
        {/* Right-side spacer keeps the progress text centered vs the close icon. */}
        <YStack width={CLOSE_ICON_SIZE} />
      </XStack>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        {children}
      </ScrollView>
    </YStack>
  )
}

function CurrentCard({
  card,
  mode,
  onOutcome,
}: {
  card: MemorizationCardState
  mode: Mode
  onOutcome: MemorizeCardProps['onOutcome']
}) {
  const { t } = useTranslation()
  const content = useCardContent(card)

  if (!content) {
    return (
      <YStack padding="$lg" gap="$sm" alignItems="center">
        <Text fontFamily="$body" fontSize="$3" color="$colorSubtle" textAlign="center">
          {t('memorize.contentMissing')}
        </Text>
      </YStack>
    )
  }

  const props: MemorizeCardProps = {
    title: content.title,
    portionLabel: content.portionLabel,
    lines: content.lines,
    mastery: card.mastery,
    onOutcome,
  }
  if (mode === 'cued') return <CuedCard {...props} />
  if (mode === 'letters') return <LettersCard {...props} />
  return <ColdCard {...props} />
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <YStack padding="$xl" gap="$sm" alignItems="center">
      <Text fontFamily="$heading" fontSize="$5" color="$color" textAlign="center">
        {t('memorize.empty')}
      </Text>
      <Text fontFamily="$body" fontSize="$3" color="$colorSubtle" textAlign="center">
        {t('memorize.emptyHint')}
      </Text>
    </YStack>
  )
}

function DoneState() {
  const { t } = useTranslation()
  // Stable per-mount rotation: lazy useState picks once and survives re-renders
  // (useMemo with a non-deterministic body can flicker under StrictMode).
  const [messageKey] = useState(() =>
    Math.random() < 0.5 ? 'memorize.sessionDone' : 'memorize.sessionDoneAlt',
  )
  return (
    <YStack padding="$xl" gap="$sm" alignItems="center">
      <Text fontFamily="$heading" fontSize="$5" color="$color" textAlign="center">
        {t(messageKey)}
      </Text>
    </YStack>
  )
}
