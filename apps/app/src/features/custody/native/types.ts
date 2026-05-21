// Wire-types for the Swift module bridge. Kept in a shared module so
// both ios.ts (real) and fallback.ts (no-op) speak the same contract.

export type AuthStatus = 'notDetermined' | 'denied' | 'approved' | 'unsupported'

export type ShieldEvent = {
  type: 'kept' | 'overrode'
  commitmentId: string
  occurredAt: number
  via?: 'prayer' | 'confession' | 'wait'
  // Idempotency key — extension generates a UUID when enqueueing so
  // the JS drain can dedupe across multiple foreground cycles.
  uid: string
}

export type CommitmentSnapshot = {
  id: string
  name: string
  friction: 'none' | 'wait' | 'prayer'
  frictionConfig?: Record<string, unknown>
  anchor: AnchorSnapshot
  // ScheduleRule payload — flattened on the Swift side into
  // DeviceActivitySchedule[].
  schedule: unknown
  // Resolved fence times if kind === 'time-fence'.
  fenceStart?: string
  fenceEnd?: string
  // Resolved limit if kind === 'time-limit'.
  limitSeconds?: number
  kind: 'abstain' | 'time-limit' | 'time-fence'
  // Per-commitment opaque token blob ref (UserDefaults key suffix).
  tokenRef?: string
  // Web-domain list (for kind === 'domain' / 'domain-list' targets).
  webDomains?: string[]
}

export type AnchorSnapshot = {
  kind: 'text' | 'image' | 'prayer' | 'lectio' | 'silence'
  title: string
  subtitle: string
  // Bundled-asset key (passed to Image(named:) in the extension).
  imageAsset?: string
}

export type DateComponents = {
  hour?: number
  minute?: number
  second?: number
  weekday?: number
}

export type WebFilterPolicy =
  | { type: 'none' }
  | { type: 'specific'; domains: string[] }
  | { type: 'all'; exceptDomains?: string[] }

export type ScheduleSpec = {
  intervalStart: DateComponents
  intervalEnd: DateComponents
  repeats: boolean
}

export type CustodyNative = {
  isSupported(): boolean
  getAuthorizationStatus(): Promise<AuthStatus>
  requestAuthorization(): Promise<AuthStatus>
  hasSelection(commitmentId: string): boolean
  syncSnapshots(snapshots: CommitmentSnapshot[]): Promise<void>
  applyShield(commitmentId: string): Promise<void>
  removeShield(commitmentId: string): Promise<void>
  removeAllShields(): Promise<void>
  setWebContentFilter(policy: WebFilterPolicy, triggeredBy: string): Promise<void>
  startMonitoring(activityName: string, schedule: ScheduleSpec): Promise<void>
  stopMonitoring(activityNames: string[]): Promise<void>
  pushShieldConfig(snapshot: CommitmentSnapshot): Promise<void>
  getStatus(): Promise<{
    activeCommitmentIds: string[]
    lockedUntil: Record<string, number>
  }>
  drainShieldEvents(): Promise<ShieldEvent[]>
  liftFrictionLock(commitmentId: string, reason: 'prayer' | 'confession'): Promise<void>
  openSettings(): Promise<void>
}
