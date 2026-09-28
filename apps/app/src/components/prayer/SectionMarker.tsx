import type { BilingualText } from '@ember/content-engine'
import { useTheme, View, XStack, YStack } from 'tamagui'
import { Typography } from '../typography'
import { useLiturgicalColor } from './LiturgicalColorContext'

const COLOR_HEX: Record<string, string> = {
  white: '#FFFFFF',
  red: '#C0392B',
  green: '#2D6A4F',
  violet: '#5B2A86',
  rose: '#E5A2C0',
  black: '#1B1B1B',
  gold: '#C8A442',
}

/**
 * Major-division header for the Mass (Initial Rites, Liturgy of the Word, …),
 * distinct from `heading` for sub-section labels. Rules are tinted in the
 * day's liturgical colour; white/rose/gold fall back to the border colour
 * because they vanish on a pale background.
 */
export function SectionMarker({ title, color }: { title: BilingualText; color?: string }) {
  const theme = useTheme()
  const ctxColor = useLiturgicalColor()
  const effective = color ?? ctxColor
  const tint =
    effective && effective !== 'white' && effective !== 'rose' && effective !== 'gold'
      ? COLOR_HEX[effective]
      : undefined
  const ruleColor = tint ?? theme.borderColor?.val ?? '#444'
  const ruleOpacity = tint ? 0.6 : 1
  return (
    <YStack alignItems="center" gap="$xs" marginVertical="$lg">
      <XStack alignItems="center" gap="$sm" width="100%">
        <View flex={1} height={1} backgroundColor={ruleColor} opacity={ruleOpacity} />
        <Typography variant="marker" flexShrink={0}>
          {title.primary}
        </Typography>
        <View flex={1} height={1} backgroundColor={ruleColor} opacity={ruleOpacity} />
      </XStack>
    </YStack>
  )
}
