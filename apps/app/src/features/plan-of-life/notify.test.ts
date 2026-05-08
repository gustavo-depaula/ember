import { describe, expect, it } from 'vitest'

import type { NotificationsManifest } from '@/content/manifestTypes'
import type { NotifyConfig } from '@/db/schema'

import {
  computeTriggerTime,
  describeLeadTime,
  hashSeed,
  localizeMessages,
  parseNotifyConfig,
  pickMessage,
  resolveReminders,
  shiftWeekday,
} from './notify'

describe('parseNotifyConfig', () => {
  it('returns undefined for null/empty input', () => {
    expect(parseNotifyConfig(null)).toBeUndefined()
    expect(parseNotifyConfig('')).toBeUndefined()
    expect(parseNotifyConfig(undefined)).toBeUndefined()
  })

  it('returns undefined for malformed JSON', () => {
    expect(parseNotifyConfig('{not json')).toBeUndefined()
    expect(parseNotifyConfig('"just a string"')).toBeUndefined()
  })

  it('parses legacy { enabled: true } shape', () => {
    expect(parseNotifyConfig('{"enabled":true}')).toEqual({ enabled: true })
  })

  it('parses new shape with reminders', () => {
    const json = '{"enabled":true,"reminders":[{"offset":30},{"offset":0}]}'
    expect(parseNotifyConfig(json)).toEqual({
      enabled: true,
      reminders: [{ offset: 30 }, { offset: 0 }],
    })
  })
})

describe('resolveReminders', () => {
  it('returns no reminders when notify is disabled', () => {
    expect(resolveReminders({ enabled: false }, undefined)).toEqual([])
    expect(resolveReminders(undefined, undefined)).toEqual([])
  })

  it('uses explicit reminders when provided', () => {
    const notify: NotifyConfig = {
      enabled: true,
      reminders: [{ offset: 0 }, { offset: 60 }],
    }
    expect(resolveReminders(notify, undefined)).toEqual([{ offset: 60 }, { offset: 0 }])
  })

  it('falls back to manifest defaults when reminders missing', () => {
    const manifest: NotificationsManifest = {
      defaultReminders: [{ offset: 60 }, { offset: 0 }],
    }
    expect(resolveReminders({ enabled: true }, manifest)).toEqual([{ offset: 60 }, { offset: 0 }])
  })

  it('falls back to [{offset:0}] when no manifest defaults', () => {
    expect(resolveReminders({ enabled: true }, undefined)).toEqual([{ offset: 0 }])
    expect(resolveReminders({ enabled: true }, {})).toEqual([{ offset: 0 }])
  })

  it('dedupes and rejects negative offsets', () => {
    const notify: NotifyConfig = {
      enabled: true,
      reminders: [{ offset: 30 }, { offset: 30 }, { offset: -5 }, { offset: 0 }],
    }
    expect(resolveReminders(notify, undefined)).toEqual([{ offset: 30 }, { offset: 0 }])
  })

  it('falls back to manifest when reminders array is empty', () => {
    const manifest: NotificationsManifest = { defaultReminders: [{ offset: 15 }] }
    expect(resolveReminders({ enabled: true, reminders: [] }, manifest)).toEqual([{ offset: 15 }])
  })
})

describe('computeTriggerTime', () => {
  it('returns slot time when offset is 0', () => {
    expect(computeTriggerTime('08:00', 0)).toEqual({ hour: 8, minute: 0, weekdayShift: 0 })
  })

  it('subtracts the offset within the same day', () => {
    expect(computeTriggerTime('08:00', 30)).toEqual({ hour: 7, minute: 30, weekdayShift: 0 })
    expect(computeTriggerTime('08:00', 60)).toEqual({ hour: 7, minute: 0, weekdayShift: 0 })
    expect(computeTriggerTime('14:15', 90)).toEqual({ hour: 12, minute: 45, weekdayShift: 0 })
  })

  it('wraps to previous day when offset crosses midnight', () => {
    expect(computeTriggerTime('00:15', 30)).toEqual({ hour: 23, minute: 45, weekdayShift: -1 })
    expect(computeTriggerTime('00:00', 60)).toEqual({ hour: 23, minute: 0, weekdayShift: -1 })
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
  it('handles same-day (no shift)', () => {
    expect(shiftWeekday(0, 0)).toBe(0)
    expect(shiftWeekday(3, 0)).toBe(3)
  })

  it('shifts back one day correctly', () => {
    expect(shiftWeekday(1, -1)).toBe(0) // Mon → Sun
    expect(shiftWeekday(0, -1)).toBe(6) // Sun → Sat
  })

  it('shifts forward and wraps', () => {
    expect(shiftWeekday(6, 1)).toBe(0) // Sat → Sun
  })
})

describe('localizeMessages', () => {
  it('returns en-US strings for default locale', () => {
    const pool = { 'en-US': ['hello', 'hi'], 'pt-BR': ['olá'] }
    expect(localizeMessages(pool, 'en-US')).toEqual(['hello', 'hi'])
  })

  it('returns pt-BR for portuguese locale', () => {
    const pool = { 'en-US': ['hello'], 'pt-BR': ['olá', 'oi'] }
    expect(localizeMessages(pool, 'pt-BR')).toEqual(['olá', 'oi'])
  })

  it('falls back to en-US when locale missing', () => {
    const pool = { 'en-US': ['hello'] }
    expect(localizeMessages(pool, 'pt-BR')).toEqual(['hello'])
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
  it('returns undefined for empty pool', () => {
    expect(pickMessage([], 0)).toBeUndefined()
  })

  it('selects deterministically by seed', () => {
    const pool = ['a', 'b', 'c']
    expect(pickMessage(pool, 0)).toBe('a')
    expect(pickMessage(pool, 1)).toBe('b')
    expect(pickMessage(pool, 4)).toBe('b')
  })

  it('handles negative seeds', () => {
    const pool = ['a', 'b']
    expect(pickMessage(pool, -1)).toBe('b')
  })
})

describe('hashSeed', () => {
  it('is deterministic', () => {
    expect(hashSeed(['rosary::default', 30])).toBe(hashSeed(['rosary::default', 30]))
  })

  it('varies by inputs', () => {
    expect(hashSeed(['a', 0])).not.toBe(hashSeed(['a', 30]))
    expect(hashSeed(['a', 0])).not.toBe(hashSeed(['b', 0]))
  })
})

describe('describeLeadTime', () => {
  it('returns "at" for offset 0 or negative', () => {
    expect(describeLeadTime(0)).toEqual({ kind: 'at' })
    expect(describeLeadTime(-5)).toEqual({ kind: 'at' })
  })

  it('returns minutes for sub-hour offsets', () => {
    expect(describeLeadTime(15)).toEqual({ kind: 'minutes', count: 15 })
    expect(describeLeadTime(45)).toEqual({ kind: 'minutes', count: 45 })
  })

  it('returns hours for whole-hour offsets ≥ 60', () => {
    expect(describeLeadTime(60)).toEqual({ kind: 'hours', count: 1 })
    expect(describeLeadTime(120)).toEqual({ kind: 'hours', count: 2 })
  })

  it('returns minutes for non-whole-hour offsets ≥ 60', () => {
    expect(describeLeadTime(90)).toEqual({ kind: 'minutes', count: 90 })
  })
})
