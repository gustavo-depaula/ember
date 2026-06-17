import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { Typography } from '@/components'
import { useFavoriteChurches } from '../favorites'
import { type ChurchRowData, ChurchSearchRow } from './ChurchSearchRow'

// Saved churches, shown above the nearby list. Renders nothing when empty. `onSelect` selects in
// place (the sheet's place mode).
export function SavedChurches({
  onSelect,
  onGlass,
}: {
  onSelect?: (church: ChurchRowData) => void
  onGlass?: boolean
}) {
  const { t } = useTranslation()
  const saved = useFavoriteChurches()
  if (saved.length === 0) return null

  return (
    <YStack gap="$sm" paddingBottom="$md">
      <Typography variant="label">{t('massTimes.savedSection')}</Typography>
      <YStack gap="$sm">
        {saved.map((church) => (
          <ChurchSearchRow key={church.id} church={church} onSelect={onSelect} onGlass={onGlass} />
        ))}
      </YStack>
    </YStack>
  )
}
