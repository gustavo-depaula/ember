import { describe, expect, it } from 'vitest'
import { makeContext } from '../../__fixtures__/engine'
import { getContextValue, lookupMap, resolvePath } from '../../engine'

describe('getContextValue', () => {
  it('returns dayOfWeek as string "0"-"6"', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dayOfWeek'),
    ).toBe('0') // Sunday
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-13T12:00:00') }), 'dayOfWeek'),
    ).toBe('1') // Monday
  })

  it('returns dayOfMonth as string', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dayOfMonth'),
    ).toBe('12')
  })

  it('returns hour from the date', () => {
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T07:30:00') }), 'hour')).toBe(
      '7',
    )
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T00:15:00') }), 'hour')).toBe(
      '0',
    )
  })

  it('returns timeOfDay buckets', () => {
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T07:00:00') }), 'timeOfDay'),
    ).toBe('morning')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T14:00:00') }), 'timeOfDay'),
    ).toBe('afternoon')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T18:00:00') }), 'timeOfDay'),
    ).toBe('evening')
    expect(
      getContextValue(makeContext({ date: new Date('2026-04-12T22:00:00') }), 'timeOfDay'),
    ).toBe('night')
  })

  it('returns liturgicalCalendar and numbering from context', () => {
    expect(getContextValue(makeContext({ liturgicalCalendar: 'ef' }), 'liturgicalCalendar')).toBe(
      'ef',
    )
    expect(getContextValue(makeContext({ numbering: 'lxx' }), 'numbering')).toBe('lxx')
  })

  it('returns programDay as string', () => {
    expect(getContextValue(makeContext({ programDay: 14 }), 'programDay')).toBe('14')
  })

  it('returns dateKey in MM-DD format', () => {
    expect(getContextValue(makeContext({ date: new Date('2026-04-12T12:00:00') }), 'dateKey')).toBe(
      '04-12',
    )
    expect(getContextValue(makeContext({ date: new Date('2026-01-05T12:00:00') }), 'dateKey')).toBe(
      '01-05',
    )
  })

  it('resolves liturgicalSeason using the EF calendar when selected', () => {
    const ef = (date: Date) =>
      getContextValue(makeContext({ date, liturgicalCalendar: 'ef' }), 'liturgicalSeason')
    expect(ef(new Date(2025, 11, 10))).toBe('advent')
    expect(ef(new Date(2025, 11, 26))).toBe('christmas')
    expect(ef(new Date(2025, 2, 10))).toBe('lent')
    expect(ef(new Date(2025, 3, 20))).toBe('easter')
    // Post-Pentecost (summer/fall — EF-only season)
    expect(ef(new Date(2025, 6, 15))).toBe('post-pentecost')
    // Epiphany (pre-Lent — EF-only season)
    expect(ef(new Date(2025, 1, 15))).toBe('epiphany')
  })

  it('defaults liturgicalSeason to the OF calendar', () => {
    // No liturgicalCalendar set → OF. Easter 2026 = Apr 5, Pentecost = May 24.
    const of = (date: Date) => getContextValue(makeContext({ date }), 'liturgicalSeason')
    // Pentecost Sunday: still Eastertide → Regina Caeli
    expect(of(new Date(2026, 4, 24))).toBe('easter')
    // Days after Pentecost: OF Eastertide has ended → Angelus
    expect(of(new Date(2026, 4, 28))).toBe('ordinary')
  })

  it('extends EF Eastertide through the Pentecost octave', () => {
    const ef = (date: Date) =>
      getContextValue(makeContext({ date, liturgicalCalendar: 'ef' }), 'liturgicalSeason')
    // Within the Pentecost octave the EF keeps Eastertide → Regina Caeli
    expect(ef(new Date(2026, 4, 28))).toBe('easter')
    // Saturday after Pentecost (octave day, Easter + 55) is still Eastertide
    expect(ef(new Date(2026, 4, 30))).toBe('easter')
    // Trinity Sunday — octave over → post-pentecost
    expect(ef(new Date(2026, 4, 31))).toBe('post-pentecost')
  })

  it('returns undefined for unknown keys', () => {
    expect(getContextValue(makeContext(), 'nonExistentKey')).toBeUndefined()
  })
})

// --- lookupMap ---

describe('lookupMap', () => {
  it('matches exact string keys', () => {
    const map = { '1': 'joyful', '2': 'sorrowful', '3': 'glorious' }
    expect(lookupMap(map, '1')).toBe('joyful')
    expect(lookupMap(map, '2')).toBe('sorrowful')
  })

  it('matches numeric range keys (inclusive)', () => {
    const map = { '6-8': 'lauds', '9-11': 'terce', '17-19': 'vespers' }
    expect(lookupMap(map, '6')).toBe('lauds')
    expect(lookupMap(map, '7')).toBe('lauds')
    expect(lookupMap(map, '8')).toBe('lauds')
    expect(lookupMap(map, '9')).toBe('terce')
    expect(lookupMap(map, '17')).toBe('vespers')
  })

  it('returns first matching range when ranges overlap', () => {
    expect(lookupMap({ '5-10': 'first', '8-12': 'second' }, '8')).toBe('first')
  })

  it('prefers exact match over range match', () => {
    expect(lookupMap({ '7': 'exact', '6-8': 'range' }, '7')).toBe('exact')
  })

  it('returns undefined when no match', () => {
    expect(lookupMap({ '1': 'a', '6-8': 'b' }, '99')).toBeUndefined()
  })

  it('handles zero in range', () => {
    expect(lookupMap({ '0-5': 'matins' }, '0')).toBe('matins')
    expect(lookupMap({ '0-5': 'matins' }, '3')).toBe('matins')
  })
})

// --- select: silent conditional ---

describe('resolvePath — dotted path access', () => {
  it('returns top-level flowData entries directly', () => {
    const ctx = makeContext({ flowData: { day: { rite: 'mass' } } })
    expect(resolvePath(ctx, 'day')).toEqual({ rite: 'mass' })
  })

  it('walks into nested objects', () => {
    const ctx = makeContext({
      flowData: {
        day: {
          celebration: { primary: { entranceAntiphon: { body: 'hello' } } },
        },
      },
    })
    expect(resolvePath(ctx, 'day.celebration.primary.entranceAntiphon.body')).toBe('hello')
  })

  it('returns undefined for missing path segments', () => {
    const ctx = makeContext({ flowData: { day: {} } })
    expect(resolvePath(ctx, 'day.celebration.title')).toBeUndefined()
  })

  it('returns arrays for paths that resolve to arrays', () => {
    const ctx = makeContext({
      flowData: { day: { celebrations: [{ id: 'a' }, { id: 'b' }] } },
    })
    expect(resolvePath(ctx, 'day.celebrations')).toEqual([{ id: 'a' }, { id: 'b' }])
  })

  it('falls back to templateVars for single-segment lookups', () => {
    const ctx = makeContext({ templateVars: { greeting: 'hello' } })
    expect(resolvePath(ctx, 'greeting')).toBe('hello')
  })

  it('falls back to getContextValue for known top-level keys', () => {
    const ctx = makeContext({ liturgicalCalendar: 'of' })
    expect(resolvePath(ctx, 'liturgicalCalendar')).toBe('of')
  })

  it('returns undefined for unknown single-segment paths', () => {
    expect(resolvePath(makeContext(), 'whatever')).toBeUndefined()
  })

  it('returns undefined when walking into a non-object', () => {
    const ctx = makeContext({ flowData: { day: 'string' } })
    expect(resolvePath(ctx, 'day.field')).toBeUndefined()
  })
})
