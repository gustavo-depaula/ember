import complineHymns from '@/assets/hymns/compline.json'
import eveningHymns from '@/assets/hymns/evening.json'
import morningHymns from '@/assets/hymns/morning.json'

export type OfficeHour = 'morning' | 'evening' | 'compline'

const hymnsByHour = {
  morning: morningHymns.hymns,
  evening: eveningHymns.hymns,
  compline: complineHymns.hymns,
}

export function getHymnForHour(hour: OfficeHour): {
  title: string
  latin: string
  english: string
  portuguese?: string
} {
  return hymnsByHour[hour][0]
}
