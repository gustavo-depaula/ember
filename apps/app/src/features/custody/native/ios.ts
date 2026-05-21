import { Linking, Platform } from 'react-native'

import { fallback } from './fallback'
import type { CommitmentSnapshot, CustodyNative, ShieldEvent } from './types'

// Lazy-loaded reference to the `react-native-device-activity` JS module.
// The module ships pre-built iOS extension targets (`ActivityMonitorExtension`,
// `ShieldAction`, `ShieldConfiguration`) which are merged into the host app's
// Xcode project at `expo prebuild` time via @kingstinct/expo-apple-targets.
// Our `getCustodyNative()` adapter translates the Custody-flavored API surface
// into RNDA's JS calls so the rest of the codebase doesn't have to learn the
// library's vocabulary.
//
// On Android / sim / web (or any environment where the module can't load),
// we transparently fall back to no-ops.
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
const SHIELD_EVENT_PREFIX = 'custody.shieldEvent.'
const LOCKED_UNTIL_PREFIX = 'custody.lockedUntil.'
const SHIELD_ID_PREFIX = 'custody.shield.'

function selectionIdFor(commitmentId: string): string {
  return `custody.selection.${commitmentId}`
}

function mapAuthStatus(raw: unknown): 'notDetermined' | 'denied' | 'approved' | 'unsupported' {
  // RNDA returns a string union from AuthorizationStatusType.
  if (raw === 'approved' || raw === 1 || raw === '1') return 'approved'
  if (raw === 'denied' || raw === 2 || raw === '2') return 'denied'
  if (raw === 'notDetermined' || raw === 0 || raw === '0') return 'notDetermined'
  return 'unsupported'
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

    presentPicker: async (commitmentId, _includeWebDomains) => {
      // RNDA exposes selection only through view components
      // (DeviceActivitySelectionView). The host UI in
      // AppTargetPickerIOS.tsx renders that view and persists the resulting
      // FamilyActivitySelection via `setFamilyActivitySelectionId`. This
      // function returns a stable tokenRef so the calling code keeps the
      // same shape — the actual selection is bound to the ref by the view
      // component.
      return { tokenRef: selectionIdFor(commitmentId) }
    },

    syncSnapshots: async (snapshots: CommitmentSnapshot[]) =>
      safeCall(async () => {
        rnda.userDefaultsSet(COMMITMENTS_KEY, snapshots)
        // Push a per-commitment ShieldConfiguration into RNDA's
        // updateShieldWithId protocol so the extension can pick the
        // right shield for each selection.
        for (const snap of snapshots) {
          rnda.updateShieldWithId(
            {
              title: snap.anchor.title,
              subtitle: snap.anchor.subtitle,
              backgroundColor: { red: 0.054, green: 0.051, blue: 0.047, alpha: 1 },
              titleColor: { red: 1, green: 1, blue: 1, alpha: 1 },
              subtitleColor: { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 },
              primaryButtonLabel: 'Pray and continue blocking',
              primaryButtonLabelColor: { red: 1, green: 1, blue: 1, alpha: 1 },
              primaryButtonBackgroundColor: {
                red: 0.83,
                green: 0.55,
                blue: 0.2,
                alpha: 1,
              },
              secondaryButtonLabel:
                snap.friction === 'confession-only'
                  ? 'After confession'
                  : snap.friction === 'prayer'
                    ? 'Pray to disable'
                    : 'Disable',
              secondaryButtonLabelColor: { red: 0.9, green: 0.9, blue: 0.9, alpha: 1 },
            },
            {
              primary: {
                behavior: 'defer',
                actions: [
                  { type: 'openApp' },
                  {
                    type: 'sendNotification',
                    payload: { title: snap.anchor.title, body: snap.anchor.subtitle },
                  },
                ],
              },
              secondary: {
                behavior:
                  snap.friction === 'confession-only' || snap.friction === 'prayer'
                    ? 'defer'
                    : 'close',
                actions:
                  snap.friction === 'confession-only' || snap.friction === 'prayer'
                    ? [{ type: 'openApp' }]
                    : [
                        {
                          type: 'unblockSelection',
                          familyActivitySelectionId: selectionIdFor(snap.id),
                        },
                      ],
              },
            },
            `${SHIELD_ID_PREFIX}${snap.id}`,
          )
        }
      }, undefined),

    applyShield: async (commitmentId) =>
      safeCall(async () => {
        const selectionId = selectionIdFor(commitmentId)
        const familyActivitySelection = rnda.getFamilyActivitySelectionId(selectionId)
        if (!familyActivitySelection) return
        rnda.blockSelection({ activitySelectionId: selectionId }, `custody-${commitmentId}`)
      }, undefined),

    removeShield: async (commitmentId) =>
      safeCall(async () => {
        const selectionId = selectionIdFor(commitmentId)
        const familyActivitySelection = rnda.getFamilyActivitySelectionId(selectionId)
        if (!familyActivitySelection) return
        rnda.unblockSelection({ activitySelectionId: selectionId }, `custody-${commitmentId}`)
      }, undefined),

    removeAllShields: async () =>
      safeCall(async () => {
        rnda.resetBlocks('custody-reset-all')
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
        const all = (rnda.userDefaultsAll() ?? {}) as Record<string, unknown>
        const events: ShieldEvent[] = []
        for (const [key, value] of Object.entries(all)) {
          if (!key.startsWith(SHIELD_EVENT_PREFIX)) continue
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
        const familyActivitySelection = rnda.getFamilyActivitySelectionId(selectionId)
        if (familyActivitySelection) {
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
