// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import { useTheme, YStack } from 'tamagui'

import { leafPath } from './ornaments/svgHelpers'

const markerImage = require('../../assets/textures/horizontal_marker.png')
const chaliceImage = require('../../assets/textures/horizontal_marker_chalice.png')
const flourishImage = require('../../assets/textures/horizontal_marker_3.png')

export function OrnamentalRule() {
  return (
    <YStack alignItems="center" paddingVertical="$md">
      <Image source={markerImage} style={styles.marker} contentFit="contain" />
    </YStack>
  )
}

export function HeaderFlourish() {
  return (
    <YStack alignItems="center" paddingBottom="$sm">
      <Image source={flourishImage} style={styles.flourish} contentFit="contain" />
    </YStack>
  )
}

export function CornerFlourish({
  position,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}) {
  const theme = useTheme()
  const color = theme.accentSubtle.val
  const green = theme.vineGreen.val
  const greenDark = theme.vineGreenDark.val

  const degrees = {
    topLeft: 0,
    topRight: 90,
    bottomRight: 180,
    bottomLeft: 270,
  }[position]

  return (
    <Svg width={36} height={36} viewBox="0 0 36 36">
      <G transform={`rotate(${degrees}, 18, 18)`}>
        <Path d="M3 33 C3 18, 8 6, 33 3" stroke={color} strokeWidth={1.2} fill="none" />
        <Path d="M3 33 C10 30, 16 22, 19 10" stroke={color} strokeWidth={0.8} fill="none" />
        <Path
          d="M5 33 C12 28, 20 18, 22 6"
          stroke={color}
          strokeWidth={0.5}
          fill="none"
          opacity={0.5}
        />
        {/* Leaf accents */}
        <Path
          d={leafPath(8, 24, 5, -30)}
          fill={green}
          stroke={greenDark}
          strokeWidth={0.3}
          opacity={0.5}
        />
        <Path
          d={leafPath(16, 14, 4, -50)}
          fill={green}
          stroke={greenDark}
          strokeWidth={0.3}
          opacity={0.4}
        />
      </G>
    </Svg>
  )
}

export function VineBar({ height = 100 }: { height?: number }) {
  const theme = useTheme()
  const c = theme.accentSubtle.val
  const green = theme.vineGreen.val
  const greenDark = theme.vineGreenDark.val
  const red = theme.floralRed.val

  return (
    <Svg width={14} height={height} viewBox={`0 0 14 ${height}`}>
      <Line x1="7" y1="0" x2="7" y2={height} stroke={c} strokeWidth={0.75} />
      {Array.from({ length: Math.floor(height / 24) }, (_, i) => {
        const y = 12 + i * 24
        const showBerry = i % 2 === 0
        return (
          <G key={i}>
            <Path d={leafPath(7, y, 6, 160)} fill={green} stroke={greenDark} strokeWidth={0.4} />
            <Path
              d={leafPath(7, y + 12, 5, 20)}
              fill={green}
              stroke={greenDark}
              strokeWidth={0.4}
            />
            <Circle cx="7" cy={y} r="1.5" fill={c} />
            {showBerry && <Circle cx={3} cy={y + 6} r={1.8} fill={red} opacity={0.6} />}
          </G>
        )
      })}
    </Svg>
  )
}

export function PageBreakOrnament() {
  return (
    <YStack alignItems="center" paddingVertical="$md">
      <Image source={chaliceImage} style={styles.chalice} contentFit="contain" />
    </YStack>
  )
}

const styles = StyleSheet.create({
  marker: {
    width: 280,
    height: 50,
  },
  chalice: {
    width: 200,
    height: 40,
  },
  flourish: {
    width: 260,
    height: 44,
  },
})
