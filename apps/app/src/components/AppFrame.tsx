import { Image } from 'expo-image'
import { memo } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { useThemeName, View } from 'tamagui'

const flourishLight = require('../../assets/textures/notch_flourish.png')
const flourishDark = require('../../assets/textures/notch_flourish_dark.png')

const aspectRatio = 2048 / 896
const screenWidth = Dimensions.get('window').width
const imageWidth = screenWidth * 0.7
const imageHeight = imageWidth / aspectRatio

export const AppFrame = memo(function AppFrame() {
  const themeName = useThemeName()
  const isDark = themeName.startsWith('dark')
  const source = isDark ? flourishDark : flourishLight

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={9999}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={source} style={styles.left} contentFit="contain" accessibilityElementsHidden />
      <Image
        source={source}
        style={styles.right}
        contentFit="contain"
        accessibilityElementsHidden
      />
    </View>
  )
})

const styles = StyleSheet.create({
  left: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: imageWidth,
    height: imageHeight,
  },
  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: imageWidth,
    height: imageHeight,
    transform: [{ scaleX: -1 }],
  },
})
