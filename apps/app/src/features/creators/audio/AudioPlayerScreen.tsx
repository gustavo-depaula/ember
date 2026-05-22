import { Image } from 'expo-image'
import { ChevronDown, ExternalLink, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { openExternalUrl } from '@/config/links'
import { useCreatorsStore } from '@/stores/creatorsStore'
import { RichDescription } from '../components/RichDescription'

const SPEEDS = [0.8, 1.0, 1.25, 1.5, 2.0] as const

function formatTime(s: number): string {
  const total = Math.max(0, Math.round(s))
  const mins = Math.floor(total / 60)
  const secs = (total % 60).toString().padStart(2, '0')
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const m = (mins % 60).toString().padStart(2, '0')
    return `${hours}:${m}:${secs}`
  }
  return `${mins}:${secs}`
}

export function AudioPlayerScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)
  const isPlaying = useCreatorsStore((s) => s.isPlaying)
  const positionS = useCreatorsStore((s) => s.positionS)
  const speed = useCreatorsStore((s) => s.speed)
  const togglePlay = useCreatorsStore((s) => s.togglePlay)
  const seek = useCreatorsStore((s) => s.seek)
  const setSpeed = useCreatorsStore((s) => s.setSpeed)

  if (!nowPlaying) {
    return (
      <ScreenLayout>
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            {t('creators.nothingPlaying')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const dur = nowPlaying.durationS ?? 0

  function cycleSpeed() {
    const idx = Math.max(0, SPEEDS.indexOf(speed as (typeof SPEEDS)[number]))
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    void setSpeed(next)
  }

  const hasDescription = !!nowPlaying.summary?.trim()
  const artworkSize = hasDescription ? 180 : 240

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$md" paddingVertical="$lg">
        <Pressable
          onPress={onBack}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={t('creators.back')}
        >
          <ChevronDown size={28} color={theme.accent.val} />
        </Pressable>

        <YStack alignItems="center" gap="$md">
          <YStack
            width={artworkSize}
            height={artworkSize}
            backgroundColor="$accentSubtle"
            borderRadius="$lg"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {nowPlaying.imageUri ? (
              <Image
                source={{ uri: nowPlaying.imageUri }}
                style={{ width: artworkSize, height: artworkSize }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                accessibilityLabel={nowPlaying.title}
              />
            ) : (
              <Play size={Math.round(artworkSize / 3)} color={theme.accent.val} />
            )}
          </YStack>
          <Text
            fontFamily="$heading"
            fontSize="$4"
            color="$color"
            textAlign="center"
            paddingHorizontal="$md"
            numberOfLines={2}
          >
            {nowPlaying.title}
          </Text>
        </YStack>

        <YStack gap="$sm">
          <XStack justifyContent="space-between">
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {formatTime(positionS)}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {dur > 0 ? formatTime(dur) : '–'}
            </Text>
          </XStack>
          <YStack backgroundColor="$borderColor" borderRadius={2} height={3} width="100%">
            <YStack
              backgroundColor="$accent"
              height={3}
              borderRadius={2}
              width={dur > 0 ? `${Math.min(100, (positionS / dur) * 100)}%` : '0%'}
            />
          </YStack>
        </YStack>

        <XStack gap="$lg" alignItems="center" justifyContent="center">
          <Pressable
            onPress={() => void seek(Math.max(0, positionS - 15))}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={t('creators.skipBack')}
          >
            <RotateCcw size={28} color={theme.accent.val} />
          </Pressable>
          <Pressable
            onPress={() => void togglePlay()}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? t('creators.pause') : t('creators.play')}
          >
            {isPlaying ? (
              <Pause size={56} color={theme.accent.val} />
            ) : (
              <Play size={56} color={theme.accent.val} />
            )}
          </Pressable>
          <Pressable
            onPress={() => void seek(positionS + 15)}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel={t('creators.skipForward')}
          >
            <RotateCw size={28} color={theme.accent.val} />
          </Pressable>
        </XStack>

        <XStack gap="$lg" alignItems="center" justifyContent="center">
          <Pressable
            onPress={cycleSpeed}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('creators.speed', { rate: speed })}
          >
            <Text fontFamily="$heading" fontSize="$2" color="$accent">
              {speed.toFixed(speed % 1 === 0 ? 0 : 2)}×
            </Text>
          </Pressable>
          {nowPlaying.webUrl && (
            <AnimatedPressable
              onPress={() => openExternalUrl(nowPlaying.webUrl)}
              accessibilityRole="link"
              accessibilityLabel={t('creators.openOriginal')}
            >
              <XStack gap="$xs" alignItems="center">
                <ExternalLink size={14} color={theme.accent.val} />
                <Text fontFamily="$heading" fontSize="$1" color="$accent">
                  {t('creators.openOriginal')}
                </Text>
              </XStack>
            </AnimatedPressable>
          )}
        </XStack>

        {hasDescription && (
          <YStack flex={1} gap="$sm" marginTop="$sm">
            <Text
              fontFamily="$heading"
              fontSize="$1"
              color="$accent"
              letterSpacing={2}
              textTransform="uppercase"
              paddingHorizontal="$md"
            >
              {t('creators.description')}
            </Text>
            <YStack flex={1}>
              <RichDescription html={nowPlaying.summary ?? ''} />
            </YStack>
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}
