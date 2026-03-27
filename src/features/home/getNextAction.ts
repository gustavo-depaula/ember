import type { Practice } from '@/db/schema'
import type { OfficeHour } from '@/features/divine-office/engine'
import {
  blockOrder,
  getCurrentTimeBlock,
  groupByTimeBlock,
} from '@/features/plan-of-life/timeBlocks'
import i18n from '@/lib/i18n'

export type NextAction =
  | { type: 'office'; hour: OfficeHour; label: string; sublabel: string; route: string }
  | { type: 'practice'; practice: Practice }
  | { type: 'allDone'; practiceCount: number; officeCount: number }

function getHourMeta(hour: OfficeHour): { label: string; sublabel: string; route: string } {
  const map: Record<OfficeHour, { labelKey: string; sublabelKey: string; route: string }> = {
    morning: {
      labelKey: 'office.morningPrayer',
      sublabelKey: 'office.lauds',
      route: '/office/morning',
    },
    evening: {
      labelKey: 'office.eveningPrayer',
      sublabelKey: 'office.vespers',
      route: '/office/evening',
    },
    compline: {
      labelKey: 'office.nightPrayer',
      sublabelKey: 'office.compline',
      route: '/office/compline',
    },
  }
  const m = map[hour]
  return { label: i18n.t(m.labelKey), sublabel: i18n.t(m.sublabelKey), route: m.route }
}

const officeByTime: Record<string, OfficeHour> = {
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
  const groups = groupByTimeBlock(practices)

  // check if there's an uncompleted office for current time or later
  const currentBlockIndex = blockOrder.indexOf(currentBlock)
  for (let i = currentBlockIndex; i < blockOrder.length; i++) {
    const block = blockOrder[i]
    const officeHour = officeByTime[block]
    if (officeHour && officeStatus && !officeStatus[officeHour]) {
      const meta = getHourMeta(officeHour)
      return { type: 'office', hour: officeHour, ...meta }
    }
  }

  // find first uncompleted practice starting from current block
  for (let i = currentBlockIndex; i < blockOrder.length; i++) {
    const block = blockOrder[i]
    for (const practice of groups[block].practices) {
      if (!completedIds.has(practice.id)) {
        return { type: 'practice', practice }
      }
    }
  }

  // check past blocks for any missed practices
  for (let i = 0; i < currentBlockIndex; i++) {
    const block = blockOrder[i]
    for (const practice of groups[block].practices) {
      if (!completedIds.has(practice.id)) {
        return { type: 'practice', practice }
      }
    }
  }

  // everything done
  const officeCount = officeStatus ? Object.values(officeStatus).filter(Boolean).length : 0
  return { type: 'allDone', practiceCount: completedIds.size, officeCount }
}
