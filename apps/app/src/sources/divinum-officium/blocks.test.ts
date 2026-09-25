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
    // A lowercase 'v.' opens a paragraph (DO's initial letter), not a versicle.
    expect(out[2]).toMatchObject({
      type: 'text',
      text: {
        primary: 'To me, thy friends, O God, are honourable.\nGlory be to the Father.',
        secondary: 'Mihi autem nimis honoráti sunt amíci tui, Deus.\nGlória Patri.',
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

  it('pairs content lines past blank lines the columns place differently', () => {
    // Prime's chapter office: equal raw line counts, but the vernacular has an
    // extra blank after the rubric and one fewer at the end.
    const vernacular = ['!Pai Nosso em segredo\n\n\nV. Pai Nosso\nV. E não nos deixeis\nR. Amém.\n']
    const latin = ['!Pater Noster secreto\n\nV. Pater noster\nV. Et ne nos\nR. Amen.\n\n']
    const verses = mapItemsToPrimitives(vernacular, latin).find((p) => p.type === 'verses')
    expect(verses).toMatchObject({
      items: [
        { text: { primary: 'Pai Nosso', secondary: 'Pater noster' } },
        { text: { primary: 'E não nos deixeis', secondary: 'Et ne nos' } },
        { text: { primary: 'Amém.', secondary: 'Amen.' } },
      ],
    })
  })

  it('sets an antiphon apart as its own block', () => {
    const out = mapItemsToPrimitives(
      ['Ant. Sede o meu auxiliador * e o meu libertador.\nV. Glória ao Pai.\nR. Como era.'],
      ['Ant. Adiútor meus * et liberátor meus.\nV. Glória Patri.\nR. Sicut erat.'],
    )
    expect(out).toMatchObject([
      {
        type: 'verses',
        items: [
          {
            mark: 'Ant.',
            text: {
              primary: 'Sede o meu auxiliador * e o meu libertador.',
              secondary: 'Adiútor meus * et liberátor meus.',
            },
          },
        ],
      },
      { type: 'verses', items: [{ role: 'v' }, { role: 'r' }] },
    ])
  })

  it('opens a new paragraph at each lowercase v./r. line', () => {
    const out = mapItemsToPrimitives([
      'r. Em Roma, santo Anastácio.\nr. Em Anagni, as santas Virgens.',
    ])
    expect(out).toEqual([
      { type: 'text', markup: 'do', text: { primary: 'Em Roma, santo Anastácio.' } },
      { type: 'text', markup: 'do', text: { primary: 'Em Anagni, as santas Virgens.' } },
    ])
  })

  it('leads a responsory or blessing with its red label', () => {
    const out = mapItemsToPrimitives([
      'R.br. Cristo Filho de Deus vivo.\nBênção. O Senhor nos abençoe.',
    ])
    expect(out).toMatchObject([
      {
        type: 'verses',
        items: [{ mark: '℟.br.', text: { primary: 'Cristo Filho de Deus vivo.' } }],
      },
      { type: 'verses', items: [{ mark: 'Bênção.', text: { primary: 'O Senhor nos abençoe.' } }] },
    ])
  })

  it('pairs stanza by stanza so one longer stanza keeps its neighbours paired', () => {
    const out = mapItemsToPrimitives(
      [
        'v. Da terra és esperança,\nDo céu já és o brilho;\n_\nr. A glória seja ao Pai,\nAgora e sempre. Amém.',
      ],
      [
        'v. Ætérna cæli glória,\nBeáta spes mortálium,\n_\nr. Deo Patri sit glória,\nIn sempitérna sǽcula.\nAmen.',
      ],
    )
    expect(out[0]).toMatchObject({
      type: 'text',
      text: {
        primary: 'Da terra és esperança,\nDo céu já és o brilho;',
        secondary: 'Ætérna cæli glória,\nBeáta spes mortálium,',
      },
    })
    expect(out[2]).toMatchObject({
      type: 'text',
      text: { primary: 'A glória seja ao Pai,\nAgora e sempre. Amém.' },
    })
  })

  it("moves a heading's braced source into a note", () => {
    const out = mapItemsToPrimitives(
      ['#Salmos{Laudes:2 Salmos e antífonas  do Saltério}'],
      ['#Psalmi{Laudes:2 Psalmi et antiphonæ ex Psalterio}'],
    )
    expect(out).toEqual([
      {
        type: 'heading',
        text: { primary: 'Salmos', secondary: 'Psalmi' },
        size: 'h1',
        note: {
          primary: 'Laudes:2 Salmos e antífonas do Saltério',
          secondary: 'Laudes:2 Psalmi et antiphonæ ex Psalterio',
        },
      },
    ])
  })

  it('drops inline rubric markers from a rubric line', () => {
    const out = mapItemsToPrimitives(['!/:«Pai Nosso» é dito em segredo:/'])
    expect(out).toEqual([{ type: 'rubric', text: { primary: '«Pai Nosso» é dito em segredo' } }])
  })

  it('falls back to chunk pairing when line structures diverge', () => {
    const out = mapItemsToPrimitives(['One line only.'], ['Linea una.\nLinea altera.'])
    expect(out).toEqual([
      {
        type: 'text',
        markup: 'do',
        text: { primary: 'One line only.', secondary: 'Linea una.\nLinea altera.' },
      },
    ])
  })

  it('renders Latin-only when no vernacular column exists', () => {
    const out = mapItemsToPrimitives(['#Canon', 'Te ígitur, clementíssime Pater.'])
    expect(out).toEqual([
      { type: 'heading', text: { primary: 'Canon' }, size: 'h1' },
      { type: 'text', markup: 'do', text: { primary: 'Te ígitur, clementíssime Pater.' } },
    ])
  })
})
