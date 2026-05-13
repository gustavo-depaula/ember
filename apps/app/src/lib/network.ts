/**
 * Single source of truth for network awareness. Status bar chip,
 * Wi-Fi-only gate, refresh-disabling — all read from this hook.
 */

import * as Network from 'expo-network'
import { useEffect, useState } from 'react'

export type NetworkType = 'wifi' | 'cellular' | 'other' | 'none'

export type NetworkState = {
  isOnline: boolean
  type: NetworkType
}

function fromExpoState(s: Network.NetworkState | undefined): NetworkState {
  if (!s) return { isOnline: false, type: 'none' }
  if (!s.isInternetReachable && !s.isConnected) return { isOnline: false, type: 'none' }
  switch (s.type) {
    case Network.NetworkStateType.WIFI:
      return { isOnline: true, type: 'wifi' }
    case Network.NetworkStateType.CELLULAR:
      return { isOnline: true, type: 'cellular' }
    case Network.NetworkStateType.NONE:
      return { isOnline: false, type: 'none' }
    default:
      return { isOnline: !!s.isConnected, type: 'other' }
  }
}

export async function getNetworkStateNow(): Promise<NetworkState> {
  try {
    const s = await Network.getNetworkStateAsync()
    return fromExpoState(s)
  } catch {
    return { isOnline: true, type: 'other' }
  }
}

export function useNetworkState(): NetworkState {
  const [state, setState] = useState<NetworkState>({ isOnline: true, type: 'other' })

  useEffect(() => {
    let cancelled = false
    void getNetworkStateNow().then((s) => {
      if (!cancelled) setState(s)
    })
    const sub = Network.addNetworkStateListener((next) => {
      setState(fromExpoState(next))
    })
    return () => {
      cancelled = true
      sub?.remove()
    }
  }, [])

  return state
}
