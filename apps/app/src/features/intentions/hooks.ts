import { useMutation } from '@tanstack/react-query'
import { useShallow } from 'zustand/react/shallow'

import { useEventStore } from '@/db/events'
import type { IntentionState } from '@/db/events/state'
import {
  addIntention,
  markIntentionAnswered,
  markIntentionUnanswered,
  removeIntention,
  updateIntention,
} from '@/db/repositories'

export function useOpenIntentions(): IntentionState[] {
  return useEventStore(
    useShallow((s) =>
      [...s.intentions.values()]
        .filter((i) => i.answered_at === null)
        .sort((a, b) => b.created_at - a.created_at),
    ),
  )
}

export function useOpenIntentionsCount(): number {
  return useEventStore((s) => {
    let count = 0
    for (const i of s.intentions.values()) if (i.answered_at === null) count++
    return count
  })
}

export function useAnsweredIntentions(): IntentionState[] {
  return useEventStore(
    useShallow((s) =>
      [...s.intentions.values()]
        .filter((i) => i.answered_at !== null)
        .sort((a, b) => (b.answered_at ?? 0) - (a.answered_at ?? 0)),
    ),
  )
}

export function useAddIntention() {
  return useMutation({ mutationFn: (text: string) => addIntention(text) })
}

export function useUpdateIntention() {
  return useMutation({
    mutationFn: (args: { id: number; text?: string; notes?: string | null }) =>
      updateIntention(args.id, { text: args.text, notes: args.notes }),
  })
}

export function useMarkIntentionAnswered() {
  return useMutation({
    mutationFn: (args: { id: number; notes?: string | null }) =>
      markIntentionAnswered(args.id, args.notes),
  })
}

export function useMarkIntentionUnanswered() {
  return useMutation({ mutationFn: (id: number) => markIntentionUnanswered(id) })
}

export function useRemoveIntention() {
  return useMutation({ mutationFn: (id: number) => removeIntention(id) })
}
