import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { translations } from '@/lib/bibleTranslations'
import { getChapter } from '@/lib/content'

import { carryPlace, getVersification, whereChapterWent } from '../versification'
import { getChapterWords, lookUp } from '../words'

// The built corpus (`pnpm build:corpus`), as the app reads it.
const bible = resolve(__dirname, '../../../../../../_site/hearth/v2/bible')
const read = (path: string) => JSON.parse(readFileSync(resolve(bible, path), 'utf-8'))

const greek = translations.filter((tr) => tr.language === 'GRC')

describe('the Greek editions’ versification', () => {
  // A table entry that names a verse the edition lacks, or a Vulgate verse
  // that is not there, sends the reader's commentary to nowhere.
  it.each(greek.filter((tr) => tr.versification))('$name maps real verses onto real ones', (tr) => {
    const table: Record<string, Record<string, string | null>> = read(
      `${tr.corpus}/versification.json`,
    )
    for (const [book, verses] of Object.entries(table)) {
      const own = read(`${tr.corpus}/${book}.json`)
      const vulgate = read(`vulgate/${book}.json`)
      for (const [from, to] of Object.entries(verses)) {
        const [c, v] = from.split(':')
        expect(own[c]?.[v], `${tr.code} ${book} ${from}`).toBeDefined()
        if (to === null) continue
        const [tc, tv] = to.split(':')
        expect(vulgate[tc]?.[tv], `${tr.code} ${book} ${from} → ${to}`).toBeDefined()
      }
    }
  })

  it('brings the Byzantine doxology of Romans to where the Vulgate has it', async () => {
    const byzantine = await getVersification('RP')
    const doxology = { bookId: 'romans', chapter: 14, verse: 24 }
    expect(byzantine.toShared(doxology)).toEqual({ bookId: 'romans', chapter: 16, verse: 25 })
    expect(byzantine.fromShared({ bookId: 'romans', chapter: 16, verse: 25 })).toEqual(doxology)
  })
})

describe('the Greek editions’ words', () => {
  it.each(greek.filter((tr) => tr.words))('$name has a word entry for every word', (tr) => {
    for (const file of readdirSync(resolve(bible, tr.corpus as string, 'words'))) {
      const text = read(`${tr.corpus}/${file}`)
      const words = read(`${tr.corpus}/words/${file}`)
      for (const [c, verses] of Object.entries<Record<string, string>>(text)) {
        for (const [v, verse] of Object.entries(verses)) {
          expect(words[c]?.[v]?.length, `${tr.code} ${file} ${c}:${v}`).toBe(
            verse.split(/\s+/).length,
          )
        }
      }
    }
  })

  it('reads John 1:1 word by word, and finds the Word in the lexicon', async () => {
    const words = await getChapterWords('N1904', 'john', 1)
    expect(words?.[1].slice(0, 5)).toEqual([
      ['ἐν', 'PREP', 'In [the]'],
      ['ἀρχή', 'N-DSF', 'beginning'],
      ['εἰμί', 'V-IAI-3S', 'was'],
      ['ὁ', 'T-NSM', 'the'],
      ['λόγος', 'N-NSM', 'Word'],
    ])
    const [entry] = await lookUp('dodson', 'λόγος')
    expect(entry.lemma).toBe('λόγος')
    expect(entry.gloss).toMatch(/word/)
  })

  it('ranks the homograph spelled as the lemma first', async () => {
    const [be] = await lookUp('middle-liddell', 'εἰμί')
    const [go] = await lookUp('middle-liddell', 'εἶμι')
    expect(be.lemma).toBe('εἰμί')
    expect(go.lemma).toBe('εἶμι')
  })
})

describe('the Septuagint', () => {
  it('carries the cup of wrath from its Jeremiah 32 to the Vulgate’s chapter 25', async () => {
    const septuagint = await getVersification('LXX')
    expect(septuagint.toShared({ bookId: 'jeremias', chapter: 32, verse: 15 })).toEqual({
      bookId: 'jeremias',
      chapter: 25,
      verse: 15,
    })
    expect(await carryPlace('LXX', 'DRB', 'jeremias', 32)).toEqual({
      bookId: 'jeremias',
      chapter: 25,
    })
  })

  it('finds where it put a chapter it has no page for', async () => {
    // Proverbs 30 of the Vulgate stands inside the Septuagint's chapter 24.
    const septuagint = await getVersification('LXX')
    expect(whereChapterWent(septuagint, 'proverbs', 30)).toEqual({
      bookId: 'proverbs',
      chapter: 24,
      verse: 35,
    })
    expect(whereChapterWent(septuagint, 'proverbs', 10)).toBeUndefined()
  })

  it('reads the Old Testament of a Greek New Testament', async () => {
    const genesis = await getChapter('N1904', 'genesis', 1)
    expect(genesis.edition).toBe('LXX')
    expect(genesis.fallback).toBeUndefined()
    expect(genesis.verses[0].text).toMatch(/ἀρχῇ ἐποίησεν ὁ Θεὸς/)
  })
})

describe('a Greek chapter', () => {
  it('is read in the edition’s own numbering', async () => {
    const chapter = await getChapter('N1904', 'john', 1)
    expect(chapter.edition).toBe('N1904')
    expect(chapter.verses[0].text).toMatch(/^Ἐν ἀρχῇ ἦν ὁ Λόγος/)
  })
})
