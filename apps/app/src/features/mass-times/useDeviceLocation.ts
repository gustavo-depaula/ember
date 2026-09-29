import { useCallback, useEffect, useState } from 'react'

// Catedral da Sé, São Paulo — the default vantage until the user shares location. The current dataset
// is São Paulo, so this also keeps the screen useful before any GPS prompt or native rebuild.
export const defaultCoords = { lat: -23.5503, lng: -46.6339 }

// 'failed': permission is granted but the device couldn't produce a fix (no signal, services off).
export type LocationStatus = 'default' | 'locating' | 'granted' | 'denied' | 'failed'

export type DeviceLocation = {
  coords: { lat: number; lng: number }
  status: LocationStatus
  isFallback: boolean // showing the default vantage rather than the user's real position
  request: () => Promise<void>
}

export function useDeviceLocation(): DeviceLocation {
  const [coords, setCoords] = useState(defaultCoords)
  const [status, setStatus] = useState<LocationStatus>('default')

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
    // GPS error surfaces via `status` so the UI can say *why* there's no blue dot, instead of silently
    // pretending the São Paulo default is the user's location.
    try {
      const perm = prompt
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync()
      if (perm.status !== 'granted') {
        // Hard denial (can't re-prompt) or an explicit decline → 'denied' so the UI offers Settings.
        setStatus(prompt || perm.canAskAgain === false ? 'denied' : 'default')
        return
      }
      setStatus('locating')
      // A fresh fix can fail indoors or with services briefly unavailable; the last known position is
      // still a far better vantage than the São Paulo default.
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => Location.getLastKnownPositionAsync())
      if (!pos) {
        setStatus('failed')
        return
      }
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setStatus('granted')
    } catch {
      setStatus('failed')
    }
  }, [])

  // On mount, silently upgrade to real coords if permission is already granted (never prompt here).
  useEffect(() => {
    void locate(false)
  }, [locate])

  return { coords, status, isFallback: status !== 'granted', request: () => locate(true) }
}
