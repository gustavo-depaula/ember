import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
import { Typography } from '@/components/typography'
import { collectionHref, warmCollection } from '@/features/collections'
import { artFor } from '@/features/explore/artMap'
import { useToday } from '@/hooks/useToday'

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

const collectionIdFor = (day: DayKey) => `collection/dies-${day}`

export default function DiesDominiScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const todayKey = dayKeys[useToday().getDay()]
  const otherDays = dayKeys.filter((key) => key !== todayKey)

  const open = (day: DayKey) => {
    const id = collectionIdFor(day)
    warmCollection(id)
    router.push(collectionHref(id))
  }

  return (
    <ScreenLayout>
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
              {t('diesDomini.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('diesDomini.subtitle')}
            </Text>
          </YStack>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$lg">
            <TodayHero dayKey={todayKey} onPress={() => open(todayKey)} />

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
                  <OtherDayRow
                    key={key}
                    dayKey={key}
                    last={index === otherDays.length - 1}
                    onPress={() => open(key)}
                  />
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </ScreenLayout>
  )
}

function TodayHero({ dayKey, onPress }: { dayKey: DayKey; onPress: () => void }) {
  const { t } = useTranslation()
  const image = artFor(collectionIdFor(dayKey))
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={t(`diesDomini.days.${dayKey}.name`)}
    >
      <YStack borderRadius="$md" overflow="hidden">
        {image && (
          <YStack height={220} backgroundColor="$backgroundSurface">
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
            />
          </YStack>
        )}
        <YStack
          gap="$sm"
          padding="$lg"
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
          <Typography
            variant="marker"
            color="$accent"
            fontSize="$1"
            letterSpacing={2}
            paddingTop="$xs"
          >
            {t('diesDomini.begin')} →
          </Typography>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}

function OtherDayRow({
  dayKey,
  last,
  onPress,
}: {
  dayKey: DayKey
  last: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <YStack gap="$sm">
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={t(`diesDomini.days.${dayKey}.name`)}
      >
        <XStack gap="$md" alignItems="flex-start">
          <YStack flex={1} gap="$sm">
            <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" letterSpacing={1}>
              {t(`diesDomini.days.${dayKey}.name`).toUpperCase()}
            </Text>
            <Text fontFamily="$body" fontSize="$3" color="$color">
              {t(`diesDomini.days.${dayKey}.line`)}
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight="$2">
              {t(`diesDomini.days.${dayKey}.description`)}
            </Text>
          </YStack>
          <YStack paddingTop="$sm">
            <ChevronRight size={18} color={theme.colorSecondary?.val} />
          </YStack>
        </XStack>
      </AnimatedPressable>
      {!last && <SectionDivider />}
    </YStack>
  )
}
