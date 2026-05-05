import type { BilingualText } from '@ember/content-engine'
import { Text, useTheme, View, XStack } from 'tamagui'

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
 * Small color swatch + localized label for a celebration's liturgical
 * vestment color. Sits inline (e.g. above the celebration body) so users
 * can see at a glance whether they're praying a white/red/green/violet day.
 */
export function LiturgicalColorBlock({
  color,
  label,
}: {
  color: 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black' | 'gold'
  label: BilingualText
}) {
  const theme = useTheme()
  const fill = COLOR_HEX[color] ?? COLOR_HEX.white
  // Ensure white/rose dots have a visible border on light themes.
  const ringColor =
    color === 'white' || color === 'rose' || color === 'gold'
      ? (theme.colorSecondary?.val ?? '#666')
      : 'transparent'
  return (
    <XStack alignItems="center" gap="$xs" marginVertical="$xs">
      <View
        width={12}
        height={12}
        borderRadius={6}
        backgroundColor={fill}
        borderWidth={1}
        borderColor={ringColor}
      />
      <Text
        fontFamily="$heading"
        fontSize="$1"
        color="$colorSecondary"
        letterSpacing={1}
        textTransform="uppercase"
      >
        {label.primary}
      </Text>
    </XStack>
  )
}
