/**
 * Persistent mini-bar mounted at layout level so audio follows the user across
 * every screen. Visibility is driven entirely by `creatorsStore.nowPlaying`.
 */

import { usePathname, useRouter } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId } from '@/content/contentIndex'
import { NOW_PLAYING_BAR_HEIGHT, useCreatorsStore } from '@/stores/creatorsStore'

export function NowPlayingBar() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const isPlaying = useCreatorsStore((s) => s.isPlaying)
  const togglePlay = useCreatorsStore((s) => s.togglePlay)
  const stop = useCreatorsStore((s) => s.stop)

  if (!nowPlaying) return null

  // Don't double-up with the full-screen player: if the user is on the
  // detail page of the currently-playing item, hide the mini-bar.
  if (pathname?.endsWith(`/episode/${nowPlaying.itemId}`)) return null

  // Sibling pressables instead of nested ones — nesting a <button> inside a
  // <button> is invalid HTML and breaks react-dom on web.
  return (
    <XStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      zIndex={100}
      alignItems="center"
      gap="$md"
      paddingHorizontal="$md"
      paddingTop="$md"
      paddingBottom={insets.bottom + 12}
      minHeight={NOW_PLAYING_BAR_HEIGHT + insets.bottom}
      backgroundColor="$backgroundSurface"
      borderTopWidth={1}
      borderTopColor="$borderColor"
    >
      <AnimatedPressable
        style={{ flex: 1 }}
        onPress={() =>
          router.push({
            pathname: '/creators/[creatorId]/episode/[itemId]',
            params: {
              creatorId: bareId(nowPlaying.creatorId),
              itemId: nowPlaying.itemId,
            },
          })
        }
        accessibilityRole="link"
        accessibilityLabel={t('creators.openPlayer', { title: nowPlaying.title })}
      >
        <Text fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={1}>
          {nowPlaying.title}
        </Text>
      </AnimatedPressable>
      <Pressable
        hitSlop={12}
        onPress={() => void togglePlay()}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? t('creators.pause') : t('creators.play')}
      >
        {isPlaying ? (
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
      >
        <X size={22} color={theme.colorSecondary.val} />
      </Pressable>
    </XStack>
  )
}
