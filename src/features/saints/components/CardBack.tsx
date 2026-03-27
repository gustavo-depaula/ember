import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import Svg, { Line, Path } from 'react-native-svg'
import { Text, View, YStack } from 'tamagui'
import type { Saint } from '../data/saints'

const corners = {
  topLeft: require('../../../../assets/textures/corner_top_left.png'),
  topRight: require('../../../../assets/textures/corner_top_right.png'),
  bottomLeft: require('../../../../assets/textures/corner_bottom_left.png'),
  bottomRight: require('../../../../assets/textures/corner_bottom_right.png'),
}

const cornerSize = 40

function OrnamentCross({ size = 48, color = '#C9A84C' }: { size?: number; color?: string }) {
  const half = size / 2
  const arm = size * 0.15
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Vertical beam */}
      <Path
        d={`M${half - arm} ${arm} L${half + arm} ${arm} L${half + arm} ${size - arm} L${half - arm} ${size - arm} Z`}
        fill={color}
        opacity={0.8}
      />
      {/* Horizontal beam */}
      <Path
        d={`M${arm} ${half - arm} L${size - arm} ${half - arm} L${size - arm} ${half + arm} L${arm} ${half + arm} Z`}
        fill={color}
        opacity={0.8}
      />
      {/* Decorative circle at center */}
      <Path
        d={`M${half} ${half - arm * 1.5} A${arm * 1.5} ${arm * 1.5} 0 1 1 ${half} ${half + arm * 1.5} A${arm * 1.5} ${arm * 1.5} 0 1 1 ${half} ${half - arm * 1.5}`}
        fill={color}
      />
      {/* Top finial lines */}
      <Line
        x1={half}
        y1={0}
        x2={half}
        y2={arm * 0.6}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={0}
        y1={half}
        x2={arm * 0.6}
        y2={half}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={half}
        y1={size}
        x2={half}
        y2={size - arm * 0.6}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={size}
        y1={half}
        x2={size - arm * 0.6}
        y2={half}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
      />
    </Svg>
  )
}

function OrnamentalDivider({ width }: { width: number }) {
  const lineWidth = width * 0.6
  return (
    <Svg width={lineWidth} height={6} viewBox={`0 0 ${lineWidth} 6`}>
      <Line x1={0} y1={3} x2={lineWidth} y2={3} stroke="#C9A84C" strokeWidth={0.5} opacity={0.4} />
      <Line
        x1={lineWidth * 0.3}
        y1={1}
        x2={lineWidth * 0.7}
        y2={1}
        stroke="#C9A84C"
        strokeWidth={0.5}
        opacity={0.3}
      />
      <Line
        x1={lineWidth * 0.3}
        y1={5}
        x2={lineWidth * 0.7}
        y2={5}
        stroke="#C9A84C"
        strokeWidth={0.5}
        opacity={0.3}
      />
    </Svg>
  )
}

export function CardBack({
  saint,
  cardWidth,
  cardHeight,
}: {
  saint: Saint
  cardWidth: number
  cardHeight: number
}) {
  const { t } = useTranslation()

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      width={cardWidth}
      height={cardHeight}
      borderRadius="$lg"
      overflow="hidden"
      borderWidth={2}
      borderColor="$accent"
      backgroundColor="$background"
      style={{ transform: [{ rotateY: '180deg' }] }}
    >
      {/* Corner textures */}
      <View position="absolute" top={-8} left={-8} zIndex={2}>
        <Image source={corners.topLeft} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" top={-8} right={-8} zIndex={2}>
        <Image source={corners.topRight} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" bottom={-8} left={-8} zIndex={2}>
        <Image source={corners.bottomLeft} style={styles.corner} contentFit="contain" />
      </View>
      <View position="absolute" bottom={-8} right={-8} zIndex={2}>
        <Image source={corners.bottomRight} style={styles.corner} contentFit="contain" />
      </View>

      {/* Inner border */}
      <View
        position="absolute"
        top={12}
        left={12}
        right={12}
        bottom={12}
        borderWidth={0.5}
        borderColor="$accentSubtle"
        borderRadius="$md"
      />

      {/* Content */}
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl" gap="$md">
        <OrnamentCross size={56} />

        <View alignItems="center" marginTop="$sm">
          <OrnamentalDivider width={cardWidth} />
        </View>

        <Text
          fontFamily="$heading"
          fontSize={24}
          color="$accent"
          textAlign="center"
          marginTop="$sm"
        >
          {t(saint.nameKey)}
        </Text>

        <Text fontFamily="$body" fontSize={18} color="$colorMuted" textAlign="center">
          {t(saint.feastDayKey)}
        </Text>

        <Text
          fontFamily="$body"
          fontSize={16}
          color="$colorMuted"
          textAlign="center"
          fontStyle="italic"
        >
          {t(saint.patronOfKey)}
        </Text>

        <View alignItems="center" marginVertical="$sm">
          <OrnamentalDivider width={cardWidth} />
        </View>

        <Text
          fontFamily="$body"
          fontSize={18}
          color="$color"
          textAlign="center"
          fontStyle="italic"
          lineHeight={26}
          paddingHorizontal="$sm"
        >
          &ldquo;{t(saint.prayerExcerptKey)}&rdquo;
        </Text>
      </YStack>
    </View>
  )
}

const styles = StyleSheet.create({
  corner: {
    width: cornerSize,
    height: cornerSize * 0.6,
  },
})
