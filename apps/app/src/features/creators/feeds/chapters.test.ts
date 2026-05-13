import { describe, expect, it } from 'vitest'
import { parseInlineChapters, parsePodcastChaptersDoc } from './chapters'

describe('parseInlineChapters', () => {
  it('parses a plain-text Q&A timestamp list', () => {
    const desc = `Episódio sobre confissão.

00:00 Intro
02:30 Pergunta 1: Posso comungar em pecado mortal?
15:42 Pergunta 2: Como confessar pecados esquecidos?
18:00 Encerramento`

    expect(parseInlineChapters(desc)).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 150, title: 'Pergunta 1: Posso comungar em pecado mortal?' },
      { tStart: 942, title: 'Pergunta 2: Como confessar pecados esquecidos?' },
      { tStart: 1080, title: 'Encerramento' },
    ])
  })

  it('parses bracketed timestamps and dash separators', () => {
    const desc = `[00:00] Intro
[12:34] - The question
[34:56] · Closing thoughts`

    expect(parseInlineChapters(desc)).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 754, title: 'The question' },
      { tStart: 2096, title: 'Closing thoughts' },
    ])
  })

  it('parses HH:MM:SS format', () => {
    const desc = `00:00 Intro
01:02:30 Long lecture
02:00:00 Conclusion`

    expect(parseInlineChapters(desc)).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 3750, title: 'Long lecture' },
      { tStart: 7200, title: 'Conclusion' },
    ])
  })

  it('strips simple HTML', () => {
    const desc = `<p>00:00 Intro</p><br/>02:30 Question one`
    expect(parseInlineChapters(desc)).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 150, title: 'Question one' },
    ])
  })

  it('returns empty when fewer than 2 timestamps detected', () => {
    expect(parseInlineChapters('00:00 Intro')).toEqual([])
    expect(parseInlineChapters('No timestamps here')).toEqual([])
  })

  it('drops non-monotonic timestamps', () => {
    const desc = `00:00 First
15:00 Out of order
05:00 Earlier (should drop)
20:00 Later`
    expect(parseInlineChapters(desc)).toEqual([
      { tStart: 0, title: 'First' },
      { tStart: 900, title: 'Out of order' },
      { tStart: 1200, title: 'Later' },
    ])
  })
})

describe('parsePodcastChaptersDoc', () => {
  it('passes through structured chapter data', () => {
    expect(
      parsePodcastChaptersDoc({
        version: '1.2',
        chapters: [
          { startTime: 0, title: 'Intro' },
          { startTime: 90.5, title: 'Question 1' },
        ],
      }),
    ).toEqual([
      { tStart: 0, title: 'Intro' },
      { tStart: 90.5, title: 'Question 1' },
    ])
  })

  it('drops malformed entries', () => {
    expect(
      parsePodcastChaptersDoc({
        chapters: [
          { startTime: 0, title: 'Intro' },
          { startTime: 'oops' as unknown as number, title: 'Bad' },
          { startTime: 100 } as unknown as { startTime: number; title: string },
        ],
      }),
    ).toEqual([{ tStart: 0, title: 'Intro' }])
  })

  it('handles missing chapters array', () => {
    expect(parsePodcastChaptersDoc({})).toEqual([])
  })
})
