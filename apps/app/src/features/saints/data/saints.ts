import type { ImageSource } from 'expo-image'
import { hearthUrl, isLocalHearth } from '@/lib/hearth'

export type Saint = {
  id: string
  nameKey: string
  image: ImageSource
  feastDayKey: string
  patronOfKey: string
  prayerExcerptKey: string
}

function saintImage(id: string): ImageSource {
  const ext = isLocalHearth() ? 'png' : 'webp'
  return { uri: hearthUrl(`saints/${id}.${ext}`) }
}

export const saints: Saint[] = [
  {
    id: 'therese',
    nameKey: 'saints.therese.name',
    image: saintImage('therese'),
    feastDayKey: 'saints.therese.feastDay',
    patronOfKey: 'saints.therese.patronOf',
    prayerExcerptKey: 'saints.therese.prayerExcerpt',
  },
  {
    id: 'joseph',
    nameKey: 'saints.joseph.name',
    image: saintImage('joseph'),
    feastDayKey: 'saints.joseph.feastDay',
    patronOfKey: 'saints.joseph.patronOf',
    prayerExcerptKey: 'saints.joseph.prayerExcerpt',
  },
  {
    id: 'michael_archangel',
    nameKey: 'saints.michaelArchangel.name',
    image: saintImage('michael_archangel'),
    feastDayKey: 'saints.michaelArchangel.feastDay',
    patronOfKey: 'saints.michaelArchangel.patronOf',
    prayerExcerptKey: 'saints.michaelArchangel.prayerExcerpt',
  },
  {
    id: 'gabriel_archangel',
    nameKey: 'saints.gabrielArchangel.name',
    image: saintImage('gabriel_archangel'),
    feastDayKey: 'saints.gabrielArchangel.feastDay',
    patronOfKey: 'saints.gabrielArchangel.patronOf',
    prayerExcerptKey: 'saints.gabrielArchangel.prayerExcerpt',
  },
  {
    id: 'peter',
    nameKey: 'saints.peter.name',
    image: saintImage('peter'),
    feastDayKey: 'saints.peter.feastDay',
    patronOfKey: 'saints.peter.patronOf',
    prayerExcerptKey: 'saints.peter.prayerExcerpt',
  },
  {
    id: 'john_evangelist',
    nameKey: 'saints.johnEvangelist.name',
    image: saintImage('john_evangelist'),
    feastDayKey: 'saints.johnEvangelist.feastDay',
    patronOfKey: 'saints.johnEvangelist.patronOf',
    prayerExcerptKey: 'saints.johnEvangelist.prayerExcerpt',
  },
  {
    id: 'john_of_the_cross',
    nameKey: 'saints.johnOfTheCross.name',
    image: saintImage('john_of_the_cross'),
    feastDayKey: 'saints.johnOfTheCross.feastDay',
    patronOfKey: 'saints.johnOfTheCross.patronOf',
    prayerExcerptKey: 'saints.johnOfTheCross.prayerExcerpt',
  },
  {
    id: 'teresa',
    nameKey: 'saints.teresa.name',
    image: saintImage('teresa'),
    feastDayKey: 'saints.teresa.feastDay',
    patronOfKey: 'saints.teresa.patronOf',
    prayerExcerptKey: 'saints.teresa.prayerExcerpt',
  },
  {
    id: 'philomena',
    nameKey: 'saints.philomena.name',
    image: saintImage('philomena'),
    feastDayKey: 'saints.philomena.feastDay',
    patronOfKey: 'saints.philomena.patronOf',
    prayerExcerptKey: 'saints.philomena.prayerExcerpt',
  },
  {
    id: 'gianna',
    nameKey: 'saints.gianna.name',
    image: saintImage('gianna'),
    feastDayKey: 'saints.gianna.feastDay',
    patronOfKey: 'saints.gianna.patronOf',
    prayerExcerptKey: 'saints.gianna.prayerExcerpt',
  },
  {
    id: 'luke',
    nameKey: 'saints.luke.name',
    image: saintImage('luke'),
    feastDayKey: 'saints.luke.feastDay',
    patronOfKey: 'saints.luke.patronOf',
    prayerExcerptKey: 'saints.luke.prayerExcerpt',
  },
  {
    id: 'fatima',
    nameKey: 'saints.fatima.name',
    image: saintImage('fatima'),
    feastDayKey: 'saints.fatima.feastDay',
    patronOfKey: 'saints.fatima.patronOf',
    prayerExcerptKey: 'saints.fatima.prayerExcerpt',
  },
  {
    id: 'moses_the_black',
    nameKey: 'saints.mosesTheBlack.name',
    image: saintImage('moses_the_black'),
    feastDayKey: 'saints.mosesTheBlack.feastDay',
    patronOfKey: 'saints.mosesTheBlack.patronOf',
    prayerExcerptKey: 'saints.mosesTheBlack.prayerExcerpt',
  },
  {
    id: 'holy_innocents',
    nameKey: 'saints.holyInnocents.name',
    image: saintImage('holy_innocents'),
    feastDayKey: 'saints.holyInnocents.feastDay',
    patronOfKey: 'saints.holyInnocents.patronOf',
    prayerExcerptKey: 'saints.holyInnocents.prayerExcerpt',
  },
]
