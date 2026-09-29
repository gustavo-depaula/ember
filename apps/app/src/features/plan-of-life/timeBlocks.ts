import type { SlotState } from '@/db/events'
import type { TimeBlock } from '@/db/schema'

export type { TimeBlock }
export type BlockState = 'collapsed' | 'expanded' | 'preview'

type BlockDefinition = {
  label: string
  slots: SlotState[]
}

export const blockOrder: TimeBlock[] = ['morning', 'daytime', 'evening', 'flexible']

export function groupByTimeBlock(slots: SlotState[]): Record<TimeBlock, BlockDefinition> {
  const groups = Object.fromEntries(
    blockOrder.map((block) => [block, { label: block, slots: [] as SlotState[] }]),
  ) as Record<TimeBlock, BlockDefinition>

  for (const s of slots) {
    const block = s.time_block in groups ? s.time_block : 'flexible'
    groups[block].slots.push(s)
  }

  for (const block of blockOrder) {
    groups[block].slots.sort((a, b) => {
      if (!a.time && !b.time) return 0
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
  }

  return groups
}

export function getActiveBlocks(slots: SlotState[]): { block: TimeBlock; def: BlockDefinition }[] {
  const groups = groupByTimeBlock(slots)
  return blockOrder
    .filter((block) => groups[block].slots.length > 0)
    .map((block) => ({ block, def: groups[block] }))
}

// Minutes into the logical day, which runs 04:00–04:00 like useToday: 01:00 is
// 25:00, the tail of the evening.
const dayStart = 4 * 60
const minutesPerDay = 24 * 60

/** Where each part of the day ends, in logical-day minutes. */
export const blockEnds = { morning: 12 * 60, daytime: 17 * 60, evening: dayStart + minutesPerDay }

/** Minutes into the logical day of a clock time — `HH:MM` or minutes since midnight. */
export function dayMinutes(time: string | number): number {
  const minutes = typeof time === 'number' ? time : clockMinutes(time)
  return minutes < dayStart ? minutes + minutesPerDay : minutes
}

function clockMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function getCurrentTimeBlock(hour: number): TimeBlock {
  if (hour >= 5 && hour * 60 < blockEnds.morning) return 'morning'
  if (hour * 60 >= blockEnds.morning && hour * 60 < blockEnds.daytime) return 'daytime'
  return 'evening'
}

export function deriveTimeBlock(time: string | null | undefined): TimeBlock {
  if (!time) return 'flexible'
  const hour = parseInt(time.split(':')[0], 10)
  return getCurrentTimeBlock(hour)
}

export function getBlockState(
  block: TimeBlock,
  currentBlock: TimeBlock,
  completedIds: Set<string>,
  blockSlotIds: string[],
): BlockState {
  const blockIndex = blockOrder.indexOf(block)
  const currentIndex = blockOrder.indexOf(currentBlock)
  const allDone = blockSlotIds.every((id) => completedIds.has(id))

  // Flexible block always expanded unless all done
  if (block === 'flexible') return allDone ? 'collapsed' : 'expanded'

  if (blockIndex < currentIndex) return allDone ? 'collapsed' : 'expanded'
  if (blockIndex === currentIndex) return 'expanded'
  return 'preview'
}

export function getBlockCompletion(
  blockSlotIds: string[],
  completedIds: Set<string>,
): { completed: number; total: number } {
  const completed = blockSlotIds.filter((id) => completedIds.has(id)).length
  return { completed, total: blockSlotIds.length }
}
