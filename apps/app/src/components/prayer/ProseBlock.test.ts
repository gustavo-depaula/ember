import { describe, expect, it } from 'vitest'
import { parseMarkdown } from './parseMarkdown'

describe('parseMarkdown', () => {
  it('parses unordered list with - prefix', () => {
    const result = parseMarkdown('- Alpha\n- Beta\n- Gamma')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [
          [{ type: 'text', text: 'Alpha' }],
          [{ type: 'text', text: 'Beta' }],
          [{ type: 'text', text: 'Gamma' }],
        ],
      },
    ])
  })

  it('parses unordered list with * prefix', () => {
    const result = parseMarkdown('* One\n* Two')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ type: 'text', text: 'One' }], [{ type: 'text', text: 'Two' }]],
      },
    ])
  })

  it('parses ordered list with N. prefix', () => {
    const result = parseMarkdown('1. First\n2. Second\n3. Third')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: true,
        items: [
          [{ type: 'text', text: 'First' }],
          [{ type: 'text', text: 'Second' }],
          [{ type: 'text', text: 'Third' }],
        ],
      },
    ])
  })

  it('parses ordered list with N.° prefix', () => {
    const result = parseMarkdown('1.° Primeiro\n2.° Segundo')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: true,
        items: [[{ type: 'text', text: 'Primeiro' }], [{ type: 'text', text: 'Segundo' }]],
      },
    ])
  })

  it('parses ordered list with N.ª prefix', () => {
    const result = parseMarkdown('1.ª Há um só Deus.\n2.ª Em Deus há três pessoas.')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: true,
        items: [
          [{ type: 'text', text: 'Há um só Deus.' }],
          [{ type: 'text', text: 'Em Deus há três pessoas.' }],
        ],
      },
    ])
  })

  it('parses inline formatting inside list items', () => {
    const result = parseMarkdown('- **bold** text\n- *italic* text')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [
          [
            { type: 'bold', text: 'bold' },
            { type: 'text', text: ' text' },
          ],
          [
            { type: 'italic', text: 'italic' },
            { type: 'text', text: ' text' },
          ],
        ],
      },
    ])
  })

  it('keeps consecutive different list types separate', () => {
    const result = parseMarkdown('- Unordered\n\n1. Ordered')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ type: 'text', text: 'Unordered' }]],
      },
      {
        type: 'list',
        ordered: true,
        items: [[{ type: 'text', text: 'Ordered' }]],
      },
    ])
  })

  it('flushes list when switching type without blank line', () => {
    const result = parseMarkdown('- Bullet\n1. Number')
    expect(result).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ type: 'text', text: 'Bullet' }]],
      },
      {
        type: 'list',
        ordered: true,
        items: [[{ type: 'text', text: 'Number' }]],
      },
    ])
  })

  it('parses mixed content: heading, list, paragraph', () => {
    const result = parseMarkdown('## Title\n\n1. Item one\n2. Item two\n\nSome text.')
    expect(result).toEqual([
      { type: 'heading', level: 2, text: 'Title' },
      {
        type: 'list',
        ordered: true,
        items: [[{ type: 'text', text: 'Item one' }], [{ type: 'text', text: 'Item two' }]],
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Some text.' }],
      },
    ])
  })

  it('still parses paragraphs, headings, and blockquotes', () => {
    const result = parseMarkdown('# Heading\n\nA paragraph.\n\n> A quote')
    expect(result).toEqual([
      { type: 'heading', level: 1, text: 'Heading' },
      { type: 'paragraph', children: [{ type: 'text', text: 'A paragraph.' }] },
      {
        type: 'blockquote',
        children: [{ type: 'text', text: 'A quote' }],
      },
    ])
  })

  it('merges consecutive blockquote lines into one node', () => {
    const result = parseMarkdown('> Line one\n> Line two\n> Line three')
    expect(result).toEqual([
      {
        type: 'blockquote',
        children: [{ type: 'text', text: 'Line one\nLine two\nLine three' }],
      },
    ])
  })

  it('handles bare > continuation lines in blockquotes', () => {
    const result = parseMarkdown('> First paragraph\n>\n> Second paragraph')
    expect(result).toEqual([
      {
        type: 'blockquote',
        children: [{ type: 'text', text: 'First paragraph\n\nSecond paragraph' }],
      },
    ])
  })

  it('strips footnote references from text', () => {
    const result = parseMarkdown('Some text [^1] and more [^23].')
    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Some text and more.' }],
      },
    ])
  })

  it('skips footnote definition lines', () => {
    const result = parseMarkdown('A paragraph.\n\n[^1]: Some source reference.')
    expect(result).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'A paragraph.' }] },
    ])
  })

  it('parses full meditation with blockquote, ***Sumário.** pattern, and inner italic', () => {
    const input = [
      '> *Secundum multitudinem dolorum meorum in corde meo, consolationes tuae laetificaverunt animam meam* – "Segundo as muitas dores que provou o meu coração, as tuas consolações alegraram a minha alma" (Sl 93, 19)',
      '',
      '***Sumário.** Era de justiça que Maria Santíssima, que mais do que qualquer outro tomou parte na Paixão de Jesus Cristo, fosse também a primeira a gozar da alegria da sua ressurreição. Imaginemos vê-la no momento em que lhe aparece o divino Redentor glorificado, acompanhado de grande multidão de Santos, entre os quais São José, São Joaquim e Santa Ana. Oh! Que ternos abraços! Que doces colóquios! Alegremo-nos com a nossa querida Mãe e digamos-lhe: *Regina coeli, laetare, alleluia — "Rainha dos céus, alegrai-vos, aleluia!"*.*',
    ].join('\n')

    const result = parseMarkdown(input)

    // Blockquote: italic Latin text + plain Portuguese translation
    expect(result[0]).toEqual({
      type: 'blockquote',
      children: [
        {
          type: 'italic',
          text: 'Secundum multitudinem dolorum meorum in corde meo, consolationes tuae laetificaverunt animam meam',
        },
        {
          type: 'text',
          text: ' – "Segundo as muitas dores que provou o meu coração, as tuas consolações alegraram a minha alma" (Sl 93, 19)',
        },
      ],
    })

    // Paragraph: bolditalic "Sumário." then italic body (inner *...* markers stripped)
    expect(result[1].type).toBe('paragraph')
    if (result[1].type === 'paragraph') {
      expect(result[1].children[0]).toEqual({ type: 'bolditalic', text: 'Sumário.' })
      expect(result[1].children[1].type).toBe('italic')
      // No literal * should appear in the rendered text
      expect(result[1].children[1].text).not.toContain('*')
      // Inner *Regina coeli...* markers are stripped (italic-within-italic)
      expect(result[1].children[1].text).toContain('Regina coeli')
      expect(result[1].children[1].text).toContain('.')
    }
  })

  it('***Sumário.** pattern: no literal * in output', () => {
    const input =
      '***Sumário.** Era de justiça, fosse também a primeira a gozar: *Regina coeli, laetare, alleluia!*.*'
    const result = parseMarkdown(input)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('paragraph')
    if (result[0].type === 'paragraph') {
      // No child should contain a literal * character
      for (const child of result[0].children) {
        expect(child.text).not.toContain('*')
      }
      expect(result[0].children[0]).toEqual({ type: 'bolditalic', text: 'Sumário.' })
      expect(result[0].children[1]).toEqual({
        type: 'italic',
        text: ' Era de justiça, fosse também a primeira a gozar: Regina coeli, laetare, alleluia!.',
      })
    }
  })

  it('simple ***Sumário.** short text* without inner italic', () => {
    const result = parseMarkdown('***Sumário.** Texto simples.*')
    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'bolditalic', text: 'Sumário.' },
          { type: 'italic', text: ' Texto simples.' },
        ],
      },
    ])
  })

  it('still parses ***bolditalic*** after adding nested bold-italic support', () => {
    const result = parseMarkdown('***all three***')
    expect(result).toEqual([
      { type: 'paragraph', children: [{ type: 'bolditalic', text: 'all three' }] },
    ])
  })

  it('strips footnotes from blockquotes', () => {
    const result = parseMarkdown('> A quote with ref [^2]')
    expect(result).toEqual([
      {
        type: 'blockquote',
        children: [{ type: 'text', text: 'A quote with ref' }],
      },
    ])
  })
})
