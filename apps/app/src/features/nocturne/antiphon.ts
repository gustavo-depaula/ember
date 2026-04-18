import type { LiturgicalSeason } from '@ember/liturgical'

export type MarianAntiphon = 'alma' | 'aveRegina' | 'reginaCaeli' | 'salve'

const seasonToAntiphon: Record<LiturgicalSeason, MarianAntiphon> = {
  advent: 'alma',
  christmas: 'alma',
  epiphany: 'alma',
  septuagesima: 'aveRegina',
  lent: 'aveRegina',
  easter: 'reginaCaeli',
  ordinary: 'salve',
  'post-pentecost': 'salve',
}

export function marianAntiphonForSeason(season: LiturgicalSeason): MarianAntiphon {
  return seasonToAntiphon[season]
}
