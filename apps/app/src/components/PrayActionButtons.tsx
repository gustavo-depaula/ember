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
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/pray/[practiceId]', params: { practiceId } })}
      accessibilityRole="button"
      accessibilityLabel={t('practice.pray')}
    >
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

  const primaryFlows = flows?.filter((f) => !f.group)
  if (!primaryFlows?.length) return null

  return (
    <>
      {primaryFlows.map((flow) => (
        <AnimatedPressable
          key={flow.id}
          onPress={() =>
            router.push({ pathname: '/pray/[practiceId]', params: { practiceId, flow: flow.id } })
          }
          accessibilityRole="button"
          accessibilityLabel={localizeContent(flow.name)}
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
