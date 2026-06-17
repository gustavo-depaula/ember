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
// native WEEKLY notification at (start time − lead). Which churches are on is persisted in the
// preferences KV; the OS holds the recurring schedules.

const storageKey = 'mass-times.reminders'
export const defaultLeadMinutes = 30

const bydayToDow: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 }
const minutesPerDay = 24 * 60

// Mass services → distinct weekly reminder slots, `leadMinutes` before each start. A lead that crosses
// midnight rolls the reminder to the previous weekday.
export function massReminderSlots(services: Service[], leadMinutes: number): MassReminderSlot[] {
  const slots: MassReminderSlot[] = []
  const seen = new Set<string>()
  for (const service of services) {
    if (service.kind !== 'mass') continue
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

type RemindersState = {
  enabled: Record<string, { leadMinutes: number }>
  hydrated: boolean
  enable: (
    church: { id: string; name: string },
    services: Service[],
    leadMinutes?: number,
  ) => Promise<boolean>
  disable: (churchId: string) => Promise<void>
  hydrate: () => Promise<void>
}

export const useRemindersStore = create<RemindersState>()(
  immer((set, get) => ({
    enabled: {},
    hydrated: false,

    enable: async (church, services, leadMinutes = defaultLeadMinutes) => {
      const granted = await requestNotificationPermission()
      if (!granted) return false
      const slots = massReminderSlots(services, leadMinutes)
      if (slots.length === 0) return false
      await scheduleMassReminders(church.id, church.name, slots, leadMinutes)
      set((state) => {
        state.enabled[church.id] = { leadMinutes }
      })
      void saveJson(storageKey, get().enabled)
      return true
    },

    disable: async (churchId) => {
      await cancelMassReminders(churchId)
      set((state) => {
        delete state.enabled[churchId]
      })
      void saveJson(storageKey, get().enabled)
    },

    hydrate: async () => {
      const stored = await loadJson<Record<string, { leadMinutes: number }>>(storageKey, {})
      set((state) => {
        state.enabled = stored
        state.hydrated = true
      })
    },
  })),
)

export function useMassReminderOn(churchId: string): boolean {
  return useRemindersStore((s) => Boolean(s.enabled[churchId]))
}
