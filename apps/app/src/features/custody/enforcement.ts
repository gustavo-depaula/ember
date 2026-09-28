import gambling from './blocklists/gambling.json'
import news from './blocklists/news.json'
import porn from './blocklists/porn.json'
import social from './blocklists/social.json'
import { getCustodyNative } from './native'
import { selectionIdFor } from './native/ios'
import type { ScheduleSpec } from './native/types'
import { snapshotFromCommitment } from './syncSnapshots'
import { parseHHmm } from './time'
import type { Commitment, Target } from './types'

// Activity name must contain the FamilyActivitySelectionId: RNDA's
// per-selection shield-config lookup filters monitored activities by
// `rawValue.contains(selectionId)`.
function activityNameFor(commitmentId: string): string {
  return selectionIdFor(commitmentId)
}

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

// `time-fence` uses its configured window; `abstain` and `time-limit` use
// 00:00–23:59 daily. Logs rather than throws on malformed fence times so the
// reconcile loop keeps going through the remaining commitments.
function scheduleFor(commitment: Commitment): ScheduleSpec | undefined {
  if (commitment.kind === 'time-fence' && commitment.fence_start && commitment.fence_end) {
    const start = parseHHmm(commitment.fence_start)
    const end = parseHHmm(commitment.fence_end)
    if (!start || !end) {
      console.error(
        `[custody/enforcement] malformed fence times for ${commitment.id}: ` +
          `start=${commitment.fence_start} end=${commitment.fence_end}`,
      )
      return undefined
    }
    return {
      intervalStart: { hour: start.hours, minute: start.minutes },
      intervalEnd: { hour: end.hours, minute: end.minutes },
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

// Idempotent: re-registers the schedule, re-pushes the shield config,
// re-applies the block.
export async function wireBoundEnforcement(commitment: Commitment): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported() || commitment.archived !== 0) return

  const triggeredBy = `custody-wire-${commitment.id}`

  // Push the shield config first so when the block fires, the extension
  // already knows what prayer card to render.
  await native.pushShieldConfig(snapshotFromCommitment(commitment))

  // A system-wide WebContentFilter: blocks these domains in Safari and any
  // WebKit-based browser.
  const domains = collectDomains(commitment.targets)
  if (domains.length > 0) {
    await native.setWebContentFilter({ type: 'specific', domains }, triggeredBy)
  }

  // App / category blocking needs a selection picked via
  // DeviceActivitySelectionViewPersisted; without one `applyShield` is a no-op.
  if (hasAppTargets(commitment.targets) || native.hasSelection(commitment.id)) {
    await native.applyShield(commitment.id)
  }

  // Wakes the DeviceActivityMonitor extension at the commitment's start/end
  // so the shield is applied / removed automatically (and
  // eventDidReachThreshold fires for time-limit).
  const schedule = scheduleFor(commitment)
  if (schedule) {
    await native.startMonitoring(activityNameFor(commitment.id), schedule)
  }
}

export async function unwireBoundEnforcement(commitment: Commitment): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported()) return

  await native.stopMonitoring([activityNameFor(commitment.id)])
  await native.removeShield(commitment.id)

  // This clears the WHOLE policy — if multiple bound commitments contribute
  // domains, the caller should re-push via reconcileAllEnforcement instead.
  const domains = collectDomains(commitment.targets)
  if (domains.length > 0) {
    await native.setWebContentFilter({ type: 'none' }, `custody-unwire-${commitment.id}`)
  }
}

// Boot reconciliation: the iOS shield state may have been wiped (reinstall,
// OS restore) while SQLite still says the commitment is bound and active.
export async function reconcileAllEnforcement(commitments: Commitment[]): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported()) return

  // One aggregate filter policy: the policy is global, so per-commitment
  // pushes would overwrite each other.
  const aggregateDomains = new Set<string>()
  const boundActive = commitments.filter((c) => c.archived === 0)
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

  for (const c of boundActive) {
    await native.pushShieldConfig(snapshotFromCommitment(c))
    if (hasAppTargets(c.targets) || native.hasSelection(c.id)) {
      await native.applyShield(c.id)
    }
    const schedule = scheduleFor(c)
    if (schedule) {
      await native.startMonitoring(activityNameFor(c.id), schedule)
    }
  }
}
