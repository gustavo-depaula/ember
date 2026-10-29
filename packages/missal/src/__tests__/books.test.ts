import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bookOf, withBook } from '../books'
import { lineText } from '../text'
import type { Lectionary } from '../types'

describe('withBook', () => {
  it('puts the announced book before a bare chapter and verse', () => {
    expect(
      withBook('6, 12-19', 'Proclamação do Evangelho de Jesus Cristo segundo Lucas', 'pt-BR'),
    ).toBe('Lc 6, 12-19')
    expect(withBook('6:12-19', 'A reading from the holy Gospel according to Luke', 'en-US')).toBe(
      'Lk 6:12-19',
    )
    expect(withBook('2, 19-22', 'Leitura da Carta de São Paulo aos Efésios', 'pt-BR')).toBe(
      'Ef 2, 19-22',
    )
  })

  it('tells the numbered books apart', () => {
    expect(bookOf('Leitura da Segunda Carta de São Paulo aos Coríntios', 'pt-BR')).toBe('2Cor')
    expect(bookOf('A reading from the first Letter of Saint John', 'en-US')).toBe('1 Jn')
    expect(bookOf('Leitura do Livro do Apocalipse de São João', 'pt-BR')).toBe('Ap')
    expect(bookOf('Paixão de Nosso Senhor Jesus Cristo segundo São João.', 'pt-BR')).toBe('Jo')
    expect(bookOf('Leitura do Livro do Eclesiástico', 'pt-BR')).toBe('Eclo')
    expect(bookOf('Leitura do Livro do Eclesiastes', 'pt-BR')).toBe('Ecl')
    expect(bookOf('Leitura do Livro de Jó', 'pt-BR')).toBe('Jó')
  })

  it('leaves a citation that names its book as it is', () => {
    expect(withBook('Sl 18, 2-3. 4-5 (R.: 5a)', 'Salmo Responsorial', 'pt-BR')).toBe(
      'Sl 18, 2-3. 4-5 (R.: 5a)',
    )
    expect(withBook('1Jo 2, 3-11', 'Leitura da Primeira Carta de São João', 'pt-BR')).toBe(
      '1Jo 2, 3-11',
    )
  })

  // Every reading the lectionary cites by chapter alone gets its book back.
  it('finds the book of every announced reading in the lectionary', () => {
    const dir = new URL('../../../../content/missal/lectionary/', import.meta.url)
    const missed = new Set<string>()
    for (const file of readdirSync(dir)) {
      const doc = JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as Lectionary
      for (const item of doc.items) {
        for (const lang of ['pt-BR', 'en-US'] as const) {
          for (const block of item.text?.[lang] ?? []) {
            if (block.role !== 'announcement' || !block.cite || !/^\s*\d/.test(block.cite)) continue
            const announcement = block.lines.map(lineText).join(' ')
            if (!bookOf(announcement, lang)) missed.add(`${lang}: ${announcement}`)
          }
        }
      }
    }
    expect([...missed]).toEqual([])
  })
})
