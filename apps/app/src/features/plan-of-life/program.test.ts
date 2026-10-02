import { describe, expect, it } from 'vitest'
import type { ProgramConfig } from '@/content/manifestTypes'
import {
  computeAllDayStates,
  computeMissedDays,
  computeProgramProgress,
  computeShouldRestart,
  isUnderWay,
  programDayDates,
  programFinishedOn,
  projectProgramAtDate,
  resolveCalendarDay,
  selectEnrollmentSchedule,
  traditionalStart,
} from './program'
import type { Schedule } from './schedule'
import { getOccurrenceBasedProgramDay } from './schedule'

function date(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d)
}

const firstFriday: Schedule = { type: 'nth-weekday', n: [1], day: 5 }

const restartProgram: ProgramConfig = {
  totalDays: 9,
  progressPolicy: 'restart',
  completionBehavior: 'offer-restart',
  restartThreshold: 1,
}

describe('computeMissedDays', () => {
  it.each([
    ['wait', 5, 0, 0],
    ['restart', undefined, 0, 0],
    ['restart', 1, 3, 0],
    ['continue', 5, 2, 3],
  ] as const)('%s policy, calendar day %s, %s completions → %s missed', (policy, day, done, missed) => {
    expect(computeMissedDays(policy, day, done)).toBe(missed)
  })
})

describe('computeShouldRestart', () => {
  it('fires only for the restart policy once the threshold is reached', () => {
    expect(computeShouldRestart('continue', 5, 1)).toBe(false)
    expect(computeShouldRestart('restart', 1, 1)).toBe(true)
    expect(computeShouldRestart('restart', 1, 2)).toBe(false)
  })
})

describe('resolveCalendarDay', () => {
  it('delegates to getProgramDay for fixed-program', () => {
    const schedule: Schedule = { type: 'fixed-program', totalDays: 9, startDate: '2026-01-01' }
    expect(resolveCalendarDay(schedule, null, date(2026, 1, 4), 9)).toBe(3)
  })

  it('delegates to getOccurrenceBasedProgramDay for nth-weekday', () => {
    const cursor = { started_at: '2026-01-01' }
    // Jan 2 is 1st Friday 2026, day after = 1 occurrence passed
    expect(resolveCalendarDay(firstFriday, cursor, date(2026, 1, 3), 9)).toBe(1)
  })

  it('returns undefined for nth-weekday without cursor', () => {
    expect(resolveCalendarDay(firstFriday, null, date(2026, 1, 3), 9)).toBe(undefined)
  })
})

describe('computeProgramProgress', () => {
  it('returns completion count as programDay for wait policy', () => {
    const waitProgram: ProgramConfig = { ...restartProgram, progressPolicy: 'wait' }
    const p = computeProgramProgress({
      program: waitProgram,
      completionCount: 3,
      calendarDay: 5,
    })
    expect(p.programDay).toBe(3)
    expect(p.missedDays).toBe(0)
    expect(p.shouldPromptRestart).toBe(false)
  })

  it('overrides programDay with calendarDay for restart policy', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 1,
      calendarDay: 3,
    })
    expect(p.programDay).toBe(3)
    expect(p.missedDays).toBe(2)
    expect(p.shouldPromptRestart).toBe(true)
  })

  it('completes at totalDays and caps programDay at totalDays - 1', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 12,
      calendarDay: undefined,
    })
    expect(p.programDay).toBe(8) // totalDays is 9, capped at 8
    expect(p.isComplete).toBe(true)
  })

  it('uses completion count when calendarDay is undefined', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 4,
      calendarDay: undefined,
    })
    expect(p.programDay).toBe(4)
    expect(p.missedDays).toBe(0)
  })
})

