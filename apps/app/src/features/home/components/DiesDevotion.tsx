import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'

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

  return (
    <Pressable
      onPress={() => router.push('/dies-domini')}
      accessibilityRole="link"
      accessibilityLabel={t('diesDomini.title')}
      hitSlop={6}
    >
      <Text fontFamily="$body" fontSize="$2" color="$accent" textAlign="center" opacity={0.9}>
        {line}
      </Text>
    </Pressable>
  )
}
