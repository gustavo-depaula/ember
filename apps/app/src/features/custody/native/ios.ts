import { Linking, Platform } from 'react-native'

import { fallback } from './fallback'
import type {
  CommitmentSnapshot,
  CustodyNative,
  ScheduleSpec,
  ShieldEvent,
  WebFilterPolicy,
} from './types'

// `react-native-device-activity` ships pre-built iOS extension targets that
// the host project consumes via @kingstinct/expo-apple-targets at prebuild
// time. This adapter translates the Custody-flavored API surface into RNDA's
// JS calls so the rest of the codebase doesn't have to learn the library's
// vocabulary. On Android / sim / any platform where the module can't load we
// return no-ops.
type RNDA = typeof import('react-native-device-activity')

function loadRNDA(): RNDA | undefined {
  if (Platform.OS !== 'ios') return undefined
  try {
    // biome-ignore lint: conditional require for platform-specific module
    return require('react-native-device-activity') as RNDA
  } catch {
    return undefined
  }
}

const COMMITMENTS_KEY = 'custody.commitments'
const LOCKED_UNTIL_PREFIX = 'custody.lockedUntil.'

export function selectionIdFor(commitmentId: string): string {
  return `custody.selection.${commitmentId}`
}

function mapAuthStatus(raw: unknown): 'notDetermined' | 'denied' | 'approved' | 'unsupported' {
  if (raw === 'approved' || raw === 2 || raw === '2') return 'approved'
  if (raw === 'denied' || raw === 1 || raw === '1') return 'denied'
  if (raw === 'notDetermined' || raw === 0 || raw === '0') return 'notDetermined'
  return 'unsupported'
}

function buildShieldPayload(snap: CommitmentSnapshot) {
  return {
    configuration: {
      title: snap.anchor.title,
      subtitle: snap.anchor.subtitle,
      backgroundColor: { red: 0.054, green: 0.051, blue: 0.047, alpha: 1 },
      titleColor: { red: 1, green: 1, blue: 1, alpha: 1 },
      subtitleColor: { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 },
      primaryButtonLabel: 'Pray and continue blocking',
      primaryButtonLabelColor: { red: 1, green: 1, blue: 1, alpha: 1 },
      primaryButtonBackgroundColor: { red: 0.83, green: 0.55, blue: 0.2, alpha: 1 },
      secondaryButtonLabel: snap.friction === 'prayer' ? 'Pray to disable' : 'Disable',
      secondaryButtonLabelColor: { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 },
    },
    actions: {
      primary: {
        behavior: 'defer' as const,
        actions: [{ type: 'openApp' as const }],
      },
      secondary: {
        behavior: snap.friction === 'prayer' ? ('defer' as const) : ('close' as const),
        actions:
          snap.friction === 'prayer'
            ? [{ type: 'openApp' as const }]
            : [
                {
                  type: 'unblockSelection' as const,
                  familyActivitySelectionId: selectionIdFor(snap.id),
                },
              ],
      },
    },
  }
}

