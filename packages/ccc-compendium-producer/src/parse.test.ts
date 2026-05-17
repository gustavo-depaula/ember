import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { chapterOrder, chapters } from './chapters'
import { parseChapter } from './parse'
import type { ChapterId, Lang } from './types'

function loadFixture(lang: Lang): string {
  const slug = lang === 'en-US' ? 'en' : 'pt'
  const path = join(__dirname, '..', '__fixtures__', `${slug}.html`)
  const buf = readFileSync(path)
  // Fixtures are stored as Latin-1 bytes (vatican.va's wire format). Decode 1:1.
  let s = ''
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i])
  return s
}

const langs: Lang[] = ['en-US', 'pt-BR']

describe('parseChapter — chapter slicing across both languages', () => {
  for (const lang of langs) {
    const raw = loadFixture(lang)

    it.each(chapterOrder)(`${lang}: produces non-empty HTML for %s`, (chapter) => {
      const out = parseChapter(raw, chapter, lang)
      expect(out.html.length).toBeGreaterThan(200)
      expect(out.anchors).toBeDefined()
    })

    it(`${lang}: part chapters contain their expected Q-number range`, () => {
      for (const id of ['part-1', 'part-2', 'part-3', 'part-4'] as ChapterId[]) {
        const range = chapters[id].questionRange
        expect(range).toBeDefined()
        const out = parseChapter(raw, id, lang)
        const [first, last] = range as [number, number]
        expect(out.html).toContain(`id="q${first}"`)
        expect(out.html).toContain(`id="q${last}"`)
        const before = first > 1 ? first - 1 : undefined
        const after = last + 1
        if (before !== undefined) expect(out.html).not.toContain(`id="q${before}"`)
        // Q599 doesn't exist, so this is always safe.
        if (after <= 598) {
          // Q from next part should not appear in this chapter
          const inNextPart = chapterOrder
            .filter((c) => c !== id)
            .some((c) => {
              const r = chapters[c].questionRange
              return r && r[0] === after
            })
          if (inNextPart) expect(out.html).not.toContain(`id="q${after}"`)
        }
      }
    })

    it(`${lang}: anchors index lists q-numbers belonging to the chapter`, () => {
      const out = parseChapter(raw, 'part-1', lang)
      expect(out.anchors['1']).toEqual({ chapter: 'part-1' })
      expect(out.anchors['217']).toEqual({ chapter: 'part-1' })
      expect(out.anchors['218']).toBeUndefined()
    })

    it(`${lang}: motu-proprio + introduction slices don't contain Q1's id`, () => {
      const motu = parseChapter(raw, 'motu-proprio', lang)
      const intro = parseChapter(raw, 'introduction', lang)
      expect(motu.html).not.toContain('id="q1"')
      expect(intro.html).not.toContain('id="q1"')
    })

    it(`${lang}: Office noise (<o:p>, mso conditionals) is stripped`, () => {
      const out = parseChapter(raw, 'part-1', lang)
      expect(out.html).not.toContain('<o:p>')
      expect(out.html).not.toContain('mso')
    })

    it(`${lang}: stray Â mojibake before typographic punctuation is gone`, () => {
      const out = parseChapter(raw, 'part-1', lang)
      // The most common pattern in the source is Â before a curly quote.
      expect(out.html).not.toMatch(/Â["“”‘’–—]/)
    })

    it(`${lang}: <font> color/size tags are stripped`, () => {
      const out = parseChapter(raw, 'part-1', lang)
      expect(out.html).not.toContain('<font ')
    })
  }
})

describe('parseChapter — Q568 edge case', () => {
  it('still injects id="q568" despite irregular markup', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-4', 'en-US')
    expect(out.html).toContain('id="q568"')
  })
})

describe('parseChapter — chapter boundary content checks', () => {
  it('en-US: motu-proprio ends with BENEDICTUS signature; intro does not include it', () => {
    const raw = loadFixture('en-US')
    const motu = parseChapter(raw, 'motu-proprio', 'en-US')
    const intro = parseChapter(raw, 'introduction', 'en-US')
    expect(motu.html).toMatch(/BENEDICTUS PP\.?\s*XVI/)
    expect(intro.html).not.toMatch(/BENEDICTUS/)
  })

  it('pt-BR: motu-proprio ends with BENEDICTUS signature; intro does not include it', () => {
    const raw = loadFixture('pt-BR')
    const motu = parseChapter(raw, 'motu-proprio', 'pt-BR')
    const intro = parseChapter(raw, 'introduction', 'pt-BR')
    expect(motu.html).toMatch(/BENEDICTUS PP/)
    expect(intro.html).not.toMatch(/BENEDICTUS/)
  })

  it('en-US: part-1 opens with the "Part One" label before the title', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    // The Part-One label paragraph must come before the title anchor.
    const labelIdx = out.html.indexOf('Part One')
    const anchorIdx = out.html.indexOf('The Profession of Faith')
    expect(labelIdx).toBeGreaterThanOrEqual(0)
    expect(anchorIdx).toBeGreaterThan(labelIdx)
  })

  it('pt-BR: part-3 opens with "TERCEIRA PARTE" before the title', () => {
    const raw = loadFixture('pt-BR')
    const out = parseChapter(raw, 'part-3', 'pt-BR')
    const labelIdx = out.html.indexOf('TERCEIRA PARTE')
    const anchorIdx = out.html.indexOf('A VIDA EM CRISTO')
    expect(labelIdx).toBeGreaterThanOrEqual(0)
    expect(anchorIdx).toBeGreaterThan(labelIdx)
  })

  it('en-US: every chapter trims trailing <hr /> and empty <p>', () => {
    const raw = loadFixture('en-US')
    for (const ch of chapterOrder) {
      const out = parseChapter(raw, ch, 'en-US')
      expect(out.html).not.toMatch(/(?:<hr\s*\/?>\s*)+$/i)
      expect(out.html).not.toMatch(/(?:<p[^>]*>\s*<\/p>\s*)+$/i)
    }
  })

  it('appendix slices have no table tags after cleanup', () => {
    const raw = loadFixture('en-US')
    for (const ch of ['appendix-a', 'appendix-b'] as const) {
      const out = parseChapter(raw, ch, 'en-US')
      expect(out.html).not.toMatch(/<\/?(?:table|tbody|tr|td|th)\b/i)
    }
  })
})

