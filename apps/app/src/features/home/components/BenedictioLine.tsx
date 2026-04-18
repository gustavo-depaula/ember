import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'

import { useEventStore } from '@/db/events'
import { useCurrentMealSlot } from '@/features/benedictio'
import { useToday } from '@/hooks/useToday'

export function BenedictioLine() {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const slot = useCurrentMealSlot()
  const dateKey = format(today, 'yyyy-MM-dd')
  const blessed = useEventStore((s) => (slot ? s.mealsBlessed.has(`${dateKey}:${slot}`) : false))

  if (!slot) return null
  if (blessed) return null

  return (
    <Pressable
      onPress={() => router.push('/benedictio')}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel={t('benedictio.title')}
    >
      <Text
        fontFamily="$script"
        fontSize="$3"
        color="$accent"
        fontStyle="italic"
        textAlign="center"
        paddingVertical="$xs"
        opacity={0.85}
      >
        {t(`benedictio.invite.${slot}`)}
      </Text>
    </Pressable>
  )
}
