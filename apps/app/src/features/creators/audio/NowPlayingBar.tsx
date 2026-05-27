/**
 * Now-playing mini-bar. Rendered as the content of NativeTabs.BottomAccessory,
 * so the tab bar's native Liquid Glass provides the surface — we render only the
 * row content (artwork, title, controls), never our own glass pill (that would
 * nest a second surface inside the accessory).
 */

import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId } from '@/content/contentIndex'
import { NOW_PLAYING_BAR_HEIGHT, useCreatorsStore } from '@/stores/creatorsStore'

const PILL_HEIGHT = NOW_PLAYING_BAR_HEIGHT
const ARTWORK_SIZE = PILL_HEIGHT - 16
const ARTWORK_LEFT_PADDING = 14

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  flex: 1,
  height: PILL_HEIGHT,
}

export function NowPlayingBar() {
  const { t } = useTranslation()
  const theme = useTheme()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const isPlaying = useCreatorsStore((s) => s.isPlaying)
  const isBuffering = useCreatorsStore((s) => s.isBuffering)
  const togglePlay = useCreatorsStore((s) => s.togglePlay)
  const stop = useCreatorsStore((s) => s.stop)

  if (!nowPlaying) return null

  const accessibilityLabel = t('creators.openPlayer', { title: nowPlaying.title })

  return (
    <View style={rowStyle}>
      <Link
        href={{
          pathname: '/creators/[creatorId]/episode/[itemId]',
          params: {
            creatorId: bareId(nowPlaying.creatorId),
            itemId: nowPlaying.itemId,
          },
        }}
        push
        asChild
      >
        <Link.AppleZoom>
          <AnimatedPressable
            style={{ flex: 1 }}
            accessibilityRole="link"
            accessibilityLabel={accessibilityLabel}
          >
            <XStack
              alignItems="center"
              gap="$sm"
              paddingLeft={ARTWORK_LEFT_PADDING}
              paddingRight={4}
              flex={1}
            >
              <YStack
                width={ARTWORK_SIZE}
                height={ARTWORK_SIZE}
                borderRadius={8}
                overflow="hidden"
                backgroundColor="$accentSubtle"
                alignItems="center"
                justifyContent="center"
              >
                {nowPlaying.imageUri ? (
                  <Image
                    source={{ uri: nowPlaying.imageUri }}
                    style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE }}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <Play size={Math.round(ARTWORK_SIZE / 2)} color={theme.accent.val} />
                )}
              </YStack>
              <YStack flex={1}>
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color="$color"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nowPlaying.title}
                </Text>
                {!!nowPlaying.creatorName && (
                  <Text
                    fontFamily="$body"
                    fontSize="$1"
                    color="$colorSecondary"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    marginTop={-1}
                  >
                    {nowPlaying.creatorName}
                  </Text>
                )}
              </YStack>
            </XStack>
          </AnimatedPressable>
        </Link.AppleZoom>
      </Link>
      <Pressable
        hitSlop={12}
        onPress={() => void togglePlay()}
        disabled={isBuffering}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? t('creators.pause') : t('creators.play')}
        style={{ paddingHorizontal: 6, paddingVertical: 6, width: 38, alignItems: 'center' }}
      >
        {isBuffering ? (
          <ActivityIndicator size="small" color={theme.accent.val} />
        ) : isPlaying ? (
          <Pause size={26} color={theme.accent.val} />
        ) : (
          <Play size={26} color={theme.accent.val} />
        )}
      </Pressable>
      <Pressable
        hitSlop={12}
        onPress={() => void stop()}
        accessibilityRole="button"
        accessibilityLabel={t('creators.close')}
        style={{ paddingHorizontal: 6, paddingVertical: 6, marginRight: 4 }}
      >
        <X size={20} color={theme.colorSecondary.val} />
      </Pressable>
    </View>
  )
}
