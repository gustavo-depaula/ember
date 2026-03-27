export { getPracticeIcon } from '@/db/seed'
export { PracticeChecklist } from './components'
export { getPracticeName } from './getPracticeName'
export {
  useAllPractices,
  useCreatePractice,
  useDeletePractice,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePracticeStats,
  usePractices,
  useReorderPractices,
  useTogglePractice,
  useUpdatePractice,
} from './hooks'
export {
  type BlockState,
  blockOrder,
  getActiveBlocks,
  getBlockCompletion,
  getBlockState,
  getCurrentTimeBlock,
  groupByTimeBlock,
  type TimeBlock,
} from './timeBlocks'
export type { DayCompletion, TieredLog } from './utils'
export {
  buildTieredWallData,
  countByTier,
  filterPracticesForDate,
  getCompletionRate,
  getCurrentStreak,
  getLongestPracticeStreak,
  getLongestStreak,
  getPracticeStreak,
  isPracticeApplicableOnDate,
  parseFrequencyDays,
  toCompletedSet,
  toGreenWallData,
  toTieredWallData,
} from './utils'
