import { useCallback, useEffect, useState } from 'react'

// Catedral da Sé, São Paulo — the default vantage until the user shares location. The current dataset
// is São Paulo, so this also keeps the screen useful before any GPS prompt or native rebuild.
export const defaultCoords = { lat: -23.5503, lng: -46.6339 }

export type LocationStatus = 'default' | 'locating' | 'granted' | 'denied'

export type DeviceLocation = {
  coords: { lat: number; lng: number }
  status: LocationStatus
  isFallback: boolean // showing the default vantage rather than the user's real position
  error?: string // a real permission/GPS failure worth showing — never silently swallowed
  request: () => Promise<void>
}

export function useDeviceLocation(): DeviceLocation {
  const [coords, setCoords] = useState(defaultCoords)
  const [status, setStatus] = useState<LocationStatus>('default')
  const [error, setError] = useState<string | undefined>(undefined)

  const locate = useCallback(async (prompt: boolean) => {
    // Dynamic import: expo-location binds its native module at import, so loading it here (not at file
    // top) keeps the screen working before a native rebuild. A failure HERE is the one genuinely soft
    // case — the module isn't in the binary yet — so we degrade to the default vantage, no error shown.
    let Location: typeof import('expo-location')
    try {
      Location = await import('expo-location')
    } catch {
      setStatus('default')
      return
    }

    // Past this point we're talking to the device. We do NOT swallow failures: a denied permission or a
    // GPS error surfaces via `status`/`error` so the UI can say *why* there's no blue dot, instead of
    // silently pretending the São Paulo default is the user's location.
    try {
      setError(undefined)
      const perm = prompt
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync()
      if (perm.status !== 'granted') {
        // Hard denial (can't re-prompt) or an explicit decline → 'denied' so the UI offers Settings.
        setStatus(prompt || perm.canAskAgain === false ? 'denied' : 'default')
        return
      }
      setStatus('locating')
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setStatus('granted')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('denied')
    }
  }, [])

  // On mount, silently upgrade to real coords if permission is already granted (never prompt here).
  useEffect(() => {
    void locate(false)
  }, [locate])

  return { coords, status, isFallback: status !== 'granted', error, request: () => locate(true) }
}
