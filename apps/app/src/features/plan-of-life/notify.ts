import type { LocalizedMessagePool, NotificationsManifest } from '@/content/manifestTypes'
import type { NotifyConfig, NotifyReminder } from '@/db/schema'

export const DEFAULT_REMINDER: NotifyReminder = { offset: 0 }

export const REMINDER_PRESETS: number[] = [0, 5, 15, 30, 60, 120]

export function parseNotifyConfig(json: string | null | undefined): NotifyConfig | undefined {
  if (!json) return undefined
  try {
    const parsed = JSON.parse(json) as NotifyConfig
    if (typeof parsed?.enabled !== 'boolean') return undefined
    return parsed
  } catch {
    return undefined
  }
}

export function resolveReminders(
  notify: NotifyConfig | undefined,
  manifestNotifications: NotificationsManifest | undefined,
): NotifyReminder[] {
  if (!notify?.enabled) return []
  if (notify.reminders && notify.reminders.length > 0) {
    return dedupeReminders(notify.reminders)
  }
  const fromManifest = manifestNotifications?.defaultReminders
  if (fromManifest && fromManifest.length > 0) {
    return dedupeReminders(fromManifest.map((r) => ({ offset: r.offset })))
  }
  return [DEFAULT_REMINDER]
}

function dedupeReminders(reminders: NotifyReminder[]): NotifyReminder[] {
  const seen = new Set<number>()
  const out: NotifyReminder[] = []
  for (const r of reminders) {
    if (!Number.isFinite(r.offset) || r.offset < 0) continue
    const offset = Math.round(r.offset)
    if (seen.has(offset)) continue
    seen.add(offset)
    out.push({ offset })
  }
  return out.sort((a, b) => b.offset - a.offset) // earliest reminder first
}

export type TriggerTime = {
  hour: number
  minute: number
  weekdayShift: number // 0 = same day; -1 = previous day (when offset wraps past midnight)
}

export function computeTriggerTime(
  slotTime: string,
  offsetMinutes: number,
): TriggerTime | undefined {
  const [hStr, mStr] = slotTime.split(':')
  const hours = Number(hStr)
  const minutes = Number(mStr)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return undefined
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return undefined

  const totalAtSlot = hours * 60 + minutes
  let total = totalAtSlot - Math.max(0, Math.round(offsetMinutes))
  let weekdayShift = 0
  while (total < 0) {
    total += 24 * 60
    weekdayShift -= 1
  }
  return { hour: Math.floor(total / 60), minute: total % 60, weekdayShift }
}

export function shiftWeekday(weekday: number, shift: number): number {
  const wrapped = (((weekday + shift) % 7) + 7) % 7
  return wrapped
}

export function localizeMessages(
  pool: LocalizedMessagePool | undefined,
  language: string,
): string[] {
  if (!pool) return []
  const primary = language === 'pt-BR' ? pool['pt-BR'] : pool['en-US']
  const fallback = pool['en-US']
  const chosen = primary ?? fallback
  if (!chosen) return []
  return Array.isArray(chosen) ? chosen.filter(Boolean) : [chosen]
}

export function pickMessage(messages: string[], seed: number): string | undefined {
  if (messages.length === 0) return undefined
  const idx = Math.abs(seed) % messages.length
  return messages[idx]
}

// Stable small hash for picking deterministic body per (slotId, offset, day).
// Avoids reshuffling on every reschedule pass.
export function hashSeed(parts: (string | number)[]): number {
  const s = parts.join('|')
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export type LeadTime =
  | { kind: 'at' }
  | { kind: 'minutes'; count: number }
  | { kind: 'hours'; count: number }

export function describeLeadTime(offsetMinutes: number): LeadTime {
  if (offsetMinutes <= 0) return { kind: 'at' }
  if (offsetMinutes >= 60 && offsetMinutes % 60 === 0) {
    return { kind: 'hours', count: offsetMinutes / 60 }
  }
  return { kind: 'minutes', count: offsetMinutes }
}
