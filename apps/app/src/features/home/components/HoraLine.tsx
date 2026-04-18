import { useTranslation } from 'react-i18next'
import { Text, XStack } from 'tamagui'

import { useCurrentHour } from '@/hooks/useCurrentHour'

export type Hora = 'matins' | 'lauds' | 'prime' | 'terce' | 'sext' | 'none' | 'vespers' | 'compline'

export function getCurrentHora(hour: number): Hora {
  if (hour < 5) return 'matins'
  if (hour < 8) return 'lauds'
  if (hour < 9) return 'prime'
  if (hour < 12) return 'terce'
  if (hour < 15) return 'sext'
  if (hour < 17) return 'none'
  if (hour < 20) return 'vespers'
  return 'compline'
}

export function HoraLine() {
  const { t } = useTranslation()
  const hora = getCurrentHora(useCurrentHour())

  return (
    <XStack justifyContent="center" paddingVertical="$xs">
      <Text fontFamily="$script" fontSize="$3" color="$colorSecondary" fontStyle="italic">
        {t(`home.hora.${hora}`)}
      </Text>
    </XStack>
  )
}
