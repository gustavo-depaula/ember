import type { Locale } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Movement } from '@/db/events'
import { formatSoftRelative } from '@/lib/softRelative'

// A petition / thanksgiving as a quiet manuscript line — a gold fleuron, the
// text, and a muted footnote (when raised, its term, how it closed). No bordered
// surface box; the list reads like the chronicle.
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
  const closed = movement.state === 'closed'
  const ts = closed ? (movement.closed_at ?? movement.recorded_at) : movement.recorded_at
  const ago = formatSoftRelative(ts, {
    locale,
    justNow: t('common.justNow'),
    aMomentAgo: t('common.aMomentAgo'),
  })

  const primary =
    !closed && onPrimary && movement.kind === 'intention' && movement.cadence === 'goal'
  const boundedDate =
    movement.kind === 'intention' && movement.cadence === 'bounded' && movement.bounded_until
      ? new Date(movement.bounded_until).toLocaleDateString()
      : undefined

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={movement.text}
    >
      <XStack gap="$sm" alignItems="baseline" paddingVertical="$sm" opacity={closed ? 0.6 : 1}>
        <Typography color="$accent">⟢</Typography>
        <YStack flex={1} gap={2}>
          <Typography fontSize="$4" textDecorationLine={closed ? 'line-through' : 'none'}>
            {movement.text}
          </Typography>
          <XStack alignItems="center" gap="$xs" flexWrap="wrap">
            <Typography variant="caption">{ago}</Typography>
            {boundedDate ? <Typography variant="caption">· {boundedDate}</Typography> : undefined}
            {closed && movement.closure_kind ? (
              <Typography variant="caption" color="$accent">
                · {t(`movements.closure.${movement.closure_kind}`)}
              </Typography>
            ) : undefined}
          </XStack>
        </YStack>
        {primary ? (
          <AnimatedPressable
            onPress={(e) => {
              e.stopPropagation?.()
              onPrimary()
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('movements.actions.markAnswered')}
          >
            <Typography variant="label" fontSize="$1" color="$accent">
              {t('movements.actions.answered')}
            </Typography>
          </AnimatedPressable>
        ) : undefined}
      </XStack>
    </AnimatedPressable>
  )
}
