import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey, parseSlotKey } from '@/lib/slotKey'
import { emit, emitBatch, resolveCompletions, useEventStore } from '../events'
import type { SlotState } from '../events/state'
import type { Completion, Tier, TimeBlock, UserPractice } from '../schema'

function getSortedSlots(): SlotState[] {
  const store = useEventStore.getState()
  return [...store.slots.values()].sort((a, b) => a.sort_order - b.sort_order)
}

function nextSlotUniqueId(practiceId: string): string {
  const store = useEventStore.getState()
  let max = 0
  for (const [key, slot] of store.slots) {
    if (slot.practice_id === practiceId) {
      const num = Number.parseInt(parseSlotKey(key).slotId, 10)
      if (!Number.isNaN(num) && num > max) max = num
    }
  }
  return String(max + 1)
}

function maxSortOrder(): number {
  const store = useEventStore.getState()
  let max = 0
  for (const slot of store.slots.values()) {
    if (slot.sort_order > max) max = slot.sort_order
  }
  return max
}

// --- Practice reads ---

export function getPractice(practiceId: string): UserPractice | undefined {
  return useEventStore.getState().practices.get(practiceId)
}

export function getArchivedPractices(): UserPractice[] {
  const store = useEventStore.getState()
  const result: UserPractice[] = []
  for (const practice of store.practices.values()) {
    if (practice.archived) result.push(practice)
  }
  return result
}

// --- Practice mutations ---

export async function createPractice(data: {
  id: string
  customName?: string
  customIcon?: string
  customDesc?: string
  activeVariant?: string
}): Promise<void> {
  if (useEventStore.getState().practices.has(data.id)) return
  await emit({
    type: 'PracticeCreated',
    practiceId: data.id,
    customName: data.customName,
    customIcon: data.customIcon,
    customDesc: data.customDesc,
    activeVariant: data.activeVariant,
  })
}

export async function updatePractice(
  practiceId: string,
  data: Partial<{
    customName: string | null
    customIcon: string | null
    customDesc: string | null
    activeVariant: string | null
  }>,
): Promise<void> {
  await emit({ type: 'PracticeUpdated', practiceId, ...data })
}

type SlotInput = { tier?: Tier; time?: string; schedule?: string; pins?: Record<string, string> }

// `offset` spaces the ids and sort orders of slots built together in one batch,
// before any of them reaches the store the counters read from.
function buildSlotAddedEvent(practiceId: string, data: SlotInput, offset = 0) {
  const uniqueId = String(Number(nextSlotUniqueId(practiceId)) + offset)
  const slotKey = composeSlotKey(practiceId, uniqueId)
  const time = data.time ?? null
  return {
    event: {
      type: 'SlotAdded' as const,
      practiceId,
      slotKey,
      tier: data.tier ?? 'ideal',
      time,
      timeBlock: deriveTimeBlock(time),
      schedule: data.schedule ?? '{"type":"daily"}',
      sortOrder: maxSortOrder() + 1 + offset,
      enabled: 1,
      ...(data.pins ? { pins: data.pins } : {}),
    },
    slotKey,
  }
}

function unarchiveEventIfNeeded(practiceId: string) {
  const existing = useEventStore.getState().practices.get(practiceId)
  if (!existing?.archived) return undefined
  return { type: 'PracticeUnarchived' as const, practiceId }
}

export async function createPracticeWithSlot(
  practice: {
    id: string
    customName?: string
    customIcon?: string
    customDesc?: string
    activeVariant?: string
  },
  slotData: SlotInput,
): Promise<string> {
  const [slotKey] = await createPracticeWithSlots(practice, [slotData])
  return slotKey
}

export async function createPracticeWithSlots(
  practice: Parameters<typeof createPracticeWithSlot>[0],
  slots: SlotInput[],
): Promise<string[]> {
  const events = []
  const existing = useEventStore.getState().practices.get(practice.id)

  if (!existing) {
    events.push({
      type: 'PracticeCreated' as const,
      practiceId: practice.id,
      customName: practice.customName,
      customIcon: practice.customIcon,
      customDesc: practice.customDesc,
      activeVariant: practice.activeVariant,
    })
  } else if (existing.archived) {
    events.push({ type: 'PracticeUnarchived' as const, practiceId: practice.id })
  }

  const built = slots.map((data, i) => buildSlotAddedEvent(practice.id, data, i))
  events.push(...built.map((b) => b.event))

  await emitBatch(events)
  return built.map((b) => b.slotKey)
}

export async function deletePractice(practiceId: string): Promise<void> {
  await emit({ type: 'PracticeDeleted', practiceId })
}

// --- Archive ---

export async function archivePractice(practiceId: string): Promise<void> {
  await emit({ type: 'PracticeArchived', practiceId })
}

