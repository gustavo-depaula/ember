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

// justif's `RunMetrics` is "one styling context inside a paragraph (the
// paragraph itself, an <em>, a size change…)", so a run may differ from its
// neighbours in size, tracking, colour and interactivity — not only in face.
// These are what let the Bible's superscript verse numbers, the missal's ℣/℟
// marks and a tappable cross-reference be justified rather than excluded.
describe('inline runs beyond the face', () => {
  const m = getFontMetrics('eb-garamond')
  if (!m) throw new Error('no metrics')

  // The reconstruction the renderer performs, in test form: every advance a
  // line draws, at the size and tracking its own run was measured with.
  const renderedWidth = (line: {
    pieces: {
      text: string
      fontSizePx?: number
      render?: unknown
      spaceAfter?: { extraPx: number; fontSizePx?: number }
    }[]
    hyphenated: boolean
  }) =>
    line.pieces.reduce((sum, p) => {
      const size = p.fontSizePx ?? 22
      const space = p.spaceAfter ? m.width(' ', p.spaceAfter.fontSizePx ?? 22) : 0
      return sum + m.width(p.text, size) + space + (p.spaceAfter?.extraPx ?? 0)
    }, 0) + (line.hyphenated ? m.width('-', 22) : 0)

  test('measures a smaller run at ITS size, not the paragraph size', () => {
    // A verse number set 0.55× must not be priced as body text — that would
    // steal ~10px from every first line and cascade a re-wrap.
    const withNumber = justifyText({
      source: [
        { text: '12', style: 'regular', fontSizePx: 12 },
        { text: '  In principio erat Verbum, et Verbum erat apud Deum.', style: 'regular' },
      ],
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'la',
    })
    expect(withNumber).toBeDefined()
    const numberPiece = withNumber!.flatMap((l) => l.pieces).find((p) => p.text === '12')
    expect(numberPiece?.fontSizePx).toBe(12)
    for (const line of withNumber!) {
      if (line.overfull) continue
      expect(renderedWidth(line)).toBeLessThanOrEqual(334.5)
    }
  })

  test('a smaller run buys real room — the same text at body size takes more', () => {
    const at = (fontSizePx: number | undefined) =>
      justifyText({
        source: [
          { text: 'NUMBER', style: 'regular', ...(fontSizePx ? { fontSizePx } : {}) },
          { text: ' the rest of a line that must be broken somewhere', style: 'regular' },
        ],
        widthPx: 170.5,
        fontSizePx: 22,
        fontFamilyId: 'eb-garamond',
        language: 'en-US',
      })
    const small = at(10)!
    const full = at(undefined)!
    const firstLineText = (ls: typeof small) => ls[0].pieces.map((p) => p.text).join('')
    // The small run leaves more of the sentence on line one.
    expect(firstLineText(small).length).toBeGreaterThan(firstLineText(full).length)
  })

  test('letterSpacing is measured AND rendered, because it is real width', () => {
    const tracking = 6
    const lines = justifyText({
      source: [
        { text: 'PS. 87:9', style: 'regular', letterSpacing: tracking },
        {
          text: ' Longe fecisti notos meos a me, posuerunt me abominationem sibi.',
          style: 'regular',
        },
      ],
      widthPx: 170.5,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'la',
    })
    expect(lines).toBeDefined()
    // The piece has to CARRY the tracking, or the renderer draws a narrower
    // line than the breaker planned and the last word re-wraps.
    const cited = lines!.flatMap((l) => l.pieces).filter((p) => p.text.startsWith('PS'))
    expect(cited.length).toBeGreaterThan(0)
    expect(cited.every((p) => p.letterSpacing === tracking)).toBe(true)

    // And the width the screen will draw — tracking included — still fits.
    for (const line of lines!) {
      if (line.overfull) continue
      const drawn = line.pieces.reduce((sum, p) => {
        const size = p.fontSizePx ?? 22
        const ls = p.letterSpacing ?? 0
        const box = m.width(p.text, size) + ls * p.text.length
        if (!p.spaceAfter) return sum + box
        const spaceLs = p.spaceAfter.letterSpacing ?? 0
        return (
          sum + box + m.width(' ', p.spaceAfter.fontSizePx ?? 22) + spaceLs + p.spaceAfter.extraPx
        )
      }, 0)
      expect(drawn).toBeLessThanOrEqual(170.5 + 0.5)
    }
  })

  test('carries colour and a press handler through to every piece', () => {
    const onPress = () => {}
    const render = { color: '#8a1538' }
    const lines = justifyText({
      source: [
        { text: 'See also', style: 'regular' },
        { text: ' 1213', style: 'bold', render, onPress },
        { text: ' on baptism.', style: 'regular' },
      ],
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'en-US',
    })
    const ref = lines!.flatMap((l) => l.pieces).filter((p) => p.onPress === onPress)
    expect(ref.length).toBeGreaterThan(0)
    expect(ref.every((p) => p.render === render)).toBe(true)
    expect(lines!.flatMap((l) => l.pieces).some((p) => p.onPress === undefined)).toBe(true)
  })

  test('never merges two references into one tap target', () => {
    const first = () => {}
    const second = () => {}
    const lines = justifyText({
      source: [
        { text: 'a', style: 'regular', onPress: first },
        { text: 'b', style: 'regular', onPress: second },
      ],
      widthPx: 334,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
    })
    const pieces = lines!.flatMap((l) => l.pieces)
    // Adjacent, same face, no space between them — merging would be the
    // obvious optimisation and would silently fuse two links.
    expect(pieces.filter((p) => p.onPress === first)).toHaveLength(1)
    expect(pieces.filter((p) => p.onPress === second)).toHaveLength(1)
  })

  test('an atomic run keeps rigid spaces and is never hyphenated', () => {
    const lines = justifyText({
      source: [
        { text: 'PS. 87:9', style: 'regular', atomic: true },
        {
          text: ' Longe fecisti notos meos a me; posuerunt me abominationem sibi traditurus.',
          style: 'regular',
        },
      ],
      widthPx: 170.5,
      fontSizePx: 22,
      fontFamilyId: 'eb-garamond',
      language: 'la',
    })
    expect(lines).toBeDefined()
    const citation = lines!.flatMap((l) => l.pieces).filter((p) => p.text.startsWith('PS.'))
    // The gap inside the citation is rigid: it must never open into "PS.   87:9"
    // the way an ordinary word space does on a stretched line.
    for (const p of citation) expect(p.spaceAfter?.extraPx ?? 0).toBe(0)
  })

  test('still declines when a run names a face it cannot measure', () => {
    // The size override must not become a way to smuggle an unmeasurable face
    // past the guard.
    expect(
      justifyText({
        source: [{ text: 'Ora pro nobis', style: 'bold', fontSizePx: 12 }],
        widthPx: 334,
        fontSizePx: 22,
        fontFamilyId: 'lora',
      }),
    ).toBeUndefined()
  })
})
