import type { BilingualText } from '@ember/content-engine'
import { Text, XStack } from 'tamagui'
import { LiturgicalColorDot } from './LiturgicalColorDot'

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
  return (
    <XStack alignItems="center" gap="$xs" marginVertical="$xs">
      <LiturgicalColorDot color={color} size={12} />
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
