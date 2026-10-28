import { describe, expect, it } from 'vitest'

import type { AppEvent } from '@/db/events/types'

import { type ChronicleProgram, chronicleDay } from '../chronicle'
import { ruleTimeline, type TimedEvent } from '../record'

const rosary = 'practice/rosary'
const viaSacra = 'practice/via-sacra'
const novena = 'practice/novena-st-michael'
const at = (date: string, time = '09:00') => new Date(`${date}T${time}:00`).getTime()
const daily = JSON.stringify({ type: 'daily' })
const fridays = JSON.stringify({ type: 'days-of-week', days: [5] })

function added(practiceId: string, date: string, slot: string, time: string, schedule = daily) {
  const event: AppEvent = {
    type: 'SlotAdded',
    practiceId,
    slotKey: `${practiceId}::${slot}`,
    tier: 'essential',
    time,
    timeBlock: 'daytime',
    schedule,
    sortOrder: 0,
    enabled: 1,
  }
  return { event, timestamp: at(date) } satisfies TimedEvent
}

function day(
  date: string,
  events: TimedEvent[],
  completions: { practiceId: string; subId: string | null; time?: string }[] = [],
  { today = '2026-09-29', now = 12 * 60, programs = [] as ChronicleProgram[] } = {},
) {
  const ids = new Set(events.map((e) => ('practiceId' in e.event ? e.event.practiceId : '')))
  return chronicleDay({
    date,
    timelines: new Map([...ids].map((id) => [id, ruleTimeline(id, events)])),
    programs,
    completions: completions.map((c) => ({ ...c, completedAt: at(date, c.time ?? '10:00') })),
    today,
    now,
    contextFor: () => undefined,
  })
}

const plan = [
  added(rosary, '2026-09-01', 'evening', '18:00'),
  added(viaSacra, '2026-09-01', '1', '15:00', fridays),
]

// September 2026: the 25th is a Friday, the 29th a Tuesday.
describe('chronicleDay', () => {
  it('strings the day on the plan that day asked for, in the order of its hours', () => {
    const friday = day('2026-09-25', plan, [{ practiceId: viaSacra, subId: '1' }])
    expect(friday.beads.map((b) => [b.practiceId, b.state])).toEqual([
      [viaSacra, 'kept'],
      [rosary, 'missed'],
    ])
    expect(day('2026-09-24', plan).beads.map((b) => b.practiceId)).toEqual([rosary])
  })

  it('shows a time added that same day only once it is prayed', () => {
    const events = [...plan, added(rosary, '2026-09-24', 'morning', '07:00')]
    expect(day('2026-09-24', events).beads).toHaveLength(1)
    const prayed = day('2026-09-24', events, [{ practiceId: rosary, subId: 'morning' }])
    expect(prayed.beads.map((b) => b.state)).toEqual(['kept', 'missed'])
  })

  it('lets a prayer outside its times fill the unkept one, and counts the rest as extra', () => {
    const d = day('2026-09-24', plan, [
      { practiceId: rosary, subId: 'default', time: '10:00' },
      { practiceId: rosary, subId: 'default', time: '20:00' },
      { practiceId: 'practice/act-of-contrition', subId: 'default', time: '21:00' },
    ])
    expect(d.beads.map((b) => b.state)).toEqual(['kept'])
    expect(d.extras.map((e) => e.practiceId)).toEqual([rosary, 'practice/act-of-contrition'])
  })

  it('leaves today’s later times ahead, not missed', () => {
    const events = [...plan, added(rosary, '2026-09-01', 'morning', '07:00')]
    const d = day('2026-09-29', events, [], { now: 12 * 60 })
    expect(d.beads.map((b) => [b.time, b.state])).toEqual([
      ['07:00', 'missed'],
      ['18:00', 'ahead'],
    ])
  })

  it('notes a practice joining the plan after it began', () => {
    const events = [...plan, added('practice/angelus', '2026-09-24', '1', '12:00')]
    expect(day('2026-09-24', events).notes).toEqual([
      { kind: 'joined', practiceId: 'practice/angelus' },
    ])
    expect(day('2026-09-01', plan).notes).toEqual([])
  })

  it('beads a program on its run’s dates, marks its first and last, and keeps an earlier run', () => {
    const dates = ['2026-09-20', '2026-09-21', '2026-09-22']
    const programs = [{ practiceId: novena, time: '20:30', dates }]
    const first = day('2026-09-20', plan, [{ practiceId: novena, subId: 'default' }], { programs })
    expect(first.beads.find((b) => b.kind === 'program')).toMatchObject({
      programDay: 1,
      state: 'kept',
    })
    expect(first.notes).toContainEqual({ kind: 'programBegan', practiceId: novena })

    const waiting = day('2026-09-20', plan, [], { programs, today: '2026-09-20' })
    expect(waiting.notes).toEqual([])

    const last = day('2026-09-22', plan, [], { programs })
    expect(last.beads.find((b) => b.kind === 'program')?.state).toBe('missed')
    expect(last.notes).toContainEqual({ kind: 'programEnded', practiceId: novena })

    const earlier = day('2026-09-10', plan, [{ practiceId: novena, subId: 'default' }], {
      programs,
    })
    expect(earlier.beads.find((b) => b.kind === 'program')).toMatchObject({
      programDay: undefined,
      state: 'kept',
    })
    expect(day('2026-09-12', plan, [], { programs }).beads.some((b) => b.kind === 'program')).toBe(
      false,
    )
  })

  it("numbers a day within its own round, and shows a later round's missed day", () => {
    const ember = 'practice/ember-days'
    const programs = [
      {
        practiceId: ember,
        time: '07:00',
        dates: [],
        rounds: [
          ['2026-12-16', '2026-12-18', '2026-12-19'],
          ['2027-02-17', '2027-02-19', '2027-02-20'],
        ],
      },
    ]
    const opts = { programs, today: '2027-03-01' }
    const kept = day('2027-02-19', [], [{ practiceId: ember, subId: '1' }], opts)
    expect(kept.beads).toMatchObject([{ kind: 'program', programDay: 2, state: 'kept' }])
    const missed = day('2027-02-20', [], [], opts)
    expect(missed.beads).toMatchObject([{ kind: 'program', programDay: 3, state: 'missed' }])
    expect(missed.notes).toEqual([])
  })
})
