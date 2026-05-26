/**
 * Persistent mini-bar mounted at layout level so audio follows the user across
 * every screen. Visibility is driven entirely by `creatorsStore.nowPlaying`.
 *
 * Visual: a floating glass pill. iOS 26 devices get a real Liquid Glass
 * background via expo-glass-effect; everywhere else falls back to expo-blur.
 */

import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { Image } from 'expo-image'
import { Link, usePathname } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Platform, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId } from '@/content/contentIndex'
import { NOW_PLAYING_BAR_HEIGHT, useCreatorsStore } from '@/stores/creatorsStore'

const PILL_HEIGHT = NOW_PLAYING_BAR_HEIGHT
const PILL_RADIUS = PILL_HEIGHT / 2
const ARTWORK_SIZE = PILL_HEIGHT - 16
const HORIZONTAL_INSET = 12
const BOTTOM_GAP = 12
const ARTWORK_LEFT_PADDING = 14

const liquidGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

export function NowPlayingBar() {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const isDark = useThemeName().startsWith('dark')
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const isPlaying = useCreatorsStore((s) => s.isPlaying)
  const isBuffering = useCreatorsStore((s) => s.isBuffering)
  const togglePlay = useCreatorsStore((s) => s.togglePlay)
  const stop = useCreatorsStore((s) => s.stop)

  if (!nowPlaying) return null

  // Don't double-up with the full-screen player: if the user is on the
  // detail page of the currently-playing item, hide the mini-bar.
  if (pathname?.endsWith(`/episode/${nowPlaying.itemId}`)) return null

  const accessibilityLabel = t('creators.openPlayer', { title: nowPlaying.title })

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + BOTTOM_GAP,
        paddingHorizontal: HORIZONTAL_INSET,
        zIndex: 100,
      }}
    >
      <GlassPill isDark={isDark}>
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
          style={{
            paddingHorizontal: 6,
            paddingVertical: 6,
            width: 38,
            alignItems: 'center',
          }}
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
      </GlassPill>
    </View>
  )
}

function GlassPill({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  const shared = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: PILL_HEIGHT,
    borderRadius: PILL_RADIUS,
    overflow: 'hidden' as const,
  }
  if (liquidGlassAvailable) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        colorScheme={isDark ? 'dark' : 'light'}
        style={shared}
      >
        {children}
      </GlassView>
    )
  }
  // expo-blur on Android falls back to a semi-transparent overlay (no real
  // blur). Acceptable for a single floating pill.
  return (
    <BlurView
      tint={isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
      intensity={80}
      style={shared}
    >
      {children}
    </BlurView>
  )
}
