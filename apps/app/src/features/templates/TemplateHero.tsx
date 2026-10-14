import { Image, type ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'

import { GlassCircle, textShadow } from '@/components/ornaments'
import { useFrameWidth } from '@/components/pageWidth'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { type PageMeasure, pageGutter, pageOuterWidth } from '@/lib/layout'

/**
 * The illuminated doorway into a tradition — twin of `BookHero`. A jewel-toned
 * frontispiece: its school's masterpiece (or a faint versal when none is mapped)
 * behind the cream name + attribution, a glass back button top-left. No CTA on
 * the seam (adoption is a deliberate act lower on the page, after the manifesto).
 */
export function TemplateHero({
  name,
  attribution,
  tone,
  image,
  measure = 'column',
  scrollY,
}: {
  name: string
  attribution?: string
  tone: BlockTone
  image?: ImageSource
  /** The measure of the page beneath, so the title stands over its left edge. */
  measure?: PageMeasure
  scrollY: SharedValue<number>
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const heroHeight = Math.round(windowHeight * 0.42) + insets.top
  const outer = pageOuterWidth(useFrameWidth(), measure)
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '✠'

  const stretch = useAnimatedStyle(() => {
    const y = scrollY.value
    if (y >= 0) return { transform: [{ translateY: 0 }, { scale: 1 }] }
    return { transform: [{ translateY: y / 2 }, { scale: 1 - y / heroHeight }] }
  })

  return (
    <YStack
      height={heroHeight}
      backgroundColor={tone.from}
      justifyContent="space-between"
      overflow="visible"
      zIndex={1}
    >
      {image ? (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, stretch]} pointerEvents="none">
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
              accessibilityLabel={name}
            />
          </Animated.View>
          {/* A soft scrim so cream ink reads over a bright painting. */}
          <YStack
            style={StyleSheet.absoluteFill}
            backgroundColor="#000"
            opacity={0.28}
            pointerEvents="none"
          />
        </>
      ) : (
        <Animated.View
          style={[StyleSheet.absoluteFill, stretch, styles.versal]}
          pointerEvents="none"
        >
          <Text fontFamily="$title" fontSize={200} lineHeight={220} color={blockInk} opacity={0.12}>
            {initial}
          </Text>
        </Animated.View>
      )}

      <YStack padding="$md" paddingTop={insets.top + 8}>
        <GlassCircle
          onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={20} color={blockInk} />
        </GlassCircle>
      </YStack>

      <YStack
        width="100%"
        maxWidth={outer}
        alignSelf="center"
        paddingHorizontal={pageGutter}
        paddingVertical="$lg"
        gap="$xs"
      >
        <Typography variant="screen-title" textAlign="left" color={blockInk} style={textShadow}>
          {name}
        </Typography>
        {attribution && (
          <Typography
            variant="marker"
            textAlign="left"
            color={blockLabelInk}
            fontSize="$2"
            style={textShadow}
          >
            {attribution}
          </Typography>
        )}
      </YStack>
    </YStack>
  )
}

const styles = StyleSheet.create({
  versal: { alignItems: 'center', justifyContent: 'center' },
})
