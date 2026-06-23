import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Primitive } from '@/content/primitives'
import { extractSecondReading } from './office-of-readings-reading'
import { parseHour } from './parse'

const load = (f: string) => readFileSync(join(__dirname, '__fixtures__', f), 'utf-8')

const allText = (ps: Primitive[]) =>
  ps.map((p) => ('text' in p && p.text ? (p.text as { primary: string }).primary : '')).join('\n')

// Each edition's Office of Readings (2026 fixtures) carries the same day:
// first reading from Judges, second reading from St Cyprian's treatise on the
// Lord's Prayer ("Let your prayer come from a humble heart").
const cases = [
  {
    fixture: 'en-ufficio_delle_letture.html',
    appLang: 'en-US',
    theme: 'humble heart',
    firstReadingLabel: 'FIRST READING',
    secondReadingLabel: 'SECOND READING',
    responsoryLabel: 'RESPONSORY',
    firstReadingMarker: 'Judges',
  },
  {
    fixture: 'pt-ufficio_delle_letture.html',
    appLang: 'pt-BR',
    theme: 'humildes de coração',
    firstReadingLabel: 'PRIMEIRA LEITURA',
    secondReadingLabel: 'SEGUNDA LEITURA',
    responsoryLabel: 'RESPONSÓRIO',
    firstReadingMarker: 'Josué',
  },
  {
    fixture: 'la-ufficio_delle_letture.html',
    appLang: 'la',
    theme: 'ex humili corde',
    firstReadingLabel: 'LECTIO PRIOR',
    secondReadingLabel: 'LECTIO ALTERA',
    responsoryLabel: 'RESPONSORIUM',
    firstReadingMarker: 'Iudicum',
  },
] as const

describe('extractSecondReading — all editions', () => {
  it.each(cases)('$fixture yields only the patristic reading', (c) => {
    const reading = extractSecondReading(parseHour(load(c.fixture)), c.appLang)
    const text = allText(reading)

    // The patristic reading itself is present…
    expect(reading.length).toBeGreaterThan(0)
    expect(text).toContain(c.theme)

    // …and nothing else: no first reading, no responsories, and the bare
    // "SECOND READING" label is dropped (the practice already titles the card).
    expect(text).not.toContain(c.firstReadingLabel)
    expect(text).not.toContain(c.firstReadingMarker)
    expect(text).not.toContain(c.responsoryLabel)
    expect(text).not.toContain(c.secondReadingLabel)
  })
})

describe('extractSecondReading — markup variants', () => {
  // Some hand-edited days inline the rubric red on a bare <span> instead of
  // class="rubrica" (e.g. June 22 2026 pt: SEGUNDA LEITURA → São Gregório de
  // Nissa). The parser must still treat that label as a rubric so the anchor is
  // found. Regression for "ibreviary: Office of Readings second reading not found".
  it('handles an inline-styled (no class="rubrica") SEGUNDA LEITURA label', () => {
    const reading = extractSecondReading(
      parseHour(load('pt-ufficio_delle_letture-inline-rubric.html')),
      'pt-BR',
    )
    const text = allText(reading)
    expect(text).toContain('São Gregório de Nissa')
    expect(text).not.toContain('SEGUNDA LEITURA')
    expect(text).not.toContain('PRIMEIRA LEITURA')
    expect(text).not.toContain('Golias') // first reading (Samuel/David)
    expect(text).not.toContain('RESPONSÓRIO')
  })
})

describe('extractSecondReading — failure contract', () => {
  it('throws when the second reading is absent (so nothing junk caches)', () => {
    const stub: Primitive[] = [{ type: 'rubric', text: { primary: 'FIRST READING' } }]
    expect(() => extractSecondReading(stub, 'en-US')).toThrow(/second reading/i)
  })
})
