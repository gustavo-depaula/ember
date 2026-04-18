import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout, SectionDivider } from '@/components'

const dayKeys = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

type DayKey = (typeof dayKeys)[number]

export default function DiesDominiScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const todayKey = dayKeys[new Date().getDay()]
  const otherDays = dayKeys.filter((key) => key !== todayKey)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color?.val} />
          </Pressable>
          <YStack flex={1}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {t('diesDomini.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('diesDomini.subtitle')}
            </Text>
          </YStack>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$lg">
            <TodayCard dayKey={todayKey} />

            <YStack gap="$xs">
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color="$colorSecondary"
                letterSpacing={1.5}
                textTransform="uppercase"
              >
                {t('diesDomini.restOfWeek')}
              </Text>
              <YStack gap="$md" paddingTop="$sm">
                {otherDays.map((key, index) => (
                  <OtherDayRow key={key} dayKey={key} last={index === otherDays.length - 1} />
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </ScreenLayout>
  )
}

function TodayCard({ dayKey }: { dayKey: DayKey }) {
  const { t } = useTranslation()
  return (
    <YStack
      gap="$sm"
      padding="$lg"
      borderRadius="$md"
      borderLeftWidth={3}
      borderLeftColor="$accent"
      backgroundColor="$backgroundSurface"
    >
      <XStack alignItems="baseline" gap="$sm">
        <Text
          fontFamily="$heading"
          fontSize="$3"
          color="$accent"
          letterSpacing={1.5}
          textTransform="uppercase"
        >
          {t(`diesDomini.days.${dayKey}.name`)}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$accent" fontStyle="italic">
          {t('memoria.today').toLowerCase()}
        </Text>
      </XStack>
      <Text fontFamily="$body" fontSize="$4" color="$color" lineHeight="$5">
        {t(`diesDomini.days.${dayKey}.line`)}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight="$2">
        {t(`diesDomini.days.${dayKey}.description`)}
      </Text>
    </YStack>
  )
}

function OtherDayRow({ dayKey, last }: { dayKey: DayKey; last: boolean }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" letterSpacing={1}>
        {t(`diesDomini.days.${dayKey}.name`).toUpperCase()}
      </Text>
      <Text fontFamily="$body" fontSize="$3" color="$color">
        {t(`diesDomini.days.${dayKey}.line`)}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight="$2">
        {t(`diesDomini.days.${dayKey}.description`)}
      </Text>
      {!last && <SectionDivider />}
    </YStack>
  )
}
