import { type QueryObserverResult, useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getBookCatalogEntry } from '@/content/books'
import type { BookEntry } from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { useEventStore } from '@/db/events/state'
import { bookIdFromCursorId } from '@/db/repositories/cursors'
import { usePreferencesStore } from '@/stores/preferencesStore'

import {
  bookEditions,
  editionPreferenceKey,
  parseReadingKey,
  resolveEdition,
  versionView,
} from './editions'
import { bookManifestQuery } from './hooks'
import { buildTitleLookup, flattenReadingFlow } from './reader/bookContent'
import { chapterCompleteFraction } from './reader/chapterCompletions'
import { parseReaderPosition } from './reader/useReaderCursor'

// Beyond this, older books aren't worth a manifest load on every Today boot.
const maxBooks = 10

type Started = {
  bookId: string
  /** The version read, if not the main text. */
  version?: string
  chapterId: string
  nearEnd: boolean
  updatedAt: number
}

/**
 * A line per book with a reading position, most recent first. The reader saves
 * its position every second, so this keeps only what the list shows — chapter,
 * whether it's nearly done, and the minute — and the store selector returns a
 * string, re-rendering subscribers when one of those moves rather than on
 * every save (or on bookmark, highlight and timing cursors).
 */
function selectStarted(cursors: Map<string, { position: string }>): string {
  const started: Started[] = []
  for (const [id, cursor] of cursors) {
    const key = bookIdFromCursorId(id)
    const position = key ? parseReaderPosition(cursor.position) : undefined
    if (!key || !position) continue
    started.push({
      ...parseReadingKey(key),
      chapterId: position.chapterId,
      nearEnd: position.fraction >= chapterCompleteFraction,
      updatedAt: Math.floor((position.updatedAt ?? 0) / 60_000) * 60_000,
    })
  }
  started.sort((a, b) => b.updatedAt - a.updatedAt)
  // One line per book: the text read last.
  const seen = new Set<string>()
  return JSON.stringify(started.filter((s) => !seen.has(s.bookId) && seen.add(s.bookId)))
}

const manifestsOf = (results: QueryObserverResult<BookEntry>[]) => results.map((r) => r.data)

/** Books the user is partway through, most recently read first; finished ones drop out. */
export function useBooksInProgress() {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const catalogVersion = useCatalogVersion()
  const signature = useEventStore((s) => selectStarted(s.cursors))

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion is the change signal.
  const started = useMemo(
    () =>
      (JSON.parse(signature) as Started[])
        .flatMap((s) => {
          const entry = getBookCatalogEntry(s.bookId)
          return entry ? [{ ...s, entry }] : []
        })
        .slice(0, maxBooks),
    [signature, catalogVersion],
  )

  const manifests = useQueries({
    queries: started.map((s) => bookManifestQuery(s.bookId, s.entry)),
    combine: manifestsOf,
  })
  // The edition each book is read in, so its chapter titles and last page are that text's.
  const preferences = useEventStore((s) => s.preferences)

  return useMemo(
    () =>
      started.flatMap(({ bookId, version, entry, chapterId, nearEnd, updatedAt }, i) => {
        // Until the manifest lands we can't tell a finished book from one in progress.
        const manifest = manifests[i]
        if (!manifest?.toc) return []
        // Titles and the last page are those of the text read there.
        const book = versionView(manifest, version)
        if (!book.toc) return []
        const editions = bookEditions(manifest).filter((e) => e.version === version)
        const lang =
          resolveEdition(editions, preferences.get(editionPreferenceKey(bookId)), contentLanguage)
            ?.language ?? 'en-US'
        const flow = flattenReadingFlow(book.toc, book, lang)
        if (nearEnd && flow.at(-1)?.id === chapterId) return []
        const chapterTitle = buildTitleLookup(book.toc, lang).get(chapterId)
        return [{ bookId, entry, chapterTitle, updatedAt }]
      }),
    [started, manifests, preferences, contentLanguage],
  )
}
