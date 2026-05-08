import { describe, expect, it } from 'vitest'

import { mergeLangs } from './mergeLangs'

describe('mergeLangs', () => {
  it('rebuilds a multilingual leaf from per-language payloads', () => {
    const shape = { title: null }
    const payloads = {
      en: { title: 'Easter Sunday' },
      la: { title: 'Dominica Resurrectionis' },
      'pt-BR': { title: 'Domingo de Páscoa' },
    }
    const merged = mergeLangs(shape, payloads) as { title: Record<string, string> }
    expect(merged.title).toEqual({
      en: 'Easter Sunday',
      la: 'Dominica Resurrectionis',
      'pt-BR': 'Domingo de Páscoa',
    })
  })

  it('preserves language-independent metadata from the shape', () => {
    const shape = {
      id: 'easter-sunday',
      season: 'easter',
      rite: 'mass',
      title: null,
    }
    const payloads = {
      en: { id: 'easter-sunday', season: 'easter', rite: 'mass', title: 'Easter Sunday' },
    }
    const merged = mergeLangs(shape, payloads) as Record<string, unknown>
    expect(merged.id).toBe('easter-sunday')
    expect(merged.season).toBe('easter')
    expect(merged.rite).toBe('mass')
    expect(merged.title).toEqual({ en: 'Easter Sunday' })
  })

  it('walks nested objects', () => {
    const shape = { collect: { body: { plain: null, lines: null } } }
    const payloads = {
      en: { collect: { body: { plain: 'O God', lines: ['O', 'God'] } } },
      la: { collect: { body: { plain: 'Deus', lines: ['Deus'] } } },
    }
    const merged = mergeLangs(shape, payloads) as {
      collect: { body: { plain: Record<string, string>; lines: Record<string, string[]> } }
    }
    expect(merged.collect.body.plain).toEqual({ en: 'O God', la: 'Deus' })
    expect(merged.collect.body.lines).toEqual({ en: ['O', 'God'], la: ['Deus'] })
  })

  it('preserves arrays element-wise', () => {
    const shape = [{ text: null }, { text: null }]
    const payloads = {
      en: [{ text: 'first' }, { text: 'second' }],
      pt: [{ text: 'primeiro' }, { text: 'segundo' }],
    }
    const merged = mergeLangs(shape, payloads) as Array<{ text: Record<string, string> }>
    expect(merged[0].text).toEqual({ en: 'first', pt: 'primeiro' })
    expect(merged[1].text).toEqual({ en: 'second', pt: 'segundo' })
  })

  it('skips languages whose payload is missing or null at a leaf', () => {
    const shape = { title: null }
    const payloads = {
      en: { title: 'Hello' },
      la: { title: null },
      pt: {},
    }
    const merged = mergeLangs(shape, payloads) as { title: Record<string, string> }
    expect(merged.title).toEqual({ en: 'Hello' })
    expect(merged.title.la).toBeUndefined()
    expect(merged.title.pt).toBeUndefined()
  })

  it('passes through scalar leaves unchanged', () => {
    expect(mergeLangs(42, {})).toBe(42)
    expect(mergeLangs('hello', {})).toBe('hello')
    expect(mergeLangs(true, {})).toBe(true)
  })

  it('handles real-world Mass-proper-shaped input', () => {
    const shape = {
      id: 'easter-sunday',
      group: 'tempore',
      season: 'easter',
      title: null,
      collect: { body: { plain: null, lines: null } },
      preface: { prefaceRefs: ['easter-i'], label: null },
    }
    const payloads = {
      en: {
        id: 'easter-sunday',
        group: 'tempore',
        season: 'easter',
        title: 'Easter Sunday',
        collect: { body: { plain: 'O God, who...', lines: ['O God', 'who'] } },
        preface: { prefaceRefs: ['easter-i'], label: 'Easter I' },
      },
      la: {
        id: 'easter-sunday',
        group: 'tempore',
        season: 'easter',
        title: 'Dominica Resurrectionis',
        collect: { body: { plain: 'Deus, qui...', lines: ['Deus, qui'] } },
        preface: { prefaceRefs: ['easter-i'], label: 'Pascha I' },
      },
    }
    const merged = mergeLangs(shape, payloads) as Record<string, any>
    expect(merged.id).toBe('easter-sunday')
    expect(merged.preface.prefaceRefs).toEqual(['easter-i'])
    expect(merged.title).toEqual({ en: 'Easter Sunday', la: 'Dominica Resurrectionis' })
    expect(merged.preface.label).toEqual({ en: 'Easter I', la: 'Pascha I' })
    expect(merged.collect.body.plain).toEqual({ en: 'O God, who...', la: 'Deus, qui...' })
  })
})
