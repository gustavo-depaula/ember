import type {
  BookManifest,
  FlowDefinition,
  LibraryDetail,
  LibraryManifest,
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

// --- Read operations ---

export function listLibraries(): Promise<LibraryManifest[]> {
  return apiFetch('/api/libraries')
}

export function getLibrary(id: string): Promise<LibraryDetail> {
  return apiFetch(`/api/libraries/${id}`)
}

export function getManifest(libraryId: string, practiceId: string): Promise<PracticeManifest> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/manifest`)
}

export function getFlow(libraryId: string, practiceId: string): Promise<FlowDefinition> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/flow`)
}

export function getPrayer(libraryId: string, prayerId: string): Promise<PrayerAsset> {
  return apiFetch(`/api/libraries/${libraryId}/prayers/${prayerId}`)
}

export function getBook(libraryId: string, bookId: string): Promise<BookManifest> {
  return apiFetch(`/api/libraries/${libraryId}/books/${bookId}`)
}

export function getBookChapter(
  libraryId: string,
  bookId: string,
  chapterId: string,
  lang: string,
): Promise<{ text: string; format: string }> {
  return apiFetch(`/api/libraries/${libraryId}/books/${bookId}/chapters/${chapterId}/${lang}`)
}

export function getPracticeData(
  libraryId: string,
  practiceId: string,
  dataFile: string,
): Promise<unknown> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/data/${dataFile}`)
}

export function getTracks(libraryId: string, practiceId: string): Promise<Record<string, unknown>> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/tracks`)
}

// --- Write operations ---

export function saveManifest(
  libraryId: string,
  practiceId: string,
  manifest: PracticeManifest,
): Promise<void> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/manifest`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manifest),
  })
}

export function saveFlow(
  libraryId: string,
  practiceId: string,
  flow: FlowDefinition,
): Promise<void> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/flow`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flow),
  })
}

export function savePrayer(
  libraryId: string,
  prayerId: string,
  prayer: PrayerAsset,
): Promise<void> {
  return apiFetch(`/api/libraries/${libraryId}/prayers/${prayerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prayer),
  })
}

export function saveLibrary(libraryId: string, manifest: LibraryManifest): Promise<void> {
  return apiFetch(`/api/libraries/${libraryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manifest),
  })
}

export function saveTracks(
  libraryId: string,
  practiceId: string,
  tracks: Record<string, unknown>,
): Promise<void> {
  return apiFetch(`/api/libraries/${libraryId}/practices/${practiceId}/tracks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tracks),
  })
}

// --- Create operations ---

export function createPractice(
  libraryId: string,
  id: string,
  options?: { fromLibrary?: string; fromPractice?: string },
): Promise<{ ok: boolean; id: string }> {
  return apiFetch(`/api/libraries/${libraryId}/practices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...options }),
  })
}

export function createPrayer(libraryId: string, id: string): Promise<{ ok: boolean; id: string }> {
  return apiFetch(`/api/libraries/${libraryId}/prayers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
}
