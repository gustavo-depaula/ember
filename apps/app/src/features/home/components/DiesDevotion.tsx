import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

const dayKeys = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export function DiesDevotion({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const key = dayKeys[date.getDay()]
  const line = t(`diesDomini.days.${key}.line`)
  const description = t(`diesDomini.days.${key}.description`)

  return (
    <Pressable
      onPress={() => router.push('/dies-domini')}
      accessibilityRole="link"
      accessibilityLabel={t('diesDomini.title')}
      hitSlop={6}
    >
      <YStack alignItems="center" gap="$sm" paddingHorizontal="$lg">
        <Text
          fontFamily="$heading"
          fontSize="$1"
          color="$accent"
          letterSpacing={2.5}
          textTransform="uppercase"
        >
          {t('diesDomini.title')}
        </Text>
        <Text
          fontFamily="$body"
          fontSize="$3"
          color="$color"
          fontStyle="italic"
          textAlign="center"
          maxWidth={420}
        >
          {line}
        </Text>
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$colorSecondary"
          textAlign="center"
          maxWidth={520}
          numberOfLines={4}
        >
          {description}
        </Text>
      </YStack>
    </Pressable>
  )
}