describe('computeAllDayStates', () => {
  it('normal progress: completed + current + future', () => {
    const progress = computeProgramProgress({
      program: restartProgram,
      completionCount: 2,
      calendarDay: 2,
    })
    const states = computeAllDayStates(progress)

    expect(states[0]).toEqual({
      isMissed: false,
      isCurrent: false,
      isCompleted: true,
      isFuture: false,
    })
    expect(states[1]).toEqual({
      isMissed: false,
      isCurrent: false,
      isCompleted: true,
      isFuture: false,
    })
    expect(states[2]).toEqual({
      isMissed: false,
      isCurrent: true,
      isCompleted: false,
      isFuture: false,
    })
    expect(states[3]).toEqual({
      isMissed: false,
      isCurrent: false,
      isCompleted: false,
      isFuture: true,
    })
  })

  it('missed 1: completed + missed + future (no current when restart needed)', () => {
    const progress = computeProgramProgress({
      program: restartProgram,
      completionCount: 1,
      calendarDay: 2,
    })
    const states = computeAllDayStates(progress)

    expect(states[0].isCompleted).toBe(true)
    expect(states[1].isMissed).toBe(true)
    expect(states[1].isCompleted).toBe(false)
    expect(states[2].isFuture).toBe(true)
    expect(states[2].isCurrent).toBe(false) // restart needed → no current
  })

  it('complete: all completed', () => {
    const progress = computeProgramProgress({
      program: restartProgram,
      completionCount: 9,
      calendarDay: undefined,
    })
    const states = computeAllDayStates(progress)

    for (const s of states) {
      expect(s.isCompleted).toBe(true)
      expect(s.isMissed).toBe(false)
    }
  })

  it('wait policy: no missed days even with gap', () => {
    const waitProgram: ProgramConfig = { ...restartProgram, progressPolicy: 'wait' }
    const progress = computeProgramProgress({
      program: waitProgram,
      completionCount: 1,
      calendarDay: 5,
    })
    const states = computeAllDayStates(progress)

    // programDay = completionCount = 1 (wait ignores calendarDay)
    expect(states[0].isCompleted).toBe(true)
    expect(states[1].isCurrent).toBe(true)
    expect(states[2].isFuture).toBe(true)
    expect(states.every((s) => !s.isMissed)).toBe(true)
  })
})

describe('selectEnrollmentSchedule', () => {
  it('keeps default schedule for wait policy', () => {
    const daily: Schedule = { type: 'daily' }
    expect(selectEnrollmentSchedule('wait', daily, 9, '2026-01-01')).toBe(daily)
  })

  it('keeps occurrence-based schedules for restart policy', () => {
    const dom: Schedule = { type: 'day-of-month', days: [1] }
    expect(selectEnrollmentSchedule('restart', firstFriday, 9, '2026-01-01')).toBe(firstFriday)
    expect(selectEnrollmentSchedule('restart', dom, 9, '2026-01-01')).toBe(dom)
  })

  it('creates fixed-program for daily schedule with restart policy', () => {
    const daily: Schedule = { type: 'daily' }
    const result = selectEnrollmentSchedule('restart', daily, 9, '2026-01-01')
    expect(result).toEqual({ type: 'fixed-program', totalDays: 9, startDate: '2026-01-01' })
  })
})

