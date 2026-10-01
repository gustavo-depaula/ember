import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { useFavoriteChurches } from '../favorites'
import { type ChurchRowData, ChurchSearchRow } from './ChurchSearchRow'
import { Hairline, SectionLabel } from './SheetType'

// Saved churches, shown above the nearby list. Renders nothing when empty. `onSelect` selects in
// place (the sheet's place mode).
export function SavedChurches({ onSelect }: { onSelect: (church: ChurchRowData) => void }) {
  const { t } = useTranslation()
  const saved = useFavoriteChurches()
  if (saved.length === 0) return null

  return (
    <YStack>
      <SectionLabel rule>{t('massTimes.savedSection')}</SectionLabel>
      {saved.map((church, i) => (
        <Fragment key={church.id}>
          {i > 0 ? <Hairline /> : null}
          <ChurchSearchRow church={church} onSelect={onSelect} />
        </Fragment>
      ))}
    </YStack>
  )
}
