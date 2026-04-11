import { File } from 'expo-file-system'
import type { ChapterManifest, PracticeManifest } from '../manifest-types'
import type {
  CycleData,
  FlowDefinition,
  FlowSection,
  LectioTrackDef,
  LocalizedContent,
  LocalizedText,
  Variant,
} from '../types'

export type PrayerAsset = {
  title: LocalizedText
  body: FlowSection[]
  subtitle?: LocalizedText
  source?: LocalizedText
}

export type TocNode = {
  id: string
  title: LocalizedText
  children?: TocNode[]
}

export type BookEntry = {
  id: string
  name: LocalizedText
  author?: LocalizedText
  description?: LocalizedText
  composed?: number | string
  languages: string[]
  image?: string
  toc?: TocNode[]
}

export type Library = {
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
  chapters?: string[]
  books?: string[]
  contents?: { type: 'chapter' | 'practice' | 'book'; id: string }[]
}

export type ContentSource = {
  libraryId: string
  libraryDirUri: string
  library: Library
  getManifest(practiceId: string): PracticeManifest | undefined
  getAllManifests(): PracticeManifest[]
  loadFlow(practiceId: string, flowId: string): FlowDefinition | undefined
  loadPerDayFlow(practiceId: string, day: number): FlowDefinition | undefined
  loadVariant(practiceId: string, variantId: string): Variant | undefined
  loadData(practiceId: string): Record<string, CycleData> | undefined
  loadTracks(practiceId: string): Record<string, LectioTrackDef> | undefined
  getPrayer(ref: string): PrayerAsset | undefined
  getCanticle(ref: string): PrayerAsset | undefined
  getChapterManifest(id: string): ChapterManifest | undefined
  getAllChapterManifests(): ChapterManifest[]
  loadChapterContent(id: string): FlowDefinition | undefined
  getProseText(filePath: string): LocalizedContent | undefined
  getBookEntry(id: string): BookEntry | undefined
  getAllBookEntries(): BookEntry[]
  loadBookChapterText(bookId: string, chapterId: string, lang: string): Promise<string | undefined>
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

  if (manifest.program?.perDayFlows) {
    const dir = manifest.program.perDayFlows
    for (let i = 0; i < manifest.program.totalDays; i++) {
      const padded = String(i + 1).padStart(2, '0')
      promises.push(
        readJson<FlowDefinition>(`${base}/${dir}/day-${padded}.json`).then((def) => {
          if (def) flows.set(`${practiceId}/__day/${i}`, def)
        }),
      )
    }
  }

  await Promise.all(promises)
}

function collectProseFiles(sections: FlowSection[]): string[] {
  const files: string[] = []
  for (const section of sections) {
    if (section.type === 'prose') files.push(section.file)
    if ('sections' in section && Array.isArray(section.sections)) {
      files.push(...collectProseFiles(section.sections as FlowSection[]))
    }
    if (section.type === 'options') {
      for (const opt of section.options) {
        files.push(...collectProseFiles(opt.sections))
      }
    }
  }
  return files
}

async function readTextFile(path: string): Promise<string | undefined> {
  try {
    return await new File(path).text()
  } catch {
    return undefined
  }
}

function rewriteImagePaths(sections: FlowSection[], baseUri: string): void {
  for (const section of sections) {
    if (section.type === 'image' && section.src && !section.src.startsWith('file://')) {
      section.src = `${baseUri}/${section.src}`
    }
    if (section.type === 'gallery') {
      for (const item of section.items) {
        if (item.src && !item.src.startsWith('file://')) {
          item.src = `${baseUri}/${item.src}`
        }
      }
    }
    if (section.type === 'holy-card' && section.image && !section.image.startsWith('file://')) {
      section.image = `${baseUri}/${section.image}`
    }
    if (section.type === 'options') {
      for (const opt of section.options) {
        rewriteImagePaths(opt.sections, baseUri)
      }
    }
  }
}

