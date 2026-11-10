import { describe, expect, it } from 'vitest'

import { evangelistArtFor } from '../evangelistArt'

const evangelist = (citation: string) =>
  /evangelist-(\w+)-/.exec(String((evangelistArtFor(citation, 0) as { uri?: string })?.uri))?.[1]

describe('evangelistArtFor', () => {
  it('knows the evangelist by name, as Vatican News prints it', () => {
    expect(evangelist('João 2,13-22')).toBe('john')
    expect(evangelist('Matthew 9:9-13')).toBe('matthew')
  })

  it('knows the evangelist by the abbreviation of the offline Gospel', () => {
    expect(evangelist('Jo 2, 13-22')).toBe('john')
    expect(evangelist('Mc 1, 1-8')).toBe('mark')
    expect(evangelist('Lc 16, 9-15')).toBe('luke')
    expect(evangelist('Mt 5, 1-12a')).toBe('matthew')
  })
})
