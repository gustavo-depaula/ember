import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, View, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { PrayDwell } from '@/features/custody/components/PrayDwell'
import { useCommitment, useRecordEvent } from '@/features/custody/hooks'
import { getCustodyNative } from '@/features/custody/native'
import { pickShieldMessage } from '@/features/custody/shieldMessages'

// Screen entered when the user actively wants to OVERRIDE the commitment.
// Visual tone is weightier than shield-pray — destructive-tinted button,
// explicit warn text. Deep variant gates the override behind a 30s dwell.
export default function PrayToDisableScreen() {
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: commitment } = useCommitment(commitmentId)
  const recordEvent = useRecordEvent()

  if (!commitmentId) return null
  const message = pickShieldMessage(commitmentId)

  const confirm = async () => {
    await getCustodyNative().liftFrictionLock(commitmentId, 'prayer')
    await recordEvent.mutateAsync({
      commitmentId,
      type: 'overrode',
      metadata: { via: 'prayer' },
    })
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
          eyebrow={t('custody.shield.override.eyebrow')}
          commitmentName={commitment?.name}
          confirmLabel={t('custody.shield.override.confirm')}
          buttonTone="destructive"
          onConfirm={confirm}
        />
        <View paddingHorizontal="$lg" paddingBottom="$lg">
          <Text fontFamily="$body" fontSize="$2" color="$colorDestructive" textAlign="center">
            {t('custody.shield.override.warn')}
          </Text>
        </View>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <YStack alignItems="center" gap="$xl" paddingVertical="$xl">
        <Text
          fontFamily="$body"
          fontSize="$1"
          color="$colorDestructive"
          letterSpacing={2}
          textAlign="center"
        >
          {t('custody.shield.override.eyebrow')}
        </Text>
        {commitment && (
          <Text fontFamily="$heading" fontSize="$5" color="$color" textAlign="center">
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
        <Text fontFamily="$body" fontSize="$2" color="$colorDestructive" textAlign="center">
          {t('custody.shield.override.warn')}
        </Text>
        <Pressable onPress={confirm} accessibilityRole="button">
          <YStack
            padding="$md"
            borderRadius="$md"
            backgroundColor="$colorDestructive"
            minWidth={220}
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$3" color="#0E0D0C">
              {t('custody.shield.override.confirm')}
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
