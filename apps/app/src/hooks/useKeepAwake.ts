import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useEffect } from 'react'

const TAG = 'ember-app'

export function useKeepAwake() {
  useEffect(() => {
    activateKeepAwakeAsync(TAG).catch(() => {})
    return () => {
      deactivateKeepAwake(TAG)
    }
  }, [])
}
