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

export function getBlockCompletion(
  blockSlotIds: string[],
  completedIds: Set<string>,
): { completed: number; total: number } {
  const completed = blockSlotIds.filter((id) => completedIds.has(id)).length
  return { completed, total: blockSlotIds.length }
}

// The day cut finer than the stored time blocks, for surfaces that list or
// colour a long plan: a practice falls in the part its time names, and one
// with no time in the middle part of its block.
export type DayPart = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'flexible'

export const dayPartOrder: DayPart[] = [
  'dawn',
  'morning',
  'midday',
  'afternoon',
  'evening',
  'night',
  'flexible',
]

// The clock hour each part begins at, latest first. Night runs past midnight
// to the end of the logical day.
const partStarts: [DayPart, number][] = [
  ['night', 21],
  ['evening', 18],
  ['afternoon', 14],
  ['midday', 12],
  ['morning', 8],
  ['dawn', dayStart / 60],
]

const untimedPart: Record<TimeBlock, DayPart> = {
  morning: 'morning',
  daytime: 'afternoon',
  evening: 'evening',
  flexible: 'flexible',
}

export function dayPartOfHour(hour: number): DayPart {
  return partStarts.find(([, start]) => hour >= start)?.[0] ?? 'night'
}

export function dayPartOf(slot: Pick<SlotState, 'time' | 'time_block'>): DayPart {
  if (slot.time) return dayPartOfHour(Number.parseInt(slot.time.slice(0, 2), 10))
  return untimedPart[slot.time_block] ?? 'flexible'
}

/** The parts of the day that hold a practice, each in the order it is prayed, untimed ones last. */
export function getActiveDayParts(slots: SlotState[]): { part: DayPart; slots: SlotState[] }[] {
  const owed = (s: SlotState) => (s.time ? dayMinutes(s.time) : Infinity)
  return dayPartOrder
    .map((part) => ({
      part,
      slots: slots.filter((s) => dayPartOf(s) === part).sort((a, b) => owed(a) - owed(b)),
    }))
    .filter(({ slots }) => slots.length > 0)
}

/**
 * How each part of the day shows in the checklist. One part lies open: the
 * first from this hour on with something left to pray. The others fold to a
 * line — a preview naming what is still unprayed, or bare once all is prayed —
 * so a long plan never opens as one long list. Any-time practices stay open
 * until prayed.
 */
export function dayPartStates(
  parts: { part: DayPart; slots: { id: string }[] }[],
  hour: number,
  completedIds: Set<string>,
): Map<DayPart, BlockState> {
  const now = dayPartOrder.indexOf(dayPartOfHour(hour))
  const allDone = (slots: { id: string }[]) => slots.every((s) => completedIds.has(s.id))
  const open = parts.find(
    ({ part, slots }) =>
      part !== 'flexible' && dayPartOrder.indexOf(part) >= now && !allDone(slots),
  )?.part
  return new Map(
    parts.map(({ part, slots }): [DayPart, BlockState] => {
      if (allDone(slots)) return [part, 'collapsed']
      return [part, part === open || part === 'flexible' ? 'expanded' : 'preview']
    }),
  )
}
