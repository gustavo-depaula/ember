import { File } from 'expo-file-system'
import type {
  CycleData,
  FlowDefinition,
  LectioTrackDef,
  LocalizedText,
  Variant,
} from '../types'
import type { PracticeManifest } from '../manifest-types'

export type PrayerAsset = {
  title: LocalizedText
  body: LocalizedText
}

export type PrayerBook = {
  id: string
  version: string
  name: LocalizedText
  languages: string[]
  practices: string[]
  prayers: string[]
  description?: LocalizedText
  author?: LocalizedText
  icon?: string
  image?: string
  tags?: string[]
  dependencies?: string[]
  defaults?: { autoSeed: boolean }
}

export type ContentSource = {
  bookId: string
  book: PrayerBook
  getManifest(practiceId: string): PracticeManifest | undefined
  getAllManifests(): PracticeManifest[]
  loadFlow(practiceId: string, flowId: string): FlowDefinition | undefined
  loadVariant(practiceId: string, variantId: string): Variant | undefined
  loadData(practiceId: string): Record<string, CycleData> | undefined
  loadTracks(practiceId: string): Record<string, LectioTrackDef> | undefined
  getPrayer(ref: string): PrayerAsset | undefined
  getCanticle(ref: string): PrayerAsset | undefined
}

const canticleRefs = new Set(['benedictus', 'magnificat', 'nunc-dimittis'])

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    const file = new File(path)
    if (!file.exists) return undefined
    const raw = await file.text()
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export async function createFileSystemSource(bookDirUri: string): Promise<ContentSource> {
  const book = await readJson<PrayerBook>(`${bookDirUri}book.json`)
  if (!book) throw new Error(`No book.json found in ${bookDirUri}`)

  // Eagerly load all content into memory (JSON is small)
  const cache = new Map<string, unknown>()
  const manifests: Record<string, PracticeManifest> = {}

  for (const practiceId of book.practices) {
    const base = `${bookDirUri}practices/${practiceId}`
    const manifest = await readJson<PracticeManifest>(`${base}/manifest.json`)
    if (!manifest) continue
    manifests[practiceId] = manifest

    for (const flow of manifest.flows) {
      const flowDef = await readJson<FlowDefinition>(`${base}/${flow.file}`)
      if (flowDef) cache.set(`flow:${practiceId}/${flow.id}`, flowDef)
    }

    if (manifest.variants?.length) {
      for (const v of manifest.variants) {
        const variant = await readJson<Variant>(`${base}/${v.file}`)
        if (variant) cache.set(`variant:${practiceId}/${v.id}`, variant)
      }
    }

    if (manifest.data) {
      const dataMap: Record<string, CycleData> = {}
      for (const [dataId, dataPath] of Object.entries(manifest.data)) {
        const data = await readJson<CycleData>(`${base}/${dataPath}`)
        if (data) dataMap[dataId] = data
      }
      if (Object.keys(dataMap).length > 0) cache.set(`data:${practiceId}`, dataMap)
    }

    if (manifest.tracks) {
      const trackMap: Record<string, LectioTrackDef> = {}
      for (const [trackId, trackPath] of Object.entries(manifest.tracks)) {
        const track = await readJson<LectioTrackDef>(`${base}/${trackPath}`)
        if (track) trackMap[trackId] = track
      }
      if (Object.keys(trackMap).length > 0) cache.set(`tracks:${practiceId}`, trackMap)
    }
  }

  // Eagerly load prayers
  const prayers: Record<string, PrayerAsset> = {}
  for (const prayerId of book.prayers) {
    const prayer = await readJson<PrayerAsset>(`${bookDirUri}prayers/${prayerId}.json`)
    if (prayer) prayers[prayerId] = prayer
  }

  const allManifests = book.practices
    .map((id) => manifests[id])
    .filter((m): m is PracticeManifest => m !== undefined)

  return {
    bookId: book.id,
    book,
    getManifest: (id) => manifests[id],
    getAllManifests: () => allManifests,
    loadFlow: (pid, fid) => cache.get(`flow:${pid}/${fid}`) as FlowDefinition | undefined,
    loadVariant: (pid, vid) => cache.get(`variant:${pid}/${vid}`) as Variant | undefined,
    loadData: (pid) => cache.get(`data:${pid}`) as Record<string, CycleData> | undefined,
    loadTracks: (pid) => cache.get(`tracks:${pid}`) as Record<string, LectioTrackDef> | undefined,
    getPrayer: (ref) => (canticleRefs.has(ref) ? undefined : prayers[ref]),
    getCanticle: (ref) => (canticleRefs.has(ref) ? prayers[ref] : undefined),
  }
}
