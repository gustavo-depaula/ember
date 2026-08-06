import { describe, expect, test } from 'vitest'

import { getFontMetrics } from '../fontMetrics'
import { justifyText } from '../justifyText'

const prose =
  'O Lord, open Thou my mouth to bless Thy holy name; cleanse my heart also from all vain, evil and wandering thoughts; enlighten my understanding, kindle my affections, that I may be able to recite this Office worthily, attentively and devoutly.'

const latin =
  'Aperi, Domine, os meum ad benedicendum Nomen sanctum tuum; munda quoque cor meum ab omnibus vanis, perversis et alienis cogitationibus; intellectum illumina, affectum inflamma.'

// The real bilingual side-by-side measure: a 390px phone, PracticeFlowView's
// 16px padding, BilingualBlock's 8px gap and 1px divider, halved.
const bilingualWidth = 170.5

describe('font metrics', () => {
  test('every reading font has a generated table', () => {
    for (const id of [
      'eb-garamond',
      'crimson-pro',
      'lora',
      'cormorant-garamond',
      'libre-baskerville',
      'source-serif-4',
      'merriweather',
    ] as const) {
      expect(getFontMetrics(id), id).toBeDefined()
    }
  })

  test('scales linearly with font size', () => {
    const m = getFontMetrics('eb-garamond')
    if (!m) throw new Error('no metrics')
    expect(m.width('Aperi', 44)).toBeCloseTo(m.width('Aperi', 22) * 2, 6)
  })

  test('soft hyphens take no width', () => {
    const m = getFontMetrics('eb-garamond')
    if (!m) throw new Error('no metrics')
    // lib/hyphenate.ts inserts these into prayer text before it ever reaches
    // the justifier; counting them would inflate every hyphenated word.
    expect(m.width('bene\u00addicendum', 22)).toBeCloseTo(m.width('benedicendum', 22), 6)
  })

  test('substitutes f-ligatures, which are narrower than their parts', () => {
    const m = getFontMetrics('eb-garamond')
    if (!m) throw new Error('no metrics')
    // "afflict" carries an ffl ligature; summing f+f+l overstates it by ~2.5px
    // at 22px, which is enough to overflow a line.
    const naive = m.width('a', 22) + m.width('f', 22) * 2 + m.width('lict', 22)
    expect(m.width('afflict', 22)).toBeLessThan(naive - 2)
  })
})

describe('justifyText', () => {
  test('breaks a paragraph into lines', () => {
    const lines = justifyText({
      source: prose,
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'en-US',
    })
    expect(lines).toBeDefined()
    expect(lines!.length).toBeGreaterThan(3)
    expect(lines!.flatMap((l) => l.pieces.map((p) => p.text)).join(' ')).toBe(prose)
  })

  test('no line overflows its measure', () => {
    const m = getFontMetrics('eb-garamond')
    if (!m) throw new Error('no metrics')
    const lines = justifyText({
      source: prose,
      widthPx: bilingualWidth,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'en-US',
    })
    expect(lines).toBeDefined()

    const natural = m.width(' ', 22)
    for (const line of lines!) {
      if (line.overfull) continue
      const glyphs = line.pieces.reduce((sum, p) => sum + m.width(p.text, 22), 0)
      const spaces = line.pieces.reduce(
        (sum, p) => sum + (p.spaceAfter ? natural + p.spaceAfter.extraPx : 0),
        0,
      )
      const hyphen = line.hyphenated ? m.width('-', 22) : 0
      // Word spaces are the only flex, so the rendered width is fully
      // reconstructible here. Half a pixel of slack for float arithmetic.
      expect(glyphs + spaces + hyphen).toBeLessThanOrEqual(bilingualWidth + 0.5)
    }
  })

  test('justifies Latin, hyphenating with the liturgical patterns', () => {
    const lines = justifyText({
      source: latin,
      widthPx: bilingualWidth,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'la',
    })
    expect(lines).toBeDefined()
    // A 170px measure is far too narrow for Latin words to fit unbroken.
    expect(lines!.some((l) => l.hyphenated)).toBe(true)
    // Hyphenation splits words, so joining is not identity — but every
    // fragment must still reconstruct the source.
    expect(
      lines!
        .flatMap((l) => l.pieces.map((p) => p.text))
        .join('')
        .replace(/\s+/g, ''),
    ).toBe(latin.replace(/\s+/g, ''))
  })

  test('narrower measures need more lines', () => {
    const wide = justifyText({
      source: prose,
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
    })
    const narrow = justifyText({
      source: prose,
      widthPx: bilingualWidth,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
    })
    expect(narrow!.length).toBeGreaterThan(wide!.length)
  })

  test('declines rather than guessing when inputs are unusable', () => {
    const base = { source: prose, fontSizePx: 22, fontFamilyId: 'eb-garamond' } as const
    expect(justifyText({ ...base, widthPx: 0 })).toBeUndefined()
    expect(justifyText({ ...base, widthPx: -10 })).toBeUndefined()
    expect(justifyText({ ...base, widthPx: 300, fontSizePx: 0 })).toBeUndefined()
    expect(justifyText({ ...base, source: '   ', widthPx: 300 })).toBeUndefined()
  })
})

