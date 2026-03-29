import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { HeaderFlourish } from '@/components'
import { formatLocalized } from '@/lib/i18n/dateLocale'
import { getLiturgicalSeason } from '@/lib/liturgical'

const seasonColors: Record<string, string> = {
  advent: '#5B2C6F',
  christmas: '#C9A84C',
  lent: '#7D3C98',
  easter: '#C9A84C',
  ordinary: '#2D6A4F',
}

export function LiturgicalHeader({ date }: { date: Date }) {
  const { t } = useTranslation()
  const season = getLiturgicalSeason(date)
  const seasonColor = seasonColors[season]

  return (
    <YStack gap="$xs" alignItems="center">
      <HeaderFlourish />

      <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
        {t(`home.liturgicalDay.${season}`)}
      </Text>

      <Text fontFamily="$script" fontSize="$4" color="$colorSecondary">
        {formatLocalized(date, 'MMMM d')}
      </Text>

      <Text fontFamily="$body" fontSize="$1" color={seasonColor}>
        {t(`home.season.${season}`)}
      </Text>
    </YStack>
  )
}
