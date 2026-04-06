import { Image } from 'expo-image'
import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { View, XStack } from 'tamagui'

const topLeftBorder = require('../../assets/textures/whole_top_and_corner_left.png')

const corners = {
  topRight: require('../../assets/textures/corner_top_right.png'),
  bottomLeft: require('../../assets/textures/corner_bottom_left.png'),
  bottomRight: require('../../assets/textures/corner_bottom_right.png'),
}

export const PageBorder = memo(function PageBorder() {
  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={1}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={topLeftBorder} style={styles.topLeftBorder} contentFit="contain" />
      <View position="absolute" top={0} right={0}>
        <Image source={corners.topRight} style={styles.topCorner} contentFit="contain" />
      </View>
    </View>
  )
})

export const PageFooter = memo(function PageFooter() {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="flex-end"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={corners.bottomLeft} style={styles.bottomCorner} contentFit="contain" />
      <Image source={corners.bottomRight} style={styles.bottomCorner} contentFit="contain" />
    </XStack>
  )
})

const styles = StyleSheet.create({
  topLeftBorder: {
    width: '55%',
    height: 140,
  },
  topCorner: {
    width: 120,
    height: 72,
  },
  bottomCorner: {
    width: 120,
    height: 72,
  },
})
