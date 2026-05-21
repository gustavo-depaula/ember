import { listCommitments } from '@/db/repositories/custody'
import type { AnchorSnapshot, CommitmentSnapshot } from './native'
import { getCustodyNative } from './native'
import type { Anchor, Commitment, Target } from './types'

function trimToLength(value: string, max: number): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

function anchorTitle(anchor: Anchor | null, fallback: string): string {
  if (!anchor) return trimToLength(fallback, 30)
  if (anchor.kind === 'text') return trimToLength(fallback, 30)
  if (anchor.kind === 'prayer') return trimToLength(anchor.prayerRef.replace(/^prayer\//, ''), 30)
  if (anchor.kind === 'lectio') return trimToLength(anchor.reference, 30)
  if (anchor.kind === 'image') return trimToLength(fallback, 30)
  return trimToLength(fallback, 30)
}

function anchorSubtitle(anchor: Anchor | null): string {
  if (!anchor) return ''
  switch (anchor.kind) {
    case 'text':
      return trimToLength(anchor.text, 120)
    case 'prayer':
      return trimToLength(anchor.rendered, 120)
    case 'lectio':
      return trimToLength(anchor.rendered, 120)
    case 'image':
      return trimToLength(anchor.caption ?? '', 120)
    case 'silence':
      return ''
  }
}

function anchorImage(anchor: Anchor | null): string | undefined {
  if (anchor?.kind === 'image') return anchor.imageRef
  return undefined
}

function toAnchorSnapshot(anchor: Anchor | null, commitmentName: string): AnchorSnapshot {
  return {
    kind: anchor?.kind ?? 'silence',
    title: anchorTitle(anchor, commitmentName),
    subtitle: anchorSubtitle(anchor),
    imageAsset: anchorImage(anchor),
  }
}

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

export function snapshotFromCommitment(c: Commitment): CommitmentSnapshot {
  return {
    id: c.id,
    name: c.name,
    severity: c.severity,
    friction: c.friction,
    frictionConfig: c.friction_config
      ? (c.friction_config as unknown as Record<string, unknown>)
      : undefined,
    anchor: toAnchorSnapshot(c.shield_anchor, c.name),
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
  const snapshots = commitments.filter((c) => c.severity === 'bound').map(snapshotFromCommitment)
  await native.syncSnapshots(snapshots)
}
