export { getPracticeIcon } from '@/db/seed'
export { DayCarousel, PracticeChecklist } from './components'
export { getPracticeIconKey, getPracticeName } from './getPracticeName'
export {
  useAllPractices,
  useCompletionRange,
  useCompletionsForDate,
  useCompletionsForPractice,
  useCreatePractice,
  useDeletePractice,
  useLogCompletion,
  usePracticeCompletionStats,
  usePracticeLogRange,
  usePracticeLogsForDate,
  usePracticeStats,
  usePractices,
  useRemoveCompletion,
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
  toCompletedSet,
  toGreenWallData,
  toTieredWallData,
} from './utils'
