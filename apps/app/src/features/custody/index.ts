// Public surface of the Custody feature. Internal modules (enforcement,
// schedule, shieldEvents, syncSnapshots) can still be reached by deep
// import where their narrow contract is preferable.

export { reconcileAllEnforcement } from './enforcement'
export {
  custodyKeys,
  useActiveCommitmentsToday,
  useArchiveCommitment,
  useCommitment,
  useCommitmentEvents,
  useCommitments,
  useCreateCommitment,
  useCreateSession,
  useDeleteCommitment,
  useEndSession,
  useRecentSessions,
  useRecordEvent,
  useUnarchiveCommitment,
  useUpdateCommitment,
} from './hooks'
export { getCustodyNative } from './native'
export {
  cancelAllCustodyNotifications,
  scheduleDailyExamenReminder,
  scheduleNudgesForCommitment,
  setupCustodyNotifications,
} from './notifications'
export { isCommitmentActiveOn, isFenceActive, nextActivation, nextDeactivation } from './schedule'
export { useSessionStore } from './sessionStore'
export { drainShieldEvents } from './shieldEvents'
export { pickShieldMessage } from './shieldMessages'
export { syncCommitmentSnapshots } from './syncSnapshots'
export type { CommitmentTemplate } from './templates'
export { COMMITMENT_TEMPLATES } from './templates'
export { isValidHHmm, parseHHmm } from './time'
export type {
  Anchor,
  Commitment,
  CommitmentEvent,
  CommitmentInput,
  CommitmentKind,
  CustodySession,
  EventType,
  Friction,
  FrictionConfig,
  Schedule,
  ScheduleContext,
  SessionAnchorType,
  SessionEndReason,
  Target,
} from './types'
