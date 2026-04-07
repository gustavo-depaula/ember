// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { memo } from 'react'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { useTheme } from 'tamagui'

import { flowerPaths, leafPath, tendrilPath } from './svgHelpers'

type Position = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

const rotations: Record<Position, number> = {
  topLeft: 0,
  topRight: 90,
  bottomRight: 180,
  bottomLeft: 270,
}

export const FloralCorner = memo(function FloralCorner({
  position,
  size = 80,
  complexity = 'full',
}: {
  position: Position
  size?: number
  complexity?: 'full' | 'simple'
}) {
  const theme = useTheme()
  const gold = theme.accent.val
  const goldSubtle = theme.accentSubtle.val
  const red = theme.floralRed.val
  const blue = theme.floralBlue.val
  const orange = theme.floralOrange.val
  const green = theme.vineGreen.val
  const greenDark = theme.vineGreenDark.val

  const deg = rotations[position]
  const isSimple = complexity === 'simple'

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" accessible={false}>
      <G transform={`rotate(${deg}, 40, 40)`}>
        {/* Main vine stem — L-shaped curve from bottom-left to top-right area */}
        <Path
          d="M2 78 C2 50, 10 25, 30 15 Q45 8 60 5"
          stroke={gold}
          strokeWidth={1.8}
          fill="none"
        />
        {/* Secondary thinner vine */}
        <Path
          d="M6 78 C8 55, 14 35, 32 22 Q42 16 55 12"
          stroke={goldSubtle}
          strokeWidth={0.9}
          fill="none"
        />

        {/* Leaves along the main vine */}
        <Path d={leafPath(8, 65, 10, -50)} fill={green} stroke={greenDark} strokeWidth={0.5} />
        <Path d={leafPath(12, 52, 8, -70)} fill={green} stroke={greenDark} strokeWidth={0.5} />
        <Path d={leafPath(18, 38, 10, -40)} fill={green} stroke={greenDark} strokeWidth={0.5} />
        <Path d={leafPath(28, 26, 8, -80)} fill={green} stroke={greenDark} strokeWidth={0.5} />
        <Path d={leafPath(40, 16, 9, -30)} fill={green} stroke={greenDark} strokeWidth={0.5} />
        <Path d={leafPath(52, 10, 7, -60)} fill={green} stroke={greenDark} strokeWidth={0.5} />

        {/* Leaves along the secondary vine */}
        <Path
          d={leafPath(10, 60, 7, 130)}
          fill={green}
          stroke={greenDark}
          strokeWidth={0.4}
          opacity={0.8}
        />
        <Path
          d={leafPath(22, 34, 7, 120)}
          fill={green}
          stroke={greenDark}
          strokeWidth={0.4}
          opacity={0.8}
        />

        {/* Main flower — red, at the bend of the vine */}
        {flowerPaths(16, 46, 7, 5).map((d, i) => (
          <Path key={`r${i}`} d={d} fill={red} opacity={0.85} />
        ))}
        <Circle cx={16} cy={46} r={2.5} fill={gold} />

        {/* Secondary flower — blue, upper part of vine */}
        {flowerPaths(36, 20, 6, 5).map((d, i) => (
          <Path key={`b${i}`} d={d} fill={blue} opacity={0.85} />
        ))}
        <Circle cx={36} cy={20} r={2} fill={gold} />

        {!isSimple && (
          <>
            {/* Third flower — orange, near top-right */}
            {flowerPaths(54, 8, 5, 5).map((d, i) => (
              <Path key={`o${i}`} d={d} fill={orange} opacity={0.8} />
            ))}
            <Circle cx={54} cy={8} r={1.8} fill={gold} />

            {/* Tendrils */}
            <Path
              d={tendrilPath(6, 72, 2, 68, 5)}
              stroke={goldSubtle}
              strokeWidth={0.5}
              fill="none"
              opacity={0.6}
            />
            <Path
              d={tendrilPath(24, 30, 20, 24, 6)}
              stroke={goldSubtle}
              strokeWidth={0.5}
              fill="none"
              opacity={0.6}
            />
            <Path
              d={tendrilPath(46, 12, 44, 6, 4)}
              stroke={goldSubtle}
              strokeWidth={0.5}
              fill="none"
              opacity={0.6}
            />

            {/* Small decorative dots at vine joints */}
            <Circle cx={10} cy={58} r={1.2} fill={goldSubtle} opacity={0.7} />
            <Circle cx={22} cy={32} r={1.2} fill={goldSubtle} opacity={0.7} />
            <Circle cx={46} cy={13} r={1} fill={goldSubtle} opacity={0.7} />
          </>
        )}
      </G>
    </Svg>
  )
})
