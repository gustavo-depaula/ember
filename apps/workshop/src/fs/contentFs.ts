import type {
  BookManifest,
  ChapterManifest,
  CollectionManifest,
  FlowDefinition,
  PracticeManifest,
  PrayerAsset,
} from '@/types/content'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Practices ──

export function listPractices(): Promise<PracticeManifest[]> {
  return apiFetch('/api/practices')
}

export function getManifest(practiceId: string): Promise<PracticeManifest> {
  return apiFetch(`/api/practices/${practiceId}/manifest`)
}

export function saveManifest(practiceId: string, manifest: PracticeManifest): Promise<void> {
  return apiFetch(`/api/practices/${practiceId}/manifest`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manifest),
  })
}

export function getFlow(practiceId: string): Promise<FlowDefinition> {
  return apiFetch(`/api/practices/${practiceId}/flow`)
}

export function saveFlow(practiceId: string, flow: FlowDefinition): Promise<void> {
  return apiFetch(`/api/practices/${practiceId}/flow`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flow),
  })
}

export function getPracticeData(practiceId: string, dataFile: string): Promise<unknown> {
  return apiFetch(`/api/practices/${practiceId}/data/${dataFile}`)
}

export function getTracks(practiceId: string): Promise<Record<string, unknown>> {
  return apiFetch(`/api/practices/${practiceId}/tracks`)
}

export function saveTracks(practiceId: string, tracks: Record<string, unknown>): Promise<void> {
  return apiFetch(`/api/practices/${practiceId}/tracks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tracks),
  })
}

export function createPractice(
  id: string,
  options?: { fromPractice?: string },
): Promise<{ ok: boolean; id: string }> {
  return apiFetch('/api/practices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...options }),
  })
}

// ── Prayers ──

export function listPrayers(): Promise<PrayerAsset[]> {
  return apiFetch('/api/prayers')
}

export function getPrayer(prayerId: string): Promise<PrayerAsset> {
  return apiFetch(`/api/prayers/${prayerId}`)
}

export function savePrayer(prayerId: string, prayer: PrayerAsset): Promise<void> {
  return apiFetch(`/api/prayers/${prayerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prayer),
  })
}

export function createPrayer(id: string): Promise<{ ok: boolean; id: string }> {
  return apiFetch('/api/prayers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
}

// ── Books ──

export function listBooks(): Promise<BookManifest[]> {
  return apiFetch('/api/books')
}

export function getBook(bookId: string): Promise<BookManifest> {
  return apiFetch(`/api/books/${bookId}`)
}

export function getBookChapter(
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<{ text: string; format: string }> {
  return apiFetch(`/api/books/${bookId}/chapters/${chapterId}/${lang}`)
}

// ── Chapters (standalone) ──

export function listChapters(): Promise<ChapterManifest[]> {
  return apiFetch('/api/chapters')
}

export function getChapter(chapterId: string): Promise<ChapterManifest> {
  return apiFetch(`/api/chapters/${chapterId}`)
}

// ── Collections ──

export function listCollections(): Promise<CollectionManifest[]> {
  return apiFetch('/api/collections')
}

export function getCollection(collectionId: string): Promise<CollectionManifest> {
  return apiFetch(`/api/collections/${collectionId}`)
}

export function saveCollection(collectionId: string, manifest: CollectionManifest): Promise<void> {
  return apiFetch(`/api/collections/${collectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manifest),
  })
}

export function createCollection(id: string): Promise<{ ok: boolean; id: string }> {
  return apiFetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
}
