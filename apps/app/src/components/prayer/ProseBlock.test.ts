import { describe, expect, it } from 'vitest'
import { parseMarkdown } from './ProseBlock'

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
})
