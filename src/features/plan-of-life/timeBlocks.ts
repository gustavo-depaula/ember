import { timeBlockLabels } from '@/config/constants'
import type { Practice, TimeBlock } from '@/db/schema'

export type { TimeBlock }
export type BlockState = 'collapsed' | 'expanded' | 'preview'

type BlockDefinition = {
  label: string
  practices: Practice[]
}

export const blockOrder: TimeBlock[] = ['morning', 'daytime', 'evening', 'flexible']

export function groupByTimeBlock(practices: Practice[]): Record<TimeBlock, BlockDefinition> {
  const groups = Object.fromEntries(
    blockOrder.map((block) => [
      block,
      { label: timeBlockLabels[block], practices: [] as Practice[] },
    ]),
  ) as Record<TimeBlock, BlockDefinition>

  for (const p of practices) {
    const block = p.time_block in groups ? p.time_block : 'flexible'
    groups[block].practices.push(p)
  }

  return groups
}

export function getActiveBlocks(
  practices: Practice[],
): { block: TimeBlock; def: BlockDefinition }[] {
  const groups = groupByTimeBlock(practices)
  return blockOrder
    .filter((block) => groups[block].practices.length > 0)
    .map((block) => ({ block, def: groups[block] }))
}

export function getCurrentTimeBlock(hour: number): TimeBlock {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'daytime'
  return 'evening'
}

export function getBlockState(
  block: TimeBlock,
  currentBlock: TimeBlock,
  completedIds: Set<string>,
  blockPracticeIds: string[],
): BlockState {
  const blockIndex = blockOrder.indexOf(block)
  const currentIndex = blockOrder.indexOf(currentBlock)
  const allDone = blockPracticeIds.every((id) => completedIds.has(id))

  // Flexible block always expanded unless all done
  if (block === 'flexible') return allDone ? 'collapsed' : 'expanded'

  if (blockIndex < currentIndex) return allDone ? 'collapsed' : 'expanded'
  if (blockIndex === currentIndex) return 'expanded'
  return 'preview'
}

export function getBlockCompletion(
  blockPracticeIds: string[],
  completedIds: Set<string>,
): { completed: number; total: number } {
  const completed = blockPracticeIds.filter((id) => completedIds.has(id)).length
  return { completed, total: blockPracticeIds.length }
}
