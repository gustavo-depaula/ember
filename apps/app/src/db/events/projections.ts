import type { WritableDraft } from 'immer'

import type { EventStoreState, SlotState } from './state'
import type { AppEvent } from './types'

export function applyEvent(draft: WritableDraft<EventStoreState>, event: AppEvent): void {
  switch (event.type) {
    // --- Practice events ---

    case 'PracticeCreated': {
      draft.practices.set(event.practiceId, {
        practice_id: event.practiceId,
        custom_name: event.customName ?? null,
        custom_icon: event.customIcon ?? null,
        custom_desc: event.customDesc ?? null,
        active_variant: event.activeVariant ?? null,
        archived: 0,
      })
      break
    }

    case 'PracticeUpdated': {
      const practice = draft.practices.get(event.practiceId)
      if (!practice) break
      if (event.customName !== undefined) practice.custom_name = event.customName ?? null
      if (event.customIcon !== undefined) practice.custom_icon = event.customIcon ?? null
      if (event.customDesc !== undefined) practice.custom_desc = event.customDesc ?? null
      if (event.activeVariant !== undefined) practice.active_variant = event.activeVariant ?? null
      break
    }

    case 'PracticeArchived': {
      const practice = draft.practices.get(event.practiceId)
      if (practice) practice.archived = 1
      for (const slot of draft.slots.values()) {
        if (slot.practice_id === event.practiceId) slot.enabled = 0
      }
      break
    }

    case 'PracticeUnarchived': {
      const practice = draft.practices.get(event.practiceId)
      if (practice) practice.archived = 0
      for (const slot of draft.slots.values()) {
        if (slot.practice_id === event.practiceId) slot.enabled = 1
      }
      break
    }

    case 'PracticeDeleted': {
      draft.practices.delete(event.practiceId)
      // Cascade: remove slots
      for (const [key, slot] of draft.slots) {
        if (slot.practice_id === event.practiceId) draft.slots.delete(key)
      }
      // Cascade: remove completions
      for (const [id, completion] of draft.completions) {
        if (completion.practice_id === event.practiceId) {
          removeCompletionFromIndexes(draft, id, completion.date, completion.practice_id)
          draft.completions.delete(id)
        }
      }
      break
    }

    case 'SlotAdded': {
      const slot: SlotState = {
        id: event.slotKey,
        practice_id: event.practiceId,
        enabled: event.enabled,
        sort_order: event.sortOrder,
        tier: event.tier,
        time: event.time,
        time_block: event.timeBlock,
        notify: null,
        schedule: event.schedule,
        variant: null,
      }
      draft.slots.set(event.slotKey, slot)
      break
    }

    case 'SlotUpdated': {
      const slot = draft.slots.get(event.slotKey)
      if (!slot) break
      const c = event.changes
      if (c.enabled !== undefined) slot.enabled = c.enabled
      if (c.sortOrder !== undefined) slot.sort_order = c.sortOrder
      if (c.tier !== undefined) slot.tier = c.tier
      if (c.time !== undefined) slot.time = c.time
      if (c.timeBlock !== undefined) slot.time_block = c.timeBlock
      if (c.notify !== undefined) slot.notify = c.notify
      if (c.schedule !== undefined) slot.schedule = c.schedule
      break
    }

    case 'SlotDeleted': {
      draft.slots.delete(event.slotKey)
      // Cascade: remove completions for this slot
      for (const [id, completion] of draft.completions) {
        if (completion.practice_id === event.practiceId && completion.sub_id === event.slotId) {
          removeCompletionFromIndexes(draft, id, completion.date, completion.practice_id)
          draft.completions.delete(id)
        }
      }
      break
    }

    case 'SlotsReordered': {
      for (let i = 0; i < event.orderedSlotKeys.length; i++) {
        const slot = draft.slots.get(event.orderedSlotKeys[i])
        if (slot) slot.sort_order = i + 1
      }
      break
    }

    // --- Completion events ---

    case 'CompletionLogged': {
      const completion = {
        id: event.completionId,
        practice_id: event.practiceId,
        sub_id: event.subId,
        date: event.date,
        completed_at: event.completedAt,
      }
      draft.completions.set(event.completionId, completion)
      addCompletionToIndexes(draft, event.completionId, event.date, event.practiceId)
      if (event.completionId >= draft.nextCompletionId) {
        draft.nextCompletionId = event.completionId + 1
      }
      break
    }

    case 'CompletionRemoved': {
      draft.completions.delete(event.completionId)
      removeCompletionFromIndexes(draft, event.completionId, event.date, event.practiceId)
      break
    }

    case 'CompletionsBatchLogged': {
      for (const entry of event.entries) {
        const completion = {
          id: entry.completionId,
          practice_id: event.practiceId,
          sub_id: entry.subId,
          date: entry.date,
          completed_at: entry.completedAt,
        }
        draft.completions.set(entry.completionId, completion)
        addCompletionToIndexes(draft, entry.completionId, entry.date, event.practiceId)
        if (entry.completionId >= draft.nextCompletionId) {
          draft.nextCompletionId = entry.completionId + 1
        }
      }
      break
    }

    // --- Cursor events ---

    case 'CursorSet': {
      draft.cursors.set(event.cursorId, {
        id: event.cursorId,
        position: event.position,
        started_at: event.startedAt,
      })
      break
    }

    case 'CursorAdvanced': {
      const cursor = draft.cursors.get(event.cursorId)
      if (!cursor) break
      const pos = JSON.parse(cursor.position)
      pos.index = event.newIndex
      cursor.position = JSON.stringify(pos)
      break
    }

    case 'CursorIndexSet': {
      const cursor = draft.cursors.get(event.cursorId)
      if (!cursor) break
      const pos = JSON.parse(cursor.position)
      pos.index = event.index
      cursor.position = JSON.stringify(pos)
      break
    }

    case 'ProgramRestarted': {
      const cursor = draft.cursors.get(event.cursorId)
      if (!cursor) break
      const pos = JSON.parse(cursor.position)
      pos.day = 0
      pos.status = 'active'
      cursor.position = JSON.stringify(pos)
      cursor.started_at = event.startDate
      break
    }

    // --- Intention events ---

    case 'IntentionAdded': {
      draft.intentions.set(event.intentionId, {
        id: event.intentionId,
        text: event.text,
        created_at: event.createdAt,
        answered_at: null,
        notes: null,
      })
      if (event.intentionId >= draft.nextIntentionId) {
        draft.nextIntentionId = event.intentionId + 1
      }
      break
    }

    case 'IntentionUpdated': {
      const intention = draft.intentions.get(event.intentionId)
      if (!intention) break
      if (event.text !== undefined) intention.text = event.text
      if (event.notes !== undefined) intention.notes = event.notes
      break
    }

    case 'IntentionAnswered': {
      const intention = draft.intentions.get(event.intentionId)
      if (!intention) break
      intention.answered_at = event.answeredAt
      if (event.notes !== undefined) intention.notes = event.notes
      break
    }

    case 'IntentionRemoved': {
      draft.intentions.delete(event.intentionId)
      break
    }

    // --- Gratitude events ---

    case 'GratitudeRecorded': {
      draft.gratitudes.set(event.gratitudeId, {
        id: event.gratitudeId,
        text: event.text,
        recorded_at: event.recordedAt,
      })
      if (event.gratitudeId >= draft.nextGratitudeId) {
        draft.nextGratitudeId = event.gratitudeId + 1
      }
      break
    }

    case 'GratitudeRemoved': {
      draft.gratitudes.delete(event.gratitudeId)
      break
    }

    // --- Oblatio events ---

    case 'DayOffered': {
      draft.offeredDays.set(event.date, event.offeredAt)
      break
    }

    case 'DayOfferingRevoked': {
      draft.offeredDays.delete(event.date)
      break
    }

    // --- Confessio events ---

    case 'ConfessionRecorded': {
      draft.confessions.set(event.confessionId, {
        id: event.confessionId,
        date: event.date,
        recorded_at: event.recordedAt,
      })
      if (event.confessionId >= draft.nextConfessionId) {
        draft.nextConfessionId = event.confessionId + 1
      }
      break
    }

    case 'ConfessionRemoved': {
      draft.confessions.delete(event.confessionId)
      break
    }
  }
}

// --- Index helpers ---

function addCompletionToIndexes(
  draft: WritableDraft<EventStoreState>,
  completionId: number,
  date: string,
  practiceId: string,
): void {
  let byDate = draft.completionsByDate.get(date)
  if (!byDate) {
    byDate = new Set()
    draft.completionsByDate.set(date, byDate)
  }
  byDate.add(completionId)

  let byPractice = draft.completionsByPractice.get(practiceId)
  if (!byPractice) {
    byPractice = new Set()
    draft.completionsByPractice.set(practiceId, byPractice)
  }
  byPractice.add(completionId)
}

function removeCompletionFromIndexes(
  draft: WritableDraft<EventStoreState>,
  completionId: number,
  date: string,
  practiceId: string,
): void {
  const byDate = draft.completionsByDate.get(date)
  if (byDate) {
    byDate.delete(completionId)
    if (byDate.size === 0) draft.completionsByDate.delete(date)
  }

  const byPractice = draft.completionsByPractice.get(practiceId)
  if (byPractice) {
    byPractice.delete(completionId)
    if (byPractice.size === 0) draft.completionsByPractice.delete(practiceId)
  }
}
