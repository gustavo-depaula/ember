import { localizeContent } from '@/lib/i18n'
import type { CycleData, FlowDefinition, LectioTrackDef, PracticeManifest, Variant } from '../types'

// Auto-discover all practice JSON files at bundle time
const ctx = require.context('./', true, /\.json$/)

function resolveKey(practiceId: string, relativePath: string): string {
  const parts = `./${practiceId}/${relativePath}`.split('/')
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else resolved.push(part)
  }
  return resolved.join('/')
}

const manifests: Record<string, PracticeManifest> = {}
const flows: Record<string, FlowDefinition> = {}
const variants: Record<string, Record<string, Variant>> = {}
const practiceData: Record<string, Record<string, CycleData>> = {}
const practiceTracks: Record<string, Record<string, LectioTrackDef>> = {}

for (const key of ctx.keys()) {
  const match = key.match(/^\.\/([^/]+)\/manifest\.json$/)
  if (!match) continue

  const id = match[1]
  const manifest = ctx(key) as PracticeManifest
  manifests[id] = manifest

  for (const flow of manifest.flows) {
    flows[`${id}/${flow.id}`] = ctx(resolveKey(id, flow.file)) as FlowDefinition
  }

  if (manifest.variants?.length) {
    variants[id] = {}
    for (const v of manifest.variants) {
      variants[id][v.id] = ctx(resolveKey(id, v.file)) as Variant
    }
  }

  if (manifest.data) {
    practiceData[id] = {}
    for (const [dataId, dataPath] of Object.entries(manifest.data)) {
      practiceData[id][dataId] = ctx(resolveKey(id, dataPath)) as unknown as CycleData
    }
  }

  if (manifest.tracks) {
    practiceTracks[id] = {}
    for (const [trackId, trackPath] of Object.entries(manifest.tracks)) {
      practiceTracks[id][trackId] = ctx(resolveKey(id, trackPath)) as unknown as LectioTrackDef
    }
  }
}

const allManifests = Object.values(manifests)

export function getManifest(id: string): PracticeManifest | undefined {
  return manifests[id]
}

export function getAllManifests(): PracticeManifest[] {
  return allManifests
}

export function loadFlowForSlot(practiceId: string, flowId: string): FlowDefinition | undefined {
  const key = `${practiceId}/${flowId}`
  if (flows[key]) return flows[key]
  // Fallback for legacy slots with stale slot_ids (e.g., 'default' before flows migration)
  const prefix = `${practiceId}/`
  const fallbackKey = Object.keys(flows).find((k) => k.startsWith(prefix))
  return fallbackKey ? flows[fallbackKey] : undefined
}

export function loadVariant(manifestId: string, variantId: string): Variant | undefined {
  return variants[manifestId]?.[variantId]
}

export function getDefaultVariant(manifestId: string): Variant | undefined {
  const manifest = manifests[manifestId]
  if (!manifest?.variants?.length) return undefined
  const firstVariantId = manifest.variants[0].id
  return variants[manifestId]?.[firstVariantId]
}

export function loadPracticeData(practiceId: string): Record<string, CycleData> | undefined {
  return practiceData[practiceId]
}

export function loadPracticeTracks(practiceId: string): Record<string, LectioTrackDef> | undefined {
  return practiceTracks[practiceId]
}

export function getManifestIconKey(manifestId: string): string {
  return manifests[manifestId]?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of allManifests) {
    for (const c of m.categories) cats.add(c)
  }
  return Array.from(cats).sort()
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return allManifests.filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}
