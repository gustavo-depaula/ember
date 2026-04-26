import { localizeContent } from '@/lib/i18n'
import type { ChapterManifest, PracticeManifest } from './manifest-types'
import type { BookEntry, ContentSource, PrayerAsset } from './sources/filesystem'
import type { CycleData, FlowDefinition, LectioTrackDef, LocalizedContent } from './types'

// --- Qualified ID helpers ---

export function qualifyId(libraryId: string, practiceId: string): string {
  return `${libraryId}:${practiceId}`
}

export function parseQualifiedId(qualifiedId: string): { libraryId: string; practiceId: string } {
  const idx = qualifiedId.indexOf(':')
  if (idx === -1) return { libraryId: '', practiceId: qualifiedId }
  return { libraryId: qualifiedId.slice(0, idx), practiceId: qualifiedId.slice(idx + 1) }
}

// --- Internal state ---

type QualifiedEntry = { manifest: PracticeManifest; libraryId: string; practiceId: string }

const sources: ContentSource[] = []
const libraryIdToSource = new Map<string, ContentSource>()
const qualifiedEntries = new Map<string, QualifiedEntry>()
// unqualified practiceId → qualified ID (fallback for legacy data)
const unqualifiedIndex = new Map<string, string>()
// groupId → qualified IDs of members (built at registration time)
const groupIndex = new Map<string, string[]>()

// --- Registration ---

export function registerSource(source: ContentSource) {
  if (libraryIdToSource.has(source.libraryId)) {
    unregisterSource(source.libraryId)
  }
  sources.push(source)
  libraryIdToSource.set(source.libraryId, source)

  for (const m of source.getAllManifests()) {
    const qid = qualifyId(source.libraryId, m.id)
    qualifiedEntries.set(qid, {
      manifest: { ...m, id: qid },
      libraryId: source.libraryId,
      practiceId: m.id,
    })
    unqualifiedIndex.set(m.id, qid)
    if (m.alternativeTo) {
      const groupId = m.alternativeTo.id
      const list = groupIndex.get(groupId)
      if (list) list.push(qid)
      else groupIndex.set(groupId, [qid])
    }
  }
}

export function unregisterSource(libraryId: string) {
  const idx = sources.findIndex((s) => s.libraryId === libraryId)
  if (idx === -1) return
  for (const [qid, entry] of qualifiedEntries) {
    if (entry.libraryId === libraryId) {
      qualifiedEntries.delete(qid)
      unqualifiedIndex.delete(entry.practiceId)
      removeFromGroupIndex(entry.manifest.alternativeTo?.id, qid)
    }
  }
  sources.splice(idx, 1)
  libraryIdToSource.delete(libraryId)
}

function removeFromGroupIndex(groupId: string | undefined, qid: string) {
  if (!groupId) return
  const list = groupIndex.get(groupId)
  if (!list) return
  const i = list.indexOf(qid)
  if (i !== -1) list.splice(i, 1)
  if (list.length === 0) groupIndex.delete(groupId)
}

export function clearSources() {
  sources.length = 0
  libraryIdToSource.clear()
  qualifiedEntries.clear()
  unqualifiedIndex.clear()
  groupIndex.clear()
}

// --- Lookups (accept qualified or unqualified IDs) ---

/** Resolve an ID that may be qualified or unqualified to the canonical qualified ID */
function resolveQualifiedId(id: string): string {
  if (qualifiedEntries.has(id)) return id
  return unqualifiedIndex.get(id) ?? id
}

function findSourceForQualified(id: string):
  | {
      source: ContentSource
      practiceId: string
    }
  | undefined {
  const entry = qualifiedEntries.get(resolveQualifiedId(id))
  if (!entry) return undefined
  const source = libraryIdToSource.get(entry.libraryId)
  if (!source) return undefined
  return { source, practiceId: entry.practiceId }
}

export function getLibraryIdForPractice(id: string): string | undefined {
  return qualifiedEntries.get(resolveQualifiedId(id))?.libraryId
}

export function getManifest(id: string): PracticeManifest | undefined {
  return qualifiedEntries.get(resolveQualifiedId(id))?.manifest
}

export function getAllManifests(): PracticeManifest[] {
  return [...qualifiedEntries.values()].map((e) => e.manifest)
}

export function loadFlow(qualifiedId: string): FlowDefinition | undefined {
  const found = findSourceForQualified(qualifiedId)
  if (!found) return undefined
  return found.source.loadFlow(found.practiceId)
}

export function loadPerDayFlow(qualifiedId: string, day: number): FlowDefinition | undefined {
  const found = findSourceForQualified(qualifiedId)
  if (!found) return undefined
  return found.source.loadPerDayFlow(found.practiceId, day)
}

