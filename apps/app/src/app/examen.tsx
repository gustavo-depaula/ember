import { useRouter } from 'expo-router'
import { ChevronRight, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { lightTap, successBuzz } from '@/lib/haptics'

const phases = ['praesentia', 'gratia', 'affectus', 'peccatum', 'propositum', 'closing'] as const

type Phase = (typeof phases)[number]

export default function ExamenScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [index, setIndex] = useState(0)
  const phase: Phase = phases[index]
  const isClosing = phase === 'closing'

  const opacity = useSharedValue(1)
  const promptStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  // biome-ignore lint/correctness/useExhaustiveDependencies: opacity is a stable shared ref
  useEffect(() => {
    opacity.value = 0
    opacity.value = withTiming(1, { duration: 450 })
  }, [index])

  function advance() {
    lightTap()
    if (index < phases.length - 1) {
      opacity.value = withTiming(0, { duration: 220 }, (finished) => {
        'worklet'
        if (finished) opacity.value = 0
      })
      setTimeout(() => setIndex((i) => i + 1), 220)
      return
    }
    successBuzz()
    router.back()
  }

  function close() {
    router.back()
  }

  return (
    <YStack
      flex={1}
      backgroundColor="#0b0906"
      paddingTop={insets.top + 12}
      paddingBottom={insets.bottom + 24}
      paddingHorizontal="$lg"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Pressable
          onPress={close}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <X size={22} color="rgba(245,240,224,0.5)" />
        </Pressable>
        <Text fontFamily="$display" fontSize="$5" color="rgba(245,240,224,0.85)" letterSpacing={1}>
          {t('examen.title')}
        </Text>
        <YStack width={22} />
      </XStack>

      <YStack flex={1} alignItems="center" justifyContent="center" gap="$xl">
        <Animated.View style={promptStyle}>
          <YStack gap="$xl" alignItems="center">
            <Text
              fontFamily="$heading"
              fontSize="$5"
              color="rgba(245,240,224,0.95)"
              letterSpacing={2}
              textAlign="center"
            >
              {t(`examen.phases.${phase}.title`)}
            </Text>

            <Text
              fontFamily="$body"
              fontSize="$3"
              color="rgba(245,240,224,0.8)"
              textAlign="center"
              paddingHorizontal="$lg"
              lineHeight={28}
            >
              {t(`examen.phases.${phase}.prompt`)}
            </Text>

            {isClosing && (
              <Pressable
                onPress={() => {
                  lightTap()
                  router.replace('/confessio')
                }}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel={t('confessio.examenPrompt')}
              >
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color="rgba(245,210,138,0.85)"
                  fontStyle="italic"
                  textAlign="center"
                  paddingHorizontal="$lg"
                >
                  {t('confessio.examenPrompt')}
                </Text>
              </Pressable>
            )}
          </YStack>
        </Animated.View>

        <XStack gap={8} justifyContent="center" paddingTop="$md">
          {phases.slice(0, 5).map((p, i) => {
            const past = i < Math.min(index, 5)
            const current = i === index && index < 5
            const dotOpacity = past ? 0.85 : current ? 0.55 : 0.15
            return (
              <YStack
                key={p}
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={`rgba(245,210,138,${dotOpacity})`}
              />
            )
          })}
        </XStack>
      </YStack>

      <AnimatedPressable
        onPress={advance}
        accessibilityRole="button"
        accessibilityLabel={isClosing ? t('examen.finish') : t('examen.continue')}
      >
        <XStack
          alignItems="center"
          justifyContent="center"
          gap="$sm"
          paddingVertical="$md"
          paddingHorizontal="$lg"
          borderRadius={999}
          borderWidth={1}
          borderColor="rgba(245,210,138,0.4)"
          backgroundColor="rgba(245,210,138,0.08)"
        >
          <Text
            fontFamily="$heading"
            fontSize="$3"
            color="rgba(245,240,224,0.95)"
            letterSpacing={1}
          >
            {isClosing ? t('examen.finish') : t('examen.continue')}
          </Text>
          {!isClosing && <ChevronRight size={18} color="rgba(245,240,224,0.75)" />}
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}
