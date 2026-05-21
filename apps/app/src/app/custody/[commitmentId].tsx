import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'
import {
  useArchiveCommitment,
  useCommitment,
  useDeleteCommitment,
  useRecordEvent,
} from '@/features/custody/hooks'
import { cancelAllCustodyNotifications } from '@/features/custody/notifications'
import { successBuzz } from '@/lib/haptics'

export default function CommitmentScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const { data: commitment } = useCommitment(commitmentId)
  const archive = useArchiveCommitment()
  const del = useDeleteCommitment()
  const recordEvent = useRecordEvent()

  if (!commitmentId) return null

  return (
    <ScreenLayout>
      <PageHeader title={t('custody.commitments.edit')} />

      {commitment && (
        <XStack gap="$xs" paddingHorizontal="$md" paddingVertical="$sm">
          <Pressable
            onPress={async () => {
              successBuzz()
              await recordEvent.mutateAsync({ commitmentId, type: 'kept' })
            }}
            style={{ flex: 1 }}
          >
            <YStack
              padding="$sm"
              borderRadius="$md"
              backgroundColor="$accentSubtle"
              alignItems="center"
            >
              <Text fontFamily="$body" fontSize="$2" color="$accent">
                Kept
              </Text>
            </YStack>
          </Pressable>
          <Pressable
            onPress={async () => {
              await recordEvent.mutateAsync({ commitmentId, type: 'fell' })
            }}
            style={{ flex: 1 }}
          >
            <YStack
              padding="$sm"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$colorSecondary"
              alignItems="center"
            >
              <Text fontFamily="$body" fontSize="$2" color="$color">
                Fell
              </Text>
            </YStack>
          </Pressable>
        </XStack>
      )}

      <CommitmentEditor mode={{ kind: 'edit', commitmentId }} />

      <YStack gap="$xs" paddingHorizontal="$md" paddingVertical="$lg">
        <Pressable
          onPress={async () => {
            await archive.mutateAsync(commitmentId)
            await cancelAllCustodyNotifications()
            router.back()
          }}
        >
          <YStack padding="$sm" alignItems="center">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
              Archive
            </Text>
          </YStack>
        </Pressable>
        <Pressable
          onPress={async () => {
            await del.mutateAsync(commitmentId)
            router.back()
          }}
        >
          <YStack padding="$sm" alignItems="center">
            <Text fontFamily="$body" fontSize="$2" color="#EF4444">
              Delete
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
