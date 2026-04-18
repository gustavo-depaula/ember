import { emit, useEventStore } from '../events'

export async function recordConfession(date: string): Promise<number> {
  const confessionId = useEventStore.getState().nextConfessionId
  await emit({ type: 'ConfessionRecorded', confessionId, date, recordedAt: Date.now() })
  return confessionId
}

export async function removeConfession(confessionId: number): Promise<void> {
  await emit({ type: 'ConfessionRemoved', confessionId })
}
