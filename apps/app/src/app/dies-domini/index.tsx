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

export default function DiesDominiScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const todayKey = dayKeys[new Date().getDay()]

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
          <YStack gap="$md">
            {dayKeys.map((key, index) => (
              <DayCard
                key={key}
                dayKey={key}
                isToday={key === todayKey}
                last={index === dayKeys.length - 1}
              />
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </ScreenLayout>
  )
}

function DayCard({
  dayKey,
  isToday,
  last,
}: {
  dayKey: (typeof dayKeys)[number]
  isToday: boolean
  last: boolean
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$sm">
      <XStack alignItems="baseline" gap="$sm">
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={isToday ? '$accent' : '$colorSecondary'}
          letterSpacing={1}
        >
          {t(`diesDomini.days.${dayKey}.name`).toUpperCase()}
        </Text>
        {isToday && (
          <Text fontFamily="$body" fontSize="$1" color="$accent" fontStyle="italic">
            {t('memoria.today').toLowerCase()}
          </Text>
        )}
      </XStack>
      <Text fontFamily="$script" fontSize={'$5' as any} color="$color" fontStyle="italic">
        {t(`diesDomini.days.${dayKey}.line`)}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight="$2">
        {t(`diesDomini.days.${dayKey}.description`)}
      </Text>
      {!last && <SectionDivider />}
    </YStack>
  )
}
