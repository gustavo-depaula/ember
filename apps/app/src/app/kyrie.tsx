import { useRouter } from 'expo-router'
import { RotateCcw, X } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { lightTap, successBuzz } from '@/lib/haptics'

const targets = [33, 50, 100, 150] as const
type Target = (typeof targets)[number]

export default function KyrieScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [target, setTarget] = useState<Target>(33)
  const [count, setCount] = useState(0)
  const pulse = useSharedValue(1)
  const completedRef = useRef(false)

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  function onTap() {
    lightTap()
    pulse.value = withSequence(withTiming(1.08, { duration: 90 }), withTiming(1, { duration: 180 }))
    setCount((c) => {
      const next = c + 1
      if (next >= target && !completedRef.current) {
        completedRef.current = true
        successBuzz()
      }
      return next
    })
  }

  function onReset() {
    lightTap()
    completedRef.current = false
    setCount(0)
  }

  function onPickTarget(next: Target) {
    lightTap()
    completedRef.current = false
    setTarget(next)
    setCount(0)
  }

  function close() {
    router.back()
  }

  const progress = Math.min(count / target, 1)
  const complete = count >= target

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
          {t('kyrie.title')}
        </Text>
        <Pressable
          onPress={onReset}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('kyrie.reset')}
        >
          <RotateCcw size={20} color="rgba(245,240,224,0.5)" />
        </Pressable>
      </XStack>

      <YStack flex={1} alignItems="center" justifyContent="center" gap="$xl">
        <Text
          fontFamily="$script"
          fontSize={'$5' as any}
          color="rgba(245,240,224,0.7)"
          fontStyle="italic"
          textAlign="center"
          paddingHorizontal="$lg"
        >
          {t('kyrie.invocation')}
        </Text>

        <Pressable onPress={onTap} accessibilityRole="button" accessibilityLabel={t('kyrie.tap')}>
          <Animated.View style={ringStyle}>
            <YStack
              width={240}
              height={240}
              borderRadius={120}
              borderWidth={2}
              borderColor={complete ? 'rgba(245,210,138,0.9)' : 'rgba(245,210,138,0.35)'}
              backgroundColor={complete ? 'rgba(245,210,138,0.12)' : 'rgba(245,210,138,0.04)'}
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontFamily="$display"
                fontSize={'$9' as any}
                color="rgba(245,240,224,0.95)"
                letterSpacing={2}
              >
                {count}
              </Text>
              <Text
                fontFamily="$body"
                fontSize="$2"
                color="rgba(245,240,224,0.45)"
                fontStyle="italic"
                marginTop="$xs"
              >
                {t('kyrie.of', { target })}
              </Text>
            </YStack>
          </Animated.View>
        </Pressable>

        <YStack
          width={240}
          height={3}
          borderRadius={2}
          backgroundColor="rgba(245,210,138,0.15)"
          overflow="hidden"
        >
          <YStack
            height={3}
            width={`${progress * 100}%`}
            backgroundColor="rgba(245,210,138,0.85)"
          />
        </YStack>
      </YStack>

      <YStack gap="$sm" paddingBottom="$md">
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="rgba(245,240,224,0.4)"
          textAlign="center"
          fontStyle="italic"
        >
          {t('kyrie.chooseRope')}
        </Text>
        <XStack flexWrap="wrap" gap="$sm" justifyContent="center">
          {targets.map((n) => {
            const selected = target === n
            return (
              <AnimatedPressable key={n} onPress={() => onPickTarget(n)}>
                <YStack
                  paddingHorizontal="$md"
                  paddingVertical="$sm"
                  borderRadius={999}
                  borderWidth={1}
                  borderColor={selected ? 'rgba(245,210,138,0.85)' : 'rgba(245,210,138,0.25)'}
                  backgroundColor={selected ? 'rgba(245,210,138,0.16)' : 'transparent'}
                  minWidth={58}
                  alignItems="center"
                >
                  <Text
                    fontFamily="$heading"
                    fontSize="$3"
                    color={selected ? 'rgba(245,240,224,0.95)' : 'rgba(245,240,224,0.6)'}
                  >
                    {n}
                  </Text>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </XStack>
      </YStack>
    </YStack>
  )
}