describe('parseChapter — CCC paragraph refs linkified', () => {
  it('en-US: Q1 ref "1-25" becomes <a data-ref="book/ccc#1-25">', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    expect(out.html).toMatch(/<a data-ref="book\/ccc#1-25">1-25<\/a>/)
  })

  it('en-US: multi-line refs (Q2: "27-30<br />44-45") emit two <a> tags', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    expect(out.html).toMatch(/<a data-ref="book\/ccc#27-30">27-30<\/a>/)
    expect(out.html).toMatch(/<a data-ref="book\/ccc#44-45">44-45<\/a>/)
  })

  it('en-US: single-number refs (Q13: "76") emit a single <a>', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    expect(out.html).toMatch(/<a data-ref="book\/ccc#76">76<\/a>/)
  })

  it('en-US: ref paragraphs get class="ccc-refs"', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    expect(out.html).toMatch(/<p class="ccc-refs"><a data-ref="book\/ccc#1-25"/)
  })

  it('en-US: linkified refs are present for the vast majority of questions', () => {
    const raw = loadFixture('en-US')
    let linked = 0
    for (const ch of ['part-1', 'part-2', 'part-3', 'part-4'] as const) {
      const out = parseChapter(raw, ch, 'en-US')
      linked += (out.html.match(/data-ref="book\/ccc#/g) ?? []).length
    }
    // Most of the 598 Qs have at least one ref token; some have multiple.
    expect(linked).toBeGreaterThan(600)
  })

  it('pt-BR: refs are linkified with the same scheme', () => {
    const raw = loadFixture('pt-BR')
    const out = parseChapter(raw, 'part-1', 'pt-BR')
    expect(out.html).toMatch(/<a data-ref="book\/ccc#\d+(?:-\d+)?">/)
  })

  it('answer paragraphs are not mistaken for refs', () => {
    const raw = loadFixture('en-US')
    const out = parseChapter(raw, 'part-1', 'en-US')
    // Q1's answer starts with "God, infinitely perfect…" — must not be linkified.
    expect(out.html).toMatch(/<p>God, infinitely perfect/)
    // The answer paragraph should not carry the ccc-refs class.
    expect(out.html).not.toMatch(/class="ccc-refs">God,/)
  })
})

describe('parseChapter — anchor count totals 598 questions', () => {
  for (const lang of langs) {
    it(`${lang}: q1..q598 ids appear exactly once across all chapters`, () => {
      const raw = loadFixture(lang)
      const seen = new Set<number>()
      for (const ch of chapterOrder) {
        const out = parseChapter(raw, ch, lang)
        const matches = out.html.matchAll(/\sid="q(\d+)"/g)
        for (const m of matches) {
          const n = Number(m[1])
          expect(seen.has(n)).toBe(false)
          seen.add(n)
        }
      }
      expect(seen.size).toBe(598)
    })
  }
})
