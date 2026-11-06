import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { type AccentTable, accentOf, accentSystem } from '../hebrew/accents'
import { grammarTerms } from '../hebrew/morphology'
import { hebrewTokens, type MorphFields } from '../hebrew/words'
import { buildVersification, getVersification, type VerseMap } from '../versification'

// The built corpus (`pnpm build:corpus`), as the app reads it.
const bible = resolve(__dirname, '../../../../../../_site/hearth/v2/bible')
const read = (path: string) => JSON.parse(readFileSync(resolve(bible, path), 'utf-8'))
const corpus = 'hebrew-wlc'

type Piece = [dStrong: string, gloss: string, morph: string, text: string]
type Entry = { p: Piece[]; t?: string; q?: string; w?: string; j?: 1 }

const tokens = hebrewTokens

const books = (read(`${corpus}/index.json`) as { slug: string }[]).map((b) => b.slug)
const verseMap: VerseMap = read(`${corpus}/versification.json`)
const versification = buildVersification(verseMap)

describe('the Hebrew Bible’s versification', () => {
  // A table entry that names a verse the codex lacks, or a Vulgate verse that
  // is not there, sends the reader's commentary to nowhere.
  it('maps real verses onto real ones', () => {
    for (const [book, verses] of Object.entries(verseMap)) {
      const own = read(`${corpus}/${book}.json`)
      // The shared address is the Douay's numbering (scripts/bible_address.py).
      const douay = read(`drb/${book}.json`)
      for (const [from, to] of Object.entries(verses)) {
        const [c, v] = from.split(':')
        expect(own[c]?.[v], `${book} ${from}`).toBeDefined()
        if (to === null) continue
        const [tc, tv] = to.split(':')
        expect(douay[tc]?.[tv], `${book} ${from} → ${to}`).toBeDefined()
      }
    }
  })

  it.each([
    ['psalms', 23, 1, 22, 1],
    ['psalms', 116, 10, 115, 10],
    ['malachias', 3, 19, 4, 1],
    ['joel', 3, 1, 2, 28],
    ['3-kings', 5, 1, 4, 21],
    ['daniel', 3, 31, 3, 98],
  ])('sends %s %i:%i to the Douay’s %i:%i', (bookId, chapter, verse, vc, vv) => {
    expect(versification.toShared({ bookId, chapter, verse })).toEqual({
      bookId,
      chapter: vc,
      verse: vv,
    })
    expect(versification.fromShared({ bookId, chapter: vc, verse: vv })).toEqual({
      bookId,
      chapter,
      verse,
    })
  })
})

describe('the Hebrew Bible’s words', () => {
  it('has one entry for every token, and every studied token has a gloss', () => {
    expect(books).toHaveLength(39)
    const files = readdirSync(resolve(bible, corpus, 'words'))
    expect(files).toHaveLength(39)
    for (const book of books) {
      const text = read(`${corpus}/${book}.json`)
      const words = read(`${corpus}/words/${book}.json`)
      for (const [c, verses] of Object.entries<Record<string, string>>(text)) {
        for (const [v, verse] of Object.entries(verses)) {
          const toks = tokens(verse)
          const entries: Entry[] = words[c]?.[v] ?? []
          expect(entries.length, `${book} ${c}:${v}`).toBe(toks.length)
          entries.forEach((entry, i) => {
            const at = `${book} ${c}:${v} #${i} ${toks[i]}`
            if (entry.p.length > 0) {
              expect(
                entry.p.some(([, gloss]) => gloss !== ''),
                at,
              ).toBe(true)
              return
            }
            // A token with nothing to study is one of three things, never a gap:
            // the paseq or the inverted nun; the second half of a word the
            // study keeps whole on the token before; or a word written but
            // not read.
            const punctuation = toks[i] === '׀' || toks[i] === '׆'
            const joined = entry.j === 1
            const unread = entry.w !== undefined && entry.q === ''
            expect(punctuation || joined || unread, at).toBe(true)
          })
        }
      }
    }
  })

  it('reads Genesis 1:1 in its pieces', () => {
    const [first]: Entry[] = read(`${corpus}/words/genesis.json`)['1']['1']
    expect(first.p.map(([d, gloss]) => [d, gloss])).toEqual([
      ['H9003', 'in'],
      ['H7225G', 'beginning'],
    ])
    expect(first.p.map(([, , , text]) => text).join('')).toBe(
      tokens(read(`${corpus}/genesis.json`)['1']['1'])[0],
    )
  })

  it('shows Psalm 100:3 as written, and studies it as read', () => {
    const text = read(`${corpus}/psalms.json`)['100']['3']
    const entries: Entry[] = read(`${corpus}/words/psalms.json`)['100']['3']
    const i = entries.findIndex((entry) => entry.w !== undefined)
    // Written "and not" (ולא), read "and his" (וְלוֹ).
    expect(entries[i].w).toBe('ולא')
    expect(entries[i].q?.normalize('NFD').replace(/[֑-֯]/g, '')).toBe('וְלוֹ'.normalize('NFD'))
    expect(tokens(text)[i].replace(/[^א-ת]/g, '')).toBe('ולא')
    expect(entries[i].p.map(([, gloss]) => gloss)).toContain('him')
  })

  it('glosses God’s Name as it is read, and never pronounces it', () => {
    // מִזְמוֹר לְדָוִד יְהוָה רֹעִי: "A psalm of David. The LORD is my shepherd."
    const [, , name]: Entry[] = read(`${corpus}/words/psalms.json`)['23']['1']
    expect(name.p[0][0]).toMatch(/^H3068/)
    expect(name.p[0][1]).toBe('the LORD')
    expect(name.t).toBe('YHWH')
  })
})

