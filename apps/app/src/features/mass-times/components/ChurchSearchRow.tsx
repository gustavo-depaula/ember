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

// A name + where-it-is row. Used for search hits and saved churches, which carry no schedule, so it
// taps through to the detail screen that loads the full church.
export function ChurchSearchRow({ church }: { church: ChurchRowData }) {
  const where = [church.address, church.city, church.region].filter(Boolean).join(' · ')

  return (
    <ChurchRow
      href={{ pathname: '/mass-times/[churchId]', params: { churchId: church.id } }}
      name={church.name}
    >
      {where ? (
        <Typography variant="caption" tone="muted" numberOfLines={1}>
          {where}
        </Typography>
      ) : null}
    </ChurchRow>
  )
}
