import type { ServiceKind } from '@ember/api'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'
import { randomId } from '@/lib/id'
import { loadJson, saveJson } from './persisted'

// A personal, on-device log of church check-ins — visits you record while you're there (a quiet
// devotional record, not a leaderboard). A check-in names what you were there for; a Mass check-in
// additionally completes the "mass" practice (see CheckInButton), so Mass attendance isn't a separate
// concept from the plan of life. Persisted as JSON in the preferences KV. Newest first.

const storageKey = 'mass-times.checkins'

export type CheckInKind = ServiceKind | 'visit'

export type CheckIn = {
  id: string
  churchId: string
  churchName: string
  kind: CheckInKind
  note?: string
  at: string // ISO timestamp
}

type CheckInsState = {
  checkins: CheckIn[]
  hydrated: boolean
  checkIn: (
    church: { id: string; name: string },
    details: { kind: CheckInKind; note?: string },
    at?: Date,
  ) => void
  remove: (id: string) => void
  hydrate: () => Promise<void>
}

export const useCheckInsStore = create<CheckInsState>()(
  immer((set, get) => ({
    checkins: [],
    hydrated: false,

    checkIn: (church, details, at = new Date()) => {
      set((state) => {
        state.checkins.unshift({
          id: randomId(),
          churchId: church.id,
          churchName: church.name,
          kind: details.kind,
          note: details.note?.trim() || undefined,
          at: at.toISOString(),
        })
      })
      void saveJson(storageKey, get().checkins)
    },

    remove: (id) => {
      set((state) => {
        state.checkins = state.checkins.filter((c) => c.id !== id)
      })
      void saveJson(storageKey, get().checkins)
    },

    hydrate: async () => {
      const stored = await loadJson<CheckIn[]>(storageKey, [])
      set((state) => {
        state.checkins = stored
        state.hydrated = true
      })
    },
  })),
)

export function useCheckInCount(): number {
  return useCheckInsStore((s) => s.checkins.length)
}

export function useRecentCheckIns(): CheckIn[] {
  return useCheckInsStore((s) => s.checkins)
}

// Per-church: how many times you've checked in, and when last.
export function useChurchAttendance(churchId: string): { count: number; last?: string } {
  return useCheckInsStore(
    useShallow((s) => {
      const mine = s.checkins.filter((c) => c.churchId === churchId)
      return { count: mine.length, last: mine[0]?.at }
    }),
  )
}
