import { describe, expect, it } from 'vitest'

import type { SlotState } from '@/db/events'
import { dayPartStates, getActiveDayParts } from '../timeBlocks'

const slot = (id: string, time: string | null, time_block: SlotState['time_block']) =>
  ({ id, time, time_block }) as SlotState

const plan = [
  slot('compline', '00:30', 'evening'),
  slot('lauds', '06:00', 'morning'),
  slot('mass', '08:00', 'morning'),
  slot('angelus', '12:00', 'daytime'),
  slot('vespers', '18:30', 'evening'),
  slot('examen', '22:00', 'evening'),
  slot('reading', null, 'daytime'),
  slot('aspirations', null, 'flexible'),
]
const parts = getActiveDayParts(plan)
const states = (hour: number, done: string[] = []) =>
  Object.fromEntries(dayPartStates(parts, hour, new Set(done)))

describe('getActiveDayParts', () => {
  it('puts a practice in the part its time names, after midnight at the end of the night', () => {
    expect(parts.map((p) => [p.part, p.slots.map((s) => s.id)])).toEqual([
      ['dawn', ['lauds']],
      ['morning', ['mass']],
      ['midday', ['angelus']],
      ['afternoon', ['reading']],
      ['evening', ['vespers']],
      ['night', ['examen', 'compline']],
      ['flexible', ['aspirations']],
    ])
  })
})

describe('dayPartStates', () => {
  it('opens only the current part, previewing what is unprayed elsewhere', () => {
    expect(states(12, ['lauds'])).toEqual({
      dawn: 'collapsed',
      morning: 'preview',
      midday: 'expanded',
      afternoon: 'preview',
      evening: 'preview',
      night: 'preview',
      flexible: 'expanded',
    })
  })

  it('opens the next part with something to pray once the current one is prayed', () => {
    expect(states(12, ['angelus']).midday).toBe('collapsed')
    expect(states(12, ['angelus']).afternoon).toBe('expanded')
  })

  it('keeps the night open past midnight', () => {
    expect(states(1, ['examen']).night).toBe('expanded')
    expect(states(1, ['examen']).dawn).toBe('preview')
  })
})
