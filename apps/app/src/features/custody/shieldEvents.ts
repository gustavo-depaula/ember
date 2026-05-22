import { recordEvent } from '@/db/repositories/custody'

import { getCustodyNative } from './native'
import type { EventType } from './types'

// Drain the iOS extension's event queue and record each event in
// `commitment_events`. The native side deletes the UserDefaults key as part
// of the drain, so the queue is single-consumption — no JS-side dedupe needed.
export async function drainShieldEvents(): Promise<number> {
  const native = getCustodyNative()
  if (!native.isSupported()) return 0
  const events = await native.drainShieldEvents()
  let recorded = 0
  for (const ev of events) {
    const type = mapShieldEventType(ev.type)
    if (!type) {
      console.error(`[custody/shieldEvents] unknown event type "${ev.type}" for ${ev.commitmentId}`)
      continue
    }
    await recordEvent({
      commitmentId: ev.commitmentId,
      type,
      occurredAt: ev.occurredAt,
      metadata: ev.via ? { via: ev.via } : undefined,
    })
    recorded++
  }
  return recorded
}

export function mapShieldEventType(raw: string): EventType | undefined {
  if (raw === 'kept' || raw === 'overrode' || raw === 'paused') return raw
  return undefined
}
