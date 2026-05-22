import { useLocalSearchParams, useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack } from 'tamagui'

import { confirm } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'
import { useDeleteCommitment } from '@/features/custody/hooks'
import { cancelAllCustodyNotifications } from '@/features/custody/notifications'

// Edit mode wraps the editor + a top-right Delete pill. No ScreenLayout —
// we want the editor's background and radial wash to bleed behind the
// status bar, so we manage the safe area locally.
export default function CommitmentScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const del = useDeleteCommitment()

  if (!commitmentId) return null

  const onDelete = async () => {
    const ok = await confirm({
      title: t('custody.deleteConfirm.title'),
      description: t('custody.deleteConfirm.body'),
      confirmLabel: t('custody.deleteConfirm.confirm'),
      destructive: true,
    })
    if (!ok) return
    // Delete cascades to commitment_events via FK; unwireBoundEnforcement
    // runs inside useDeleteCommitment so the shield gets pulled too.
    await del.mutateAsync(commitmentId)
    await cancelAllCustodyNotifications()
    router.back()
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <CommitmentEditor mode={{ kind: 'edit', commitmentId }} />
      <View position="absolute" right={16} top={insets.top + 8} zIndex={30}>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel={t('custody.deleteConfirm.confirm')}
          hitSlop={8}
        >
          <XStack
            alignItems="center"
            gap={8}
            paddingHorizontal={16}
            paddingVertical={10}
            borderRadius={999}
            backgroundColor="$colorDestructive"
          >
            <Trash2 size={18} color="white" />
            <Text fontFamily="$heading" fontSize="$2" color="white">
              {t('custody.deleteConfirm.confirm')}
            </Text>
          </XStack>
        </Pressable>
      </View>
    </YStack>
  )
}