describe('the Hebrew lexicons', () => {
  it('finds בְּרֵאשִׁית’s word in BDB and its root family', () => {
    const bdb = read('lexicon-hebrew/bdb/14.json')
    expect(bdb.H7225G.lemma).toBe('רֵאשִׁית')
    const roots = read('lexicon-hebrew/roots.json')
    const families = read('lexicon-hebrew/families.json')
    const family = families[roots.H7225G]
    expect(family.members.map((m: { d: string }) => m.d)).toEqual(
      expect.arrayContaining(['H7218A', 'H7223G', 'H7225G']),
    )
  })

  it('lists every occurrence with its grammar', () => {
    const shard = read(`${corpus}/concordance/14.json`)
    expect(shard.H7225G[0]).toEqual(['genesis', 1, 1, 'HNcfsa'])
    const counts = read(`${corpus}/concordance/counts.json`)
    expect(counts.H7225G).toBe(shard.H7225G.length)
  })
})

describe('reading the Hebrew', () => {
  const accents: AccentTable = read(`${corpus}/accents.json`)
  const verse = (book: string, chapter: number, n: number) =>
    tokens(read(`${corpus}/${book}.json`)[chapter][n] as string)
  const accentAt = (book: string, chapter: number, n: number, index: number) =>
    accentOf(accents, accentSystem(accents, book, chapter, n), verse(book, chapter, n), index)

  // A wrong accent tells a student the verse divides where it does not.
  it('names the accents that divide a prose verse', () => {
    // בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים … הָאָֽרֶץ׃
    expect(accentAt('genesis', 1, 1, 0)?.accent.name).toBe('Ṭiphḥā')
    expect(accentAt('genesis', 1, 1, 1)).toMatchObject({ kind: 'conjunctive', inPause: false })
    expect(accentAt('genesis', 1, 1, 2)).toMatchObject({ inPause: true })
    expect(accentAt('genesis', 1, 1, 2)?.accent.name).toBe('ʾAthnâḥ')
    expect(accentAt('genesis', 1, 1, 6)?.accent.name).toBe('Sillûq')
  })

  it('reads the Psalms by the poetic system', () => {
    expect(accentSystem(accents, 'psalms', 23, 1)).toBe('poetic')
    expect(accentSystem(accents, 'job', 1, 1)).toBe('prose')
    expect(accentSystem(accents, 'job', 3, 2)).toBe('poetic')
    // יְהוָ֥ה רֹ֝עִ֗י: Rebhîaʿ with Gèreš on the same word.
    const shepherd = verse('psalms', 23, 1).findIndex((t) => t.startsWith('רֹ'))
    expect(accentAt('psalms', 23, 1, shepherd)?.accent.name).toBe('Rebhîaʿ mugrāš')
  })

  it('parses a verb as grammarians write it', () => {
    const morphology: Record<string, MorphFields> = read(`${corpus}/morphology.json`)
    expect(grammarTerms(morphology.HVqw3ms)).toBe('Qal wayyiqtol 3ms')
    expect(grammarTerms(morphology.HNcfsa)).toBeUndefined()
  })
})

describe('the shared address', () => {
  // The Douay numbers ten chapters otherwise than the corpus Vulgate, and its
  // numbering is the one the commentary and the lectionary use: every
  // edition must land on the Douay's verse, or the pane shows the wrong one.
  it.each([
    ['VULG', 'psalms', 115, 1],
    ['LXX', 'psalms', 115, 1],
    ['WLC', 'psalms', 116, 10],
  ] as const)('%s %s %i:%i is the Douay’s Psalm 115:10', async (code, bookId, chapter, verse) => {
    const map = await getVersification(code)
    expect(map.toShared({ bookId, chapter, verse })).toEqual({
      bookId: 'psalms',
      chapter: 115,
      verse: 10,
    })
  })

  it('gives each Douay verse of a verse the Vulgate joins its own place', async () => {
    const hebrew = await getVersification('WLC')
    // Genesis 5:32, Noe's sons: the Vulgate's 5:31 holds it, the Douay's 5:32 is it.
    expect(hebrew.toShared({ bookId: 'genesis', chapter: 5, verse: 32 })).toEqual({
      bookId: 'genesis',
      chapter: 5,
      verse: 32,
    })
    // Isaiah 45:24 "in the Lord are my justices" is the Douay's 45:25.
    expect(hebrew.toShared({ bookId: 'isaias', chapter: 45, verse: 24 })).toEqual({
      bookId: 'isaias',
      chapter: 45,
      verse: 25,
    })
  })
})
