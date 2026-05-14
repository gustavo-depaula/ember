import { useRouter } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import type { MovementKind } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { MovementCaptureSheet } from './MovementCaptureSheet'
import { MovementList } from './MovementList'

const labels = {
  intention: {
    title: 'intentions.title',
    subtitle: 'intentions.subtitle',
    submit: 'movements.capture.raise',
  },
  thanksgiving: {
    title: 'gratias.title',
    subtitle: 'gratias.subtitle',
    submit: 'movements.capture.offer',
  },
} as const

export function MovementScreen({ kind }: { kind: MovementKind }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const [captureOpen, setCaptureOpen] = useState(false)
  const l = labels[kind]

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.goBack')}
          >
            <ChevronLeft size={24} color={theme.color?.val} />
          </Pressable>
          <YStack flex={1}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {t(l.title)}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t(l.subtitle)}
            </Text>
          </YStack>
          <AnimatedPressable
            onPress={() => {
              lightTap()
              setCaptureOpen(true)
            }}
            accessibilityRole="button"
            accessibilityLabel={t(l.submit)}
          >
            <XStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$sm"
              paddingHorizontal="$md"
              borderRadius="$md"
              backgroundColor="$accent"
            >
              <Plus size={14} color="white" />
              <Text fontFamily="$heading" fontSize="$2" color="white" letterSpacing={0.5}>
                {t('common.add')}
              </Text>
            </XStack>
          </AnimatedPressable>
        </XStack>

        <MovementList kind={kind} onAdd={() => setCaptureOpen(true)} />
      </YStack>
      <MovementCaptureSheet
        kind={kind}
        visible={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </ScreenLayout>
  )
}
