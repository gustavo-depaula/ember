import { useTranslation } from 'react-i18next'
import { Text, View } from 'tamagui'

import type { RankEF, RankOF } from '@/lib/liturgical'
import { rankColors } from '@/lib/liturgical/rank-colors'

export function RankBadge({ rank }: { rank: RankOF | RankEF }) {
  const { t } = useTranslation()
  const color = rankColors[rank] ?? '#999'

  return (
    <View
      flexDirection="row"
      alignItems="center"
      gap={4}
      paddingHorizontal={6}
      paddingVertical={2}
      borderRadius={4}
      backgroundColor="$backgroundHover"
    >
      <View width={6} height={6} borderRadius={3} backgroundColor={color} />
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
        {t(`calendar.rank.${rank}`)}
      </Text>
    </View>
  )
}
