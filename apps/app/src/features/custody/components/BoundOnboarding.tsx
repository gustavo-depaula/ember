import { useState } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { AuthorizationGuard } from './AuthorizationGuard'

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Custody is your phone helping you keep your word.',
    body: 'You decide what to shield, and you can lift it any time — Custody is ascetical aid, not jail.',
  },
  {
    title: 'Custody is single-user.',
    body: 'No one else controls your apps. There is no guardian, no remote, no shared account.',
  },
  {
    title: 'We never see which apps you pick.',
    body: 'Apple keeps that private. Ember can only ask the system to shield what you select.',
  },
]

export function BoundOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [askedAuth, setAskedAuth] = useState(false)

  if (step < STEPS.length) {
    const current = STEPS[step]
    return (
      <YStack gap="$lg" padding="$lg" alignItems="center">
        <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
          {current.title}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {current.body}
        </Text>
        <XStack gap="$md">
          {step > 0 && (
            <Pressable onPress={() => setStep(step - 1)}>
              <YStack padding="$sm" borderRadius="$md" borderWidth={1} borderColor="$borderColor">
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  Back
                </Text>
              </YStack>
            </Pressable>
          )}
          <Pressable onPress={() => setStep(step + 1)}>
            <YStack padding="$sm" borderRadius="$md" backgroundColor="$accent">
              <Text fontFamily="$body" fontSize="$2" color="white">
                Continue
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
              Screen Time access already granted. You can proceed.
            </Text>
            <Pressable
              onPress={async () => {
                setAskedAuth(true)
                onComplete()
              }}
            >
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                Continue
              </Text>
            </Pressable>
          </YStack>
        </AuthorizationGuard>
      </YStack>
    )
  }

  onComplete()
  return null
}
