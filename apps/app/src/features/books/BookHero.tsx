import { type Href, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'

import { GlassCircle, textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { ZoomLink } from '@/components/ZoomLink'
import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'

export function BookHero({
  name,
  author,
  ctaLabel,
  tone,
  scrollY,
  readHref,
}: {
  name: string
  author?: string
  ctaLabel: string
  tone: BlockTone
  scrollY: SharedValue<number>
  /** Reader route — wrapped in Link.AppleZoom so the capsule morphs into the reader. */
  readHref: Href
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const heroHeight = Math.round(windowHeight * 0.5) + insets.top
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '✠'

  // Pull-down (scrollY < 0) grows the versal to fill the overscroll, anchored to
  // the top, rather than revealing the page background above it.
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
      // Lift above the opaque content column so the floating capsule isn't
      // painted over by the column below.
      zIndex={1}
    >
      <Animated.View style={[StyleSheet.absoluteFill, stretch, styles.versal]} pointerEvents="none">
        <Text fontFamily="$title" fontSize={200} lineHeight={220} color={blockInk} opacity={0.12}>
          {initial}
        </Text>
      </Animated.View>

      <YStack padding="$md" paddingTop={insets.top + 8}>
        <GlassCircle
          onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={20} color={blockInk} />
        </GlassCircle>
      </YStack>

      <YStack padding="$lg" gap="$xs">
        <Typography
          variant="sacred-title"
          textAlign="left"
          color={blockInk}
          fontSize={32}
          lineHeight={36}
          numberOfLines={3}
          style={textShadow}
        >
          {name}
        </Typography>
        {author && (
          <Typography
            variant="marker"
            textAlign="left"
            color={blockLabelInk}
            fontSize="$2"
            style={textShadow}
          >
            {author}
          </Typography>
        )}
      </YStack>

      <ZoomLink href={readHref}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={styles.capsuleWrap}
        >
          <YStack
            backgroundColor="$accent"
            borderRadius={9999}
            paddingVertical="$sm"
            paddingHorizontal="$xl"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 3 }}
            shadowOpacity={0.3}
            shadowRadius={10}
            elevation={6}
          >
            <Typography variant="label" fontSize="$3" color="$background" numberOfLines={1}>
              {ctaLabel}
            </Typography>
          </YStack>
        </Pressable>
      </ZoomLink>
    </YStack>
  )
}

const styles = StyleSheet.create({
  versal: { alignItems: 'center', justifyContent: 'center' },
  capsuleWrap: { position: 'absolute', bottom: -22, alignSelf: 'center' },
})
