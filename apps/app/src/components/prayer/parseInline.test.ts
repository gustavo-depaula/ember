import { describe, expect, it } from 'vitest'
import { parseInline } from './parseMarkdown'

describe('parseInline', () => {
  it('plain text returns single text node', () => {
    expect(parseInline('hello world')).toEqual([{ type: 'text', text: 'hello world' }])
  })

  it('*italic*', () => {
    expect(parseInline('*hello*')).toEqual([{ type: 'italic', text: 'hello' }])
  })

  it('**bold**', () => {
    expect(parseInline('**hello**')).toEqual([{ type: 'bold', text: 'hello' }])
  })

  it('***bolditalic***', () => {
    expect(parseInline('***hello***')).toEqual([{ type: 'bolditalic', text: 'hello' }])
  })

  it('mixed text and *italic*', () => {
    expect(parseInline('before *middle* after')).toEqual([
      { type: 'text', text: 'before ' },
      { type: 'italic', text: 'middle' },
      { type: 'text', text: ' after' },
    ])
  })

  // The Liguori meditation pattern: ***Sumário.** body text.*
  describe('nested bold-italic: ***bold** italic*', () => {
    it('simple case', () => {
      const result = parseInline('***Sumário.** Texto simples.*')
      expect(result).toEqual([
        { type: 'bolditalic', text: 'Sumário.' },
        { type: 'italic', text: ' Texto simples.' },
      ])
    })

    it('with inner *italic* pairs stripped', () => {
      const input = '***Sumário.** Alegremo-nos e digamos-lhe: *Regina coeli, laetare, alleluia!*.*'
      const result = parseInline(input)
      expect(result).toEqual([
        { type: 'bolditalic', text: 'Sumário.' },
        {
          type: 'italic',
          text: ' Alegremo-nos e digamos-lhe: Regina coeli, laetare, alleluia!.',
        },
      ])
    })

    it('with multiple inner *italic* pairs', () => {
      const input = '***Sumário.** Texto *primeiro* e depois *segundo* final.*'
      const result = parseInline(input)
      expect(result[0]).toEqual({ type: 'bolditalic', text: 'Sumário.' })
      expect(result[1].type).toBe('italic')
      expect(result[1].text).not.toContain('*')
      expect(result[1].text).toContain('primeiro')
      expect(result[1].text).toContain('segundo')
    })
  })

  // Regression: a dot after the closing * (`*.`) broke the nested pattern,
  // which expected the paragraph to end at the *.
  it('tolerates trailing punctuation after the closing *', () => {
    const input =
      '***Sumário.** Assim é: só em Deus se acha a verdadeira paz; porque, tendo Deus criado o homem para si, o Bem infinito, só Ele pode fazê-lo contente. Quem quiser gozar esta paz, deve repelir de seu coração tudo que não seja Deus, que feche as portas dos sentidos a todas as criaturas e viva como que morto aos afetos terrestres. É isto exatamente o que o Senhor quis dar a entender aos apóstolos, quando, aparecendo para lhes anunciar a paz, quis ambas as vezes entrar aonde estavam os apóstolos, estando as portas fechadas.*.'
    const result = parseInline(input)
    for (const node of result) {
      expect(node.text).not.toContain('*')
    }
    expect(result[0]).toEqual({ type: 'bolditalic', text: 'Sumário.' })
    expect(result[1].type).toBe('italic')
    expect(result[1].text).toContain('estando as portas fechadas.')
  })

  it('bold section marker', () => {
    expect(parseInline('**I.** Refere São João')).toEqual([
      { type: 'bold', text: 'I.' },
      { type: 'text', text: ' Refere São João' },
    ])
  })

  it('italic span mid-sentence', () => {
    const input =
      'Com estas palavras quis Jesus Cristo dar-nos a entender "*que Ele é a nossa paz*".'
    const result = parseInline(input)
    expect(result).toEqual([
      { type: 'text', text: 'Com estas palavras quis Jesus Cristo dar-nos a entender "' },
      { type: 'italic', text: 'que Ele é a nossa paz' },
      { type: 'text', text: '".' },
    ])
  })
})
