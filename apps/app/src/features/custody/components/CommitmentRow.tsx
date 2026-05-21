import { ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'

import { COMMITMENT_TEMPLATES } from '../templates'
import type { Commitment } from '../types'
import { selectedDays, WEEK_LABELS, WEEK_ORDER } from '../weekDays'

// A commitment row reads as a tappable card — chunky padding, a saturated
// emoji disc, scale-on-press via AnimatedPressable. Matches the visual
// weight of the template grid above so the list doesn't look like an
// afterthought.

function findTemplate(name: string) {
  return COMMITMENT_TEMPLATES.find((tp) => tp.name === name)
}

// Fallback disc tints for user-created commitments (those that don't match a
// template by name). Picked per kind so the row's color carries a hint of
// what the commitment does.
const KIND_TINT: Record<Commitment['kind'], string> = {
  abstain: '#D4A63A', // accent gold — total abstention reads as the brand action
  'time-fence': '#3D5A80', // muted blue — evokes night hours
  'time-limit': '#2D6A4F', // green — measured, bounded
}

// Emoji used when the commitment isn't tied to a known template. Matches the
// emoji-forward visual language of the templates themselves.
const KIND_EMOJI: Record<Commitment['kind'], string> = {
  abstain: '🛡️',
  'time-fence': '🌙',
  'time-limit': '⏳',
}

function formatLimit(limitSeconds: number | null): string {
  if (!limitSeconds || limitSeconds <= 0) return ''
  const minutes = Math.round(limitSeconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem ? `${hours}h ${rem}m` : `${hours}h`
}

function kindSummary(commitment: Commitment, kindLabel: string): string {
  if (commitment.kind === 'time-fence' && commitment.fence_start && commitment.fence_end) {
    return `${commitment.fence_start}–${commitment.fence_end}`
  }
  if (commitment.kind === 'time-limit' && commitment.limit_seconds) {
    return `Max ${formatLimit(commitment.limit_seconds)}/day`
  }
  return kindLabel
}

function daysSummary(commitment: Commitment, t: (k: string) => string): string {
  const days = selectedDays(commitment.schedule)
  if (days.length === 7) return t('custody.editor.summary.daysDaily')
  if (days.length === 0) return t('custody.editor.summary.daysNone')
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
    return t('custody.editor.summary.daysWeekdays')
  }
  if (days.length === 2 && [0, 6].every((d) => days.includes(d))) {
    return t('custody.editor.summary.daysWeekends')
  }
  return days
    .slice()
    .sort()
    .map((d) => WEEK_LABELS[WEEK_ORDER.indexOf(d)])
    .join(' ')
}

export function CommitmentRow({
  commitment,
  onPress,
  trailing,
}: {
  commitment: Commitment
  onPress: () => void
  trailing?: React.ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const template = findTemplate(commitment.name)
  const tint = template?.tint ?? KIND_TINT[commitment.kind]
  const emoji = template?.emoji ?? KIND_EMOJI[commitment.kind]
  const kindLabel = t(`custody.kinds.${commitment.kind}.label`)
  const subtitle = `${kindSummary(commitment, kindLabel)} · ${daysSummary(commitment, t)}`

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={commitment.name}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius={18}
        paddingVertical={14}
        paddingHorizontal={14}
        alignItems="center"
        gap={14}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.06)"
      >
        {/* Disc — template emoji on the template tint, otherwise a kind glyph
            on the kind's signature color. Bigger than the previous treatment
            so the row reads as content-with-an-icon, not a thin list cell. */}
        <View
          width={52}
          height={52}
          borderRadius={26}
          backgroundColor={tint}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={26}>{emoji}</Text>
        </View>

        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color" numberOfLines={1}>
            {commitment.name}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        </YStack>

        {trailing}
        <ChevronRight size={18} color={theme.colorSecondary.val} />
      </XStack>
    </AnimatedPressable>
  )
}
