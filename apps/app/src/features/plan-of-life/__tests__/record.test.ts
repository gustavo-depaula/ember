import { describe, expect, it } from 'vitest'

import type { AppEvent } from '@/db/events/types'

import {
  fidelity,
  planFidelity,
  practiceRecord,
  recordWall,
  ruleTimeline,
  type TimedEvent,
} from '../record'

const id = 'practice/via-sacra'
const at = (date: string, time = '09:00') => new Date(`${date}T${time}:00`).getTime()
const fridays = JSON.stringify({ type: 'days-of-week', days: [5] })
const daily = JSON.stringify({ type: 'daily' })

function added(date: string, slot = '1', schedule = fridays, time = '09:00'): TimedEvent {
  const event: AppEvent = {
    type: 'SlotAdded',
    practiceId: id,
    slotKey: `${id}::${slot}`,
    tier: 'extra',
    time: '15:00',
    timeBlock: 'daytime',
    schedule,
    sortOrder: 0,
    enabled: 1,
  }
  return { event, timestamp: at(date, time) }
}

function updated(date: string, changes: Record<string, unknown>, slot = '1'): TimedEvent {
  return { event: { type: 'SlotUpdated', slotKey: `${id}::${slot}`, changes }, timestamp: at(date) }
}

const prayed = (...dates: string[]) => dates.map((date) => ({ date, subId: '1' }))

function record(
  events: TimedEvent[],
  completions: { date: string; subId: string }[],
  today: string,
) {
  return practiceRecord({
    timeline: ruleTimeline(id, events),
    completions,
    today,
    contextFor: () => undefined,
  })
}

// September 2026: Fridays fall on the 4th, 11th, 18th and 25th.
describe('practiceRecord', () => {
  it('counts a Friday rule by its Fridays, passing over the days between', () => {
    const r = record(
      [added('2026-09-01')],
      prayed('2026-09-04', '2026-09-11', '2026-09-18'),
      '2026-09-24',
    )
    expect(r).toEqual({ count: 3, since: '2026-09-04' })
  })

  it('breaks the run at a missed Friday', () => {
    const r = record([added('2026-09-01')], prayed('2026-09-04', '2026-09-18'), '2026-09-24')
    expect(r.since).toBe('2026-09-18')
  })

  it('does not count today as missed before it is over', () => {
    const r = record([added('2026-09-01')], prayed('2026-09-11', '2026-09-18'), '2026-09-25')
    expect(r.since).toBe('2026-09-11')
  })

  it('reads each day against the rule in force then, not today’s', () => {
    // Fridays until the 19th, then every day: the Thursdays before stay free.
    const events = [added('2026-09-01'), updated('2026-09-19', { schedule: daily })]
    const r = record(
      events,
      prayed('2026-09-04', '2026-09-11', '2026-09-18', '2026-09-20', '2026-09-21'),
      '2026-09-22',
    )
    expect(r.since).toBe('2026-09-04')
  })

  it('does not hold a time against the day it was added on, unless prayed', () => {
    const events = [added('2026-09-01'), added('2026-09-20', '2', daily, '20:00')]
    // The new daily time was added on the evening of the 20th and not prayed that day.
    const r = record(
      events,
      [...prayed('2026-09-04', '2026-09-11', '2026-09-18'), { date: '2026-09-21', subId: '2' }],
      '2026-09-22',
    )
    expect(r.since).toBe('2026-09-04')
  })

  it('asks for every due time on a day with several', () => {
    const events = [added('2026-09-01', '1', daily), added('2026-09-01', '2', daily)]
    const r = record(
      events,
      [
        { date: '2026-09-02', subId: '1' },
        { date: '2026-09-02', subId: '2' },
        { date: '2026-09-03', subId: '1' },
        { date: '2026-09-04', subId: '1' },
        { date: '2026-09-04', subId: '2' },
      ],
      '2026-09-05',
    )
    expect(r.since).toBe('2026-09-04')
  })

  it('lets a prayer outside any due time stand in for one', () => {
    const r = record(
      [added('2026-09-01')],
      [{ date: '2026-09-04', subId: 'default' }],
      '2026-09-05',
    )
    expect(r.since).toBe('2026-09-04')
  })

  it('asks nothing while the practice is out of the rule', () => {
    const events = [
      added('2026-09-01'),
      { event: { type: 'PracticeArchived', practiceId: id }, timestamp: at('2026-09-05') },
      { event: { type: 'PracticeUnarchived', practiceId: id }, timestamp: at('2026-09-15') },
    ] satisfies TimedEvent[]
    const r = record(events, prayed('2026-09-04', '2026-09-18'), '2026-09-20')
    expect(r.since).toBe('2026-09-04')
  })
})

