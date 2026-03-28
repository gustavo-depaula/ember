import antiphonData from '@/assets/prayers/marian-antiphons.json'
import { getLiturgicalSeason } from './season'

export type Antiphon = {
  id: string
  season: string
  title: string
  latin: string
  english: string
  portuguese?: string
}

export function getMarianAntiphon(date: Date): Antiphon {
  const season = getLiturgicalSeason(date)
  const antiphon = antiphonData.antiphons.find((a: { season: string }) => a.season === season)
  // Fallback to Salve Regina
  return antiphon ?? antiphonData.antiphons[3]
}
