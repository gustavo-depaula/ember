import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getCustodyNative } from '../native'

export function AuthorizationGuard({
  children,
  onRequest,
}: {
  children: ReactNode
  onRequest?: () => void
}) {
  const native = getCustodyNative()
  const {
    data: status,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ['custody', 'auth-status'],
    queryFn: () => native.getAuthorizationStatus(),
  })

  if (!native.isSupported()) {
    return (
      <YStack
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
      >
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          Bound mode is iOS-only in v1.
        </Text>
      </YStack>
    )
  }

  if (isPending) return null

  if (status === 'approved') return <>{children}</>

  if (status === 'denied') {
    return (
      <YStack
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$accent"
        gap="$xs"
        backgroundColor="$accentSubtle"
      >
        <Text fontFamily="$heading" fontSize="$2" color="$accent">
          Screen Time access denied
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$color">
          Custody enforcement is disabled. Open Settings → Screen Time and allow Ember to re-enable
          bound mode.
        </Text>
        <Pressable
          onPress={async () => {
            await native.openSettings()
          }}
        >
          <Text fontFamily="$body" fontSize="$2" color="$accent">
            Open Settings
          </Text>
        </Pressable>
      </YStack>
    )
  }

  // notDetermined / unsupported
  return (
    <YStack padding="$md" borderRadius="$md" borderWidth={1} borderColor="$accent" gap="$xs">
      <Text fontFamily="$body" fontSize="$2" color="$color">
        To enforce bound commitments, Ember needs Screen Time access. We never see which apps you
        pick — selections are opaque on iOS.
      </Text>
      <Pressable
        onPress={async () => {
          await native.requestAuthorization()
          await refetch()
          onRequest?.()
        }}
      >
        <YStack padding="$sm" backgroundColor="$accent" borderRadius="$md" alignItems="center">
          <Text fontFamily="$heading" fontSize="$2" color="white">
            Grant Screen Time access
          </Text>
        </YStack>
      </Pressable>
    </YStack>
  )
}