describe('inline emphasis', () => {
  const styled = [
    { text: 'Sancta Maria, ', style: 'regular' as const },
    { text: 'Mater Dei', style: 'italic' as const },
    {
      text: ', ora pro nobis peccatoribus, nunc et in hora mortis nostrae.',
      style: 'regular' as const,
    },
  ]

  test('justifies across mixed styles instead of declining', () => {
    const lines = justifyText({
      source: styled,
      widthPx: bilingualWidth,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'la',
    })
    expect(lines).toBeDefined()
    expect(lines!.length).toBeGreaterThan(1)
    // Every character survives, in order.
    expect(lines!.flatMap((l) => l.pieces.map((p) => p.text)).join('')).toBe(
      styled
        .map((s) => s.text)
        .join('')
        .replace(/ /g, ''),
    )
  })

  test('carries the italic style through to the pieces', () => {
    const lines = justifyText({
      source: styled,
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
    })
    const italic = lines!.flatMap((l) => l.pieces).filter((p) => p.style === 'italic')
    expect(italic.length).toBeGreaterThan(0)
    expect(italic.map((p) => p.text).join('')).toContain('Mater')
  })

  test('measures the italic face, not the regular one', () => {
    const regular = getFontMetrics('eb-garamond', 'regular')
    const italic = getFontMetrics('eb-garamond', 'italic')
    expect(italic).toBeDefined()
    // EB Garamond's italic is a genuinely different face, so widths differ —
    // if they matched we would be silently measuring the wrong metrics.
    expect(italic!.width('Mater Dei', 22)).not.toBeCloseTo(regular!.width('Mater Dei', 22), 3)
  })

  test('bold on a family that ships no bold face declines rather than guessing', () => {
    // Only EB Garamond loads real italic/bold. Elsewhere the platform smears a
    // synthetic bold whose advances we cannot predict.
    expect(getFontMetrics('lora', 'bold')).toBeUndefined()
    expect(
      justifyText({
        source: [{ text: 'Ora pro nobis', style: 'bold' }],
        widthPx: 334,
        fontSizePx: 22,
        fontFamilyId: 'lora',
      }),
    ).toBeUndefined()
  })

  test('synthetic italic reuses regular metrics — a shear preserves advances', () => {
    const regular = getFontMetrics('lora', 'regular')
    const synthetic = getFontMetrics('lora', 'italic')
    expect(synthetic).toBeDefined()
    expect(synthetic!.width('Mater Dei', 22)).toBeCloseTo(regular!.width('Mater Dei', 22), 6)
  })
})
