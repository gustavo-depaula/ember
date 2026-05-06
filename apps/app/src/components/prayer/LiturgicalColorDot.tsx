import { useTheme, View } from 'tamagui'

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
 * Small circular swatch in a liturgical-vestment color. Single canonical
 * implementation — used by `LiturgicalColorBlock` (12px) and
 * `CelebrationBanner` (14px). Light-on-light dots (white/rose/gold) get
 * a thin ring against the page background.
 */
export function LiturgicalColorDot({ color, size = 12 }: { color: string; size?: number }) {
  const theme = useTheme()
  const fill = COLOR_HEX[color] ?? COLOR_HEX.white
  const ringColor =
    color === 'white' || color === 'rose' || color === 'gold'
      ? (theme.colorSecondary?.val ?? '#666')
      : 'transparent'
  return (
    <View
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor={fill}
      borderWidth={1}
      borderColor={ringColor}
    />
  )
}
