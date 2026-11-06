import { describe, expect, it } from 'vitest'

import {
  fetchLanguages,
  type LanguageDefaults,
  type LanguageTraits,
  pageLayout,
  parseOverrides,
  patchOverride,
  pinnedOverride,
  prayPatch,
  promotedDefaults,
  resolveLanguages,
} from '../practiceLanguages'

const tradition: LanguageDefaults = { stance: 'tradition', vernacular: 'pt-BR', layout: 'auto' }
const latinMass: LanguageTraits = { prayedIn: 'la', parallel: 'la' }
const ordinaryMass: LanguageTraits = { parallel: 'la' }
const angelus: LanguageTraits = {}
const hours: LanguageTraits = { languages: ['pt-BR', 'en-US'], parallel: false }

describe('resolveLanguages', () => {
  it('prays a Latin-native practice in Latin with the vernacular beside it', () => {
    const r = resolveLanguages(latinMass, tradition)
    expect([r.pray, r.follow]).toEqual(['la', 'pt-BR'])
  })

  it('prays everything else in the vernacular, alone', () => {
    const r = resolveLanguages(angelus, tradition)
    expect([r.pray, r.follow]).toEqual(['pt-BR', undefined])
  })

  it('follows the stance', () => {
    expect(resolveLanguages(angelus, { ...tradition, stance: 'always' }).pray).toBe('la')
    expect(resolveLanguages(latinMass, { ...tradition, stance: 'vernacular' }).pray).toBe('pt-BR')
  })

  it('never offers Latin a practice does not have', () => {
    const r = resolveLanguages(hours, { ...tradition, stance: 'always' })
    expect(r.pray).toBe('pt-BR')
    expect(r.followOptions).toEqual([])
  })

  it('pairs a missal only with Latin', () => {
    expect(resolveLanguages(ordinaryMass, tradition).followOptions).toEqual(['la'])
    expect(resolveLanguages(latinMass, tradition).followOptions).toEqual(['en-US', 'pt-BR'])
  })

  it("keeps a prayer's own choice, and drops a companion the new language cannot have", () => {
    const r = resolveLanguages(ordinaryMass, tradition, { pray: 'en-US', follow: 'pt-BR' })
    expect([r.pray, r.follow]).toEqual(['en-US', undefined])
    expect(resolveLanguages(angelus, tradition, { follow: 'none', pray: 'la' }).follow).toBe(
      undefined,
    )
  })
})

describe('fetchLanguages', () => {
  it('fetches a Latin prayer vernacular-first and turns it at the page', () => {
    expect(fetchLanguages({ pray: 'la', follow: 'pt-BR' })).toEqual({
      primary: 'pt-BR',
      secondary: 'la',
      swapped: true,
    })
    expect(fetchLanguages({ pray: 'la', follow: undefined }).swapped).toBe(false)
    expect(fetchLanguages({ pray: 'pt-BR', follow: 'la' })).toEqual({
      primary: 'pt-BR',
      secondary: 'la',
      swapped: false,
    })
  })
})

describe('patchOverride', () => {
  it('is no override when it asks for what the defaults give', () => {
    expect(patchOverride(latinMass, tradition, undefined, { pray: 'la' })).toBeUndefined()
    expect(patchOverride(angelus, tradition, undefined, { layout: 'auto' })).toBeUndefined()
  })

  it('switches the Angelus to Latin with Portuguese beside it', () => {
    const resolved = resolveLanguages(angelus, tradition)
    const override = patchOverride(angelus, tradition, undefined, prayPatch(resolved, 'la'))
    expect(override).toEqual({ pray: 'la' })
    const r = resolveLanguages(angelus, tradition, override)
    expect([r.pray, r.follow]).toEqual(['la', 'pt-BR'])
  })

  it('turns the two round when the companion is picked to pray in', () => {
    const resolved = resolveLanguages(latinMass, tradition)
    const override = patchOverride(latinMass, tradition, undefined, prayPatch(resolved, 'pt-BR'))
    const r = resolveLanguages(latinMass, tradition, override)
    expect([r.pray, r.follow]).toEqual(['pt-BR', 'la'])
  })

  it('keeps a companion turned off', () => {
    const override = patchOverride(latinMass, tradition, undefined, { follow: 'none' })
    expect(override).toEqual({ follow: 'none' })
    expect(resolveLanguages(latinMass, tradition, override).follow).toBeUndefined()
  })

  it('keeps a pinned prayer as it is when the defaults change', () => {
    const pinned = pinnedOverride(resolveLanguages(latinMass, tradition))
    const vernacular = { ...tradition, stance: 'vernacular' as const }
    const r = resolveLanguages(latinMass, vernacular, pinned)
    expect([r.pray, r.follow]).toEqual(['la', 'pt-BR'])
  })
})

describe('promotedDefaults', () => {
  it('makes Latin the stance for every prayer', () => {
    const r = resolveLanguages(angelus, tradition, { pray: 'la' })
    expect(promotedDefaults(tradition, r)).toEqual({
      stance: 'always',
      vernacular: 'pt-BR',
      layout: 'auto',
    })
  })

  it('makes a vernacular the reader’s language, with no Latin', () => {
    const r = resolveLanguages(latinMass, tradition, { pray: 'en-US' })
    expect(promotedDefaults(tradition, r)).toMatchObject({
      stance: 'vernacular',
      vernacular: 'en-US',
    })
  })
})

describe('pageLayout', () => {
  it('interleaves upright and sets columns when wide', () => {
    expect(pageLayout('auto', 'pt-BR', false)).toBe('interleaved')
    expect(pageLayout('auto', 'pt-BR', true)).toBe('columns')
    expect(pageLayout('tap', 'pt-BR', true)).toBe('tap')
    expect(pageLayout('columns', undefined, true)).toBe('single')
  })
})

describe('parseOverrides', () => {
  it('keeps only what it understands', () => {
    const raw = JSON.stringify({
      angelus: { pray: 'la', follow: 'xx', layout: 'tap' },
      rosary: { follow: 'none' },
      empty: { pray: 'xx' },
    })
    expect(parseOverrides(raw)).toEqual({
      angelus: { pray: 'la', layout: 'tap' },
      rosary: { follow: 'none' },
    })
  })
})
