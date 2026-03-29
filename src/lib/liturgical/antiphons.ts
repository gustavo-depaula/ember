import { addDays } from 'date-fns'

import antiphonData from '@/assets/prayers/marian-antiphons.json'
import { computeEaster, dateInRange, getFirstSundayOfAdvent } from './season'

export type Antiphon = {
  id: string
  season: string
  title: string
  latin: string
  english: string
  portuguese?: string
}

function findAntiphon(id: string): Antiphon {
  return antiphonData.antiphons.find((a: { id: string }) => a.id === id) as Antiphon
}

// Traditional Marian antiphon schedule (used in both EF and OF):
// - Alma Redemptoris Mater: First Sunday of Advent through February 1
// - Ave Regina Caelorum: February 2 through Wednesday of Holy Week
// - Regina Caeli: Easter Sunday through Saturday after Pentecost
// - Salve Regina: Trinity Sunday through Saturday before First Sunday of Advent
export function getMarianAntiphon(date: Date): Antiphon {
  const year = date.getFullYear()
  const easter = computeEaster(year)
  const adventStart = getFirstSundayOfAdvent(year)
  const pentecostSaturday = addDays(easter, 55)
  const holyWednesday = addDays(easter, -4)

  const feb1 = new Date(year, 1, 1)
  if (dateInRange(date, adventStart, new Date(year, 11, 31)))
    return findAntiphon('alma-redemptoris')
  if (dateInRange(date, new Date(year, 0, 1), feb1)) return findAntiphon('alma-redemptoris')

  const feb2 = new Date(year, 1, 2)
  if (dateInRange(date, feb2, holyWednesday)) return findAntiphon('ave-regina')

  if (dateInRange(date, easter, pentecostSaturday)) return findAntiphon('regina-caeli')

  return findAntiphon('salve-regina')
}
