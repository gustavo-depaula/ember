import type { OfficeHour } from '@/features/divine-office/engine'
import {
	blockOrder,
	getCurrentTimeBlock,
	type TimeBlock,
	timeBlocks,
} from '@/features/plan-of-life/timeBlocks'

type Practice = { id: string; name: string; icon: string }

export type NextAction =
	| { type: 'office'; hour: OfficeHour; label: string; sublabel: string; route: string }
	| { type: 'practice'; practice: Practice }
	| { type: 'allDone'; practiceCount: number; officeCount: number }

const hourMeta: Record<OfficeHour, { label: string; sublabel: string; route: string }> = {
	morning: { label: 'Morning Prayer', sublabel: 'Lauds', route: '/office/morning' },
	evening: { label: 'Evening Prayer', sublabel: 'Vespers', route: '/office/evening' },
	compline: { label: 'Night Prayer', sublabel: 'Compline', route: '/office/compline' },
}

const officeByTime: Record<TimeBlock, OfficeHour> = {
	morning: 'morning',
	daytime: 'evening',
	evening: 'compline',
}

export function getNextAction(
	hour: number,
	officeStatus: Record<OfficeHour, boolean> | undefined,
	completedIds: Set<string>,
	practices: Practice[],
): NextAction {
	const currentBlock = getCurrentTimeBlock(hour)

	// check if there's an uncompleted office for current time or later
	const currentBlockIndex = blockOrder.indexOf(currentBlock)
	for (let i = currentBlockIndex; i < blockOrder.length; i++) {
		const block = blockOrder[i]
		const officeHour = officeByTime[block]
		if (officeStatus && !officeStatus[officeHour]) {
			const meta = hourMeta[officeHour]
			return { type: 'office', hour: officeHour, ...meta }
		}
	}

	// find first uncompleted practice starting from current block
	const practiceMap = new Map(practices.map((p) => [p.id, p]))
	for (let i = currentBlockIndex; i < blockOrder.length; i++) {
		const block = blockOrder[i]
		for (const practiceId of timeBlocks[block].practiceIds) {
			if (!completedIds.has(practiceId)) {
				const practice = practiceMap.get(practiceId)
				if (practice) return { type: 'practice', practice }
			}
		}
	}

	// check past blocks for any missed practices
	for (let i = 0; i < currentBlockIndex; i++) {
		const block = blockOrder[i]
		for (const practiceId of timeBlocks[block].practiceIds) {
			if (!completedIds.has(practiceId)) {
				const practice = practiceMap.get(practiceId)
				if (practice) return { type: 'practice', practice }
			}
		}
	}

	// everything done
	const officeCount = officeStatus ? Object.values(officeStatus).filter(Boolean).length : 0
	return { type: 'allDone', practiceCount: completedIds.size, officeCount }
}
