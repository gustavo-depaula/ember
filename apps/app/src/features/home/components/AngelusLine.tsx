import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text } from 'tamagui'

import { useEventStore } from '@/db/events'
import { currentAngelusSlot } from '@/features/angelus'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'

export function AngelusLine({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { season } = useLiturgicalTheme()
  const slot = currentAngelusSlot(date)
  const dateKey = format(date, 'yyyy-MM-dd')
  const prayed = useEventStore((s) => (slot ? s.angelusPrayed.has(`${dateKey}:${slot}`) : false))

  if (!slot) return null
  if (prayed) return null

  const eastertide = season === 'easter'
  const label = eastertide ? t('angelus.reginaCaeliBell') : t('angelus.bell')

  return (
    <Pressable
      onPress={() => router.push('/angelus')}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel={t('angelus.title')}
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
        {label}
      </Text>
    </Pressable>
  )
}
