export { type CccParagraph, getCccParagraphs } from '@/lib/catechism'
// Backward-compat aliases
export {
  ensurePracticeCursors,
  ensurePracticeCursors as ensurePracticeTracks,
  useAdvanceCursor,
  useAdvanceCursor as useAdvanceTrack,
  useBibleReading,
  useCccReading,
  useCursorsForPractice,
  useCursorsForPractice as useTracksForPractice,
  usePsalmsForHour,
  useSetCursorIndex,
  useSetCursorIndex as useSetTrackIndex,
} from './hooks'
export { formatPsalmRef, formatPsalmRefs, type PsalmRef, parsePsalmRef } from './psalter'