describe('projectProgramAtDate', () => {
  const waitProgram: ProgramConfig = {
    totalDays: 9,
    progressPolicy: 'wait',
    completionBehavior: 'auto-disable',
  }
  const continueProgram: ProgramConfig = {
    totalDays: 9,
    progressPolicy: 'continue',
    completionBehavior: 'auto-disable',
  }
  const dailySchedule: Schedule = { type: 'daily' }
  const fixedSchedule: Schedule = {
    type: 'fixed-program',
    totalDays: 9,
    startDate: '2026-06-01',
  }
  const cursor = { started_at: '2026-06-01' }

  describe('wait policy', () => {
    const completions = ['2026-06-01', '2026-06-03', '2026-06-05']
    const realToday = date(2026, 6, 6)

    it('hides before start date', () => {
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 5, 30),
      })
      expect(p.visible).toBe(false)
    })

    it('past in window shows count up to that date', () => {
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 3),
      })
      expect(p.visible).toBe(true)
      expect(p.programDay).toBe(2) // 2 completions by Jun 3 → working on day 3
    })

    it('today shows current count', () => {
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: realToday,
      })
      expect(p.visible).toBe(true)
      expect(p.programDay).toBe(3)
      expect(p.isProjection).toBe(false)
    })

    it('future projects on-track from today', () => {
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 9),
      })
      expect(p.visible).toBe(true)
      expect(p.programDay).toBe(6) // 3 + 3 days ahead
      expect(p.isProjection).toBe(true)
    })

    it('future hides when projected end reached', () => {
      // 3 done + 6 days ahead = 9 (= totalDays) → complete → hide
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 12),
      })
      expect(p.visible).toBe(false)
      expect(p.isComplete).toBe(true)
    })

    it('caps programDay at totalDays - 1 on the last visible day', () => {
      // 3 done + 5 days ahead = 8 (= totalDays - 1) → still visible
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 11),
      })
      expect(p.visible).toBe(true)
      expect(p.programDay).toBe(8)
    })

    it('past hides after the user finished the novena', () => {
      const done = Array.from({ length: 9 }, (_, i) => `2026-06-0${i + 1}`)
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor,
        completionDatesAsc: done,
        realToday: date(2026, 6, 15),
        targetDate: date(2026, 6, 12),
      })
      expect(p.visible).toBe(false)
    })

    it('hides when no cursor', () => {
      const p = projectProgramAtDate({
        program: waitProgram,
        schedule: dailySchedule,
        cursor: null,
        completionDatesAsc: [],
        realToday,
        targetDate: realToday,
      })
      expect(p.visible).toBe(false)
    })
  })

  describe('continue/restart policy', () => {
    const realToday = date(2026, 6, 6)
    const completions = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05']

    it('within window uses calendar day', () => {
      const p = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 5),
      })
      expect(p.visible).toBe(true)
      expect(p.programDay).toBe(4)
    })

    it('hides past end of window', () => {
      const p = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 6, 10),
      })
      // June 1 + 9 days = June 10 (day 9 = out of range)
      expect(p.visible).toBe(false)
    })

    it('past its window rests on the last day: complete, or with the days missed', () => {
      const all = Array.from({ length: 9 }, (_, i) => `2026-06-0${i + 1}`)
      const finished = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: all,
        realToday: date(2026, 6, 15),
        targetDate: date(2026, 6, 15),
      })
      expect(finished.isComplete).toBe(true)
      expect(finished.completionCount).toBe(9)

      const lapsed = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: completions,
        realToday: date(2026, 6, 15),
        targetDate: date(2026, 6, 15),
      })
      expect(lapsed.isComplete).toBe(false)
      expect(lapsed.programDay).toBe(8)
      expect(lapsed.completionCount).toBe(5)
      expect(lapsed.missedDays).toBe(4)
      expect(computeAllDayStates(lapsed).filter((d) => d.isMissed)).toHaveLength(4)
      expect(computeAllDayStates(lapsed).some((d) => d.isCurrent)).toBe(false)
    })

    it('marks the very day that was missed, not the next one after the days kept', () => {
      const p = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: ['2026-06-01', '2026-06-02', '2026-06-04', '2026-06-05'],
        realToday,
        targetDate: realToday,
      })
      const states = computeAllDayStates(p)
      expect(states.map((s) => s.isMissed)).toEqual([
        false,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
      ])
      expect(states[3].isCompleted).toBe(true)
      expect(states[4].isCompleted).toBe(true)
      expect(states[5].isCurrent).toBe(true)
      expect(p.missedDays).toBe(1)
    })

    it("doesn't let a prayer after the ninth day stand for a missed one", () => {
      const p = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: [
          '2026-06-01',
          '2026-06-02',
          '2026-06-04',
          '2026-06-05',
          '2026-06-06',
          '2026-06-07',
          '2026-06-08',
          '2026-06-09',
          '2026-06-10',
        ],
        realToday: date(2026, 6, 10),
        targetDate: date(2026, 6, 10),
      })
      expect(p.isComplete).toBe(false)
      expect(p.completionCount).toBe(8)
      expect(computeAllDayStates(p)[2].isMissed).toBe(true)
    })

    it('forward projection suppresses missed/restart diagnostics', () => {
      const restartCfg: ProgramConfig = {
        ...continueProgram,
        progressPolicy: 'restart',
        restartThreshold: 1,
      }
      // 2 completions, real today is day 5 — restart should fire today
      const p = projectProgramAtDate({
        program: restartCfg,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: ['2026-06-01', '2026-06-02'],
        realToday: date(2026, 6, 5),
        targetDate: date(2026, 6, 7),
      })
      expect(p.isProjection).toBe(true)
      expect(p.missedDays).toBe(0)
      expect(p.shouldPromptRestart).toBe(false)
    })

    it('today on restart-needed program flags restart', () => {
      const restartCfg: ProgramConfig = {
        ...continueProgram,
        progressPolicy: 'restart',
        restartThreshold: 1,
      }
      const p = projectProgramAtDate({
        program: restartCfg,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: ['2026-06-01', '2026-06-02'],
        realToday: date(2026, 6, 5),
        targetDate: date(2026, 6, 5),
      })
      expect(p.shouldPromptRestart).toBe(true)
      expect(p.missedDays).toBeGreaterThan(0)
    })
  })
})

