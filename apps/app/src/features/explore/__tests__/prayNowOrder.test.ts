import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import type { Tier } from '@/db/schema'
import { dayMinutes } from '@/features/plan-of-life/timeBlocks'
import { pickByWindow } from '../prayNowOrder'

// Real plans, straight from content/: the templates' times and tiers, on an
// ordinary weekday — the practices kept every day.
const content = resolve(__dirname, '../../../../../../content')
type TemplatePractice = {
  ref?: string
  tier?: Tier
  time?: string
  schedule?: { type: string }
  enabled?: boolean
}
const template = (id: string) =>
  (
    JSON.parse(readFileSync(`${content}/plan-of-life-templates/${id}.json`, 'utf8')) as {
      practices: TemplatePractice[]
    }
  ).practices

function plan(id: string) {
  return template(id).flatMap((p) => {
    if (!p.ref || !p.time || p.enabled === false) return []
    if (p.schedule && p.schedule.type !== 'daily') return []
    return [{ ref: p.ref, tier: p.tier ?? 'essential', due: dayMinutes(p.time) }]
  })
}

function pick(id: string, clock: string, done: string[] = []) {
  const all = plan(id)
  const items = all.filter((p) => !done.includes(p.ref))
  const { next, comingUp } = pickByWindow(
    items,
    dayMinutes(clock),
    all.map((p) => p.due),
  )
  return { ref: next?.ref, comingUp }
}

describe('pray now: which practice', () => {
  it('holds a timed practice until its hour', () => {
    // Once the 12:15 Mass is prayed, the 15:00 Chaplet is only coming up; from 14:30 it is due.
    const done = ['morning-offering-faustina', 'mass']
    expect(pick('divine-mercy', '12:40', done)).toEqual({
      ref: 'chaplet-of-divine-mercy',
      comingUp: true,
    })
    expect(pick('divine-mercy', '14:45', done)).toEqual({
      ref: 'chaplet-of-divine-mercy',
      comingUp: false,
    })
  })

  it("follows the plan's order over tier", () => {
    // The Carmelite offering (05:50) before mental prayer (06:00).
    expect(pick('carmelite', '05:55').ref).toBe('morning-offering-carmelite')
  })

  it('never offers the night examen in the afternoon', () => {
    const morning = [
      'morning-offering-carmelite',
      'mental-prayer-teresian',
      'mass',
      'divine-office',
    ]
    expect(pick('carmelite', '17:00', morning).ref).not.toBe('examination-of-conscience')
    expect(pick('carmelite', '17:45', morning).ref).toBe('rosary')
  })

  it('holds a practice until the next one comes due', () => {
    const done = ['morning-offering', 'mass', 'mental-prayer', 'visit-blessed-sacrament']
    // Cursillo: the 18:00 Rosary (ideal) stays until the 21:00 spiritual reading takes over.
    expect(pick('cursillo', '20:55', done).ref).toBe('rosary')
    expect(pick('cursillo', '21:05', done).ref).toBe('spiritual-reading')
  })

  it('holds an unprayed essential for two hours, over what comes due after it', () => {
    // Opus Dei: offering 06:30, Mass 07:00, mental prayer 07:30 — all essential.
    expect(pick('opus-dei', '08:25').ref).toBe('morning-offering-opus-dei')
    expect(pick('opus-dei', '08:35').ref).toBe('mass')
    expect(pick('opus-dei', '09:05').ref).toBe('mental-prayer-opus-dei')
    // An ideal still gives way when the next practice comes due: the
    // Carmelite offering (05:50) yields to mental prayer at 06:00.
    expect(pick('carmelite', '06:05').ref).toBe('mental-prayer-teresian')
  })

  it("closes a practice's timeframe with its part of the day", () => {
    // The Franciscan 08:00 Gospel holds until noon — the morning's end — not
    // until the 21:30 examen.
    expect(pick('franciscan', '11:30').ref).toBe('gospel-of-the-day')
    expect(pick('franciscan', '13:00')).toEqual({
      ref: 'examination-of-conscience',
      comingUp: true,
    })
  })

  it('never brings back a missed practice', () => {
    // Nothing prayed all morning: at 13h the card looks ahead to the 13:30
    // visit, not back.
    expect(pick('cursillo', '13:00')).toEqual({ ref: 'visit-blessed-sacrament', comingUp: false })
    // A timeframe ends with its part of the day: the 15:00 Chaplet is gone by
    // 23h; an evening Rosary holds through the night.
    expect(pick('divine-mercy', '23:00', ['morning-offering-faustina', 'mass']).ref).toBeUndefined()
    expect(pick('legion-of-mary', '03:00', ['morning-offering']).ref).toBe('rosary')
  })

  it('keeps the evening going past midnight', () => {
    // At 01:00 the 22:00 examen is late, not tomorrow's.
    expect(pick('beginner-minimum', '01:00', ['morning-offering']).ref).toBe(
      'examination-of-conscience',
    )
  })
})
