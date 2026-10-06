import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseAveMariaChapter } from './aveMaria'
import { parseKnoxChapter } from './knox'
import { parseMatosSoaresChapter } from './matosSoares'

// Real responses, cut down to a few verses, so a site redesign shows up here.
const fixture = (name: string) => readFileSync(join(__dirname, '__fixtures__', name), 'utf8')

describe('Ave Maria (Claretian API)', () => {
  const verses = parseAveMariaChapter(JSON.parse(fixture('ave-maria-joao-1.json')))

  it('reads verses and drops footnote asterisks', () => {
    expect(verses[0]).toEqual({
      verse: 1,
      text: 'No princípio era o Verbo, e o Verbo estava junto de Deus e o Verbo era Deus.',
    })
  })

  it('drops synoptic parallels and a dangling dialogue dash', () => {
    expect(verses.find((v) => v.verse === 18)?.text).toBe(
      'Ninguém jamais viu Deus. O Filho único, que está no seio do Pai, foi quem o revelou.',
    )
    expect(verses.find((v) => v.verse === 20)?.text).toMatch(/“Eu não sou o Cristo”\.$/)
  })
})

describe('Matos Soares (Lírio Católico)', () => {
  const verses = parseMatosSoaresChapter(fixture('lirio-matos-soares-joao-1.html'))

  it('reads each verse without its number, buttons or footnote call', () => {
    expect(verses.map((v) => v.verse)).toEqual([1, 2, 3, 51])
    expect(verses[1].text).toBe('Estava no princípio junto de Deus,')
  })
})

describe('Knox (catholicbible.online)', () => {
  it('reads each verse without its footnote mark', () => {
    const verses = parseKnoxChapter(fixture('knox-john-1.html'))
    expect(verses.map((v) => v.verse)).toEqual([1, 2, 51])
    expect(verses[2].text).toMatch(/upon the Son of Man\.$/)
  })

  it('keeps a psalm title apart from the line that follows it', () => {
    const verses = parseKnoxChapter(fixture('knox-psalm-22.html'))
    expect(verses[0].text).toBe(
      '(A psalm. Of David.) The Lord is my shepherd; how can I lack anything?',
    )
  })
})