describe('First Fridays end-to-end scenarios', () => {
  const startDate = '2026-01-01'

  function scenario(today: Date, completionCount: number) {
    const calendarDay = getOccurrenceBasedProgramDay(firstFriday, startDate, today, 9)
    return computeProgramProgress({
      program: restartProgram,
      completionCount,
      calendarDay,
    })
  }

  it('missed 1: completed 1, day after 2nd first Friday', () => {
    const p = scenario(date(2026, 2, 7), 1)
    expect(p.missedDays).toBe(1)
    expect(p.shouldPromptRestart).toBe(true)

    const states = computeAllDayStates(p)
    expect(states[0].isCompleted).toBe(true)
    expect(states[1].isMissed).toBe(true)
    expect(states[2].isFuture).toBe(true)
  })

  it('missed all: completed 0, after 3rd first Friday', () => {
    const p = scenario(date(2026, 3, 7), 0)
    expect(p.missedDays).toBe(3)
    expect(p.shouldPromptRestart).toBe(true)

    const states = computeAllDayStates(p)
    expect(states[0].isMissed).toBe(true)
    expect(states[1].isMissed).toBe(true)
    expect(states[2].isMissed).toBe(true)
    expect(states[3].isFuture).toBe(true)
  })

  it('on track: completed 3, on 4th first Friday', () => {
    const p = scenario(date(2026, 4, 3), 3)
    expect(p.missedDays).toBe(0)
    expect(p.shouldPromptRestart).toBe(false)

    const states = computeAllDayStates(p)
    expect(states[2].isCompleted).toBe(true)
    expect(states[3].isCurrent).toBe(true)
    expect(states[4].isFuture).toBe(true)
  })

  it('mid-month enrollment skips past occurrence', () => {
    const calendarDay = getOccurrenceBasedProgramDay(firstFriday, '2026-01-05', date(2026, 2, 7), 9)
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 0,
      calendarDay,
    })
    // Feb 6 was day 0, now passed → calendarDay = 1, missed 1
    expect(p.programDay).toBe(1)
    expect(p.missedDays).toBe(1)
    expect(p.shouldPromptRestart).toBe(true)
  })
})

describe('First Fridays kept on their Fridays', () => {
  const fridays = [
    '2026-01-02',
    '2026-02-06',
    '2026-03-06',
    '2026-04-03',
    '2026-05-01',
    '2026-06-05',
    '2026-07-03',
    '2026-08-07',
    '2026-09-04',
  ]
  const on = (done: string[], today: Date) =>
    projectProgramAtDate({
      program: restartProgram,
      schedule: firstFriday,
      cursor: { started_at: '2026-01-01' },
      completionDatesAsc: done,
      realToday: today,
      targetDate: today,
    })

  it("doesn't let a prayer on another day stand for a missed Friday", () => {
    const late = on(['2026-01-02', '2026-02-06', '2026-03-10'], date(2026, 3, 10))
    expect(late.completionCount).toBe(2)
    expect(late.shouldPromptRestart).toBe(true)
  })

  it('rests complete once the ninth Friday is kept, and asks to restart if it was missed', () => {
    const kept = on(fridays, date(2026, 9, 20))
    expect(kept.isComplete).toBe(true)
    expect(kept.programDay).toBe(8)

    const missed = on(fridays.slice(0, 8), date(2026, 9, 20))
    expect(missed.isComplete).toBe(false)
    expect(missed.missedDays).toBe(1)
    expect(missed.shouldPromptRestart).toBe(true)
  })
})