async function loadChapter(
  bookDirUri: string,
  chapterId: string,
  languages: string[],
  chapters: Record<string, ChapterManifest>,
  chapterFlows: Map<string, FlowDefinition>,
  proseTexts: Map<string, LocalizedContent>,
) {
  const base = `${bookDirUri}chapters/${chapterId}`
  const manifest = await readJson<ChapterManifest>(`${base}/chapter.json`)
  if (!manifest) return
  chapters[chapterId] = manifest

  const content = await readJson<FlowDefinition>(`${base}/content.json`)
  if (!content) return
  rewriteImagePaths(content.sections, base)
  chapterFlows.set(chapterId, content)

  const proseFiles = collectProseFiles(content.sections)
  await Promise.all(
    proseFiles.map(async (file) => {
      const key = `${chapterId}/${file}`
      const text: LocalizedContent = {}
      await Promise.all(
        languages.map(async (lang) => {
          const content = await readTextFile(`${base}/${file}.${lang}.md`)
          if (content) (text as Record<string, string>)[lang] = content
        }),
      )
      if (Object.keys(text).length > 0) proseTexts.set(key, text)
    }),
  )
}

export async function createFileSystemSource(libraryDirUri: string): Promise<ContentSource> {
  const library = await readJson<Library>(`${libraryDirUri}library.json`)
  if (!library) throw new Error(`No library.json found in ${libraryDirUri}`)

  const manifests: Record<string, PracticeManifest> = {}
  const flows = new Map<string, FlowDefinition>()
  const variants = new Map<string, Variant>()
  const dataCache = new Map<string, Record<string, CycleData>>()
  const tracksCache = new Map<string, Record<string, LectioTrackDef>>()

  await Promise.all(
    library.practices.map((pid) =>
      loadPractice(libraryDirUri, pid, manifests, flows, variants, dataCache, tracksCache),
    ),
  )

  const chapters: Record<string, ChapterManifest> = {}
  const chapterFlows = new Map<string, FlowDefinition>()
  const proseTexts = new Map<string, LocalizedContent>()

  if (library.chapters?.length) {
    await Promise.all(
      library.chapters.map((cid) =>
        loadChapter(libraryDirUri, cid, library.languages, chapters, chapterFlows, proseTexts),
      ),
    )
  }

  const prayers: Record<string, PrayerAsset> = {}
  await Promise.all(
    library.prayers.map(async (prayerId) => {
      const prayer = await readJson<PrayerAsset>(`${libraryDirUri}prayers/${prayerId}.json`)
      if (prayer) prayers[prayerId] = prayer
    }),
  )

  const bookEntries: Record<string, BookEntry> = {}
  if (library.books?.length) {
    await Promise.all(
      library.books.map(async (bookId) => {
        const entry = await readJson<BookEntry>(`${libraryDirUri}books/${bookId}/book.json`)
        if (entry) bookEntries[bookId] = entry
      }),
    )
  }
  const allBookEntries = (library.books ?? [])
    .map((id) => bookEntries[id])
    .filter((e): e is BookEntry => e !== undefined)

  const allManifests = library.practices
    .map((id) => manifests[id])
    .filter((m): m is PracticeManifest => m !== undefined)

  const allChapterManifests = (library.chapters ?? [])
    .map((id) => chapters[id])
    .filter((m): m is ChapterManifest => m !== undefined)

  return {
    libraryId: library.id,
    libraryDirUri,
    library,
    getManifest: (id) => manifests[id],
    getAllManifests: () => allManifests,
    loadFlow: (pid, fid) => flows.get(`${pid}/${fid}`),
    loadPerDayFlow: (pid, day) => flows.get(`${pid}/__day/${day}`),
    loadVariant: (pid, vid) => variants.get(`${pid}/${vid}`),
    loadData: (pid) => dataCache.get(pid),
    loadTracks: (pid) => tracksCache.get(pid),
    getPrayer: (ref) => (canticleRefs.has(ref) ? undefined : prayers[ref]),
    getCanticle: (ref) => (canticleRefs.has(ref) ? prayers[ref] : undefined),
    getChapterManifest: (id) => chapters[id],
    getAllChapterManifests: () => allChapterManifests,
    loadChapterContent: (id) => chapterFlows.get(id),
    getProseText: (filePath) => proseTexts.get(filePath),
    getBookEntry: (id) => bookEntries[id],
    getAllBookEntries: () => allBookEntries,
    loadBookChapterText: (bookId, chapterId, lang) =>
      readTextFile(`${libraryDirUri}books/${bookId}/${lang}/${chapterId}.md`),
  }
}
