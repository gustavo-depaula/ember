import type { ImageSource } from 'expo-image'

export type Saint = {
  id: string
  nameKey: string
  image: ImageSource
  feastDayKey: string
  patronOfKey: string
  prayerExcerptKey: string
}

export const saints: Saint[] = [
  {
    id: 'therese',
    nameKey: 'saints.therese.name',
    image: require('../../../../assets/saints/therese.png'),
    feastDayKey: 'saints.therese.feastDay',
    patronOfKey: 'saints.therese.patronOf',
    prayerExcerptKey: 'saints.therese.prayerExcerpt',
  },
  {
    id: 'joseph',
    nameKey: 'saints.joseph.name',
    image: require('../../../../assets/saints/joseph.png'),
    feastDayKey: 'saints.joseph.feastDay',
    patronOfKey: 'saints.joseph.patronOf',
    prayerExcerptKey: 'saints.joseph.prayerExcerpt',
  },
  {
    id: 'michael_archangel',
    nameKey: 'saints.michaelArchangel.name',
    image: require('../../../../assets/saints/michael_archangel.png'),
    feastDayKey: 'saints.michaelArchangel.feastDay',
    patronOfKey: 'saints.michaelArchangel.patronOf',
    prayerExcerptKey: 'saints.michaelArchangel.prayerExcerpt',
  },
  {
    id: 'gabriel_archangel',
    nameKey: 'saints.gabrielArchangel.name',
    image: require('../../../../assets/saints/gabriel_archangel.png'),
    feastDayKey: 'saints.gabrielArchangel.feastDay',
    patronOfKey: 'saints.gabrielArchangel.patronOf',
    prayerExcerptKey: 'saints.gabrielArchangel.prayerExcerpt',
  },
  {
    id: 'peter',
    nameKey: 'saints.peter.name',
    image: require('../../../../assets/saints/peter.png'),
    feastDayKey: 'saints.peter.feastDay',
    patronOfKey: 'saints.peter.patronOf',
    prayerExcerptKey: 'saints.peter.prayerExcerpt',
  },
  {
    id: 'john_evangelist',
    nameKey: 'saints.johnEvangelist.name',
    image: require('../../../../assets/saints/john_evangelist.png'),
    feastDayKey: 'saints.johnEvangelist.feastDay',
    patronOfKey: 'saints.johnEvangelist.patronOf',
    prayerExcerptKey: 'saints.johnEvangelist.prayerExcerpt',
  },
  {
    id: 'john_of_the_cross',
    nameKey: 'saints.johnOfTheCross.name',
    image: require('../../../../assets/saints/john_of_the_cross.png'),
    feastDayKey: 'saints.johnOfTheCross.feastDay',
    patronOfKey: 'saints.johnOfTheCross.patronOf',
    prayerExcerptKey: 'saints.johnOfTheCross.prayerExcerpt',
  },
  {
    id: 'teresa',
    nameKey: 'saints.teresa.name',
    image: require('../../../../assets/saints/teresa.png'),
    feastDayKey: 'saints.teresa.feastDay',
    patronOfKey: 'saints.teresa.patronOf',
    prayerExcerptKey: 'saints.teresa.prayerExcerpt',
  },
  {
    id: 'philomena',
    nameKey: 'saints.philomena.name',
    image: require('../../../../assets/saints/philomena.png'),
    feastDayKey: 'saints.philomena.feastDay',
    patronOfKey: 'saints.philomena.patronOf',
    prayerExcerptKey: 'saints.philomena.prayerExcerpt',
  },
  {
    id: 'gianna',
    nameKey: 'saints.gianna.name',
    image: require('../../../../assets/saints/gianna.png'),
    feastDayKey: 'saints.gianna.feastDay',
    patronOfKey: 'saints.gianna.patronOf',
    prayerExcerptKey: 'saints.gianna.prayerExcerpt',
  },
  {
    id: 'luke',
    nameKey: 'saints.luke.name',
    image: require('../../../../assets/saints/luke.png'),
    feastDayKey: 'saints.luke.feastDay',
    patronOfKey: 'saints.luke.patronOf',
    prayerExcerptKey: 'saints.luke.prayerExcerpt',
  },
  {
    id: 'fatima',
    nameKey: 'saints.fatima.name',
    image: require('../../../../assets/saints/fatima.png'),
    feastDayKey: 'saints.fatima.feastDay',
    patronOfKey: 'saints.fatima.patronOf',
    prayerExcerptKey: 'saints.fatima.prayerExcerpt',
  },
  {
    id: 'moses_the_black',
    nameKey: 'saints.mosesTheBlack.name',
    image: require('../../../../assets/saints/moses_the_black.png'),
    feastDayKey: 'saints.mosesTheBlack.feastDay',
    patronOfKey: 'saints.mosesTheBlack.patronOf',
    prayerExcerptKey: 'saints.mosesTheBlack.prayerExcerpt',
  },
  {
    id: 'holy_innocents',
    nameKey: 'saints.holyInnocents.name',
    image: require('../../../../assets/saints/holy_innocents.png'),
    feastDayKey: 'saints.holyInnocents.feastDay',
    patronOfKey: 'saints.holyInnocents.patronOf',
    prayerExcerptKey: 'saints.holyInnocents.prayerExcerpt',
  },
]