describe('isUnderWay', () => {
  const novena: ProgramConfig = {
    totalDays: 9,
    progressPolicy: 'continue',
    completionBehavior: 'offer-restart',
  }
  const schedule: Schedule = { type: 'fixed-program', totalDays: 9, startDate: '2026-09-01' }
  const all = Array.from({ length: 9 }, (_, i) => `2026-09-0${i + 1}`)
  const on = (done: string[], today: Date) =>
    isUnderWay({
      program: novena,
      schedule,
      cursor: { started_at: '2026-09-01' },
      completionDatesAsc: done,
      today,
    })

  it('keeps a finished novena for a week past its last day, then lets it go', () => {
    expect(on(all, date(2026, 9, 5))).toBe(true)
    expect(on(all, date(2026, 9, 16))).toBe(true)
    expect(on(all, date(2026, 9, 17))).toBe(false)
  })

  it('lets a lapsed novena go a week after its window closes', () => {
    expect(on(all.slice(0, 5), date(2026, 9, 14))).toBe(true)
    expect(on(all.slice(0, 5), date(2026, 9, 20))).toBe(false)
  })
})

describe('programDayDates', () => {
  const novena = (policy: ProgramConfig['progressPolicy']): ProgramConfig => ({
    totalDays: 9,
    progressPolicy: policy,
    completionBehavior: 'offer-restart',
  })

  it('counts a calendar-bound novena on from its start, missed days included', () => {
    const dates = programDayDates({
      program: novena('continue'),
      schedule: { type: 'fixed-program', totalDays: 9, startDate: '2026-09-26' },
      startedAt: '2026-09-26',
      completionDatesAsc: ['2026-09-26', '2026-09-28'],
      today: date(2026, 9, 29),
    })
    expect(dates).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
  })

  it('dates a waiting program by its prayers, then from tomorrow once today is prayed', () => {
    const dates = programDayDates({
      program: { ...novena('wait'), totalDays: 4 },
      schedule: { type: 'daily' },
      startedAt: '2026-09-01',
      completionDatesAsc: ['2026-08-20', '2026-09-03', '2026-09-29'],
      today: date(2026, 9, 29),
    })
    expect(dates).toEqual(['2026-09-03', '2026-09-29', '2026-09-30', '2026-10-01'])
  })

  it('lands a first-Friday devotion on first Fridays', () => {
    const dates = programDayDates({
      program: { ...novena('continue'), totalDays: 3 },
      schedule: firstFriday,
      startedAt: '2026-09-10',
      completionDatesAsc: [],
      today: date(2026, 9, 29),
    })
    expect(dates).toEqual(['2026-10-02', '2026-11-06', '2026-12-04'])
  })

  it('leaves the days of a holy-day rule undated', () => {
    const dates = programDayDates({
      program: { ...novena('continue'), totalDays: 2 },
      schedule: { type: 'holy-days-of-obligation' },
      startedAt: '2026-09-10',
      completionDatesAsc: [],
      today: date(2026, 9, 29),
    })
    expect(dates).toEqual([undefined, undefined])
  })
})

