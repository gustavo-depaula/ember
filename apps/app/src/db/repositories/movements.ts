import { randomId } from '@/lib/id'

import { emit } from '../events'
import type { Cadence } from '../events/types'

export type RaiseIntentionInput = {
  text: string
  subject?: string
  cadence?: Cadence
  bounded_until?: number
}

export async function raiseIntention(input: RaiseIntentionInput): Promise<string> {
  const text = input.text.trim()
  if (!text) throw new Error('Intention text is required')
  const id = randomId()
  const cadence = input.cadence ?? 'perpetual'
  if (cadence === 'bounded' && !input.bounded_until) {
    throw new Error('bounded_until is required for bounded cadence')
  }
  await emit({
    type: 'IntentionRaised',
    id,
    text,
    subject: input.subject?.trim() || undefined,
    cadence,
    bounded_until: cadence === 'bounded' ? input.bounded_until : undefined,
    raised_at: Date.now(),
  })
  return id
}

export type UpdateIntentionInput = {
  id: string
  text?: string
  subject?: string | null
  cadence?: Cadence
  bounded_until?: number | null
}

export async function updateIntention(input: UpdateIntentionInput): Promise<void> {
  await emit({
    type: 'IntentionUpdated',
    id: input.id,
    text: input.text,
    subject: input.subject,
    cadence: input.cadence,
    bounded_until: input.bounded_until,
  })
}

export async function markIntentionAnswered(id: string, notes?: string): Promise<void> {
  await emit({
    type: 'IntentionAnswered',
    id,
    notes: notes?.trim() || undefined,
    answered_at: Date.now(),
  })
}

export async function expireIntention(id: string, when = Date.now()): Promise<void> {
  await emit({ type: 'IntentionExpired', id, expired_at: when })
}

export async function retireIntention(id: string): Promise<void> {
  await emit({ type: 'IntentionRetired', id, retired_at: Date.now() })
}

export type OfferThanksgivingInput = {
  text: string
  subject?: string
  from_intention?: string
}

export async function offerThanksgiving(input: OfferThanksgivingInput): Promise<string> {
  const text = input.text.trim()
  if (!text) throw new Error('Thanksgiving text is required')
  const id = randomId()
  await emit({
    type: 'ThanksgivingOffered',
    id,
    text,
    subject: input.subject?.trim() || undefined,
    offered_at: Date.now(),
    from_intention: input.from_intention,
  })
  return id
}

export async function updateThanksgiving(input: {
  id: string
  text?: string
  subject?: string | null
}): Promise<void> {
  await emit({
    type: 'ThanksgivingUpdated',
    id: input.id,
    text: input.text,
    subject: input.subject,
  })
}

export async function retireThanksgiving(id: string): Promise<void> {
  await emit({ type: 'ThanksgivingRetired', id, retired_at: Date.now() })
}

export async function pinMovement(practiceId: string, movementId: string): Promise<void> {
  await emit({
    type: 'MovementPinned',
    practice_id: practiceId,
    movement_id: movementId,
    pinned_at: Date.now(),
  })
}

export async function unpinMovement(practiceId: string, movementId: string): Promise<void> {
  await emit({
    type: 'MovementUnpinned',
    practice_id: practiceId,
    movement_id: movementId,
    unpinned_at: Date.now(),
  })
}

export type RecordMovementInput =
  | ({ kind: 'intention' } & RaiseIntentionInput)
  | ({ kind: 'thanksgiving' } & OfferThanksgivingInput)

export async function recordMovement(input: RecordMovementInput): Promise<string> {
  const { kind, ...payload } = input
  return kind === 'intention'
    ? raiseIntention(payload as RaiseIntentionInput)
    : offerThanksgiving(payload as OfferThanksgivingInput)
}
