import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import type { PracticeManifest } from '@/content/types'
import { localizeContent } from '@/lib/i18n'

import { AnimatedPressable } from './AnimatedPressable'

export function PrayButton({ practiceId }: { practiceId: string }) {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <AnimatedPressable onPress={() => router.push(`/pray/${practiceId}` as any)}>
      <YStack
        backgroundColor="$accent"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$accentSubtle"
        paddingVertical="$sm"
        alignItems="center"
      >
        <Text fontFamily="$heading" fontSize="$3" color="$background">
          {t('practice.pray')}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

export function FlowButtons({
  practiceId,
  flows,
}: {
  practiceId: string
  flows: PracticeManifest['flows']
}) {
  const router = useRouter()

  if (!flows?.length) return null

  return (
    <>
      {flows.map((flow) => (
        <AnimatedPressable
          key={flow.id}
          onPress={() => router.push(`/pray/${practiceId}?flow=${flow.id}` as any)}
        >
          <XStack
            backgroundColor="$accent"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$accentSubtle"
            paddingVertical="$sm"
            paddingHorizontal="$md"
            justifyContent="center"
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$2" color="$background">
              {localizeContent(flow.name)}
            </Text>
          </XStack>
        </AnimatedPressable>
      ))}
    </>
  )
}
