import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseAveMariaChapter } from './aveMaria'

// A real response, cut down to a few verses, so an API change shows up here.
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
