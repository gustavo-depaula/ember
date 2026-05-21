import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { PrayDwell } from '@/features/custody/components/PrayDwell'
import { useCommitment, useRecordEvent } from '@/features/custody/hooks'
import { pickShieldMessage } from '@/features/custody/shieldMessages'

// Screen entered when the user taps "Pray and continue" from the iOS shield
// (i.e. the user kept the commitment). Visual tone is affirming — accent
// gold, "you kept it" eyebrow. The deep variant renders Our Father with a
// 30-second dwell before the button enables.
export default function ShieldPrayScreen() {
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: commitment } = useCommitment(commitmentId)
  const recordEvent = useRecordEvent()

  if (!commitmentId) return null
  const message = pickShieldMessage(commitmentId)

  const confirm = async () => {
    await recordEvent.mutateAsync({ commitmentId, type: 'kept' })
    router.back()
  }

  const isDeep =
    commitment?.friction === 'prayer' &&
    commitment.friction_config?.kind === 'prayer' &&
    commitment.friction_config.depth === 'deep'

  if (isDeep) {
    return (
      <ScreenLayout>
        <PrayDwell
          eyebrow={t('custody.shield.kept.eyebrow')}
          commitmentName={commitment?.name}
          confirmLabel={t('custody.shield.kept.confirm')}
          buttonTone="accent"
          onConfirm={confirm}
        />
      </ScreenLayout>
    )
  }

  // Shallow path — rotating message + single tap.
  return (
    <ScreenLayout>
      <YStack alignItems="center" gap="$xl" paddingVertical="$xl">
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorSecondary"
          letterSpacing={2}
          textAlign="center"
        >
          {t('custody.shield.kept.eyebrow')}
        </Text>
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
        <Pressable onPress={confirm} accessibilityRole="button">
          <YStack
            padding="$md"
            borderRadius="$md"
            backgroundColor="$accent"
            minWidth={220}
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$3" color="#0E0D0C">
              {t('custody.shield.kept.confirm')}
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
