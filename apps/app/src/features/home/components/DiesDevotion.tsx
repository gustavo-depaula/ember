import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { YStack } from 'tamagui'

import { Typography } from '@/components'

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
      <YStack gap="$sm" paddingHorizontal="$lg" paddingVertical="$md">
        <Typography variant="marker" textAlign="left" fontSize="$1" letterSpacing={2.5}>
          {t('diesDomini.title')}
        </Typography>
        <Typography variant="whisper" color="$color" fontSize="$3" maxWidth={420}>
          {line}
        </Typography>
        <Typography variant="whisper" fontSize="$2" maxWidth={520} numberOfLines={4}>
          {description}
        </Typography>
      </YStack>
    </Pressable>
  )
}
