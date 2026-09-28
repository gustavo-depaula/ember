import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n', () => ({
  supportedLanguages: [
    { code: 'en-US', label: 'English' },
    { code: 'pt-BR', label: 'Português' },
  ],
}))

import { normalizeLangKeys, pickAvailableLang } from './langAliases'

describe('pickAvailableLang', () => {
  it('returns the canonical code when present', () => {
    expect(pickAvailableLang('en-US', { 'en-US': {}, la: {} })).toBe('en-US')
    expect(pickAvailableLang('pt-BR', { 'pt-BR': {}, la: {} })).toBe('pt-BR')
  })

  it('falls back to the short form when only the short form is present', () => {
    expect(pickAvailableLang('en-US', { en: {}, la: {} })).toBe('en')
    expect(pickAvailableLang('pt-BR', { pt: {}, la: {} })).toBe('pt')
  })

  it('returns undefined when neither form is present', () => {
    expect(pickAvailableLang('en-US', { la: {} })).toBeUndefined()
    expect(pickAvailableLang('pt-BR', {})).toBeUndefined()
  })

  it('handles `la` (no short alias) — returns `la` if present, undefined otherwise', () => {
    expect(pickAvailableLang('la', { la: {}, en: {} })).toBe('la')
    expect(pickAvailableLang('la', { en: {} })).toBeUndefined()
  })
})

describe('normalizeLangKeys', () => {
  it('handles a mixed leaf with short, canonical, and Latin codes', () => {
    const input = { en: 'Hello', 'pt-BR': 'Olá', la: 'Salve' }
    expect(normalizeLangKeys(input)).toEqual({
      'en-US': 'Hello',
      'pt-BR': 'Olá',
      la: 'Salve',
    })
  })

  it('recurses into non-localized objects', () => {
    const input = { id: 'x', title: { en: 'Hello', la: 'Salve' } }
    expect(normalizeLangKeys(input)).toEqual({
      id: 'x',
      title: { 'en-US': 'Hello', la: 'Salve' },
    })
  })

  it('normalizes leaves inside arrays', () => {
    const input = [
      { en: 'first', pt: 'primeiro' },
      { en: 'second', pt: 'segundo' },
    ]
    expect(normalizeLangKeys(input)).toEqual([
      { 'en-US': 'first', 'pt-BR': 'primeiro' },
      { 'en-US': 'second', 'pt-BR': 'segundo' },
    ])
  })

  it('does not treat an empty object as a leaf', () => {
    const input = { id: 'x', meta: {} }
    expect(normalizeLangKeys(input)).toEqual({ id: 'x', meta: {} })
  })

  it('passes through scalars unchanged', () => {
    expect(normalizeLangKeys(42)).toBe(42)
    expect(normalizeLangKeys('hello')).toBe('hello')
    expect(normalizeLangKeys(true)).toBe(true)
    expect(normalizeLangKeys(null)).toBe(null)
  })
})
