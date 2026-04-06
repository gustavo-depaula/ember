import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { useReadingStyle } from '@/hooks/useReadingStyle'
import { leafPath } from './ornaments/svgHelpers'

export function IlluminatedInitial({ text }: { text: string }) {
  const theme = useTheme()
  const subtle = theme.accentSubtle.val
  const accent = theme.accent.val
  const green = theme.vineGreen.val
  const greenDark = theme.vineGreenDark.val
  const red = theme.floralRed.val
  const blue = theme.floralBlue.val
  const readingStyle = useReadingStyle()

  if (text.length === 0) return undefined

  const firstLetter = text[0]
  const rest = text.slice(1)

  return (
    <XStack gap="$sm" accessibilityLabel={text}>
      <YStack
        alignItems="center"
        justifyContent="flex-start"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {/* Gold bordered frame around the initial */}
        <View position="relative" width={64} height={72}>
          <Svg
            width={64}
            height={72}
            viewBox="0 0 64 72"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Subtle background wash */}
            <Rect x="5" y="5" width="54" height="62" fill={blue} opacity={0.05} rx={1} />
            {/* Outer frame — thicker gold */}
            <Rect
              x="1"
              y="1"
              width="62"
              height="70"
              stroke={accent}
              strokeWidth={2}
              fill="none"
              rx={2}
            />
            {/* Inner frame */}
            <Rect
              x="4"
              y="4"
              width="56"
              height="64"
              stroke={subtle}
              strokeWidth={1}
              fill="none"
              rx={1}
            />
            {/* Corner flower motifs — 4-petal flowers at each corner */}
            {/* Top-left */}
            <Circle cx="4" cy="4" r="3" fill={red} opacity={0.5} />
            <Circle cx="4" cy="4" r="1.2" fill={accent} opacity={0.8} />
            {/* Top-right */}
            <Circle cx="60" cy="4" r="3" fill={blue} opacity={0.5} />
            <Circle cx="60" cy="4" r="1.2" fill={accent} opacity={0.8} />
            {/* Bottom-left */}
            <Circle cx="4" cy="68" r="3" fill={blue} opacity={0.5} />
            <Circle cx="4" cy="68" r="1.2" fill={accent} opacity={0.8} />
            {/* Bottom-right */}
            <Circle cx="60" cy="68" r="3" fill={red} opacity={0.5} />
            <Circle cx="60" cy="68" r="1.2" fill={accent} opacity={0.8} />
          </Svg>
          <Text
            position="absolute"
            top={4}
            left={0}
            right={0}
            fontFamily="$display"
            fontSize={52}
            lineHeight={64}
            color="$accent"
            textAlign="center"
          >
            {firstLetter}
          </Text>
        </View>
        {/* Vine extending below the initial — with filled leaves and terminal flower */}
        <Svg width={14} height={48} viewBox="0 0 14 48">
          <Line x1="7" y1="0" x2="7" y2="40" stroke={subtle} strokeWidth={0.75} />
          {/* Leaves */}
          <Path d={leafPath(7, 10, 6, 160)} fill={green} stroke={greenDark} strokeWidth={0.4} />
          <Path d={leafPath(7, 22, 5, 20)} fill={green} stroke={greenDark} strokeWidth={0.4} />
          <Path
            d={leafPath(7, 34, 5, 160)}
            fill={green}
            stroke={greenDark}
            strokeWidth={0.4}
            opacity={0.7}
          />
          {/* Terminal flower bud */}
          <Circle cx="7" cy="42" r="3" fill={red} opacity={0.5} />
          <Circle cx="7" cy="42" r="1.2" fill={accent} opacity={0.7} />
          {/* Junction dots */}
          <Circle cx="7" cy="10" r="1" fill={subtle} />
          <Circle cx="7" cy="22" r="1" fill={subtle} />
        </Svg>
      </YStack>
      <Text flex={1} color="$color" paddingTop="$sm" {...readingStyle}>
        {rest}
      </Text>
    </XStack>
  )
}
