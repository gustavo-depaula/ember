/**
 * The illuminated doorway into a collection. A tall hero: the painting fills the
 * width (cover), bleeding up into the safe-area notch and out to the screen
 * edges. Pulling down stretches the image to fill the overscroll (anchored at
 * the top) rather than revealing the page behind it. The title + tagline sit
 * over the lower image in cream ink with a soft shadow. Back and offline
 * controls float as liquid-glass circles (with an opaque fallback off iOS 26).
 *
 * `overflow` is left visible so the stretched image can spill up into the
 * overscroll; the opaque content column below covers any lower spill.
 */

import { Image, type ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  CloudDownload,
  FolderPlus,
  Loader,
  Pencil,
} from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { GlassCircle, textShadow } from '@/components/ornaments'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'
import { useSaveToggle } from '@/features/library/savedHooks'
import { usePinToggle } from '@/features/pinning/hooks'

export function CollectionHero({
  collectionId,
  name,
  tagline,
  image,
  tone,
  scrollY,
  kind = 'collection',
  onEdit,
  onAddToCollection,
}: {
  collectionId: string
  name: string
  tagline?: string
  image?: ImageSource
  tone: BlockTone
  scrollY: SharedValue<number>
  /** Catalog kind for the Save row. 'usercollection' hides the offline control. */
  kind?: string
  /** When set, shows an Edit (pencil) control — used by the user-collection viewer. */
  onEdit?: () => void
  /** When set, shows an "add this to one of your collections" control. */
  onAddToCollection?: () => void
}) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const { pinned, isWorking, toggle } = usePinToggle(collectionId)
  const { saved, toggle: toggleSave } = useSaveToggle(collectionId, kind)

  const isUserCollection = kind === 'usercollection'
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '✠'
  const OfflineIcon = isWorking ? Loader : pinned ? Check : CloudDownload
  const SaveIcon = saved ? BookmarkCheck : Bookmark
  const heroHeight = Math.round(windowHeight * 0.5) + insets.top

  // Pull-down (scrollY < 0) grows the painting to fill the overscroll, anchored
  // to the top, rather than revealing the page background above it.
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
    >
      {image ? (
        <Animated.View style={[StyleSheet.absoluteFill, stretch]}>
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
        <Text
          position="absolute"
          alignSelf="center"
          top={insets.top + 48}
          fontFamily="$title"
          fontSize={180}
          lineHeight={200}
          color={blockInk}
          opacity={0.12}
        >
          {initial}
        </Text>
      )}

      <XStack justifyContent="space-between" padding="$md" paddingTop={insets.top + 8}>
        <GlassCircle onPress={() => router.back()} accessibilityLabel={t('a11y.goBack')}>
          <ChevronLeft size={20} color={blockInk} />
        </GlassCircle>
        <XStack gap="$sm">
          {/* Save belongs only to corpus collections — a user collection is
              already in the library (it lives in "Your collections"), so a
              bookmark there is a no-op. */}
          {!isUserCollection && (
            <GlassCircle
              onPress={toggleSave}
              accessibilityRole="switch"
              accessibilityState={{ checked: saved }}
              accessibilityLabel={saved ? t('library.saved') : t('library.save')}
            >
              <SaveIcon size={18} color={saved ? blockLabelInk : blockInk} />
            </GlassCircle>
          )}

          {onAddToCollection && (
            <GlassCircle
              onPress={onAddToCollection}
              accessibilityLabel={t('library.addToCollection')}
            >
              <FolderPlus size={18} color={blockInk} />
            </GlassCircle>
          )}

          {isUserCollection ? (
            onEdit && (
              <GlassCircle onPress={onEdit} accessibilityLabel={t('collections.manage')}>
                <Pencil size={17} color={blockInk} />
              </GlassCircle>
            )
          ) : (
            <GlassCircle
              onPress={toggle}
              disabled={isWorking}
              accessibilityRole="switch"
              accessibilityState={{ checked: pinned, busy: isWorking }}
              accessibilityLabel={
                pinned
                  ? t('pinning.availableOffline', { defaultValue: 'Available offline' })
                  : t('pinning.makeAvailableOffline', { defaultValue: 'Make available offline' })
              }
            >
              <OfflineIcon size={18} color={pinned ? blockLabelInk : blockInk} />
            </GlassCircle>
          )}
        </XStack>
      </XStack>

      <YStack padding="$lg" gap="$xs">
        <Typography
          variant="screen-title"
          textAlign="left"
          color={blockInk}
          fontSize={32}
          lineHeight={36}
          numberOfLines={3}
          style={textShadow}
        >
          {name}
        </Typography>
        {tagline && (
          <Typography
            variant="caption"
            fontSize="$1"
            color="rgba(245,239,226,0.9)"
            style={textShadow}
          >
            {tagline}
          </Typography>
        )}
      </YStack>
    </YStack>
  )
}