export function loadPracticeData(qualifiedId: string): Record<string, CycleData> | undefined {
  const found = findSourceForQualified(qualifiedId)
  if (!found) return undefined
  return found.source.loadData(found.practiceId)
}

export function loadPracticeTracks(
  qualifiedId: string,
): Record<string, LectioTrackDef> | undefined {
  const found = findSourceForQualified(qualifiedId)
  if (!found) return undefined
  return found.source.loadTracks(found.practiceId)
}

export function getManifestIconKey(qualifiedId: string): string {
  return getManifest(qualifiedId)?.icon ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const { manifest: m } of qualifiedEntries.values()) {
    for (const c of m.categories) cats.add(c)
  }
  return Array.from(cats).sort()
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return getAllManifests().filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}

// --- Alternative groups ---

export type AlternativeGroup = {
  groupId: string // unqualified, from alternativeTo.id
  members: Array<{
    manifest: PracticeManifest // with qualified id
    label: string // localized alternativeTo.label
    description: string // localized alternativeTo.description
  }>
}

export function getAlternativeGroup(id: string): AlternativeGroup | undefined {
  const entry = qualifiedEntries.get(resolveQualifiedId(id))
  if (!entry?.manifest.alternativeTo) return undefined

  const groupId = entry.manifest.alternativeTo.id
  const qids = groupIndex.get(groupId)
  if (!qids || qids.length < 2) return undefined

  const members: AlternativeGroup['members'] = []
  for (const qid of qids) {
    const e = qualifiedEntries.get(qid)
    if (!e?.manifest.alternativeTo) continue
    members.push({
      manifest: e.manifest,
      label: localizeContent(e.manifest.alternativeTo.label),
      description: localizeContent(e.manifest.alternativeTo.description),
    })
  }

  members.sort((a, b) => a.label.localeCompare(b.label))
  return { groupId, members }
}

/** Check if any member of a practice's alternative group is already in a collection of practice IDs */
export function findGroupMemberInSet(
  qualifiedId: string,
  practiceIds: { has(key: string): boolean },
): string | undefined {
  const group = getAlternativeGroup(qualifiedId)
  if (!group) return undefined
  for (const member of group.members) {
    if (practiceIds.has(member.manifest.id)) return member.manifest.id
  }
  return undefined
}

// --- Prayer / canticle resolution ---

export function resolvePrayer(ref: string, libraryId?: string): PrayerAsset | undefined {
  if (libraryId) {
    const source = libraryIdToSource.get(libraryId)
    if (source) {
      const prayer = source.getPrayer(ref)
      if (prayer) return prayer
    }
  }
  for (const s of sources) {
    const prayer = s.getPrayer(ref)
    if (prayer) return prayer
  }
  return undefined
}

export function resolveCanticle(ref: string): PrayerAsset | undefined {
  for (const s of sources) {
    const canticle = s.getCanticle(ref)
    if (canticle) return canticle
  }
  return undefined
}

// --- Library-scoped lookups ---

export function getPracticeIdsForLibrary(libraryId: string): string[] {
  const result: string[] = []
  for (const [qid, entry] of qualifiedEntries) {
    if (entry.libraryId === libraryId) result.push(qid)
  }
  return result
}

export function getInstalledLibraryIds(): string[] {
  return sources.map((s) => s.libraryId)
}

export function getChapterManifest(
  chapterId: string,
  libraryId: string,
): ChapterManifest | undefined {
  return libraryIdToSource.get(libraryId)?.getChapterManifest(chapterId)
}

export function getAllChapterManifestsForLibrary(libraryId: string): ChapterManifest[] {
  return libraryIdToSource.get(libraryId)?.getAllChapterManifests() ?? []
}

export function loadChapterContent(
  chapterId: string,
  libraryId: string,
): FlowDefinition | undefined {
  return libraryIdToSource.get(libraryId)?.loadChapterContent(chapterId)
}

export function getProseText(filePath: string, libraryId: string): LocalizedContent | undefined {
  return libraryIdToSource.get(libraryId)?.getProseText(filePath)
}

export function getBookEntry(bookId: string, libraryId: string): BookEntry | undefined {
  return libraryIdToSource.get(libraryId)?.getBookEntry(bookId)
}

export function getAllBookEntries(libraryId: string): BookEntry[] {
  return libraryIdToSource.get(libraryId)?.getAllBookEntries() ?? []
}

export function getBookDirUri(bookId: string, libraryId: string): string | undefined {
  const source = libraryIdToSource.get(libraryId)
  if (!source) return undefined
  const entry = source.getBookEntry(bookId)
  if (!entry) return undefined
  return `${source.libraryDirUri}books/${bookId}/`
}

export function loadBookChapterText(
  libraryId: string,
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<string | undefined> {
  const source = libraryIdToSource.get(libraryId)
  if (!source) return Promise.resolve(undefined)
  return source.loadBookChapterText(bookId, chapterId, lang)
}
