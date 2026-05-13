import { useEffect } from 'react'
import { AppState } from 'react-native'

import { useEventStore } from '@/db/events'
import { expireIntention } from '@/db/repositories'

import { findExpiredIntentionIds } from './findExpired'

const SWEEP_INTERVAL_MS = 60 * 60 * 1000

export async function sweepExpiredIntentions(now = Date.now()): Promise<void> {
  const movements = useEventStore.getState().movements
  const ids = findExpiredIntentionIds(movements, now)
  for (const id of ids) {
    await expireIntention(id, now)
  }
}

export function useExpirySweep(): void {
  useEffect(() => {
    let alive = true

    sweepExpiredIntentions().catch(() => {})

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && alive) sweepExpiredIntentions().catch(() => {})
    })

    const interval = setInterval(() => {
      if (alive) sweepExpiredIntentions().catch(() => {})
    }, SWEEP_INTERVAL_MS)

    return () => {
      alive = false
      sub.remove()
      clearInterval(interval)
    }
  }, [])
}
