/**
 * The illuminated doorway into a prayer or practice — the sibling of
 * CollectionHero. A tall jewel-toned frontispiece: when a hero painting is
 * provided it bleeds full-width as a cover photo; otherwise a large watercolor
 * emblem floats over a stable tone ground. The tracked metadata and cream
 * title sit at the base, and a single glass back button rides the top-left.
 * When `onPray` is given (simple prayers / practices, never programs), a gold
 * "Rezar" capsule floats on the hero/column seam — the doorway is right on the
 * title page.
 *
 * `overflow` is left visible so the emblem/image can stretch into the
 * overscroll and the Rezar capsule can straddle the lower edge; the opaque
 * content column below covers any lower spill.
 */

import { Image, type ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { GlassCircle, textShadow } from '@/components/ornaments'
import { PracticeIcon } from '@/components/PracticeIcon'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'

export function PracticeHero({
  iconKey,
  name,
  metadata,
  tone,
  image,
  scrollY,
  onPray,
}: {
  iconKey: string
  name: string
  metadata?: string
  tone: BlockTone
  /** Full-bleed sacred-art cover; when present the icon emblem is suppressed. */
  image?: ImageSource
  scrollY: SharedValue<number>
  /** When set, floats a "Rezar" capsule on the hero base. Omitted for programs. */
  onPray?: () => void
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const heroHeight = Math.round(windowHeight * 0.5) + insets.top

  // Pull-down (scrollY < 0) grows the emblem/image to fill the overscroll,
  // anchored to the top, rather than revealing the page background above it.
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
      // Lift above the opaque content column so the Rezar capsule, which spills
      // past the hero's lower edge, isn't painted over by the column below.
      zIndex={1}
    >
      {image ? (
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
      ) : (
        <Animated.View
          style={[StyleSheet.absoluteFill, stretch, styles.emblem]}
          pointerEvents="none"
        >
          <PracticeIcon name={iconKey} size={104} />
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

      <YStack padding="$lg" gap="$xs">
        {metadata && (
          <Typography
            variant="marker"
            textAlign="left"
            color={blockLabelInk}
            fontSize="$2"
            style={textShadow}
          >
            {metadata}
          </Typography>
        )}
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
      </YStack>

      {onPray && (
        <Pressable
          onPress={onPray}
          accessibilityRole="button"
          accessibilityLabel={t('practice.pray')}
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
            <Typography variant="label" fontSize="$3" color="$background">
              {t('practice.pray')}
            </Typography>
          </YStack>
        </Pressable>
      )}
    </YStack>
  )
}

const styles = StyleSheet.create({
  emblem: { alignItems: 'center', justifyContent: 'center' },
  capsuleWrap: { position: 'absolute', bottom: -22, alignSelf: 'center' },
})
