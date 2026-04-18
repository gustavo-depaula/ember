import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { useComplinePrayed, useMarianAntiphon, usePrayCompline } from '@/features/nocturne'
import { getToday } from '@/hooks/useToday'
import { successBuzz } from '@/lib/haptics'

export default function NocturneScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const antiphon = useMarianAntiphon()
  const dateKey = format(getToday(), 'yyyy-MM-dd')
  const prayedAt = useComplinePrayed(dateKey)
  const pray = usePrayCompline()

  function handlePrayed() {
    if (prayedAt) return
    successBuzz()
    pray.mutate(dateKey)
  }

  return (
    <ScreenLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
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
          <PrayerCard
            heading={t('nocturne.antiphonHeading')}
            body={t(`nocturne.antiphon.${antiphon}`)}
          />
          <PrayerCard heading={t('nocturne.blessingHeading')} body={t('nocturne.blessingBody')} />

          <AnimatedPressable
            onPress={handlePrayed}
            disabled={Boolean(prayedAt)}
            accessibilityRole="button"
            accessibilityLabel={t('nocturne.a11yCommend')}
            accessibilityState={{ disabled: Boolean(prayedAt) }}
          >
            <XStack
              justifyContent="center"
              alignItems="center"
              gap="$sm"
              paddingVertical="$md"
              paddingHorizontal="$lg"
              borderRadius="$md"
              borderWidth={1}
              borderColor={prayedAt ? '$borderColor' : '$accent'}
              backgroundColor={prayedAt ? 'transparent' : '$accent'}
            >
              {prayedAt ? <Check size={16} color={theme.colorSecondary?.val} /> : undefined}
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color={prayedAt ? '$colorSecondary' : '$backgroundSurface'}
                letterSpacing={1}
              >
                {prayedAt ? t('nocturne.commended') : t('nocturne.commendDay')}
              </Text>
            </XStack>
          </AnimatedPressable>
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
      <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight={26}>
        {body}
      </Text>
    </YStack>
  )
}
