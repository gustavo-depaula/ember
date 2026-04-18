import { emit, useEventStore } from '../events'

export async function addGratitude(text: string): Promise<number> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Gratitude text is required')
  const gratitudeId = useEventStore.getState().nextGratitudeId
  await emit({
    type: 'GratitudeRecorded',
    gratitudeId,
    text: trimmed,
    recordedAt: Date.now(),
  })
  return gratitudeId
}

export async function removeGratitude(gratitudeId: number): Promise<void> {
  await emit({ type: 'GratitudeRemoved', gratitudeId })
}
