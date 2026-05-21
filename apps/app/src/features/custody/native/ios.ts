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

// Keys the RNDA Shield Extension actually reads. `shieldConfiguration` is the
// fallback used when no per-selection match is found; the prefixed keys are
// per-FamilyActivitySelection overrides. We write both so blocked apps render
// the prayer regardless of which lookup path the extension takes.
const SHIELD_CONFIG_FALLBACK = 'shieldConfiguration'
const SHIELD_ACTIONS_FALLBACK = 'shieldActions'
const SHIELD_CONFIG_PER_SELECTION_PREFIX = 'shieldConfigurationForSelection_'
const SHIELD_ACTIONS_PER_SELECTION_PREFIX = 'shieldActionsForSelection_'

export function selectionIdFor(commitmentId: string): string {
  return `custody.selection.${commitmentId}`
}

function mapAuthStatus(raw: unknown): 'notDetermined' | 'denied' | 'approved' | 'unsupported' {
  if (raw === 'approved' || raw === 2 || raw === '2') return 'approved'
  if (raw === 'denied' || raw === 1 || raw === '1') return 'denied'
  if (raw === 'notDetermined' || raw === 0 || raw === '0') return 'notDetermined'
  return 'unsupported'
}

// Ember dark-theme palette, expressed in 0–255 because RNDA divides every
// channel by 255 in `getColor` before constructing the UIColor.
const SHIELD_BG = { red: 14, green: 13, blue: 12, alpha: 1 } // #0E0D0C — cathedral void
const SHIELD_BG_BLUR = 3 // UIBlurEffect.Style.systemThinMaterialDark
const TITLE = { red: 237, green: 228, blue: 216, alpha: 1 } // #EDE4D8 — bone white
const SUBTITLE = { red: 168, green: 154, blue: 140, alpha: 1 } // #A89A8C — sandstone
const ACCENT = { red: 212, green: 166, blue: 58, alpha: 1 } // #D4A63A — reliquary gold
const ACCENT_INK = { red: 14, green: 13, blue: 12, alpha: 1 } // dark text on gold

function buildShieldPayload(snap: CommitmentSnapshot) {
  const secondaryLabel = snap.friction === 'prayer' ? 'Pray to disable' : 'Disable'
  return {
    configuration: {
      title: snap.name,
      subtitle: snap.anchor.subtitle || snap.anchor.title,
      iconSystemName: 'flame.fill',
      iconTint: ACCENT,
      backgroundColor: SHIELD_BG,
      backgroundBlurStyle: SHIELD_BG_BLUR,
      titleColor: TITLE,
      subtitleColor: SUBTITLE,
      primaryButtonLabel: 'Pray and continue',
      primaryButtonLabelColor: ACCENT_INK,
      primaryButtonBackgroundColor: ACCENT,
      secondaryButtonLabel: secondaryLabel,
      secondaryButtonLabelColor: SUBTITLE,
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

  // Write the shield config under every key the extension might read:
  //   - `shieldConfiguration` / `shieldActions` (default fallback, used for
  //     any blocked app/domain when no per-selection match is found)
  //   - `shieldConfigurationForSelection_<id>` / `shieldActionsForSelection_<id>`
  //     (per-FamilyActivitySelection override, used when the blocked token
  //     belongs to a known selection in a monitored activity)
  // updateShieldWithId() only writes the `shieldConfiguration_<id>` template,
  // which RNDA's `blockSelection` action shield-button reads — that's not the
  // same as what the extension reads upfront. So we also write the keys
  // above explicitly via userDefaultsSet.
  const writeShield = (snap: CommitmentSnapshot) => {
    const { configuration, actions } = buildShieldPayload(snap)
    const selectionId = selectionIdFor(snap.id)
    rnda.userDefaultsSet(SHIELD_CONFIG_FALLBACK, configuration)
    rnda.userDefaultsSet(SHIELD_ACTIONS_FALLBACK, actions)
    rnda.userDefaultsSet(`${SHIELD_CONFIG_PER_SELECTION_PREFIX}${selectionId}`, configuration)
    rnda.userDefaultsSet(`${SHIELD_ACTIONS_PER_SELECTION_PREFIX}${selectionId}`, actions)
    // Preserve the templated form too — shield-button actions look it up.
    rnda.updateShieldWithId(configuration, actions, selectionId)
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
        for (const snap of snapshots) writeShield(snap)
      }, undefined),

    pushShieldConfig: async (snap) => safeCall(async () => writeShield(snap), undefined),

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
            .filter((name) => name.startsWith('custody.selection.'))
            .map((name) => name.slice('custody.selection.'.length))
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
