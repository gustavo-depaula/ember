import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { matchSectionHeader } from './conditions'
import { parseSectionedFile, type SectionedDoFile, splitDoLines } from './sectioned'

describe('parseSectionedFile', () => {
  it('keeps duplicate sections in order with their conditions', () => {
    const parsed = parseSectionedFile(
      ['[Lectio1]', 'first', '', '[Lectio1] (rubrica 1960)', 'second'].join('\n'),
    )
    expect(parsed.sections).toEqual([
      { name: 'Lectio1', lines: ['first', ''] },
      { name: 'Lectio1', condition: 'rubrica 1960', lines: ['second'] },
    ])
  })

  it('keeps a preamble that hosts whole-file inclusions', () => {
    const parsed = parseSectionedFile(['@Tempora/Pent03-0r', '[Oratio]', 'text'].join('\n'))
    expect(parsed.sections[0]).toEqual({ name: '__preamble', lines: ['@Tempora/Pent03-0r'] })
  })

  it('drops a blank preamble and trailing blank lines', () => {
    const parsed = parseSectionedFile(['', '[Oratio]', 'text', '', ''].join('\n'))
    expect(parsed.sections).toEqual([{ name: 'Oratio', lines: ['text'] }])
  })
})

// Fixtures are real files vendored from the pinned Divinum Officium checkout.
const fixturesRoot = join(__dirname, '..', '..', 'test', 'fixtures')

function listFixtures(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listFixtures(full) : full.endsWith('.txt') ? [full] : []
  })
}

const plainFixture = (path: string) =>
  path.includes('Psalmorum') || path.includes('Ordinarium') || path.includes('Tabulae')

function reconstruct(parsed: SectionedDoFile): string {
  return parsed.sections
    .flatMap((s) =>
      s.name === '__preamble'
        ? s.lines
        : [s.condition ? `[${s.name}] (${s.condition})` : `[${s.name}]`, ...s.lines],
    )
    .join('\n')
}

describe('fixture round-trips', () => {
  for (const fixture of listFixtures(fixturesRoot)) {
    const rel = fixture.slice(fixturesRoot.length + 1)

    if (plainFixture(fixture)) {
      it(`${rel}: splits lines losslessly`, () => {
        const text = readFileSync(fixture, 'utf8')
        const lines = splitDoLines(text)
        expect(lines.join('\n')).toBe(
          text
            .replace(/^\uFEFF/, '')
            .replace(/\r/g, '')
            .replace(/\n+$/, ''),
        )
      })
      continue
    }

    it(`${rel}: preserves every body line byte-for-byte`, () => {
      const text = readFileSync(fixture, 'utf8')
      const parsed = parseSectionedFile(text)
      const sourceBodyLines = splitDoLines(text).filter((line) => !matchSectionHeader(line))
      const parsedLines = parsed.sections.flatMap((s) => s.lines)
      // The parser may drop an all-blank preamble; account for it.
      const dropped = sourceBodyLines.length - parsedLines.length
      expect(sourceBodyLines.slice(dropped)).toEqual(parsedLines)
      expect(sourceBodyLines.slice(0, dropped).every((l) => !l.trim())).toBe(true)
    })

    it(`${rel}: parse(reconstruct(parse(x))) is a fixpoint`, () => {
      const text = readFileSync(fixture, 'utf8')
      const parsed = parseSectionedFile(text)
      expect(parseSectionedFile(reconstruct(parsed))).toEqual(parsed)
    })
  }
})
