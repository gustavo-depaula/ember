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

/**
 * A failed sweep is not user-actionable and must not interrupt prayer with a
 * dialog: the lazy overlay in `hooks.ts` already reports an overdue bounded
 * intention as closed, so the state the user sees is correct whether or not the
 * `IntentionExpired` event was written. The next sweep retries. Logged because
 * a persistently failing write is a real defect, just not this user's problem.
 */
function reportSweepFailure(error: unknown): void {
  console.error('[movements] expiry sweep failed; lazy overlay still masks it', error)
}

export function useExpirySweep(): void {
  useEffect(() => {
    let alive = true

    sweepExpiredIntentions().catch(reportSweepFailure)

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && alive) sweepExpiredIntentions().catch(reportSweepFailure)
    })

    const interval = setInterval(() => {
      if (alive) sweepExpiredIntentions().catch(reportSweepFailure)
    }, SWEEP_INTERVAL_MS)

    return () => {
      alive = false
      sub.remove()
      clearInterval(interval)
    }
  }, [])
}