function buildCustodyNative(rnda: RNDA): CustodyNative {
  const safeCall = async <T>(fn: () => T | Promise<T>, fallbackValue: T): Promise<T> => {
    try {
      return await fn()
    } catch (err) {
      console.warn('[custody/native]', err)
      return fallbackValue
    }
  }

  return {
    isSupported: () => {
      try {
        return rnda.isAvailable()
      } catch {
        return false
      }
    },

    getAuthorizationStatus: async () =>
      safeCall(() => mapAuthStatus(rnda.getAuthorizationStatus()), 'unsupported'),

    requestAuthorization: async () =>
      safeCall(async () => {
        await rnda.requestAuthorization('individual')
        return mapAuthStatus(rnda.getAuthorizationStatus())
      }, 'denied'),

    hasSelection: (commitmentId) => {
      try {
        const selection = rnda.getFamilyActivitySelectionId(selectionIdFor(commitmentId))
        return !!selection
      } catch {
        return false
      }
    },

    syncSnapshots: async (snapshots: CommitmentSnapshot[]) =>
      safeCall(async () => {
        rnda.userDefaultsSet(COMMITMENTS_KEY, snapshots)
        for (const snap of snapshots) {
          const { configuration, actions } = buildShieldPayload(snap)
          // The shield extension looks up shield config by activitySelectionId
          // (passed as `shieldId` to blockSelection). Keep these aligned.
          rnda.updateShieldWithId(configuration, actions, selectionIdFor(snap.id))
        }
      }, undefined),

    pushShieldConfig: async (snap) =>
      safeCall(async () => {
        const { configuration, actions } = buildShieldPayload(snap)
        rnda.updateShieldWithId(configuration, actions, selectionIdFor(snap.id))
      }, undefined),

    applyShield: async (commitmentId) =>
      safeCall(async () => {
        const selectionId = selectionIdFor(commitmentId)
        if (!rnda.getFamilyActivitySelectionId(selectionId)) return
        rnda.blockSelection({ activitySelectionId: selectionId }, `custody-apply-${commitmentId}`)
      }, undefined),

    removeShield: async (commitmentId) =>
      safeCall(async () => {
        const selectionId = selectionIdFor(commitmentId)
        if (!rnda.getFamilyActivitySelectionId(selectionId)) return
        rnda.unblockSelection(
          { activitySelectionId: selectionId },
          `custody-remove-${commitmentId}`,
        )
      }, undefined),

    removeAllShields: async () =>
      safeCall(async () => {
        rnda.resetBlocks('custody-reset-all')
        rnda.clearWebContentFilterPolicy('custody-reset-all')
      }, undefined),

    setWebContentFilter: async (policy: WebFilterPolicy, triggeredBy: string) =>
      safeCall(async () => {
        if (policy.type === 'none') {
          rnda.clearWebContentFilterPolicy(triggeredBy)
        } else if (policy.type === 'specific') {
          rnda.setWebContentFilterPolicy({ type: 'specific', domains: policy.domains }, triggeredBy)
        } else {
          rnda.setWebContentFilterPolicy(
            { type: 'all', exceptDomains: policy.exceptDomains },
            triggeredBy,
          )
        }
      }, undefined),

    startMonitoring: async (activityName: string, schedule: ScheduleSpec) =>
      safeCall(async () => {
        await rnda.startMonitoring(activityName, schedule, [])
      }, undefined),

    stopMonitoring: async (activityNames: string[]) =>
      safeCall(async () => {
        rnda.stopMonitoring(activityNames)
      }, undefined),

    getStatus: async () =>
      safeCall(
        async () => {
          const activities = rnda.getActivities()
          const activeCommitmentIds = activities
            .map((name) => name.split('_')[0])
            .filter((id, idx, arr) => arr.indexOf(id) === idx)
          const all = (rnda.userDefaultsAll() ?? {}) as Record<string, unknown>
          const lockedUntil: Record<string, number> = {}
          for (const [key, value] of Object.entries(all)) {
            if (key.startsWith(LOCKED_UNTIL_PREFIX) && typeof value === 'number') {
              lockedUntil[key.slice(LOCKED_UNTIL_PREFIX.length)] = value
            }
          }
          return { activeCommitmentIds, lockedUntil }
        },
        { activeCommitmentIds: [], lockedUntil: {} },
      ),

    drainShieldEvents: async () =>
      safeCall(async () => {
        // RNDA's monitor extension emits onDeviceActivityMonitorEvent events
        // and the shield action extension writes ShieldEvent rows via
        // userDefaultsSet under the `custody.shieldEvent.<uid>` key. Drain.
        const all = (rnda.userDefaultsAll() ?? {}) as Record<string, unknown>
        const events: ShieldEvent[] = []
        for (const [key, value] of Object.entries(all)) {
          if (!key.startsWith('custody.shieldEvent.')) continue
          if (value && typeof value === 'object') {
            const v = value as Partial<ShieldEvent>
            if (v.type && v.commitmentId && v.uid && typeof v.occurredAt === 'number') {
              events.push(v as ShieldEvent)
            }
          }
          rnda.userDefaultsRemove(key)
        }
        return events
      }, [] as ShieldEvent[]),

    liftFrictionLock: async (commitmentId, reason) =>
      safeCall(async () => {
        rnda.userDefaultsRemove(`${LOCKED_UNTIL_PREFIX}${commitmentId}`)
        const selectionId = selectionIdFor(commitmentId)
        if (rnda.getFamilyActivitySelectionId(selectionId)) {
          rnda.unblockSelection({ activitySelectionId: selectionId }, `custody-lift-${reason}`)
        }
      }, undefined),

    openSettings: async () =>
      safeCall(async () => {
        await Linking.openSettings()
      }, undefined),
  }
}

let cached: CustodyNative | undefined

export function getCustodyNative(): CustodyNative {
  if (cached) return cached
  const rnda = loadRNDA()
  cached = rnda ? buildCustodyNative(rnda) : fallback
  return cached
}

export function _resetCustodyNativeForTests(): void {
  cached = undefined
}

export type { AnchorSnapshot, AuthStatus, CommitmentSnapshot, ShieldEvent } from './types'
