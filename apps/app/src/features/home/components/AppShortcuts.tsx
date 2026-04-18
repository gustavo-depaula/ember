import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { lightTap, mediumTap } from '@/lib/haptics'

const tileImages = {
  mass: require('../../../../assets/textures/nav-tiles/mass.png'),
  practices: require('../../../../assets/textures/nav-tiles/practices.png'),
  bible: require('../../../../assets/textures/nav-tiles/bible.png'),
  reading: require('../../../../assets/textures/nav-tiles/reading.png'),
  plan: require('../../../../assets/textures/nav-tiles/plan.png'),
  settings: require('../../../../assets/textures/nav-tiles/settings.png'),
}

const shortcuts = [
  {
    image: tileImages.mass,
    labelKey: 'home.holyMass',
    route: { pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } },
  },
  {
    image: tileImages.practices,
    labelKey: 'home.pray',
    route: '/practices',
  },
  {
    image: tileImages.bible,
    labelKey: 'home.bible',
    route: '/bible',
  },
  {
    image: tileImages.reading,
    labelKey: 'explore.title',
    route: '/explore',
  },
  {
    image: tileImages.plan,
    labelKey: 'home.planOfLife',
    route: '/plan',
  },
  {
    image: tileImages.settings,
    labelKey: 'settings.title',
    route: '/settings',
  },
] as const

const tileSize = 110

export function AppShortcuts() {
  const { t } = useTranslation()
  const router = useRouter()
  const [peekImage, setPeekImage] = useState<(typeof shortcuts)[number] | undefined>(undefined)
  const { width: screenWidth } = useWindowDimensions()
  const peekSize = Math.min(screenWidth - 48, 340)

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginHorizontal: -24,
        }}
        contentContainerStyle={{ gap: 12, paddingLeft: 24, paddingRight: 24 }}
      >
        {shortcuts.map((s) => (
          <AnimatedPressable
            key={s.labelKey}
            onPress={() => {
              lightTap()
              router.push(s.route)
            }}
            onLongPress={() => {
              mediumTap()
              setPeekImage(s)
            }}
            delayLongPress={300}
          >
            <YStack alignItems="center" gap="$xs" width={tileSize}>
              <Image
                source={s.image}
                style={{ width: tileSize, height: tileSize, borderRadius: 6 }}
                contentFit="cover"
              />
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color="$color"
                numberOfLines={1}
                textAlign="center"
              >
                {t(s.labelKey)}
              </Text>
            </YStack>
          </AnimatedPressable>
        ))}
      </ScrollView>

      <Modal
        visible={!!peekImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPeekImage(undefined)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setPeekImage(undefined)}>
          <Animated.View entering={FadeIn.duration(200)}>
            <YStack alignItems="center" gap="$sm">
              <Image
                source={peekImage?.image}
                style={{
                  width: peekSize,
                  height: peekSize,
                  borderRadius: 10,
                }}
                contentFit="cover"
              />
              <Text fontFamily="$heading" fontSize="$4" color="rgba(245,240,224,0.9)">
                {peekImage ? t(peekImage.labelKey) : ''}
              </Text>
            </YStack>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
