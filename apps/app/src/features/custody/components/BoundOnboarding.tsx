import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { AuthorizationGuard } from './AuthorizationGuard'

const STEP_KEYS = ['intro', 'singleUser', 'privacy'] as const

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <XStack gap="$xs" justifyContent="center" paddingBottom="$sm">
      {Array.from({ length: total }).map((_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length progress ladder
          key={i}
          width={i === step ? 24 : 8}
          height={8}
          borderRadius={4}
          backgroundColor={i <= step ? '$accent' : '$borderColor'}
        />
      ))}
    </XStack>
  )
}

export function BoundOnboarding({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [askedAuth, setAskedAuth] = useState(false)
  const completedRef = useRef(false)

  const done = step >= STEP_KEYS.length && askedAuth
  useEffect(() => {
    if (done && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  }, [done, onComplete])

  if (step < STEP_KEYS.length) {
    const key = STEP_KEYS[step]
    return (
      <YStack gap="$lg" padding="$lg" alignItems="center">
        <ProgressDots step={step} total={STEP_KEYS.length} />
        <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
          {t(`custody.onboarding.steps.${key}.title`)}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {t(`custody.onboarding.steps.${key}.body`)}
        </Text>
        <XStack gap="$md">
          {step > 0 && (
            <Pressable onPress={() => setStep(step - 1)}>
              <YStack padding="$sm" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  {t('custody.onboarding.back')}
                </Text>
              </YStack>
            </Pressable>
          )}
          <Pressable onPress={() => setStep(step + 1)}>
            <YStack padding="$sm" borderRadius="$md" backgroundColor="$accent">
              <Text fontFamily="$body" fontSize="$2" color="white">
                {t('custody.onboarding.continue')}
              </Text>
            </YStack>
          </Pressable>
        </XStack>
      </YStack>
    )
  }

  if (!askedAuth) {
    return (
      <YStack gap="$md" padding="$lg">
        <AuthorizationGuard onRequest={() => setAskedAuth(true)}>
          <YStack>
            <Text fontFamily="$body" fontSize="$2" color="$color">
              {t('custody.onboarding.alreadyGranted')}
            </Text>
            <Pressable onPress={() => setAskedAuth(true)}>
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                {t('custody.onboarding.continue')}
              </Text>
            </Pressable>
          </YStack>
        </AuthorizationGuard>
      </YStack>
    )
  }

  // `done` branch — onComplete fires from the useEffect above exactly once.
  return null
}
