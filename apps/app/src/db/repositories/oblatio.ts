import { emit, useEventStore } from '../events'

export async function offerDay(date: string): Promise<void> {
  if (useEventStore.getState().offeredDays.has(date)) return
  await emit({ type: 'DayOffered', date, offeredAt: Date.now() })
}

export async function revokeDayOffering(date: string): Promise<void> {
  if (!useEventStore.getState().offeredDays.has(date)) return
  await emit({ type: 'DayOfferingRevoked', date })
}
