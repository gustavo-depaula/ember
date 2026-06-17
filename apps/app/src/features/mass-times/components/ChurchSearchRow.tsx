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

// A name + where-it-is row for search hits and saved churches (no schedule). `onSelect` selects the
// church in place (the sheet's place mode).
export function ChurchSearchRow({
  church,
  onSelect,
  onGlass,
}: {
  church: ChurchRowData
  onSelect: (church: ChurchRowData) => void
  onGlass?: boolean
}) {
  const where = [church.address, church.city, church.region].filter(Boolean).join(' · ')

  return (
    <ChurchRow name={church.name} onGlass={onGlass} onPress={() => onSelect(church)}>
      {where ? (
        <Typography variant="caption" tone="muted" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
