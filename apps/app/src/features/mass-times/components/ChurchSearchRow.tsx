import { Typography } from '@/components'
import { ChurchRow } from './ChurchRow'

// Minimal church shape this row needs — satisfied by a full Church, a search hit, or a saved snapshot.
export type ChurchRowData = {
  id: string
  name: string
  address?: string | null
  city?: string | null
  region?: string | null
}

// A name + where-it-is row for search hits and saved churches (no schedule). `onSelect` selects in
// place (the sheet); without it, it navigates to the detail screen (the search page).
export function ChurchSearchRow({
  church,
  onSelect,
}: {
  church: ChurchRowData
  onSelect?: (church: ChurchRowData) => void
}) {
  const where = [church.address, church.city, church.region].filter(Boolean).join(' · ')

  return (
    <ChurchRow
      name={church.name}
      onPress={onSelect ? () => onSelect(church) : undefined}
      href={
        onSelect
          ? undefined
          : { pathname: '/mass-times/[churchId]', params: { churchId: church.id } }
      }
    >
      {where ? (
        <Typography variant="caption" tone="muted" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
