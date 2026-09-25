import { AppState, InteractionManager } from 'react-native'

import { listCommitments, reconcileAbandonedSessions } from '@/features/custody/db'

import { reconcileAllEnforcement } from './enforcement'
import { setupCustodyNotifications } from './notifications'
import { drainShieldEvents } from './shieldEvents'
import { syncCommitmentSnapshots } from './syncSnapshots'

/**
 * Boot the module once the DB is ready and the corpus has seeded: notification
 * categories now, reconciliation after interactions settle, and a foreground
 * listener that drains shield events the native extensions queued meanwhile.
 */
export function startCustody(): void {
  setupCustodyNotifications().catch((err) =>
    console.error('[startup] custody notifications setup failed', err),
  )

  InteractionManager.runAfterInteractions(() => {
    reconcileAbandonedSessions().catch((err) =>
      console.error('[startup] custody session reconciliation failed', err),
    )
    syncCommitmentSnapshots().catch((err) =>
      console.error('[startup] custody snapshot sync failed', err),
    )
    drainShieldEvents().catch((err) =>
      console.error('[startup] custody shield event drain failed', err),
    )
    // Re-apply iOS Family Controls enforcement for every active bound
    // commitment. Handles the cold-launch case where iOS shield state
    // may not match what SQLite says (reinstall, OS restore).
    listCommitments({ includeArchived: false })
      .then((all) => reconcileAllEnforcement(all))
      .catch((err) => console.error('[startup] custody enforcement reconcile failed', err))
  })

  // iOS sends `active` for transient interruptions (control center, share
  // sheet, notification banner). Debounce so a quick swipe-up doesn't run
  // the whole drain+sync loop.
  let lastRunAt = 0
  AppState.addEventListener('change', (next) => {
    if (next !== 'active') return
    const now = Date.now()
    if (now - lastRunAt < 2000) return
    lastRunAt = now
    void drainShieldEvents().catch(() => {})
    void syncCommitmentSnapshots().catch(() => {})
  })
}
