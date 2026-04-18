import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'

export default function NocturneScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {t('nocturne.title')}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                {t('nocturne.subtitle')}
              </Text>
            </YStack>
          </XStack>

          <PrayerCard heading={t('nocturne.latinHeading')} body={t('nocturne.latinBody')} />
          <PrayerCard
            heading={t('nocturne.translationHeading')}
            body={t('nocturne.translationBody')}
          />
          <PrayerCard heading={t('nocturne.blessingHeading')} body={t('nocturne.blessingBody')} />
        </YStack>
      </ScrollView>
    </ScreenLayout>
  )
}

function PrayerCard({ heading, body }: { heading: string; body: string }) {
  return (
    <YStack
      gap="$sm"
      padding="$md"
      borderRadius="$md"
      borderLeftWidth={3}
      borderLeftColor="$accent"
      backgroundColor="$backgroundSurface"
    >
      <Text
        fontFamily="$heading"
        fontSize="$1"
        color="$accent"
        letterSpacing={1.5}
        textTransform="uppercase"
      >
        {heading}
      </Text>
      <Text fontFamily="$script" fontSize="$3" color="$color" lineHeight={26}>
        {body}
      </Text>
    </YStack>
  )
}