describe('recordWall', () => {
  it('lights kept days, dims missed ones and leaves free days and today dark', () => {
    const wall = recordWall({
      timeline: ruleTimeline(id, [added('2026-09-01')]),
      completions: prayed('2026-09-04', '2026-09-18'),
      today: '2026-09-25',
      days: 25,
      contextFor: () => undefined,
    })
    const lit = Object.fromEntries(wall.filter((d) => d.value > 0).map((d) => [d.date, d.value]))
    expect(lit).toEqual({ '2026-09-04': 4, '2026-09-11': 1, '2026-09-18': 4 })
  })
})

describe('planFidelity', () => {
  const rosary = 'practice/rosary'
  const angelus = 'practice/angelus'
  const slot = (practiceId: string, tier: 'essential' | 'ideal', date: string): TimedEvent => ({
    event: {
      type: 'SlotAdded',
      practiceId,
      slotKey: `${practiceId}::1`,
      tier,
      time: '12:00',
      timeBlock: 'daytime',
      schedule: daily,
      sortOrder: 0,
      enabled: 1,
    },
    timestamp: at(date),
  })
  const on = (date: string, practiceId: string) => ({ date, practiceId, subId: '1' })

  function fidelityOf(
    events: TimedEvent[],
    completions: ReturnType<typeof on>[],
    today: string,
    days: number,
  ) {
    const ids = [rosary, angelus]
    return planFidelity({
      timelines: new Map(ids.map((i) => [i, ruleTimeline(i, events)])),
      completions,
      today,
      days,
      contextFor: () => undefined,
    })
  }

  it('lights a day whose essentials were kept, dims one with only prayer, and leaves today open', () => {
    const r = fidelityOf(
      [slot(rosary, 'essential', '2026-09-01'), slot(angelus, 'ideal', '2026-09-01')],
      [on('2026-09-10', rosary), on('2026-09-11', angelus)],
      '2026-09-13',
      4,
    )
    expect(r.wall).toEqual([
      { date: '2026-09-10', value: fidelity.kept },
      { date: '2026-09-11', value: fidelity.prayed },
      { date: '2026-09-12', value: fidelity.none },
      { date: '2026-09-13', value: fidelity.open },
    ])
  })

  it('counts a prayer outside the plan as a day prayed', () => {
    const r = fidelityOf(
      [slot(rosary, 'essential', '2026-09-01')],
      [{ date: '2026-09-12', practiceId: 'practice/memorare', subId: 'default' }],
      '2026-09-13',
      2,
    )
    expect(r.wall[0].value).toBe(fidelity.prayed)
  })

  it('does not owe an essential on the days before it joined the rule', () => {
    const r = fidelityOf(
      [slot(angelus, 'ideal', '2026-09-01'), slot(rosary, 'essential', '2026-09-12')],
      [on('2026-09-10', angelus)],
      '2026-09-13',
      4,
    )
    expect(r.wall[0].value).toBe(fidelity.kept)
  })

  it('carries the streak through yesterday while today is unprayed', () => {
    const events = [slot(rosary, 'essential', '2026-09-01')]
    const prayed = [on('2026-09-10', angelus), on('2026-09-11', rosary), on('2026-09-12', rosary)]
    expect(fidelityOf(events, prayed, '2026-09-13', 7).streak).toBe(3)
    expect(fidelityOf(events, [...prayed, on('2026-09-13', rosary)], '2026-09-13', 7).streak).toBe(
      4,
    )
    expect(fidelityOf(events, prayed.slice(1), '2026-09-14', 7).streak).toBe(0)
  })

  it('counts days from the plan’s first day, and today only once prayed', () => {
    const events = [slot(rosary, 'essential', '2026-09-10')]
    const prayed = [on('2026-09-10', rosary), on('2026-09-12', rosary)]
    expect(fidelityOf(events, prayed, '2026-09-13', 30)).toMatchObject({
      prayedDays: 2,
      countedDays: 3,
    })
    expect(
      fidelityOf(events, [...prayed, on('2026-09-13', rosary)], '2026-09-13', 30),
    ).toMatchObject({ prayedDays: 3, countedDays: 4 })
  })
})
