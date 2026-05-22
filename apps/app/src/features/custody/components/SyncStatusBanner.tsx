import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { getCustodyNative } from '../native'

export function SyncStatusBanner() {
  const { t } = useTranslation()
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
      borderColor="$colorDestructive"
      backgroundColor="$backgroundSurface"
      gap="$xs"
    >
      <Text fontFamily="$heading" fontSize="$2" color="$colorDestructive">
        {t('custody.banner.title')}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$color">
        {t('custody.banner.body')}
      </Text>
      <Pressable
        onPress={async () => {
          await native.openSettings()
          await refetch()
        }}
      >
        <Text fontFamily="$body" fontSize="$2" color="$accent">
          {t('custody.banner.openSettings')}
        </Text>
      </Pressable>
    </YStack>
  )
}
