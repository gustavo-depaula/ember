import { File } from 'expo-file-system'
import type { PracticeManifest } from '../manifest-types'
import type { CycleData, FlowDefinition, LectioTrackDef, LocalizedText, Variant } from '../types'

export type PrayerAsset = {
  title: LocalizedText
  body: LocalizedText
  subtitle?: LocalizedText
  source?: LocalizedText
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
    const raw = await new File(path).text()
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

async function loadPractice(
  bookDirUri: string,
  practiceId: string,
  manifests: Record<string, PracticeManifest>,
  flows: Map<string, FlowDefinition>,
  variants: Map<string, Variant>,
  dataCache: Map<string, Record<string, CycleData>>,
  tracksCache: Map<string, Record<string, LectioTrackDef>>,
) {
  const base = `${bookDirUri}practices/${practiceId}`
  const manifest = await readJson<PracticeManifest>(`${base}/manifest.json`)
  if (!manifest) return
  manifests[practiceId] = manifest

  const promises: Promise<void>[] = []

  for (const flow of manifest.flows) {
    promises.push(
      readJson<FlowDefinition>(`${base}/${flow.file}`).then((def) => {
        if (def) flows.set(`${practiceId}/${flow.id}`, def)
      }),
    )
  }

  if (manifest.variants?.length) {
    for (const v of manifest.variants) {
      promises.push(
        readJson<Variant>(`${base}/${v.file}`).then((def) => {
          if (def) variants.set(`${practiceId}/${v.id}`, def)
        }),
      )
    }
  }

  if (manifest.data) {
    for (const [dataId, dataPath] of Object.entries(manifest.data)) {
      promises.push(
        readJson<CycleData>(`${base}/${dataPath}`).then((data) => {
          if (!data) return
          const existing = dataCache.get(practiceId) ?? {}
          existing[dataId] = data
          dataCache.set(practiceId, existing)
        }),
      )
    }
  }

  if (manifest.tracks) {
    for (const [trackId, trackPath] of Object.entries(manifest.tracks)) {
      promises.push(
        readJson<LectioTrackDef>(`${base}/${trackPath}`).then((track) => {
          if (!track) return
          const existing = tracksCache.get(practiceId) ?? {}
          existing[trackId] = track
          tracksCache.set(practiceId, existing)
        }),
      )
    }
  }

  await Promise.all(promises)
}

export async function createFileSystemSource(bookDirUri: string): Promise<ContentSource> {
  const book = await readJson<PrayerBook>(`${bookDirUri}book.json`)
  if (!book) throw new Error(`No book.json found in ${bookDirUri}`)

  const manifests: Record<string, PracticeManifest> = {}
  const flows = new Map<string, FlowDefinition>()
  const variants = new Map<string, Variant>()
  const dataCache = new Map<string, Record<string, CycleData>>()
  const tracksCache = new Map<string, Record<string, LectioTrackDef>>()

  await Promise.all(
    book.practices.map((pid) =>
      loadPractice(bookDirUri, pid, manifests, flows, variants, dataCache, tracksCache),
    ),
  )

  const prayers: Record<string, PrayerAsset> = {}
  await Promise.all(
    book.prayers.map(async (prayerId) => {
      const prayer = await readJson<PrayerAsset>(`${bookDirUri}prayers/${prayerId}.json`)
      if (prayer) prayers[prayerId] = prayer
    }),
  )

  const allManifests = book.practices
    .map((id) => manifests[id])
    .filter((m): m is PracticeManifest => m !== undefined)

  return {
    bookId: book.id,
    book,
    getManifest: (id) => manifests[id],
    getAllManifests: () => allManifests,
    loadFlow: (pid, fid) => flows.get(`${pid}/${fid}`),
    loadVariant: (pid, vid) => variants.get(`${pid}/${vid}`),
    loadData: (pid) => dataCache.get(pid),
    loadTracks: (pid) => tracksCache.get(pid),
    getPrayer: (ref) => (canticleRefs.has(ref) ? undefined : prayers[ref]),
    getCanticle: (ref) => (canticleRefs.has(ref) ? prayers[ref] : undefined),
  }
}
