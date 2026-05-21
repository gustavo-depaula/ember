import { useQuery } from '@tanstack/react-query'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getCustodyNative } from '../native'

export function SyncStatusBanner() {
  const native = getCustodyNative()
  const { data: status, refetch } = useQuery({
    queryKey: ['custody', 'auth-status'],
    queryFn: () => native.getAuthorizationStatus(),
    enabled: native.isSupported(),
    refetchOnWindowFocus: true,
  })

  if (!native.isSupported()) return null
  if (status !== 'denied') return null

  return (
    <YStack
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="#EF4444"
      backgroundColor="$backgroundSurface"
      gap="$xs"
    >
      <Text fontFamily="$heading" fontSize="$2" color="#EF4444">
        Custody enforcement disabled
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$color">
        Screen Time access was revoked. Bound commitments are running as Firm until you re-enable
        Ember in Settings → Screen Time.
      </Text>
      <Pressable
        onPress={async () => {
          await native.openSettings()
          await refetch()
        }}
      >
        <Text fontFamily="$body" fontSize="$2" color="$accent">
          Open Settings
        </Text>
      </Pressable>
    </YStack>
  )
}
