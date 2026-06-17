import { useCallback, useEffect, useState } from 'react'

// Catedral da Sé, São Paulo — the default vantage point until the user shares location. The current
// dataset is São Paulo, so this also keeps the screen useful before any GPS prompt or native rebuild.
export const defaultCoords = { lat: -23.5503, lng: -46.6339 }

export type LocationStatus = 'default' | 'locating' | 'granted' | 'denied'

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
    try {
      // Dynamic import: expo-location binds its native module at import, so loading it here (not at
      // file top) keeps the screen working before a native rebuild — the catch handles its absence.
      const Location = await import('expo-location')
      const perm = prompt
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync()
      if (perm.status !== 'granted') {
        setStatus(prompt ? 'denied' : 'default')
        return
      }
      setStatus('locating')
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setStatus('granted')
    } catch (err) {
      // Graceful degradation, not a swallowed bug: GPS can fail and the native module is absent
      // until the app is rebuilt with expo-location. We keep the default vantage and say so via
      // `isFallback`; the warning preserves the trail for debugging.
      console.warn('[mass-times] location unavailable, using default vantage', err)
      setStatus((s) => (s === 'locating' ? 'default' : s))
    }
  }, [])

  // Silently upgrade to real coords when permission is already granted — never prompt on mount.
  useEffect(() => {
    void locate(false)
  }, [locate])

  return { coords, status, isFallback: status !== 'granted', request: () => locate(true) }
}
