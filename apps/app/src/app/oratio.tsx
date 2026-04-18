import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { CandleFlame } from '@/components/CandleFlame'
import { lightTap, successBuzz } from '@/lib/haptics'

type Phase = 'setup' | 'running' | 'done'

const durationMinutes = [5, 10, 15, 20, 30, 45, 60] as const

function formatRemaining(seconds: number): string {
  const clamped = Math.max(0, seconds)
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function OratioScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [phase, setPhase] = useState<Phase>('setup')
  const [minutes, setMinutes] = useState<number>(20)
  const [remaining, setRemaining] = useState<number>(20 * 60)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function begin(mins: number) {
    lightTap()
    setMinutes(mins)
    setRemaining(mins * 60)
    setPhase('running')
    const endAt = Date.now() + mins * 60_000
    intervalRef.current = setInterval(() => {
      const secondsLeft = Math.round((endAt - Date.now()) / 1000)
      if (secondsLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setRemaining(0)
        setPhase('done')
        successBuzz()
        return
      }
      setRemaining(secondsLeft)
    }, 250)
  }

  function amen() {
    lightTap()
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPhase('done')
  }

  function close() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    router.back()
  }

  const flameMode = phase === 'done' ? 'fading' : phase === 'setup' ? 'dim' : 'alive'

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
          accessibilityLabel={t('oratio.close')}
        >
          <X size={22} color="rgba(245,240,224,0.5)" />
        </Pressable>
        <Text
          fontFamily="$display"
          fontSize={'$5' as any}
          color="rgba(245,240,224,0.85)"
          letterSpacing={1}
        >
          {t('oratio.title')}
        </Text>
        <YStack width={22} />
      </XStack>

      <YStack flex={1} alignItems="center" justifyContent="center" gap="$xl">
        <CandleFlame size={140} mode={flameMode} />

        {phase === 'running' && (
          <YStack alignItems="center" gap="$sm">
            <Text
              fontFamily="$script"
              fontSize={'$6' as any}
              color="rgba(245,240,224,0.92)"
              letterSpacing={2}
            >
              {formatRemaining(remaining)}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$1"
              color="rgba(245,240,224,0.45)"
              fontStyle="italic"
              textAlign="center"
              paddingHorizontal="$lg"
            >
              {t('oratio.presence')}
            </Text>
          </YStack>
        )}

        {phase === 'done' && (
          <YStack alignItems="center" gap="$sm">
            <Text
              fontFamily="$display"
              fontSize={'$6' as any}
              color="rgba(245,240,224,0.9)"
              letterSpacing={2}
            >
              {t('oratio.amenHeading')}
            </Text>
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="rgba(245,240,224,0.5)"
              fontStyle="italic"
              textAlign="center"
              paddingHorizontal="$lg"
            >
              {t('oratio.completeMessage', { minutes })}
            </Text>
          </YStack>
        )}
      </YStack>

      {phase === 'setup' && (
        <YStack gap="$md" paddingBottom="$lg">
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="rgba(245,240,224,0.55)"
            textAlign="center"
            fontStyle="italic"
            paddingHorizontal="$md"
          >
            {t('oratio.invitation')}
          </Text>
          <XStack flexWrap="wrap" gap="$sm" justifyContent="center">
            {durationMinutes.map((m) => (
              <AnimatedPressable key={m} onPress={() => begin(m)}>
                <YStack
                  paddingHorizontal="$md"
                  paddingVertical="$sm"
                  borderRadius={999}
                  borderWidth={1}
                  borderColor="rgba(245,210,138,0.35)"
                  minWidth={66}
                  alignItems="center"
                >
                  <Text fontFamily="$heading" fontSize="$3" color="rgba(245,240,224,0.88)">
                    {t('oratio.minutesShort', { count: m })}
                  </Text>
                </YStack>
              </AnimatedPressable>
            ))}
          </XStack>
        </YStack>
      )}

      {phase === 'running' && (
        <AnimatedPressable onPress={amen}>
          <YStack
            paddingVertical="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor="rgba(245,210,138,0.45)"
            alignItems="center"
          >
            <Text
              fontFamily="$heading"
              fontSize="$3"
              color="rgba(245,240,224,0.88)"
              letterSpacing={1}
            >
              {t('oratio.amen')}
            </Text>
          </YStack>
        </AnimatedPressable>
      )}

      {phase === 'done' && (
        <AnimatedPressable onPress={close}>
          <YStack
            paddingVertical="$md"
            borderRadius="$md"
            backgroundColor="rgba(245,210,138,0.92)"
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$3" color="#0b0906" letterSpacing={1}>
              {t('oratio.done')}
            </Text>
          </YStack>
        </AnimatedPressable>
      )}
    </YStack>
  )
}
