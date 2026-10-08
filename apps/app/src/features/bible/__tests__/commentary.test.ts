import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchHearth = vi.fn()
const loadBookChapterText = vi.fn()
vi.mock('@/lib/hearth', () => ({ fetchHearth }))
vi.mock('@/content/books', () => ({ loadBookChapterText }))

// The Catena as the repo has it: the lectures and the table that names the Fathers.
const content = join(__dirname, '../../../../../../content')
const fathers = JSON.parse(readFileSync(join(content, 'bible/catena/fathers.json'), 'utf8'))
const lecture = (gospel: string, id: string) =>
  readFileSync(
    join(content, 'books/aquinas-opera-omnia/catena-aurea', gospel, 'en-US', `${id}.md`),
    'utf8',
  )

const {
  entriesForVerse,
  excerpt,
  getCommentary,
  loadVoices,
  parseCatenaLecture,
  parseHaydockNote,
  spanForVerse,
  spanLabel,
} = await import('../commentary')

beforeEach(() => {
  fetchHearth.mockReset()
})

describe('parseHaydockNote', () => {
  it('splits the commentators and leaves out the apparatus in braces', () => {
    const note =
      'In the beginning was the word:{ Ver. 1. Et Deus erat Verbum, kai theos en o logos.|} or rather, the word was in the beginning. (Witham) — The Greek for the word is Logos. (Bible de Vence)'
    expect(parseHaydockNote(note)).toEqual([
      { text: 'In the beginning was the word: or rather, the word was in the beginning. (Witham)' },
      { text: 'The Greek for the word is Logos. (Bible de Vence)' },
    ])
  })
})

describe('getCommentary', () => {
  it('reads Haydock by verse, a note on several verses as a span', async () => {
    fetchHearth.mockResolvedValue({
      '1': {
        '8-9': ['He; that is John the Baptist. (Witham)'],
        '7': ['That all men.'],
        '0': ['On the chapter.'],
      },
    })

    const entries = await getCommentary('haydock', 'john', 1)

    expect(fetchHearth).toHaveBeenCalledWith('bible/haydock/john.json')
    expect(entries.map((e) => [e.from, e.to])).toEqual([
      [0, 0],
      [7, 7],
      [8, 9],
    ])
    expect(entriesForVerse(entries, 9)[0].voices?.[0].text).toMatch(/^He; that is John/)
    expect(entriesForVerse(entries, 6)).toEqual([])
  })

  it('reads the Catena by passage, its words from the book, and not at all outside the Gospels', async () => {
    fetchHearth.mockImplementation(async (path: string) =>
      path.endsWith('fathers.json')
        ? fathers
        : {
            book: 'aquinas-catena-aurea-john',
            chapters: {
              '9': [
                { from: 1, to: 7, lecture: 'g10-c001' },
                { from: 8, to: 17, lecture: 'g10-c002' },
              ],
            },
          },
    )
    loadBookChapterText.mockResolvedValue(lecture('john', 'g10-c002'))

    const entries = await getCommentary('catena', 'john', 9)
    expect(spanForVerse(entries, 12)).toEqual({ from: 8, to: 17 })
    expect(spanLabel({ from: 8, to: 17 })).toBe('8–17')

    const voices = await loadVoices(entriesForVerse(entries, 12)[0])
    expect(loadBookChapterText).toHaveBeenCalledWith(
      'aquinas-catena-aurea-john',
      'g10-c002',
      'en-US',
    )
    expect(voices[0].who).toBe('Chrysostom')
    expect(voices[0].text).toMatch(/^The suddenness of the miracle/)

    expect(await getCommentary('catena', 'genesis', 1)).toEqual([])
  })

  it('marks the whole of every passage on a verse commented more than once', () => {
    const entries = [
      { from: 1, to: 1, voices: [] },
      { from: 1, to: 2, voices: [] },
      { from: 3, to: 3, voices: [] },
    ]
    expect(spanForVerse(entries, 1)).toEqual({ from: 1, to: 2 })
    expect(spanForVerse(entries, 4)).toBeUndefined()
  })
})

describe('excerpt', () => {
  it('keeps whole voices while they fit, and cuts the next at a sentence', () => {
    const voices = [
      { who: 'Chrysostom', text: 'A short remark.' },
      { who: 'Augustine', text: `${'First sentence here. '.repeat(10)}Tail without end` },
    ]
    const { voices: kept, cut } = excerpt(voices, 120)
    expect(cut).toBe(true)
    expect(kept[0]).toEqual(voices[0])
    expect(kept[1].who).toBe('Augustine')
    expect(kept[1].text.endsWith('here.')).toBe(true)
    expect(kept[1].text.length).toBeLessThanOrEqual(105)
  })

  it('leaves a note that fits whole', () => {
    expect(excerpt([{ text: 'Brief.' }], 700)).toEqual({ voices: [{ text: 'Brief.' }], cut: false })
  })
})

// Each Gospel's Catena was transcribed by other hands, and attributes differently.
describe('parseCatenaLecture', () => {
  const opening = (gospel: string, id: string) =>
    parseCatenaLecture(lecture(gospel, id), fathers)
      .slice(0, 3)
      .map((v) => [v.who, v.text.slice(0, 28)])

  it('reads "CHRYS …" (John) and leaves the passage itself out', () => {
    expect(opening('john', 'g10-c002')).toEqual([
      ['Chrysostom', 'The suddenness of the miracl'],
      ['Augustine', 'His eyes being opened had al'],
      ['Chrysostom', 'He was not ashamed of his fo'],
    ])
  })

  it('reads "Chrys. …" and "Gloss. ord." (Matthew)', () => {
    expect(opening('matthew', 'g4-c002').map(([who]) => who)).toEqual([
      'Augustine',
      'The Gloss',
      'Pseudo-Chrysostom',
    ])
  })

  it('reads "**Pseudo-Jerome**: …" (Mark) and "**BEDE**; …" (Luke)', () => {
    expect(opening('mark', 'ch01-l04')[0][0]).toBe('Pseudo-Jerome')
    expect(opening('luke', 'g2-c003')[0]).toEqual(['Bede', 'The Lord appointed by the ha'])
  })

  it("keeps a Father's further paragraphs with him", () => {
    const voices = parseCatenaLecture(lecture('john', 'g2-c001'), fathers)
    const augustine = voices.find((v) => v.text.includes('Now whoever can conceive'))
    expect(augustine?.who).toBe('Augustine')
    expect(augustine?.text.split('\n\n').length).toBeGreaterThan(1)
  })
})
