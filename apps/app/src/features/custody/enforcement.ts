import gambling from './blocklists/gambling.json'
import news from './blocklists/news.json'
import porn from './blocklists/porn.json'
import social from './blocklists/social.json'
import { getCustodyNative } from './native'
import type { ScheduleSpec } from './native/types'
import { snapshotFromCommitment } from './syncSnapshots'
import type { Commitment, Target } from './types'

// Maps a commitment's runtime intent — selection, web filter, schedule — onto
// the actual `react-native-device-activity` calls that tell iOS to start
// blocking. This is the "make it real" layer: applyShield, setWebContentFilter,
// startMonitoring all originate here. Called whenever a bound commitment is
// created / updated / re-enabled, and on cold boot to reconcile what iOS
// already has vs what SQLite says.

const BLOCKLIST_DOMAINS: Record<string, string[]> = {
  porn: porn.domains,
  gambling: gambling.domains,
  social: social.domains,
  news: news.domains,
}

function collectDomains(targets: Target[]): string[] {
  const out = new Set<string>()
  for (const t of targets) {
    if (t.kind === 'domain') out.add(t.domain)
    if (t.kind === 'domain-list') {
      for (const d of BLOCKLIST_DOMAINS[t.listKey] ?? []) out.add(d)
    }
  }
  return [...out]
}

function hasAppTargets(targets: Target[]): boolean {
  return targets.some((t) => t.kind === 'ios-app' || t.kind === 'ios-category')
}

function parseHHmm(value: string): { hour: number; minute: number } | undefined {
  const [h, m] = value.split(':')
  const hour = Number.parseInt(h, 10)
  const minute = Number.parseInt(m, 10)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return undefined
  return { hour, minute }
}

// Translate a commitment's fence/schedule shape into the single
// DeviceActivitySchedule we register with iOS. For `time-fence` use the
// configured window; for `abstain` and `time-limit` use 00:00–23:59 daily.
function scheduleFor(commitment: Commitment): ScheduleSpec | undefined {
  if (commitment.kind === 'time-fence' && commitment.fence_start && commitment.fence_end) {
    const start = parseHHmm(commitment.fence_start)
    const end = parseHHmm(commitment.fence_end)
    if (!start || !end) return undefined
    return {
      intervalStart: { hour: start.hour, minute: start.minute },
      intervalEnd: { hour: end.hour, minute: end.minute },
      repeats: true,
    }
  }
  if (commitment.kind === 'abstain' || commitment.kind === 'time-limit') {
    return {
      intervalStart: { hour: 0, minute: 0 },
      intervalEnd: { hour: 23, minute: 59 },
      repeats: true,
    }
  }
  return undefined
}

// Apply real iOS-level enforcement for a single commitment. Idempotent — safe
// to call repeatedly on the same commitment (re-registers the schedule,
// re-pushes the shield config, re-applies the block).
export async function wireBoundEnforcement(commitment: Commitment): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported() || commitment.severity !== 'bound') return

  const triggeredBy = `custody-wire-${commitment.id}`

  // Push the shield config first so when the block fires, the extension
  // already knows what prayer card to render.
  await native.pushShieldConfig(snapshotFromCommitment(commitment))

  // Web-domain blocking: explicit domain list + curated blocklists. RNDA's
  // `setWebContentFilterPolicy({ type: 'specific', domains })` installs a
  // system-wide WebContentFilter that blocks the given domains in Safari
  // and any WebKit-based browser on iOS.
  const domains = collectDomains(commitment.targets)
  if (domains.length > 0) {
    await native.setWebContentFilter({ type: 'specific', domains }, triggeredBy)
  }

  // App / category blocking: requires the user to have picked a selection via
  // DeviceActivitySelectionViewPersisted under `selectionIdFor(commitmentId)`.
  // If they haven't, `applyShield` is a no-op (skips when the selection key
  // isn't present).
  if (hasAppTargets(commitment.targets) || native.hasSelection(commitment.id)) {
    await native.applyShield(commitment.id)
  }

  // Schedule registration: wake the DeviceActivityMonitor extension at the
  // commitment's start/end times so the shield can be applied / removed
  // automatically (and so eventDidReachThreshold fires for time-limit).
  const schedule = scheduleFor(commitment)
  if (schedule) {
    await native.startMonitoring(commitment.id, schedule)
  }
}

// Tear down all enforcement for a commitment. Called on archive / delete /
// severity downgrade.
export async function unwireBoundEnforcement(commitment: Commitment): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported()) return

  await native.stopMonitoring([commitment.id])
  await native.removeShield(commitment.id)

  // If the commitment had domains, clear them. Note: this clears the WHOLE
  // policy — if multiple bound commitments contribute domains, the caller
  // should re-derive and re-push via reconcileAllEnforcement instead.
  const domains = collectDomains(commitment.targets)
  if (domains.length > 0) {
    await native.setWebContentFilter({ type: 'none' }, `custody-unwire-${commitment.id}`)
  }
}

// Boot reconciliation: walk every active bound commitment and (re)apply its
// enforcement. Handles the cold-launch case where the iOS shield state may
// have been wiped (uninstall + reinstall, OS restore) but the SQLite state
// still says "this commitment is bound and active."
export async function reconcileAllEnforcement(commitments: Commitment[]): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported()) return

  // First, collect every domain across every active bound commitment and
  // push a single specific-filter policy. Per-commitment unwire would clear
  // the others; aggregate first.
  const aggregateDomains = new Set<string>()
  const boundActive = commitments.filter((c) => c.severity === 'bound' && c.archived === 0)
  for (const c of boundActive) {
    for (const d of collectDomains(c.targets)) aggregateDomains.add(d)
  }
  if (aggregateDomains.size > 0) {
    await native.setWebContentFilter(
      { type: 'specific', domains: [...aggregateDomains] },
      'custody-reconcile',
    )
  } else {
    await native.setWebContentFilter({ type: 'none' }, 'custody-reconcile')
  }

  // Then per-commitment: shield config, app-selection block, schedule.
  for (const c of boundActive) {
    await native.pushShieldConfig(snapshotFromCommitment(c))
    if (hasAppTargets(c.targets) || native.hasSelection(c.id)) {
      await native.applyShield(c.id)
    }
    const schedule = scheduleFor(c)
    if (schedule) {
      await native.startMonitoring(c.id, schedule)
    }
  }
}
