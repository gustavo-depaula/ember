import type { Locale } from 'date-fns'
import { Calendar, Check, Hash, Tag } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import type { Movement } from '@/db/events'
import { formatSoftRelative } from '@/lib/softRelative'

export function MovementCard({
  movement,
  locale,
  onPress,
  onPrimary,
}: {
  movement: Movement
  locale: Locale | undefined
  onPress?: () => void
  onPrimary?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const closed = movement.state === 'closed'
  const ts = closed ? (movement.closed_at ?? movement.recorded_at) : movement.recorded_at
  const ago = formatSoftRelative(ts, {
    locale,
    justNow: t('common.justNow'),
    aMomentAgo: t('common.aMomentAgo'),
  })

  const primary =
    !closed && onPrimary && movement.kind === 'intention' && movement.cadence === 'goal'

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={movement.text}
    >
      <YStack
        gap="$sm"
        padding="$md"
        borderRadius="$md"
        borderWidth={closed ? 0 : 1}
        borderColor="$borderColor"
        backgroundColor="$backgroundSurface"
        opacity={closed ? 0.7 : 1}
      >
        <Text
          selectable
          fontFamily="$body"
          fontSize="$3"
          color="$color"
          textDecorationLine={closed ? 'line-through' : 'none'}
        >
          {movement.text}
        </Text>

        <XStack alignItems="center" gap="$sm" flexWrap="wrap">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
            {ago}
          </Text>
          {movement.subject ? (
            <XStack alignItems="center" gap="$xs">
              <Tag size={10} color={theme.colorSecondary?.val} />
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {movement.subject}
              </Text>
            </XStack>
          ) : undefined}
          {movement.kind === 'intention' &&
          movement.cadence === 'bounded' &&
          movement.bounded_until ? (
            <XStack alignItems="center" gap="$xs">
              <Calendar size={10} color={theme.colorSecondary?.val} />
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {new Date(movement.bounded_until).toLocaleDateString()}
              </Text>
            </XStack>
          ) : undefined}
          {closed && movement.closure_kind ? (
            <XStack alignItems="center" gap="$xs">
              <Hash size={10} color={theme.accent?.val} />
              <Text fontFamily="$body" fontSize="$1" color="$accent">
                {t(`movements.closure.${movement.closure_kind}`)}
              </Text>
            </XStack>
          ) : undefined}
          {primary ? (
            <XStack flex={1} justifyContent="flex-end">
              <AnimatedPressable
                onPress={(e) => {
                  e.stopPropagation?.()
                  onPrimary()
                }}
                accessibilityRole="button"
                accessibilityLabel={t('movements.actions.markAnswered')}
              >
                <XStack
                  alignItems="center"
                  gap="$xs"
                  paddingVertical="$xs"
                  paddingHorizontal="$sm"
                  borderRadius="$sm"
                  borderWidth={1}
                  borderColor="$accent"
                >
                  <Check size={12} color={theme.accent?.val} />
                  <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={0.5}>
                    {t('movements.actions.answered')}
                  </Text>
                </XStack>
              </AnimatedPressable>
            </XStack>
          ) : undefined}
        </XStack>
      </YStack>
    </AnimatedPressable>
  )
}
