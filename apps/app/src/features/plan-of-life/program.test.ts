import { describe, expect, it } from 'vitest'
import type { ProgramConfig } from '@/content/manifestTypes'
import {
  computeAllDayStates,
  computeMissedDays,
  computeProgramProgress,
  computeShouldRestart,
  projectProgramAtDate,
  resolveCalendarDay,
  selectEnrollmentSchedule,
} from './program'
import type { Schedule } from './schedule'
import { getOccurrenceBasedProgramDay } from './schedule'

function date(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d)
}

const firstFriday: Schedule = { type: 'nth-weekday', n: 1, day: 5 }

const restartProgram: ProgramConfig = {
  totalDays: 9,
  progressPolicy: 'restart',
  completionBehavior: 'offer-restart',
  restartThreshold: 1,
}

// --- computeMissedDays ---

describe('computeMissedDays', () => {
  it('returns 0 for wait policy regardless of gap', () => {
    expect(computeMissedDays('wait', 5, 0)).toBe(0)
  })

  it('returns 0 when calendarDay is undefined', () => {
    expect(computeMissedDays('restart', undefined, 0)).toBe(0)
  })

  it('returns 0 when completions match calendar', () => {
    expect(computeMissedDays('restart', 2, 2)).toBe(0)
  })

  it('returns 0 when completions exceed calendar', () => {
    expect(computeMissedDays('restart', 1, 3)).toBe(0)
  })

  it('returns gap for restart policy', () => {
    expect(computeMissedDays('restart', 3, 1)).toBe(2)
  })

  it('returns gap for continue policy', () => {
    expect(computeMissedDays('continue', 5, 2)).toBe(3)
  })
})

// --- computeShouldRestart ---

describe('computeShouldRestart', () => {
  it('returns false for non-restart policies', () => {
    expect(computeShouldRestart('wait', 5, 1)).toBe(false)
    expect(computeShouldRestart('continue', 5, 1)).toBe(false)
  })

  it('returns true when missed >= threshold', () => {
    expect(computeShouldRestart('restart', 1, 1)).toBe(true)
    expect(computeShouldRestart('restart', 3, 1)).toBe(true)
  })

  it('returns false when missed < threshold', () => {
    expect(computeShouldRestart('restart', 0, 1)).toBe(false)
    expect(computeShouldRestart('restart', 1, 2)).toBe(false)
  })
})

// --- resolveCalendarDay ---

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

  it('returns undefined for daily schedule', () => {
    const daily: Schedule = { type: 'daily' }
    expect(resolveCalendarDay(daily, { started_at: '2026-01-01' }, date(2026, 1, 5), 9)).toBe(
      undefined,
    )
  })
})

// --- computeProgramProgress ---

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

  it('no missed days when on track', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 2,
      calendarDay: 2,
    })
    expect(p.missedDays).toBe(0)
    expect(p.shouldPromptRestart).toBe(false)
  })

  it('marks program complete when completionCount >= totalDays', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 9,
      calendarDay: undefined,
    })
    expect(p.isComplete).toBe(true)
    expect(p.shouldPromptRestart).toBe(false)
  })

  it('caps programDay at totalDays - 1', () => {
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

// --- computeDayState / computeAllDayStates ---

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

  it('missed all: all missed + future', () => {
    const progress = computeProgramProgress({
      program: restartProgram,
      completionCount: 0,
      calendarDay: 3,
    })
    const states = computeAllDayStates(progress)

    expect(states[0].isMissed).toBe(true)
    expect(states[1].isMissed).toBe(true)
    expect(states[2].isMissed).toBe(true)
    expect(states[3].isFuture).toBe(true)
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

// --- selectEnrollmentSchedule ---

describe('selectEnrollmentSchedule', () => {
  it('keeps default schedule for wait policy', () => {
    const daily: Schedule = { type: 'daily' }
    expect(selectEnrollmentSchedule('wait', daily, 9, '2026-01-01')).toBe(daily)
  })

  it('keeps nth-weekday schedule for restart policy', () => {
    expect(selectEnrollmentSchedule('restart', firstFriday, 9, '2026-01-01')).toBe(firstFriday)
  })

  it('keeps day-of-month schedule for restart policy', () => {
    const dom: Schedule = { type: 'day-of-month', days: [1] }
    expect(selectEnrollmentSchedule('restart', dom, 9, '2026-01-01')).toBe(dom)
  })

  it('creates fixed-program for daily schedule with restart policy', () => {
    const daily: Schedule = { type: 'daily' }
    const result = selectEnrollmentSchedule('restart', daily, 9, '2026-01-01')
    expect(result).toEqual({ type: 'fixed-program', totalDays: 9, startDate: '2026-01-01' })
  })
})

// --- projectProgramAtDate ---

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

    it('hides before start date', () => {
      const p = projectProgramAtDate({
        program: continueProgram,
        schedule: fixedSchedule,
        cursor,
        completionDatesAsc: completions,
        realToday,
        targetDate: date(2026, 5, 25),
      })
      expect(p.visible).toBe(false)
    })

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

// --- Full chain: First Fridays scenario tests ---

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

  it('no miss: completed 1, on 2nd first Friday', () => {
    const p = scenario(date(2026, 2, 6), 1)
    expect(p.programDay).toBe(1)
    expect(p.missedDays).toBe(0)
    expect(p.shouldPromptRestart).toBe(false)
  })

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

  it('completed all 9', () => {
    const p = computeProgramProgress({
      program: restartProgram,
      completionCount: 9,
      calendarDay: undefined,
    })
    expect(p.isComplete).toBe(true)
    const states = computeAllDayStates(p)
    expect(states.every((s) => s.isCompleted)).toBe(true)
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
