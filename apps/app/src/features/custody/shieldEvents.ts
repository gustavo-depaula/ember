import { recordEvent } from '@/db/repositories/custody'

import { getCustodyNative } from './native'

// Drain the iOS extension's event queue and record each event in
// `commitment_events`. The native side deletes the UserDefaults key as part
// of the drain, so the queue is single-consumption — no JS-side dedupe needed.
export async function drainShieldEvents(): Promise<number> {
  const native = getCustodyNative()
  if (!native.isSupported()) return 0
  const events = await native.drainShieldEvents()
  for (const ev of events) {
    await recordEvent({
      commitmentId: ev.commitmentId,
      type: ev.type === 'kept' ? 'kept' : 'overrode',
      occurredAt: ev.occurredAt,
      metadata: ev.via ? { via: ev.via } : undefined,
    })
  }
  return events.length
}
