import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'

import { useIsMementoEvening } from '@/features/memento'

export function MementoLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const evening = useIsMementoEvening()

  if (!evening) return null

  return (
    <Pressable
      onPress={() => router.push('/memento')}
      hitSlop={6}
      accessibilityRole="link"
      accessibilityLabel={t('memento.title')}
    >
      <Text
        fontFamily="$script"
        fontSize="$2"
        color="$colorSecondary"
        fontStyle="italic"
        opacity={0.75}
        textAlign="center"
        paddingVertical="$xs"
      >
        {t('memento.homeLine')}
      </Text>
    </Pressable>
  )
}
