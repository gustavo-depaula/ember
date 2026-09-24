import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { getHourSlots, getPinLabels, getPinnableSelects } from '../pins'
import type { FlowDefinition } from '../types'

function practiceFlow(id: string): FlowDefinition {
  const path = resolve(__dirname, '../../../../../content/practices', id, 'flow.json')
  return JSON.parse(readFileSync(path, 'utf8')) as FlowDefinition
}

describe('getPinnableSelects', () => {
  it('offers the hours of the breviary under a stable key', () => {
    const [hour, ...rest] = getPinnableSelects(practiceFlow('breviary'))
    expect(rest).toEqual([])
    expect(hour.key).toBe('hour')
    expect(hour.options.map((o) => o.id)).toEqual(
      expect.arrayContaining(['Matutinum', 'Laudes', 'Prima', 'Completorium']),
    )
    expect(hour.options.map((o) => o.id)).not.toContain('Votive')
  })

  it('offers the mystery sets of the rosary', () => {
    const selects = getPinnableSelects(practiceFlow('rosary'))
    expect(selects.map((s) => s.key)).toEqual(['mysteries'])
  })

  it('offers nothing where a choice is how you pray, not what', () => {
    expect(getPinnableSelects(practiceFlow('mass'))).toEqual([])
    expect(getPinnableSelects(practiceFlow('gospel-of-the-day'))).toEqual([])
  })
})

describe('getPinLabels', () => {
  it('names the pinned option and drops a pin the flow no longer has', () => {
    const flow = practiceFlow('breviary')
    expect(getPinLabels(flow, { hour: 'Prima' })).toEqual([
      expect.objectContaining({ 'en-US': 'Prime' }),
    ])
    expect(getPinLabels(flow, { hour: 'Retired' })).toEqual([])
    expect(getPinLabels(undefined, { hour: 'Prima' })).toEqual([])
  })
})

describe('getHourSlots', () => {
  it("lists every hour of the office at the hour's own time", () => {
    const slots = getHourSlots(practiceFlow('breviary'))
    expect(slots).toContainEqual({ pins: { hour: 'Matutinum' }, time: '05:00' })
    expect(slots).toContainEqual({ pins: { hour: 'Prima' }, time: '07:00' })
    expect(slots).toContainEqual({ pins: { hour: 'Completorium' }, time: '21:00' })
    expect(slots.map((s) => s.pins.hour)).not.toContain('Votive')
  })

  it('gives every hour of every office a time', () => {
    for (const id of ['little-office-bvm', 'little-office-dead', 'divine-office', 'dwdo']) {
      const slots = getHourSlots(practiceFlow(id))
      expect(slots.length).toBeGreaterThan(0)
      expect(slots.every((s) => s.time)).toBe(true)
    }
  })

  it('leaves a practice whose choice is not an hour as one slot', () => {
    expect(getHourSlots(practiceFlow('rosary'))).toEqual([])
  })
})
