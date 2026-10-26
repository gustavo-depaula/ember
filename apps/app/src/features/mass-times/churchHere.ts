import { useQuery } from '@tanstack/react-query'
import { isSameDay } from 'date-fns'
import { create } from 'zustand'

import { useEventStore } from '@/db/events'
import { churchesAround } from '@/lib/mass-times'
import { haversineKm } from './useMassTimesNearby'

// The church you are at, for the nudges that ask after Mass: one within this distance of the device.
// A church and its square fit inside it; the next parish over does not.
const hereKm = 0.15
// A last-known position older than this may be from somewhere else entirely.
const staleFixMs = 10 * 60_000

export type ChurchHere = { id: string; name: string }

/**
 * Where the device is, if a church stands there. Never asks for location: without a permission
 * already given, or without a fix, there is no answer and no nudge — not knowing where you are is
 * an ordinary state here, not a fault. A failed tile load still throws.
 */
export async function findChurchHere(): Promise<ChurchHere | undefined> {
  let Location: typeof import('expo-location')
  try {
    // As in useDeviceLocation: the module binds natively at import, so a build without it has no
    // location, which is the same as not being allowed it.
    Location = await import('expo-location')
  } catch {
    return undefined
  }
  const permission = await Location.getForegroundPermissionsAsync()
  if (permission.status !== 'granted') return undefined
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  }).catch(() => Location.getLastKnownPositionAsync())
  if (!position || Date.now() - position.timestamp > staleFixMs) return undefined

  const { latitude, longitude } = position.coords
  const nearest = (await churchesAround(latitude, longitude))
    .map((church) => ({ church, km: haversineKm(latitude, longitude, church.lat, church.lng) }))
    .filter(({ km }) => km <= hereKm)
    .sort((a, b) => a.km - b.km)[0]
  return nearest ? { id: nearest.church.id, name: nearest.church.name } : undefined
}

// Whether a check-in already says you were at this church today, so the nudge doesn't ask twice.
function checkedInToday(churchId: string): boolean {
  const today = new Date()
  return [...useEventStore.getState().checkIns.values()].some(
    (c) => c.churchId === churchId && isSameDay(new Date(c.at), today),
  )
}

/** The church you're at, while a screen wants it (the end of the Mass text). */
export function useChurchHere(enabled: boolean) {
  return useQuery({
    queryKey: ['mass-times', 'church-here'],
    queryFn: async () => {
      const church = await findChurchHere()
      return church && !checkedInToday(church.id) ? church : null
    },
    enabled,
    // Where you are changes as you walk; asked again each time the screen comes back.
    staleTime: 60_000,
  })
}

// The toast that asks after a Mass ticked on Hoje. A store, so the tick and the toast, which live
// in different trees, meet without threading props: the checklist offers, the host at the root shows.
const useNudgeStore = create<{ church?: ChurchHere }>(() => ({}))

export function useCheckInNudge(): ChurchHere | undefined {
  return useNudgeStore((s) => s.church)
}

export function dismissCheckInNudge(): void {
  useNudgeStore.setState({ church: undefined })
}

/** After Mass is ticked on Hoje: ask "at this church?" when you're at one, and stay quiet otherwise. */
export async function offerMassCheckIn(): Promise<void> {
  // Offline with no tile kept for here, we can't tell where you are — for an offer, the same as not
  // being at a church: nothing to ask, and nothing wrong to report.
  const church = await findChurchHere().catch(() => undefined)
  if (!church || checkedInToday(church.id)) return
  useNudgeStore.setState({ church })
}
