import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/react/shallow'
import { randomId } from '@/lib/id'
import { loadJson, saveJson } from './persisted'

// A personal, on-device log of Masses attended — a quiet devotional record (not a backend write, not
// a leaderboard). Persisted as JSON in the preferences KV. Newest first.

const storageKey = 'mass-times.checkins'

export type CheckIn = {
  id: string
  churchId: string
  churchName: string
  at: string // ISO timestamp
}

type CheckInsState = {
  checkins: CheckIn[]
  hydrated: boolean
  checkIn: (church: { id: string; name: string }, at?: Date) => void
  remove: (id: string) => void
  hydrate: () => Promise<void>
}

export const useCheckInsStore = create<CheckInsState>()(
  immer((set, get) => ({
    checkins: [],
    hydrated: false,

    checkIn: (church, at = new Date()) => {
      set((state) => {
        state.checkins.unshift({
          id: randomId(),
          churchId: church.id,
          churchName: church.name,
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

// Per-church attendance: how many times, and when last.
export function useChurchAttendance(churchId: string): { count: number; last?: string } {
  return useCheckInsStore(
    useShallow((s) => {
      const mine = s.checkins.filter((c) => c.churchId === churchId)
      return { count: mine.length, last: mine[0]?.at }
    }),
  )
}