export async function unarchivePractice(practiceId: string): Promise<void> {
  await emit({ type: 'PracticeUnarchived', practiceId })
}

// --- Slot reads ---

export function getEnabledSlots(): SlotState[] {
  const store = useEventStore.getState()
  return getSortedSlots().filter((slot) => {
    if (!slot.enabled) return false
    const practice = store.practices.get(slot.practice_id)
    return !practice?.archived
  })
}

export function getAllSlots(): SlotState[] {
  return getSortedSlots()
}

export function getSlotsForPractice(practiceId: string): SlotState[] {
  const store = useEventStore.getState()
  const result: SlotState[] = []
  for (const slot of store.slots.values()) {
    if (slot.practice_id === practiceId) result.push(slot)
  }
  return result.sort((a, b) => a.sort_order - b.sort_order)
}

// --- Slot mutations ---

export async function addSlot(practiceId: string, data: SlotInput): Promise<string> {
  const { event, slotKey } = buildSlotAddedEvent(practiceId, data)
  const unarchive = unarchiveEventIfNeeded(practiceId)
  if (unarchive) {
    await emitBatch([unarchive, event])
  } else {
    await emit(event)
  }
  return slotKey
}

export async function updateSlot(
  slotId: string,
  data: Partial<{
    enabled: number
    sortOrder: number
    tier: Tier
    time: string | null
    timeBlock: TimeBlock
    notify: string | null
    schedule: string
    pins: Record<string, string>
  }>,
): Promise<void> {
  if (data.time !== undefined && data.timeBlock === undefined) {
    data.timeBlock = deriveTimeBlock(data.time)
  }

  await emit({
    type: 'SlotUpdated',
    slotKey: slotId,
    changes: data,
  })
}

export async function deleteSlot(slotId: string): Promise<void> {
  const { practiceId, slotId: subId } = parseSlotKey(slotId)
  await emit({ type: 'SlotDeleted', slotKey: slotId, practiceId, slotId: subId })
}

async function setSlotsEnabled(practiceId: string, enabled: 0 | 1): Promise<void> {
  const store = useEventStore.getState()
  const events: Parameters<typeof emitBatch>[0] = []
  if (enabled === 1) {
    const unarchive = unarchiveEventIfNeeded(practiceId)
    // PracticeUnarchived already re-enables every slot for this practice; avoid
    // emitting redundant SlotUpdated events when unarchiving would cover them.
    if (unarchive) {
      await emit(unarchive)
      return
    }
  }
  for (const [key, slot] of store.slots) {
    if (slot.practice_id === practiceId && slot.enabled !== enabled) {
      events.push({ type: 'SlotUpdated' as const, slotKey: key, changes: { enabled } })
    }
  }
  if (events.length > 0) await emitBatch(events)
}

export const enableSlotsForPractice = (id: string) => setSlotsEnabled(id, 1)
export const disableSlotsForPractice = (id: string) => setSlotsEnabled(id, 0)

export async function reorderSlots(orderedIds: string[]): Promise<void> {
  await emit({ type: 'SlotsReordered', orderedSlotKeys: orderedIds })
}

// --- Completions ---

export async function logCompletion(
  practiceId: string,
  date: string,
  subId: string,
): Promise<void> {
  const completionId = useEventStore.getState().nextCompletionId
  await emit({
    type: 'CompletionLogged',
    completionId,
    practiceId,
    subId,
    date,
    completedAt: Date.now(),
  })
}

export async function backfillMissedDays(practiceId: string, dates: string[]): Promise<void> {
  const ts = Date.now()
  const store = useEventStore.getState()
  let nextId = store.nextCompletionId
  const entries = dates.map((date) => ({
    completionId: nextId++,
    date,
    subId: 'backfill',
    completedAt: ts,
  }))
  await emit({ type: 'CompletionsBatchLogged', practiceId, entries })
}

export async function removeCompletion(id: number): Promise<void> {
  const completion = useEventStore.getState().completions.get(id)
  if (!completion) return
  await emit({
    type: 'CompletionRemoved',
    completionId: id,
    practiceId: completion.practice_id,
    date: completion.date,
    subId: completion.sub_id,
  })
}

function resolve(ids: Set<number> | undefined): Completion[] {
  return resolveCompletions(ids, useEventStore.getState().completions)
}

export async function toggleCompletion(
  practiceId: string,
  date: string,
  completed: boolean,
  subId: string,
): Promise<void> {
  if (completed) {
    await logCompletion(practiceId, date, subId)
  } else {
    const match = resolve(useEventStore.getState().completionsByDate.get(date)).find(
      (c) => c.practice_id === practiceId && c.sub_id === subId,
    )
    if (match) await removeCompletion(match.id)
  }
}
