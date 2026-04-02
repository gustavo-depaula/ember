import { Image } from 'expo-image'
import { StyleSheet } from 'react-native'
import { Text, View, YStack } from 'tamagui'

import { AnimatedPressable, WatercolorIcon } from '@/components'
import type { IconName } from '@/components/ornaments/WatercolorIcon'

const topLeft = require('../../../../assets/textures/corner_top_left.png')
const bottomRight = require('../../../../assets/textures/corner_bottom_right.png')

const cornerSize = 72

export function NavigationMedallion({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <AnimatedPressable onPress={onPress}>
      <YStack padding={12} position="relative" overflow="visible">
        <View position="absolute" top={0} left={0}>
          <Image source={topLeft} style={styles.topLeft} contentFit="contain" />
        </View>
        <View position="absolute" bottom={0} right={0}>
          <Image source={bottomRight} style={styles.bottomRight} contentFit="contain" />
        </View>

        <YStack alignItems="center" gap="$sm" padding="$md">
          <WatercolorIcon name={icon} size={44} />
          <YStack gap={2} alignItems="center">
            <Text fontFamily="$heading" fontSize="$3" color="$color">
              {title}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
              {subtitle}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  topLeft: {
    width: cornerSize * 1.2,
    height: cornerSize * 0.84,
  },
  bottomRight: {
    width: cornerSize,
    height: cornerSize * 0.6,
  },
})
