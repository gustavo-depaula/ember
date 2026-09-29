import type { Service } from '@ember/api'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  cancelMassReminders,
  type MassReminderSlot,
  requestNotificationPermission,
  scheduleMassReminders,
} from '@/lib/notifications'
import { loadJson, saveJson } from './persisted'

// Opt-in recurring reminders before a church's Masses. We translate each weekly Mass service into a
// native WEEKLY notification at (start time − lead). The slots are persisted per church in the
// preferences KV, so launch can restore the OS schedule without a network round-trip.

const storageKey = 'mass-times.reminders'
export const defaultLeadMinutes = 30

const bydayToDow: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }
const minutesPerDay = 24 * 60

// A WEEKLY trigger repeats every week of the year, so only plain weekly rules fit — a seasonal
// (BYMONTH), every-other-week (INTERVAL) or monthly (1FR) Mass would ring on weeks it isn't said.
function isEveryWeek(rrule: string): boolean {
  return (
    /(^|;)FREQ=WEEKLY(;|$)/.test(rrule) &&
    !/(^|;)(BYMONTH|BYMONTHDAY|BYSETPOS|UNTIL|COUNT)=/.test(rrule) &&
    !/(^|;)INTERVAL=(?!1(;|$))/.test(rrule)
  )
}

// Mass services → distinct weekly reminder slots, `leadMinutes` before each start. A lead that crosses
// midnight rolls the reminder to the previous weekday.
export function massReminderSlots(services: Service[], leadMinutes: number): MassReminderSlot[] {
  const slots: MassReminderSlot[] = []
  const seen = new Set<string>()
  for (const service of services) {
    if (service.kind !== 'mass' || !isEveryWeek(service.rrule)) continue
    const byday = /BYDAY=([A-Z,]+)/.exec(service.rrule)?.[1]
    if (!byday) continue
    const [h, m] = service.startTime.split(':').map(Number)
    const base = (h || 0) * 60 + (m || 0) - leadMinutes
    for (const token of byday.split(',')) {
      const dow = bydayToDow[token]
      if (dow === undefined) continue
      let minutes = base
      let day = dow
      if (minutes < 0) {
        minutes += minutesPerDay
        day = (day + 6) % 7
      }
      const weekday = day + 1 // expo: 1 = Sunday
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      const key = `${weekday}-${hour}-${minute}`
      if (seen.has(key)) continue
      seen.add(key)
      slots.push({ weekday, hour, minute })
    }
  }
  return slots
}

type Reminder = { name: string; leadMinutes: number; slots: MassReminderSlot[] }

type RemindersState = {
  enabled: Record<string, Reminder>
  hydrated: boolean
  // 'denied' when notification permission was refused.
  enable: (
    church: { id: string; name: string },
    services: Service[],
    leadMinutes?: number,
  ) => Promise<'on' | 'denied'>
  disable: (churchId: string) => Promise<void>
  hydrate: () => Promise<void>
}

export const useRemindersStore = create<RemindersState>()(
  immer((set, get) => ({
    enabled: {},
    hydrated: false,

    enable: async (church, services, leadMinutes = defaultLeadMinutes) => {
      if (!(await requestNotificationPermission())) return 'denied'
      const slots = massReminderSlots(services, leadMinutes)
      await scheduleMassReminders(church.id, church.name, slots, leadMinutes)
      set((state) => {
        state.enabled[church.id] = { name: church.name, leadMinutes, slots }
      })
      void saveJson(storageKey, get().enabled)
      return 'on'
    },

    disable: async (churchId) => {
      await cancelMassReminders(churchId)
      set((state) => {
        delete state.enabled[churchId]
      })
      void saveJson(storageKey, get().enabled)
    },

    hydrate: async () => {
      const stored = await loadJson<Record<string, Partial<Reminder>>>(storageKey, {})
      // Entries saved before slots were persisted can't be restored offline; drop them so the toggle
      // reads off rather than claiming a reminder the OS no longer holds.
      const valid = Object.fromEntries(
        Object.entries(stored).filter(([, r]) => r.slots && r.name),
      ) as Record<string, Reminder>
      set((state) => {
        state.enabled = valid
        state.hydrated = true
      })
    },
  })),
)

// Re-register every enabled church's reminders with the OS. Idempotent (each church's schedule is
// replaced), so it runs on launch alongside the practice reschedule.
export async function rescheduleMassReminders(): Promise<void> {
  if (!useRemindersStore.getState().hydrated) await useRemindersStore.getState().hydrate()
  for (const [churchId, r] of Object.entries(useRemindersStore.getState().enabled)) {
    await scheduleMassReminders(churchId, r.name, r.slots, r.leadMinutes)
  }
}

export function useMassReminderOn(churchId: string): boolean {
  return useRemindersStore((s) => Boolean(s.enabled[churchId]))
}
