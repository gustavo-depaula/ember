import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchHearth = vi.fn()
vi.mock('@/lib/hearth', () => ({ fetchHearth }))

const { entriesForVerse, getCommentary, parseHaydockNote, spanForVerse, spanLabel } = await import(
  '../commentary'
)

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
    expect(entriesForVerse(entries, 9)[0].voices[0].text).toMatch(/^He; that is John/)
    expect(entriesForVerse(entries, 6)).toEqual([])
  })

  it('reads the Catena by passage, and not at all outside the Gospels', async () => {
    fetchHearth.mockResolvedValue({
      chapters: {
        '9': [
          { from: 1, to: 7, lecture: 'g10-c001', voices: [{ who: 'Chrysostom', text: 'a' }] },
          { from: 8, to: 17, lecture: 'g10-c002', voices: [{ who: 'Augustine', text: 'b' }] },
        ],
      },
    })

    const entries = await getCommentary('catena', 'john', 9)
    expect(spanForVerse(entries, 12)).toEqual({ from: 8, to: 17 })
    expect(spanLabel({ from: 8, to: 17 })).toBe('8–17')

    expect(await getCommentary('catena', 'genesis', 1)).toEqual([])
    expect(fetchHearth).toHaveBeenCalledTimes(1)
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
