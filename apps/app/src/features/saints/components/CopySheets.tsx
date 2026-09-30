import { View } from 'react-native'

const sheets = ['#eadfc2', '#dccfae']

/**
 * The other copies of a held card, as the edges of up to two cards stacked
 * beneath it: how many is felt, never counted. Render before the card, in a
 * parent that doesn't clip.
 */
export function CopySheets({
  count,
  width,
  height,
  radius,
  step = 4,
}: {
  count: number
  width: number
  height: number
  radius: number
  step?: number
}) {
  return sheets
    .slice(0, Math.max(count - 1, 0))
    .map((color, i) => (
      <View
        key={color}
        style={{
          position: 'absolute',
          width,
          height,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: 'rgba(138,106,59,0.45)',
          backgroundColor: color,
          transform: [{ translateX: (i + 1) * step }, { translateY: (i + 1) * step }],
        }}
      />
    ))
    .reverse()
}