describe('programFinishedOn', () => {
  const novena: ProgramConfig = {
    totalDays: 9,
    progressPolicy: 'continue',
    completionBehavior: 'offer-restart',
  }
  const schedule: Schedule = { type: 'fixed-program', totalDays: 9, startDate: '2026-06-01' }
  const cursor = { started_at: '2026-06-01' }
  const days = Array.from({ length: 9 }, (_, i) => `2026-06-0${i + 1}`)
  const finished = (completionDatesAsc: string[], today: Date, program = novena) =>
    programFinishedOn({ program, schedule, cursor, completionDatesAsc, today })

  it('finishes on its last day once every day is prayed', () => {
    expect(finished(days, date(2026, 6, 9))).toBe('2026-06-09')
  })

  it('forgives one missed day in nine, but only once the last day has gone by', () => {
    const one = days.filter((d) => d !== '2026-06-03')
    expect(finished(one, date(2026, 6, 9))).toBeUndefined()
    expect(finished(one, date(2026, 6, 10))).toBe('2026-06-09')
  })

  it('gives nothing for two missed days', () => {
    const two = days.filter((d) => d !== '2026-06-03' && d !== '2026-06-07')
    expect(finished(two, date(2026, 6, 20))).toBeUndefined()
  })

  it('scales the allowance: one miss for each nine days, so a short program is kept whole', () => {
    const short = (done: string[]) =>
      programFinishedOn({
        program: { ...novena, totalDays: 3 },
        schedule: { type: 'fixed-program', totalDays: 3, startDate: '2026-06-01' },
        cursor,
        completionDatesAsc: done,
        today: date(2026, 6, 10),
      })
    expect(short(['2026-06-01', '2026-06-03'])).toBeUndefined()
    expect(short(['2026-06-01', '2026-06-02', '2026-06-03'])).toBe('2026-06-03')
  })

  it('needs every day of a program that restarts on a miss', () => {
    const restart: ProgramConfig = { ...novena, progressPolicy: 'restart' }
    const one = days.filter((d) => d !== '2026-06-03')
    expect(finished(one, date(2026, 6, 20), restart)).toBeUndefined()
  })

  it('finishes a program that waits on its last prayer', () => {
    const wait = (done: string[]) =>
      programFinishedOn({
        program: { ...novena, progressPolicy: 'wait' },
        schedule: { type: 'daily' },
        cursor,
        completionDatesAsc: done,
        today: date(2026, 6, 25),
      })
    const prayed = ['2026-06-01', '2026-06-04', '2026-06-05', '2026-06-08', '2026-06-09']
    expect(wait(prayed)).toBeUndefined()
    expect(wait([...prayed, '2026-06-12', '2026-06-13', '2026-06-15', '2026-06-20'])).toBe(
      '2026-06-20',
    )
  })
})

describe('traditionalStart', () => {
  const novena = (ends: ProgramConfig['ends']): ProgramConfig => ({
    totalDays: 9,
    progressPolicy: 'continue',
    completionBehavior: 'offer-restart',
    ends,
  })

  it('counts back from the eve of a fixed feast', () => {
    expect(traditionalStart(novena('03-18'), date(2027, 1, 15))).toBe('2027-03-10')
  })

  it('is today on the day it begins', () => {
    expect(traditionalStart(novena('03-18'), date(2027, 3, 10))).toBe('2027-03-10')
  })

  it('has no date to offer while its days are under way', () => {
    expect(traditionalStart(novena('03-18'), date(2027, 3, 11))).toBeUndefined()
    expect(traditionalStart(novena('03-18'), date(2027, 3, 18))).toBeUndefined()
  })

  it('waits for next year once this year\u2019s has gone by', () => {
    expect(traditionalStart(novena('03-18'), date(2027, 3, 19))).toBe('2028-03-10')
  })

  it('begins in December when it ends in January', () => {
    const epiphany = novena('01-05')
    expect(traditionalStart(epiphany, date(2026, 12, 1))).toBe('2026-12-28')
    expect(traditionalStart(epiphany, date(2026, 12, 30))).toBeUndefined()
    expect(traditionalStart(epiphany, date(2027, 1, 2))).toBeUndefined()
    expect(traditionalStart(epiphany, date(2027, 1, 6))).toBe('2027-12-28')
  })

  it('follows a moveable feast from year to year', () => {
    // Easter falls on 28 March 2027 and 16 April 2028.
    const pentecost = novena({ anchor: 'pentecost', offset: -1 })
    expect(traditionalStart(pentecost, date(2027, 1, 1))).toBe('2027-05-07')
    expect(traditionalStart(pentecost, date(2027, 5, 16))).toBe('2028-05-26')
    const divineMercy = novena({ anchor: 'easter', offset: 6 })
    expect(traditionalStart(divineMercy, date(2027, 1, 1))).toBe('2027-03-26')
  })

  it('follows Shrove Tuesday and the Holy Family', () => {
    // Ash Wednesday 2027 is 10 February: the Holy Face is kept on the 9th.
    const holyFace = novena({ anchor: 'ash_wednesday', offset: -2 })
    expect(traditionalStart(holyFace, date(2027, 1, 1))).toBe('2027-01-31')
    // The Sunday in the octave of Christmas 2027 is 26 December.
    const holyFamily = novena({ anchor: 'holy_family', offset: -1 })
    expect(traditionalStart(holyFamily, date(2027, 6, 1))).toBe('2027-12-17')
  })

  it('is undefined for a program tied to no date', () => {
    expect(traditionalStart(novena(undefined), date(2027, 1, 1))).toBeUndefined()
  })
})
