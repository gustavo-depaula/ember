export type TimeBlock = 'morning' | 'daytime' | 'evening'
export type BlockState = 'collapsed' | 'expanded' | 'preview'

type BlockDefinition = {
	label: string
	practiceIds: string[]
}

export const timeBlocks: Record<TimeBlock, BlockDefinition> = {
	morning: {
		label: 'Morning',
		practiceIds: ['morning-offering', 'mental-prayer', 'holy-mass'],
	},
	daytime: {
		label: 'Daytime',
		practiceIds: ['spiritual-reading', 'angelus', 'rosary'],
	},
	evening: {
		label: 'Evening',
		practiceIds: ['examination-conscience', 'night-prayer'],
	},
}

export const blockOrder: TimeBlock[] = ['morning', 'daytime', 'evening']

export function getCurrentTimeBlock(hour: number): TimeBlock {
	if (hour >= 5 && hour < 12) return 'morning'
	if (hour >= 12 && hour < 17) return 'daytime'
	return 'evening'
}

export function getBlockState(
	block: TimeBlock,
	currentBlock: TimeBlock,
	completedIds: Set<string>,
): BlockState {
	const blockIndex = blockOrder.indexOf(block)
	const currentIndex = blockOrder.indexOf(currentBlock)
	const { practiceIds } = timeBlocks[block]
	const allDone = practiceIds.every((id) => completedIds.has(id))

	if (blockIndex < currentIndex) return allDone ? 'collapsed' : 'expanded'
	if (blockIndex === currentIndex) return 'expanded'
	return 'preview'
}

export function getBlockCompletion(
	block: TimeBlock,
	completedIds: Set<string>,
): { completed: number; total: number } {
	const { practiceIds } = timeBlocks[block]
	const completed = practiceIds.filter((id) => completedIds.has(id)).length
	return { completed, total: practiceIds.length }
}
