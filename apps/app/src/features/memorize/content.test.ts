import { describe, expect, it } from 'vitest'

import { extractPortionContent } from './content'

const ourFather = {
  id: 'prayer/our-father',
  title: { 'en-US': 'Our Father', 'pt-BR': 'Pai Nosso', la: 'Pater Noster' },
  body: [
    {
      type: 'prayer',
      inline: {
        'en-US': 'Our Father, who art in heaven,\nhallowed be thy name.\nAmen.',
        'pt-BR': 'Pai nosso, que estais nos céus,\nsantificado seja o vosso nome.\nAmém.',
        la: 'Pater noster, qui es in cælis,\nsanctificétur nomen tuum.\nAmen.',
      },
    },
  ],
}

const psalmWithPortions = {
  id: 'prayer/psalm-x',
  title: { 'en-US': 'Psalm', la: 'Psalmus' },
  body: [
    {
      type: 'prayer',
      inline: {
        'en-US': 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
        la: 'Linea I\nLinea II\nLinea III\nLinea IV\nLinea V',
      },
    },
  ],
  memorize: {
    portions: [
      { lines: [1, 2] as [number, number] },
      { lines: [3, 5] as [number, number], label: { 'en-US': 'Latter half' } },
    ],
  },
}

describe('extractPortionContent', () => {
  it('returns the whole prayer as a single portion when memorize.portions is omitted', () => {
    const result = extractPortionContent(ourFather, 'en-US', 0)
    expect(result).toEqual({
      title: 'Our Father',
      portionLabel: undefined,
      lines: ['Our Father, who art in heaven,', 'hallowed be thy name.', 'Amen.'],
    })
  })

  it('localizes title to the requested language', () => {
    const result = extractPortionContent(ourFather, 'la', 0)
    expect(result?.title).toBe('Pater Noster')
    expect(result?.lines[0]).toBe('Pater noster, qui es in cælis,')
  })

  it('falls back to en-US title when the requested language is missing', () => {
    const sparse = { ...ourFather, title: { 'en-US': 'Our Father' } }
    expect(extractPortionContent(sparse, 'pt-BR', 0)?.title).toBe('Our Father')
  })

  it('returns the requested portion for portioned prayers', () => {
    const portion0 = extractPortionContent(psalmWithPortions, 'en-US', 0)
    expect(portion0?.lines).toEqual(['Line 1', 'Line 2'])
    expect(portion0?.portionLabel).toBeUndefined()

    const portion1 = extractPortionContent(psalmWithPortions, 'en-US', 1)
    expect(portion1?.lines).toEqual(['Line 3', 'Line 4', 'Line 5'])
    expect(portion1?.portionLabel).toBe('Latter half')
  })

  it('returns undefined when portionIndex is out of range', () => {
    expect(extractPortionContent(psalmWithPortions, 'en-US', 99)).toBeUndefined()
  })

  it('returns undefined when the prayer has no body in the requested language', () => {
    const onlyEn = {
      id: 'x',
      title: { 'en-US': 'X' },
      body: [{ inline: { 'en-US': 'a\nb' } }],
    }
    expect(extractPortionContent(onlyEn, 'pt-BR', 0)).toBeUndefined()
  })

  it('joins multiple body items with a newline before splitting', () => {
    const multiBlock = {
      id: 'x',
      title: { 'en-US': 'Multi' },
      body: [
        { type: 'prayer', inline: { 'en-US': 'A\nB' } },
        { type: 'prayer', inline: { 'en-US': 'C\nD' } },
      ],
    }
    expect(extractPortionContent(multiBlock, 'en-US', 0)?.lines).toEqual(['A', 'B', 'C', 'D'])
  })
})
