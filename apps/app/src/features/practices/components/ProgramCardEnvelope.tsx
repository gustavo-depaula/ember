import { type Href, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { EnvelopeStack, usePendingHolyCards, useSaintsCatalog } from '@/features/saints'

// Apart from the other ending parts (ProgramEnding) because it brings the saints feature, whose
// cards and envelopes load their art as the module loads: screens that don't always show it load
// it lazily.

/**
 * The program's holy card in its envelope. Won (kept whole): sealed, and opening it is the redeem
 * screen's, as from Today. Not won: greyed, saying what brings it. Nothing for a program that gives
 * no card, or once the card is no longer waiting.
 */
export function CardEnvelope({
  practiceId,
  cards,
  won,
  onOpen,
}: {
  practiceId: string
  cards: string[]
  won: boolean
  /** Where opening goes — a modal over the prayer replaces its screen rather than stacking on it. */
  onOpen?: (href: Href) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const pending = usePendingHolyCards()
  const { byId } = useSaintsCatalog()
  const saint = byId[cards[0] ?? '']
  if (!saint) return null

  if (!won)
    return (
      <XStack alignItems="center" gap="$md" paddingVertical="$sm">
        <YStack opacity={0.35}>
          <EnvelopeStack width={56} count={1} name="" date="" shimmer={false} />
        </YStack>
        <YStack flex={1}>
          <Typography fontSize="$4">{t('program.ending.cardOf', { name: saint.name })}</Typography>
          <Typography tone="muted" fontSize="$2">
            {t('program.ending.cardComesWith')}
          </Typography>
        </YStack>
      </XStack>
    )

  const grant = pending?.find((g) => g.door === 'novena' && g.novena === practiceId)
  if (!grant) return null
  const href: Href = { pathname: '/redeem', params: { grant: grant.id } }
  return (
    <AnimatedPressable
      onPress={() => (onOpen ? onOpen(href) : router.push(href))}
      accessibilityRole="button"
      accessibilityLabel={t('program.ending.cardWaiting')}
    >
      <XStack
        alignItems="center"
        gap="$md"
        padding="$md"
        borderRadius="$lg"
        backgroundColor="$backgroundSurface"
      >
        <EnvelopeStack width={56} count={1} name="" date="" />
        <YStack flex={1}>
          <Typography fontSize="$4">{t('program.ending.cardWaiting')}</Typography>
          <Typography tone="muted" fontSize="$2">
            {t('program.ending.cardWon', { name: saint.name })}
          </Typography>
        </YStack>
        <Typography tone="muted" fontSize="$4">
          ›
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
