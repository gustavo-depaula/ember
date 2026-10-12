import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'

import type { NotificationsManifest } from '@/content/manifestTypes'
import type { NotifyConfig } from '@/db/schema'

import {
  computeTriggerTime,
  datedReminderTimes,
  describeLeadTime,
  localizeMessages,
  parseNotifyConfig,
  pickMessage,
  reminderRecurrence,
  resolveReminders,
  shiftWeekday,
} from './notify'
import { isApplicableOn } from './schedule'

describe('parseNotifyConfig', () => {
  it('returns undefined for empty or malformed input', () => {
    expect(parseNotifyConfig(null)).toBeUndefined()
    expect(parseNotifyConfig('')).toBeUndefined()
    expect(parseNotifyConfig('{not json')).toBeUndefined()
    expect(parseNotifyConfig('"just a string"')).toBeUndefined()
  })

  it('parses configs with and without reminders', () => {
    expect(parseNotifyConfig('{"enabled":true}')).toEqual({ enabled: true })
    expect(parseNotifyConfig('{"enabled":true,"reminders":[{"offset":30},{"offset":0}]}')).toEqual({
      enabled: true,
      reminders: [{ offset: 30 }, { offset: 0 }],
    })
  })
})

describe('resolveReminders', () => {
  const manifest: NotificationsManifest = { defaultReminders: [{ offset: 15 }] }

  it('returns no reminders when notify is disabled', () => {
    expect(resolveReminders({ enabled: false }, manifest)).toEqual([])
    expect(resolveReminders(undefined, manifest)).toEqual([])
  })

  it('uses explicit reminders, deduped, non-negative, latest-first', () => {
    const notify: NotifyConfig = {
      enabled: true,
      reminders: [{ offset: 0 }, { offset: 30 }, { offset: 30 }, { offset: -5 }, { offset: 60 }],
    }
    expect(resolveReminders(notify, manifest)).toEqual([
      { offset: 60 },
      { offset: 30 },
      { offset: 0 },
    ])
  })

  it('falls back to manifest defaults when reminders are missing or empty', () => {
    expect(resolveReminders({ enabled: true }, manifest)).toEqual([{ offset: 15 }])
    expect(resolveReminders({ enabled: true, reminders: [] }, manifest)).toEqual([{ offset: 15 }])
  })

  it('falls back to [{offset:0}] when no manifest defaults', () => {
    expect(resolveReminders({ enabled: true }, undefined)).toEqual([{ offset: 0 }])
    expect(resolveReminders({ enabled: true }, {})).toEqual([{ offset: 0 }])
  })
})

describe('computeTriggerTime', () => {
  it('subtracts the offset within the same day', () => {
    expect(computeTriggerTime('14:15', 90)).toEqual({ hour: 12, minute: 45, weekdayShift: 0 })
  })

  it('wraps to previous day when offset crosses midnight', () => {
    expect(computeTriggerTime('00:15', 30)).toEqual({ hour: 23, minute: 45, weekdayShift: -1 })
  })

  it('returns undefined for malformed slot time', () => {
    expect(computeTriggerTime('25:00', 0)).toBeUndefined()
    expect(computeTriggerTime('abc', 0)).toBeUndefined()
    expect(computeTriggerTime('08', 0)).toBeUndefined()
  })

  it('clamps negative reminder offset to 0', () => {
    expect(computeTriggerTime('08:00', -10)).toEqual({ hour: 8, minute: 0, weekdayShift: 0 })
  })
})

describe('shiftWeekday', () => {
  it('wraps around the week in both directions', () => {
    expect(shiftWeekday(0, -1)).toBe(6)
    expect(shiftWeekday(6, 1)).toBe(0)
  })
})

describe('localizeMessages', () => {
  it('returns the pool for the language, falling back to en-US', () => {
    const pool = { 'en-US': ['hello'], 'pt-BR': ['olá', 'oi'] }
    expect(localizeMessages(pool, 'pt-BR')).toEqual(['olá', 'oi'])
    expect(localizeMessages({ 'en-US': ['hello'] }, 'pt-BR')).toEqual(['hello'])
  })

  it('wraps a single string into an array', () => {
    expect(localizeMessages({ 'en-US': 'hello' }, 'en-US')).toEqual(['hello'])
  })

  it('returns empty array when pool undefined or empty', () => {
    expect(localizeMessages(undefined, 'en-US')).toEqual([])
    expect(localizeMessages({}, 'en-US')).toEqual([])
  })
})

describe('pickMessage', () => {
  it('picks by seed modulo pool size, including negative seeds', () => {
    expect(pickMessage([], 0)).toBeUndefined()
    expect(pickMessage(['a', 'b', 'c'], 4)).toBe('b')
    expect(pickMessage(['a', 'b'], -1)).toBe('b')
  })
})

describe('describeLeadTime', () => {
  it.each([
    [0, { kind: 'at' }],
    [-5, { kind: 'at' }],
    [45, { kind: 'minutes', count: 45 }],
    [120, { kind: 'hours', count: 2 }],
    [90, { kind: 'minutes', count: 90 }],
  ])('%i minutes → %o', (offset, expected) => {
    expect(describeLeadTime(offset)).toEqual(expected)
  })
})

describe('reminderRecurrence', () => {
  it('repeats by clock or weekday only when nothing else bounds the rule', () => {
    expect(reminderRecurrence({ type: 'daily' })).toEqual({ kind: 'daily' })
    expect(reminderRecurrence({ type: 'days-of-week', days: [1, 5] })).toEqual({
      kind: 'weekly',
      days: [1, 5],
    })
    expect(reminderRecurrence({ type: 'daily', seasons: ['easter'] })).toEqual({ kind: 'dated' })
    expect(reminderRecurrence({ type: 'ember-days' })).toEqual({ kind: 'dated' })
    expect(reminderRecurrence({ type: 'nth-weekday', n: [1], day: 5 })).toEqual({ kind: 'dated' })
  })
})

describe('datedReminderTimes', () => {
  const emberDays = (from: Date, offset: number) =>
    datedReminderTimes({
      slotTime: '07:30',
      offset,
      from,
      days: 90,
      isDue: (date) => isApplicableOn({ type: 'ember-days' }, date),
    }).map((d) => format(d, 'yyyy-MM-dd HH:mm'))

  it('rings the Ember days on their own dates and no other', () => {
    expect(emberDays(new Date(2026, 9, 12, 9, 0), 0)).toEqual([
      '2026-12-16 07:30',
      '2026-12-18 07:30',
      '2026-12-19 07:30',
    ])
  })

  it('leaves out a reminder whose hour has passed today', () => {
    expect(emberDays(new Date(2026, 11, 16, 8, 0), 0).slice(0, 2)).toEqual([
      '2026-12-18 07:30',
      '2026-12-19 07:30',
    ])
  })

  it('carries a lead time past midnight to the eve', () => {
    const times = datedReminderTimes({
      slotTime: '00:30',
      offset: 60,
      from: new Date(2026, 9, 12, 9, 0),
      days: 90,
      isDue: (date) => isApplicableOn({ type: 'ember-days' }, date),
    })
    expect(format(times[0], 'yyyy-MM-dd HH:mm')).toBe('2026-12-15 23:30')
  })
})
