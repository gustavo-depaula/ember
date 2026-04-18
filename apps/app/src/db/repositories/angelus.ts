import { emit, useEventStore } from '../events'
import type { AngelusSlot } from '../events/types'

export async function prayAngelus(date: string, slot: AngelusSlot): Promise<void> {
  const key = `${date}:${slot}`
  if (useEventStore.getState().angelusPrayed.has(key)) return
  await emit({ type: 'AngelusPrayed', date, slot, prayedAt: Date.now() })
}

export async function revokeAngelus(date: string, slot: AngelusSlot): Promise<void> {
  const key = `${date}:${slot}`
  if (!useEventStore.getState().angelusPrayed.has(key)) return
  await emit({ type: 'AngelusRevoked', date, slot })
}
