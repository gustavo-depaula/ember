import type { WritableDraft } from 'immer'

import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'

import type { EventStoreState, SlotState } from './state'
import type { AppEvent } from './types'

// Stored events whose type is not in AppEvent fall through the switch and
// replay as no-ops, so dropping an event type needs no migration.
export function applyEvent(draft: WritableDraft<EventStoreState>, event: AppEvent): void {
  switch (event.type) {
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
      for (const [key, slot] of draft.slots) {
        if (slot.practice_id === event.practiceId) draft.slots.delete(key)
      }
      for (const [id, completion] of draft.completions) {
        if (completion.practice_id === event.practiceId) {
          removeCompletionFromIndexes(draft, id, completion.date, completion.practice_id)
          draft.completions.delete(id)
        }
      }
      break
    }

    case 'PracticeMerged': {
      const { fromId, toId } = event
      const from = draft.practices.get(fromId)
      if (!from || fromId === toId) break
      const slotsOf = (id: string) => [...draft.slots.values()].filter((s) => s.practice_id === id)
      const kept = slotsOf(toId)

      const to = draft.practices.get(toId)
      if (to) {
        // The one the plan was keeping says which form is prayed.
        const inPlan = !to.archived && kept.some((s) => s.enabled)
        if (!inPlan && from.active_variant) to.active_variant = from.active_variant
        if (!from.archived) to.archived = 0
      } else {
        from.practice_id = toId
        draft.practices.set(toId, from)
      }
      draft.practices.delete(fromId)

      // A slot whose number the other practice already uses takes the next
      // free one; its completions follow it.
      const taken = new Set(kept.map((s) => parseSlotKey(s.id).slotId))
      const renumbered = new Map<string, string>()
      for (const slot of slotsOf(fromId)) {
        const slotId = parseSlotKey(slot.id).slotId
        const numbers = [...taken].map(Number).filter((n) => !Number.isNaN(n))
        const newId = taken.has(slotId) ? String(Math.max(0, ...numbers) + 1) : slotId
        taken.add(newId)
        renumbered.set(slotId, newId)
        draft.slots.delete(slot.id)
        slot.id = composeSlotKey(toId, newId)
        slot.practice_id = toId
        draft.slots.set(slot.id, slot)
      }

      for (const id of draft.completionsByPractice.get(fromId) ?? []) {
        const completion = draft.completions.get(id)
        if (!completion) continue
        removeCompletionFromIndexes(draft, id, completion.date, fromId)
        completion.practice_id = toId
        completion.sub_id = renumbered.get(completion.sub_id ?? '') ?? completion.sub_id
        addCompletionToIndexes(draft, id, completion.date, toId)
      }

      const cursor = draft.cursors.get(`program/${fromId}`)
      if (cursor) {
        draft.cursors.delete(cursor.id)
        cursor.id = `program/${toId}`
        if (!draft.cursors.has(cursor.id)) draft.cursors.set(cursor.id, cursor)
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
        pins: event.pins,
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
      if (c.pins !== undefined) slot.pins = c.pins
      break
    }

    case 'SlotDeleted': {
      draft.slots.delete(event.slotKey)
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

    case 'CompletionLogged': {
      const completion = {
        id: event.completionId,
        practice_id: event.practiceId,
        sub_id: event.subId,
        date: event.date,
        completed_at: event.completedAt,
        prayed_id: event.prayedId,
        via: event.via,
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

    case 'HolyCardRedeemed': {
      const { type, ...copy } = event
      draft.holyCards.set(copy.grant, copy)
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
  }
}

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
