import { batchedLoad } from '@/lib/async'
import { idbReadText } from '@/lib/idb-fs'
import type { ChapterManifest, PracticeManifest } from '../manifest-types'
import type {
  CycleData,
  FlowDefinition,
  FlowSection,
  LectioTrackDef,
  LocalizedContent,
} from '../types'
import type { BookEntry, ContentSource, Library, PrayerAsset } from './filesystem'

async function readJson<T>(path: string): Promise<T | undefined> {
  const raw = await idbReadText(path)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    console.error(`[idb] failed to parse JSON at ${path}:`, err)
    return undefined
  }
}

async function loadPracticeFlow(
  base: string,
  manifest: PracticeManifest,
): Promise<FlowDefinition | undefined> {
  return readJson<FlowDefinition>(`${base}/${manifest.flow}`)
}

async function loadPractice(
  bookDirPath: string,
  practiceId: string,
  manifests: Record<string, PracticeManifest>,
  flows: Map<string, FlowDefinition>,
  dataCache: Map<string, Record<string, CycleData>>,
  tracksCache: Map<string, Record<string, LectioTrackDef>>,
) {
  const base = `${bookDirPath}practices/${practiceId}`
  const manifest = await readJson<PracticeManifest>(`${base}/manifest.json`)
  if (!manifest) return
  manifests[practiceId] = manifest

  const promises: Promise<void>[] = []

  promises.push(
    (async () => {
      const loadedFlow = await loadPracticeFlow(base, manifest)
      if (!loadedFlow) return
      rewriteImagePaths(loadedFlow.sections, base)
      flows.set(practiceId, loadedFlow)
    })(),
  )

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
    if (section.type === 'prose' && 'file' in section) files.push(section.file)
    if ('sections' in section && Array.isArray(section.sections)) {
      files.push(...collectProseFiles(section.sections as FlowSection[]))
    }
    if (section.type === 'options' && 'options' in section) {
      for (const opt of section.options) {
        files.push(...collectProseFiles(opt.sections))
      }
    }
  }
  return files
}

function rewriteImagePaths(sections: FlowSection[], basePath: string): void {
  for (const section of sections) {
    if (section.type === 'image' && section.src && !section.src.startsWith('data:')) {
      // On web/IDB we'll resolve images at render time via blob URLs
      section.src = `idb://${basePath}/${section.src}`
    }
    if (section.type === 'gallery') {
      for (const item of section.items) {
        if (item.src && !item.src.startsWith('data:')) {
          item.src = `idb://${basePath}/${item.src}`
        }
      }
    }
    if (section.type === 'holy-card' && section.image && !section.image.startsWith('data:')) {
      section.image = `idb://${basePath}/${section.image}`
    }
    if ('sections' in section && Array.isArray(section.sections)) {
      rewriteImagePaths(section.sections as FlowSection[], basePath)
    }
    if ((section.type === 'options' || section.type === 'select') && 'options' in section) {
      for (const opt of section.options) {
        if (Array.isArray(opt.sections)) {
          rewriteImagePaths(opt.sections, basePath)
        }
      }
    }
  }
}

async function loadChapter(
  bookDirPath: string,
  chapterId: string,
  languages: string[],
  chapters: Record<string, ChapterManifest>,
  chapterFlows: Map<string, FlowDefinition>,
  proseTexts: Map<string, LocalizedContent>,
) {
  const base = `${bookDirPath}chapters/${chapterId}`
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
          const content = await idbReadText(`${base}/${file}.${lang}.md`)
          if (content) (text as Record<string, string>)[lang] = content
        }),
      )
      if (Object.keys(text).length > 0) proseTexts.set(key, text)
    }),
  )
}

export async function createIdbSource(libraryId: string): Promise<ContentSource> {
  const bookDirPath = `books/${libraryId}/`
  const library = await readJson<Library>(`${bookDirPath}library.json`)
  if (!library) throw new Error(`No library.json found in IDB for ${libraryId}`)

  const manifests: Record<string, PracticeManifest> = {}
  const flows = new Map<string, FlowDefinition>()
  const dataCache = new Map<string, Record<string, CycleData>>()
  const tracksCache = new Map<string, Record<string, LectioTrackDef>>()

  await batchedLoad(library.practices, (pid) =>
    loadPractice(bookDirPath, pid, manifests, flows, dataCache, tracksCache),
  )

  const chapters: Record<string, ChapterManifest> = {}
  const chapterFlows = new Map<string, FlowDefinition>()
  const proseTexts = new Map<string, LocalizedContent>()

  if (library.chapters?.length) {
    await batchedLoad(library.chapters, (cid) =>
      loadChapter(bookDirPath, cid, library.languages, chapters, chapterFlows, proseTexts),
    )
  }

  const prayers: Record<string, PrayerAsset> = {}
  await batchedLoad(library.prayers, async (prayerId) => {
    const prayer = await readJson<PrayerAsset>(`${bookDirPath}prayers/${prayerId}.json`)
    if (prayer) prayers[prayerId] = prayer
  })

  const bookEntries: Record<string, BookEntry> = {}
  if (library.books?.length) {
    await Promise.all(
      library.books.map(async (bookId) => {
        const entry = await readJson<BookEntry>(`${bookDirPath}books/${bookId}/book.json`)
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

  // Use a placeholder URI — on web content is in IDB not filesystem
  const libraryDirUri = `idb://books/${libraryId}/`

  return {
    libraryId: library.id,
    libraryDirUri,
    library,
    getManifest: (id) => manifests[id],
    getAllManifests: () => allManifests,
    loadFlow: (pid) => flows.get(pid),
    loadPerDayFlow: (pid, day) => flows.get(`${pid}/__day/${day}`),
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
      idbReadText(`${bookDirPath}books/${bookId}/${lang}/${chapterId}.md`),
  }
}

const canticleRefs = new Set(['benedictus', 'magnificat', 'nunc-dimittis'])
