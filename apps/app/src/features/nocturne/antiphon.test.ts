import { describe, expect, it } from 'vitest'

import { marianAntiphonForSeason } from './antiphon'

describe('marianAntiphonForSeason', () => {
  it('returns Alma Redemptoris Mater for Advent through Epiphany', () => {
    expect(marianAntiphonForSeason('advent')).toBe('alma')
    expect(marianAntiphonForSeason('christmas')).toBe('alma')
    expect(marianAntiphonForSeason('epiphany')).toBe('alma')
  })

  it('returns Ave Regina Caelorum for Septuagesima and Lent', () => {
    expect(marianAntiphonForSeason('septuagesima')).toBe('aveRegina')
    expect(marianAntiphonForSeason('lent')).toBe('aveRegina')
  })

  it('returns Regina Caeli for Easter', () => {
    expect(marianAntiphonForSeason('easter')).toBe('reginaCaeli')
  })

  it('returns Salve Regina for ordinary time and post-pentecost', () => {
    expect(marianAntiphonForSeason('ordinary')).toBe('salve')
    expect(marianAntiphonForSeason('post-pentecost')).toBe('salve')
  })
})
