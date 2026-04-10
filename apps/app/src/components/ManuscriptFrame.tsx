import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import { View, YStack } from 'tamagui'

const corners = {
  topLeft: require('../../assets/textures/corner_top_left.png'),
  topRight: require('../../assets/textures/corner_top_right.png'),
  bottomLeft: require('../../assets/textures/corner_bottom_left.png'),
  bottomRight: require('../../assets/textures/corner_bottom_right.png'),
}

const cornerSize = 120

export function ManuscriptFrame({
  children,
  light = false,
  contentPadding,
}: {
  children: ReactNode
  light?: boolean
  contentPadding?: number | string
}) {
  const { showCorners, outerBorder, innerBorder, innerPadding } = (() => {
    if (light) {
      return { showCorners: false, outerBorder: 0.5, innerBorder: 0, innerPadding: 0 }
    }

    return { showCorners: true, outerBorder: 0.5, innerBorder: 0.25, innerPadding: 4 }
  })()

  return (
    <YStack
      borderWidth={outerBorder}
      borderColor={'$accent'}
      padding={innerPadding}
      position="relative"
      overflow="visible"
    >
      {showCorners && (
        <>
          <View position="absolute" top={-8} left={-24} accessible={false}>
            <Image source={corners.topLeft} style={styles.corner} contentFit="contain" />
          </View>
          <View position="absolute" top={-8} right={-16} accessible={false}>
            <Image source={corners.topRight} style={styles.corner} contentFit="contain" />
          </View>
          <View position="absolute" bottom={-12} left={-12} accessible={false}>
            <Image source={corners.bottomLeft} style={styles.corner} contentFit="contain" />
          </View>
          <View position="absolute" bottom={-12} right={-10} accessible={false}>
            <Image source={corners.bottomRight} style={styles.corner} contentFit="contain" />
          </View>
        </>
      )}

      <YStack
        borderWidth={innerBorder}
        borderColor={'$accentSubtle'}
        padding={contentPadding ?? '$md'}
        overflow="hidden"
        style={innerBorder > 0 ? styles.inner : undefined}
      >
        {children}
      </YStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  corner: {
    width: cornerSize,
    height: cornerSize * 0.6,
  },
  inner: {
    borderStyle: 'solid',
  },
})
