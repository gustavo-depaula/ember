import { type Href, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { GlassCircle, textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { ZoomLink } from '@/components/ZoomLink'
import { BookCover, type BookCoverFormat } from '@/features/covers'
import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'

export function BookHero({
  name,
  author,
  ctaLabel,
  tone,
  format,
  scrollY,
  readHref,
}: {
  name: string
  author?: string
  ctaLabel: string
  tone: BlockTone
  /** The book's generated cover, stood in the middle of the hero. */
  format: BookCoverFormat
  scrollY: SharedValue<number>
  /** Reader route — wrapped in Link.AppleZoom so the capsule morphs into the reader. */
  readHref: Href
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const heroHeight = Math.round(windowHeight * 0.5) + insets.top
  // What's left after the back button, the title block, and the capsule's overlap.
  const coverWidth = Math.round(
    Math.min(180, Math.max(110, (heroHeight - insets.top - 56 - 120 - 40) / 1.5)),
  )

  // Pull-down (scrollY < 0) grows the tone to fill the overscroll, anchored to
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
      overflow="visible"
      // Lift above the opaque content column so the floating capsule isn't
      // painted over by the column below.
      zIndex={1}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, stretch, { backgroundColor: tone.from }]}
        pointerEvents="none"
      />

      <YStack position="absolute" top={insets.top + 8} left="$md" zIndex={2}>
        <GlassCircle
          onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={20} color={blockInk} />
        </GlassCircle>
      </YStack>

      <YStack
        flex={1}
        alignItems="center"
        justifyContent="flex-end"
        gap="$md"
        paddingTop={insets.top + 56}
        paddingHorizontal="$lg"
        paddingBottom={40}
      >
        <BookCover title={name} author={author} tone={tone} format={format} width={coverWidth} />
        <YStack alignItems="center" gap="$xs">
          <Typography
            variant="sacred-title"
            textAlign="center"
            color={blockInk}
            fontSize={26}
            lineHeight={30}
            numberOfLines={2}
            style={textShadow}
          >
            {name}
          </Typography>
          {author && (
            <Typography
              variant="marker"
              textAlign="center"
              color={blockLabelInk}
              fontSize="$2"
              style={textShadow}
            >
              {author}
            </Typography>
          )}
        </YStack>
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
  capsuleWrap: { position: 'absolute', bottom: -22, alignSelf: 'center' },
})
