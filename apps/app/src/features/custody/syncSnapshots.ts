import { listCommitments } from '@/db/repositories/custody'
import type { CommitmentSnapshot } from './native'
import { getCustodyNative } from './native'
import { pickShieldMessage } from './shieldMessages'
import type { Commitment, Target } from './types'

function extractWebDomains(targets: Target[]): string[] | undefined {
  const set = new Set<string>()
  for (const t of targets) {
    if (t.kind === 'domain') set.add(t.domain)
    if (t.kind === 'domain-list') {
      // The Swift side resolves curated lists from the bundled JSON; we
      // pass the listKey by prefixing with `list:` so the bridge can do
      // the lookup.
      set.add(`list:${t.listKey}`)
    }
  }
  return set.size > 0 ? [...set] : undefined
}

function extractTokenRef(targets: Target[]): string | undefined {
  return targets.find((t) => t.kind === 'ios-app' || t.kind === 'ios-category')?.tokenRef
}

export function snapshotFromCommitment(c: Commitment, now: Date = new Date()): CommitmentSnapshot {
  const message = pickShieldMessage(c.id, now)
  return {
    id: c.id,
    name: c.name,
    friction: c.friction,
    frictionConfig: c.friction_config
      ? (c.friction_config as unknown as Record<string, unknown>)
      : undefined,
    anchor: {
      kind: 'text',
      title: message.title,
      subtitle: message.body,
    },
    schedule: c.schedule,
    fenceStart: c.fence_start ?? undefined,
    fenceEnd: c.fence_end ?? undefined,
    limitSeconds: c.limit_seconds ?? undefined,
    kind: c.kind,
    tokenRef: extractTokenRef(c.targets),
    webDomains: extractWebDomains(c.targets),
  }
}

// Pulls every active commitment from SQLite, builds an extension-friendly
// snapshot for each, and pushes the whole array to UserDefaults under the
// App Group. Called after every commitment mutation and on app foreground.
export async function syncCommitmentSnapshots(): Promise<void> {
  const native = getCustodyNative()
  if (!native.isSupported()) return
  const commitments = await listCommitments({ includeArchived: false })
  const snapshots = commitments.map((c) => snapshotFromCommitment(c))
  await native.syncSnapshots(snapshots)
}
