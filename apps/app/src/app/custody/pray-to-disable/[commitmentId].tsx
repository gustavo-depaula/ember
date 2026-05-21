import { useLocalSearchParams, useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { useCommitment, useRecordEvent } from '@/features/custody/hooks'
import { getCustodyNative } from '@/features/custody/native'
import { pickShieldMessage } from '@/features/custody/shieldMessages'

export default function PrayToDisableScreen() {
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const router = useRouter()
  const { data: commitment } = useCommitment(commitmentId)
  const recordEvent = useRecordEvent()

  if (!commitmentId) return null
  const message = pickShieldMessage(commitmentId)

  return (
    <ScreenLayout>
      <YStack alignItems="center" gap="$xl" paddingVertical="$xl">
        {commitment && (
          <Text fontFamily="$heading" fontSize="$5" color="$accent" textAlign="center">
            {commitment.name}
          </Text>
        )}
        <YStack gap="$md" paddingHorizontal="$lg" alignItems="center">
          <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
            {message.title}
          </Text>
          <Text fontFamily="$body" fontSize="$3" color="$colorSecondary" textAlign="center">
            {message.body}
          </Text>
        </YStack>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          Pray, then tap below. The shield will lift for the rest of today.
        </Text>
        <Pressable
          onPress={async () => {
            await getCustodyNative().liftFrictionLock(commitmentId, 'prayer')
            await recordEvent.mutateAsync({
              commitmentId,
              type: 'overrode',
              metadata: { via: 'prayer' },
            })
            router.back()
          }}
        >
          <YStack padding="$md" borderRadius="$md" backgroundColor="$accent">
            <Text fontFamily="$heading" fontSize="$3" color="white">
              I have prayed — lift the shield
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
