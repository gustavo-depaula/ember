import { emit, useEventStore } from '../events'
import type { IntentionState } from '../events/state'

export function getAllIntentions(): IntentionState[] {
  const store = useEventStore.getState()
  return [...store.intentions.values()].sort((a, b) => b.created_at - a.created_at)
}

export async function addIntention(text: string): Promise<number> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Intention text is required')
  const intentionId = useEventStore.getState().nextIntentionId
  await emit({
    type: 'IntentionAdded',
    intentionId,
    text: trimmed,
    createdAt: Date.now(),
  })
  return intentionId
}

export async function updateIntention(
  intentionId: number,
  data: { text?: string; notes?: string | null },
): Promise<void> {
  await emit({ type: 'IntentionUpdated', intentionId, ...data })
}

export async function markIntentionAnswered(
  intentionId: number,
  notes?: string | null,
): Promise<void> {
  await emit({
    type: 'IntentionAnswered',
    intentionId,
    answeredAt: Date.now(),
    notes: notes ?? null,
  })
}

export async function markIntentionUnanswered(intentionId: number): Promise<void> {
  await emit({ type: 'IntentionAnswered', intentionId, answeredAt: null })
}

export async function removeIntention(intentionId: number): Promise<void> {
  await emit({ type: 'IntentionRemoved', intentionId })
}
