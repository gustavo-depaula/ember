import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'
import { useArchiveCommitment, useDeleteCommitment } from '@/features/custody/hooks'
import { cancelAllCustodyNotifications } from '@/features/custody/notifications'

export default function CommitmentScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const archive = useArchiveCommitment()
  const del = useDeleteCommitment()

  if (!commitmentId) return null

  return (
    <ScreenLayout>
      <PageHeader title={t('custody.commitments.edit')} />

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
