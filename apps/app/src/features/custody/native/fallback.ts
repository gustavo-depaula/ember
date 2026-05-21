import type { CustodyNative } from './types'

// No-op implementation for Android / sim / unsupported iOS. Every Custody
// hook calls through this if the native module isn't available so the rest
// of the codebase doesn't have to branch on Platform.OS.
export const fallback: CustodyNative = {
  isSupported: () => false,
  getAuthorizationStatus: async () => 'unsupported',
  requestAuthorization: async () => 'unsupported',
  hasSelection: () => false,
  syncSnapshots: async () => {},
  applyShield: async () => {},
  removeShield: async () => {},
  removeAllShields: async () => {},
  setWebContentFilter: async () => {},
  startMonitoring: async () => {},
  stopMonitoring: async () => {},
  pushShieldConfig: async () => {},
  getStatus: async () => ({ activeCommitmentIds: [], lockedUntil: {} }),
  drainShieldEvents: async () => [],
  liftFrictionLock: async () => {},
  openSettings: async () => {},
}
