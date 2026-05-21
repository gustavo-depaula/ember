import { useLocalSearchParams, useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { confirm, ScreenLayout } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'
import { useArchiveCommitment, useDeleteCommitment } from '@/features/custody/hooks'
import { cancelAllCustodyNotifications } from '@/features/custody/notifications'

export default function CommitmentScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const archive = useArchiveCommitment()
  const del = useDeleteCommitment()

  if (!commitmentId) return null

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete this block?',
      description: 'It will stop enforcing and disappear from your list. Cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!ok) return
    await archive.mutateAsync(commitmentId)
    await del.mutateAsync(commitmentId)
    await cancelAllCustodyNotifications()
    router.back()
  }

  return (
    <ScreenLayout scroll={false} padded={false}>
      <XStack position="absolute" right={16} top={16} zIndex={10} gap="$xs" alignItems="center">
        <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel="Delete">
          <XStack
            alignItems="center"
            gap="$xs"
            paddingHorizontal="$md"
            paddingVertical="$xs"
            borderRadius={999}
            backgroundColor="$backgroundSurface"
          >
            <Trash2 size={14} color={theme.colorSecondary?.val} />
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              Delete
            </Text>
          </XStack>
        </Pressable>
      </XStack>
      <CommitmentEditor mode={{ kind: 'edit', commitmentId }} />
    </ScreenLayout>
  )
}
