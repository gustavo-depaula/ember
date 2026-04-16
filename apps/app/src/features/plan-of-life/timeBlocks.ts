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

export function getCurrentTimeBlock(hour: number): TimeBlock {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'daytime'
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
