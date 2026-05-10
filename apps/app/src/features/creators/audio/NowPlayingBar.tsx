/**
 * Persistent mini-bar mounted at layout level so audio follows the user across
 * every screen. Visibility is driven entirely by `creatorsStore.nowPlaying`.
 */

import { useRouter } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { bareId } from '@/content/contentIndex'
import { useCreatorsStore } from '@/stores/creatorsStore'

export function NowPlayingBar() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const isPlaying = useCreatorsStore((s) => s.isPlaying)
  const togglePlay = useCreatorsStore((s) => s.togglePlay)
  const stop = useCreatorsStore((s) => s.stop)

  if (!nowPlaying) return null

  return (
    <YStack
      position="absolute"
      bottom={insets.bottom}
      left={0}
      right={0}
      backgroundColor="$backgroundSurface"
      borderTopWidth={1}
      borderTopColor="$borderColor"
    >
      <AnimatedPressable
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
        <XStack alignItems="center" gap="$md" padding="$md" minHeight={56}>
          <Text flex={1} fontFamily="$heading" fontSize="$2" color="$color" numberOfLines={1}>
            {nowPlaying.title}
          </Text>
          <Pressable
            hitSlop={12}
            onPress={(e) => {
              e.stopPropagation()
              void togglePlay()
            }}
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
            onPress={(e) => {
              e.stopPropagation()
              void stop()
            }}
            accessibilityRole="button"
            accessibilityLabel={t('creators.close')}
          >
            <X size={22} color={theme.colorSecondary.val} />
          </Pressable>
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}
