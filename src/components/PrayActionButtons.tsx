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

export function HourButtons({
  practiceId,
  hours,
}: {
  practiceId: string
  hours: PracticeManifest['hours']
}) {
  const { t } = useTranslation()
  const router = useRouter()

  if (!hours?.length) return null

  return (
    <>
      {hours.map((hour) => (
        <AnimatedPressable
          key={hour.id}
          onPress={() => router.push(`/pray/${practiceId}?hour=${hour.id}` as any)}
        >
          <XStack
            backgroundColor="$accent"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$accentSubtle"
            paddingVertical="$sm"
            paddingHorizontal="$md"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$2" color="$background">
              {localizeContent(hour.name)}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$background" opacity={0.8}>
              {t(`timeBlock.${hour.timeBlock}`)}
            </Text>
          </XStack>
        </AnimatedPressable>
      ))}
    </>
  )
}
