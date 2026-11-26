import Svg, { Circle, Path } from 'react-native-svg'
import { XStack } from 'tamagui'

import { Typography } from '@/components'

export const beadRowHeight = 50
export const railWidth = 52
const sway = 12
// The string winds gently as it descends; each row draws its own stretch of it.
export const beadX = (i: number) => railWidth / 2 + sway * Math.sin(i * 1.1)

// Row i's stretch of the string: from halfway to the bead above, through its
// own bead, to halfway to the one below. A taller row (a name with a line
// under it) passes its own height.
export function threadPath(i: number, count: number, height = beadRowHeight): string {
  const mid = height / 2
  const from = i > 0 ? `M${(beadX(i - 1) + beadX(i)) / 2},0 L` : 'M'
  const to = i < count - 1 ? ` L${(beadX(i) + beadX(i + 1)) / 2},${height}` : ''
  return `${from}${beadX(i)},${mid}${to}`
}

/**
 * One bead of the plan's string, upright: its stretch of thread, the bead in the
 * hue of its hour (hollow for a practice kept on some days only), the name and
 * when. `index` and `count` place it on a string of `count` beads.
 */
export function BeadRow({
  index,
  count,
  hue,
  radius,
  hollow,
  background,
  name,
  when,
}: {
  index: number
  count: number
  hue: string
  radius: number
  hollow?: boolean
  background: string
  name: string
  when?: string
}) {
  return (
    <XStack height={beadRowHeight} alignItems="center" gap="$sm">
      <Svg width={railWidth} height={beadRowHeight}>
        <Path
          d={threadPath(index, count)}
          stroke={hue}
          strokeOpacity={0.55}
          strokeWidth={1.3}
          fill="none"
        />
        {hollow ? (
          <Circle
            cx={beadX(index)}
            cy={beadRowHeight / 2}
            r={radius}
            fill={background}
            stroke={hue}
            strokeWidth={1.6}
          />
        ) : (
          <Circle cx={beadX(index)} cy={beadRowHeight / 2} r={radius} fill={hue} />
        )}
      </Svg>
      <Typography flex={1} fontSize="$3" numberOfLines={1}>
        {name}
      </Typography>
      {when ? (
        <Typography tone="muted" fontSize="$1">
          {when}
        </Typography>
      ) : null}
    </XStack>
  )
}
