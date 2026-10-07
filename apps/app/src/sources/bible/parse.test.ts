import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { parseAveMariaChapter } from './aveMaria'
import { decodeWindows1252, parseClerusPage } from './cnbb'

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

// Fragments of real Biblia Clerus pages, one for each way the export loses a number.
describe('CNBB (Biblia Clerus)', () => {
  const bytes = readFileSync(join(__dirname, '__fixtures__', 'cnbb-clerus.htm'))
  const chapters = parseClerusPage(decodeWindows1252(new Uint8Array(bytes)))
  const verse = (chapter: number, n: number) => chapters[chapter].find((v) => v.verse === n)?.text

  it('reads the chapters of a page, without soft hyphens or cross-reference links', () => {
    expect(Object.keys(chapters)).toEqual(['2', '17', '19', '20', '22'])
    expect(verse(19, 1)).toBe(
      'Quando terminou essas palavras, Jesus deixou a Galiléia e foi para a região da Judéia, pelo outro lado do Jordão.',
    )
    expect(verse(19, 2)).toBe('Grandes multidões o acompanhavam, e ali, ele realizava curas.')
  })

  it('finds a verse whose number is only a figure in the text', () => {
    expect(verse(2, 17)).toBe('Assim se cumpriu o que foi dito pelo profeta Jeremias:')
    expect(verse(2, 18)).toMatch(/^“Ouviu-se um grito em Ramá/)
  })

  it('starts the next chapter where the verses begin again unannounced', () => {
    expect(verse(19, 30)).toMatch(/serão primeiros\.$/)
    expect(verse(20, 1)).toMatch(/^Pois o Reino dos Céus/)
  })

  it('leaves out a verse the translation omits', () => {
    expect(verse(17, 20)).toMatch(/Nada vos será impossível”\.$/)
    expect(verse(17, 21)).toBeUndefined()
    expect(verse(17, 22)).toBe('Quando estavam reunidos na Galiléia.')
  })

  it('drops the other numbering’s figures and mends a lost space', () => {
    expect(verse(22, 1)).toMatch(/^\(Se um ladrão .* vingança de sangue\.$/)
    expect(verse(22, 3)).toMatch(/^Se o boi, o jumento ou a ovelha/)
  })
})
