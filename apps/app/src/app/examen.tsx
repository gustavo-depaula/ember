import { useRouter } from 'expo-router'
import { ChevronRight, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
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

  function advance() {
    lightTap()
    if (index < phases.length - 1) {
      setIndex((i) => i + 1)
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
          fontFamily="$script"
          fontSize={'$5' as any}
          color="rgba(245,240,224,0.75)"
          fontStyle="italic"
          textAlign="center"
          paddingHorizontal="$lg"
          lineHeight={32}
        >
          {t(`examen.phases.${phase}.prompt`)}
        </Text>

        <XStack gap={8} justifyContent="center" paddingTop="$md">
          {phases.slice(0, 5).map((p, i) => {
            const past = i < Math.min(index, 5)
            const current = i === index && index < 5
            const opacity = past ? 0.85 : current ? 0.55 : 0.15
            return (
              <YStack
                key={p}
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={`rgba(245,210,138,${opacity})`}
              />
            )
          })}
        </XStack>
      </YStack>

      <AnimatedPressable onPress={advance}>
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
