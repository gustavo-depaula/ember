import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  chapterForQuestion,
  extractQuestion,
  programDayToQuestionRange,
  TOTAL_QUESTIONS,
  totalProgramDays,
} from './extract'
import { parseChapter } from './parse'

function loadFixture(slug: 'en' | 'pt'): string {
  return new TextDecoder('iso-8859-1').decode(
    readFileSync(join(__dirname, '..', '__fixtures__', `${slug}.html`)),
  )
}

describe('programDayToQuestionRange', () => {
  it('day 0 (fresh program), 6 Q/day → 1..6', () => {
    expect(programDayToQuestionRange(0, 6)).toEqual([1, 6])
  })

  it('day 1, 6 Q/day → 7..12', () => {
    expect(programDayToQuestionRange(1, 6)).toEqual([7, 12])
  })

  it('straddles Part 1 → Part 2 around Q217/Q218', () => {
    // Day 36 = Qs 217-222 (217 is the last of part-1, 218 starts part-2)
    const [first, last] = programDayToQuestionRange(36, 6)
    expect(first).toBe(217)
    expect(last).toBe(222)
    expect(chapterForQuestion(first)).toBe('part-1')
    expect(chapterForQuestion(last)).toBe('part-2')
  })

  it('final day clamps to 598', () => {
    const total = totalProgramDays(6)
    expect(total).toBe(100)
    const [first, last] = programDayToQuestionRange(total - 1, 6)
    expect(first).toBe(595)
    expect(last).toBe(TOTAL_QUESTIONS)
  })

  it('1 Q/day reaches every question exactly once', () => {
    const total = totalProgramDays(1)
    expect(total).toBe(TOTAL_QUESTIONS)
    expect(programDayToQuestionRange(0, 1)).toEqual([1, 1])
    expect(programDayToQuestionRange(TOTAL_QUESTIONS - 1, 1)).toEqual([
      TOTAL_QUESTIONS,
      TOTAL_QUESTIONS,
    ])
  })

  it('throws for day past the program', () => {
    expect(() => programDayToQuestionRange(100, 6)).toThrow()
  })

  it('throws for invalid inputs', () => {
    expect(() => programDayToQuestionRange(-1, 6)).toThrow()
    expect(() => programDayToQuestionRange(0, 0)).toThrow()
  })
})

describe('chapterForQuestion', () => {
  it.each([
    [1, 'part-1'],
    [217, 'part-1'],
    [218, 'part-2'],
    [356, 'part-2'],
    [357, 'part-3'],
    [533, 'part-3'],
    [534, 'part-4'],
    [598, 'part-4'],
  ])('Q%i → %s', (q, chapter) => {
    expect(chapterForQuestion(q)).toBe(chapter)
  })

  it('throws for out-of-range Q numbers', () => {
    expect(() => chapterForQuestion(0)).toThrow()
    expect(() => chapterForQuestion(599)).toThrow()
  })
})

describe('extractQuestion', () => {
  const raw = loadFixture('en')
  const part1 = parseChapter(raw, 'part-1', 'en-US').html
  const part4 = parseChapter(raw, 'part-4', 'en-US').html

  it('extracts Q1 with its refs and answer', () => {
    const out = extractQuestion(part1, 1)
    expect(out).toMatch(/^<p[^>]*\sid="q1"/)
    expect(out).toMatch(/What is the plan of God for man\?/)
    expect(out).toContain('class="ccc-refs"')
    expect(out).toContain('data-ref="book/ccc#1-25"')
    expect(out).toMatch(/God, infinitely perfect/)
  })

  it('extracts Q217 — last Q of part-1 — and stops before Part Two', () => {
    const out = extractQuestion(part1, 217)
    expect(out).toMatch(/^<p[^>]*\sid="q217"/)
    expect(out).not.toContain('id="q218"')
    expect(out).not.toContain('Part Two')
  })

  it('extracts Q568 — irregular markup case — cleanly', () => {
    const out = extractQuestion(part4, 568)
    expect(out).toMatch(/^<p[^>]*\sid="q568"/)
    expect(out).not.toContain('id="q569"')
  })

  it('throws when the chapter HTML does not contain the requested Q', () => {
    expect(() => extractQuestion(part1, 400)).toThrow(/Q400 not found/)
  })

  it('PT extraction matches EN structure', () => {
    const pt = parseChapter(loadFixture('pt'), 'part-1', 'pt-BR').html
    const out = extractQuestion(pt, 1)
    expect(out).toMatch(/^<p[^>]*\sid="q1"/)
    expect(out).toContain('class="ccc-refs"')
  })
})
