import { describe, expect, it } from 'vitest'
import { mapItemsToPrimitives } from './blocks'

describe('mapItemsToPrimitives', () => {
  it('maps section heads, rubrics, dialog, and text with Latin as secondary', () => {
    const vernacular = [
      '#Introit',
      '!Ps 138:17\nv. To me, thy friends, O God, are honourable.\nGlory be to the Father.',
      '',
      'S. Lord, have mercy.\nM. Christ, have mercy.',
      '_',
    ]
    const latin = [
      '#Introitus',
      '!Ps 138:17\nv. Mihi autem nimis honoráti sunt amíci tui, Deus.\nGlória Patri.',
      '',
      'S. Kýrie, eléison.\nM. Christe, eléison.',
      '_',
    ]
    const out = mapItemsToPrimitives(vernacular, latin)

    expect(out[0]).toEqual({
      type: 'heading',
      text: { primary: 'Introit', secondary: 'Introitus' },
      size: 'h1',
    })
    expect(out[1]).toEqual({
      type: 'rubric',
      text: { primary: 'Ps 138:17' },
    })
    // 'v.'-marked line + plain line: verse group then text
    expect(out[2]).toMatchObject({ type: 'verses' })
    expect(out[3]).toMatchObject({
      type: 'text',
      text: {
        primary: 'Glory be to the Father.',
        secondary: 'Glória Patri.',
      },
    })
    const dialog = out.find((p) => p.type === 'verses' && p.items.length === 2)
    expect(dialog).toMatchObject({
      items: [
        { text: { primary: 'Lord, have mercy.', secondary: 'Kýrie, eléison.' }, role: 'v' },
        { text: { primary: 'Christ, have mercy.', secondary: 'Christe, eléison.' }, role: 'r' },
      ],
    })
    expect(out[out.length - 1]).toEqual({ type: 'divider' })
  })

  it('falls back to chunk pairing when line structures diverge', () => {
    const out = mapItemsToPrimitives(['One line only.'], ['Linea una.\nLinea altera.'])
    expect(out).toEqual([
      {
        type: 'text',
        text: { primary: 'One line only.', secondary: 'Linea una.\nLinea altera.' },
      },
    ])
  })

  it('renders Latin-only when no vernacular column exists', () => {
    const out = mapItemsToPrimitives(['#Canon', 'Te ígitur, clementíssime Pater.'])
    expect(out).toEqual([
      { type: 'heading', text: { primary: 'Canon' }, size: 'h1' },
      { type: 'text', text: { primary: 'Te ígitur, clementíssime Pater.' } },
    ])
  })
})
