import { randomId } from '@/lib/id'

import { emit } from '../events'
import type { ResolutionLevel, ResolutionOutcome, ResolutionSource } from '../events/types'

export type SetResolutionInput = {
  level: ResolutionLevel
  text: string
  virtue?: string
  parent_id?: string
  starts_at: number
  ends_at: number
  source?: ResolutionSource
}

export async function setResolution(input: SetResolutionInput): Promise<string> {
  const text = input.text.trim()
  if (!text) throw new Error('Resolution text is required')
  const id = randomId()
  await emit({
    type: 'ResolutionSet',
    id,
    level: input.level,
    text,
    virtue: input.virtue?.trim() || undefined,
    parent_id: input.parent_id,
    starts_at: input.starts_at,
    ends_at: input.ends_at,
    source: input.source ?? 'examen',
    recorded_at: Date.now(),
  })
  return id
}

export type ReviseResolutionInput = {
  id: string
  text?: string
  virtue?: string | null
  parent_id?: string | null
}

export async function reviseResolution(input: ReviseResolutionInput): Promise<void> {
  await emit({
    type: 'ResolutionRevised',
    id: input.id,
    text: input.text?.trim(),
    virtue: input.virtue,
    parent_id: input.parent_id,
    revised_at: Date.now(),
  })
}

export async function checkinResolution(
  resolutionId: string,
  outcome: ResolutionOutcome,
  notes?: string,
): Promise<void> {
  await emit({
    type: 'ResolutionCheckin',
    resolution_id: resolutionId,
    outcome,
    notes: notes?.trim() || undefined,
    reviewed_at: Date.now(),
  })
}

export async function reviewResolution(
  resolutionId: string,
  outcome: ResolutionOutcome,
  notes?: string,
): Promise<void> {
  await emit({
    type: 'ResolutionReviewed',
    resolution_id: resolutionId,
    outcome,
    notes: notes?.trim() || undefined,
    reviewed_at: Date.now(),
  })
}

export async function archiveResolution(id: string): Promise<void> {
  await emit({ type: 'ResolutionArchived', id, archived_at: Date.now() })
}
