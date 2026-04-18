import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useEffect } from 'react'
import { Platform } from 'react-native'

const TAG = 'ember-app'

export function useKeepAwake() {
  useEffect(() => {
    // Wake Lock API on web rejects while the page is not yet visible
    // (common during route transitions) — surfaces as an uncaught rejection.
    // Prayer on web is brief anyway; browsers don't have an app-managed
    // sleep model to fight.
    if (Platform.OS === 'web') return
    activateKeepAwakeAsync(TAG).catch(() => {})
    return () => {
      deactivateKeepAwake(TAG)
    }
  }, [])
}
