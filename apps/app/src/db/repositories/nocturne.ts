import { emit, useEventStore } from '../events'

export async function prayCompline(date: string): Promise<void> {
  if (useEventStore.getState().complinePrayed.has(date)) return
  await emit({ type: 'ComplinePrayed', date, prayedAt: Date.now() })
}

export async function revokeCompline(date: string): Promise<void> {
  if (!useEventStore.getState().complinePrayed.has(date)) return
  await emit({ type: 'ComplineRevoked', date })
}
