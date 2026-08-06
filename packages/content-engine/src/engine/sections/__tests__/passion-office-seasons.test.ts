import { describe, expect, it } from 'vitest'
import passionOfficeFlow from '../../../../../../content/practices/little-office-passion-by-s-francis-of-assisi/flow.json'
import { makeContext, makeEngineContext } from '../../../__fixtures__/engine'
import { resolveFlow } from '../../../engine'
import type { FlowDefinition } from '../../../types'

// St Francis arranged the office in five parts, each governing a different
// stretch of the year. The outer select dispatches on season + day-of-week so
// the right part is already on screen; the picker still lets the user override.
const flow = passionOfficeFlow as FlowDefinition

function selectedPart(date: string, calendar: 'of' | 'ef') {
  const resolved = resolveFlow(
    flow,
    makeContext({ date: new Date(`${date}T12:00:00`), liturgicalCalendar: calendar }),
    makeEngineContext(),
  )
  const select = resolved.find((s) => s.type === 'select')
  if (select?.type !== 'select') throw new Error('no select at top level')
  return select.selectedId
}

describe('Little Office of the Passion — seasonal dispatch', () => {
  it('serves the Passion part on ordinary weekdays and in Holy Week', () => {
    expect(selectedPart('2026-07-14', 'of')).toBe('passion') // Tuesday, ordinary
    expect(selectedPart('2026-04-02', 'of')).toBe('passion') // Maundy Thursday
    expect(selectedPart('2026-03-03', 'ef')).toBe('passion') // Tuesday in Lent
  })

  it('serves the Paschal part throughout Eastertide', () => {
    expect(selectedPart('2026-04-07', 'of')).toBe('paschal') // Easter Tuesday
    expect(selectedPart('2026-04-12', 'of')).toBe('paschal') // Sunday in Easter
    expect(selectedPart('2026-04-12', 'ef')).toBe('paschal')
  })

  it('serves the Sundays & feasts part on Sundays outside Advent/Christmas/Easter', () => {
    expect(selectedPart('2026-07-12', 'of')).toBe('sundays') // Sunday, ordinary
    expect(selectedPart('2026-06-14', 'ef')).toBe('sundays') // Sunday, post-Pentecost
    expect(selectedPart('2026-01-25', 'ef')).toBe('sundays') // Sunday after Epiphany octave
    expect(selectedPart('2026-02-08', 'ef')).toBe('sundays') // Septuagesima Sunday
  })

  it('serves the Advent part from Advent to Christmas eve, Sundays included', () => {
    expect(selectedPart('2026-12-01', 'of')).toBe('advent') // Tuesday in Advent
    expect(selectedPart('2026-12-06', 'ef')).toBe('advent') // Sunday in Advent
  })

  it('serves the Christmas part through the Epiphany octave', () => {
    expect(selectedPart('2026-12-25', 'of')).toBe('christmas')
    expect(selectedPart('2027-01-10', 'of')).toBe('christmas') // Sunday within the octave
  })

  it('resolves the hour picker nested inside the selected part', () => {
    const resolved = resolveFlow(
      flow,
      makeContext({
        date: new Date('2026-12-01T12:00:00'),
        now: new Date('2026-12-01T07:30:00'), // Terce
        liturgicalCalendar: 'of',
      }),
      makeEngineContext(),
    )
    const outer = resolved.find((s) => s.type === 'select')
    if (outer?.type !== 'select') throw new Error('no select at top level')
    const part = outer.options.find((o) => o.id === outer.selectedId)
    const inner = part?.sections.find((s) => s.type === 'select')
    if (inner?.type !== 'select') throw new Error('no hour select inside the part')
    expect(inner.selectedId).toBe('terce')
  })

  it('carries each cento verse reference as data, not baked into the prayed text', () => {
    const resolved = resolveFlow(
      flow,
      makeContext({ date: new Date('2026-07-14T12:00:00'), liturgicalCalendar: 'of' }),
      makeEngineContext(),
    )
    const outer = resolved.find((s) => s.type === 'select')
    if (outer?.type !== 'select') throw new Error('no select at top level')
    const hours = outer.options[0]?.sections.find((s) => s.type === 'select')
    if (hours?.type !== 'select') throw new Error('no hour select')
    const compline = hours.options.find((o) => o.id === 'compline')
    const psalm = compline?.sections.find((s) => s.type === 'psalm')
    if (psalm?.type !== 'psalm') throw new Error('no psalm section at Compline')

    expect(psalm.verses[0]).toMatchObject({
      ref: { primary: 'Sl 55,9' },
      text: {
        primary: 'Ó Deus, eu vos expus a minha vida; pusestes as minhas lágrimas diante de vós.',
      },
    })
    // Every verse's prayed text must be free of its own leading citation —
    // that's the whole point of splitting `ref` out.
    for (const verse of psalm.verses) {
      expect(verse.text.primary).not.toMatch(/^(Sl|Ps\.|Lm|Ex|Lc)\s?\d+[,:]/)
    }
  })

  it('offers every part in the picker so the user can override the guess', () => {
    const resolved = resolveFlow(flow, makeContext(), makeEngineContext())
    const select = resolved.find((s) => s.type === 'select')
    if (select?.type !== 'select') throw new Error('no select at top level')
    expect(select.options.map((o) => o.id)).toEqual([
      'passion',
      'paschal',
      'sundays',
      'advent',
      'christmas',
    ])
  })

  it('gives every hour of every part real prayed text, never a cross-reference', () => {
    const resolved = resolveFlow(flow, makeContext(), makeEngineContext())
    const outer = resolved.find((s) => s.type === 'select')
    if (outer?.type !== 'select') throw new Error('no select at top level')

    const prayedChars = (sections: (typeof outer.options)[number]['sections']) =>
      sections.reduce((total, s) => {
        if (s.type === 'psalm') {
          return total + s.verses.reduce((n, v) => n + v.text.primary.length, 0)
        }
        if (s.type === 'prayer' && s.text) return total + s.text.primary.length
        return total
      }, 0)

    // Francis abbreviates repeated psalms as "…etc., as above" — fine in a book
    // you can page back through, useless once the parts are separate branches.
    // Every branch must stand alone.
    const thin: string[] = []
    for (const part of outer.options) {
      const hourSelect = part.sections.find((s) => s.type === 'select')
      const branches =
        hourSelect?.type === 'select'
          ? hourSelect.options.map((h) => [`${part.id}/${h.id}`, h.sections] as const)
          : [[part.id, part.sections] as const]
      for (const [label, sections] of branches) {
        if (prayedChars(sections) < 200) thin.push(label)
      }
    }
    expect(thin).toEqual([])
  })
})
