import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, YStack } from 'tamagui'

import { ReaderErrorState } from '@/components/ReaderErrorState'
import { type ReaderPaletteId, resolvePalette } from '@/config/readerPalettes'
import { getBookEntry } from '@/content/resolver'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'
import { stripHtml } from '@/lib/html'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { buildTitleLookup, openBookSession } from './bookContent'
import { addBookmark, type Bookmark, listBookmarks, removeBookmark } from './bookmarks'
import {
  clearBookPaletteOverride,
  getBookPaletteOverride,
  setBookPaletteOverride,
} from './bookPaletteOverride'
import { ChapterCompleteToast } from './ChapterCompleteToast'
import { listCompletedChapters, markChapterCompleted } from './chapterCompletions'
import { type ChapterTiming, estimateChapterTiming, persistChapterTimings } from './chapterTimings'
import { FootnoteSheet } from './FootnoteSheet'
import {
  type BootstrapHighlight,
  type FoliateMessage,
  FoliateReader,
  type FoliateReaderHandle,
} from './foliate/FoliateReader'
import { HIGHLIGHT_COLORS, paintColorFor } from './highlightColors'
import {
  addHighlight as addHighlightToStore,
  type Highlight,
  type HighlightColor,
  listHighlights,
  removeHighlight as removeHighlightFromStore,
  updateHighlight as updateHighlightInStore,
} from './highlights'
import { ReaderBookmarksSheet } from './ReaderBookmarksSheet'
import { ReaderHighlightsSheet } from './ReaderHighlightsSheet'
import { ReaderMenuSheet } from './ReaderMenuSheet'
import { ReaderNoteEditor } from './ReaderNoteEditor'
import { ReaderOverlay } from './ReaderOverlay'
import { ReaderSearchSheet } from './ReaderSearchSheet'
import { ReaderSelectionToolbar } from './ReaderSelectionToolbar'
import { ReaderSettingsSheet } from './ReaderSettingsSheet'
import { ReaderTapHint } from './ReaderTapHint'
import { ReaderTocSheet } from './ReaderTocSheet'
import { appendTurn, estimateMinutesPerPage, type PageTurn } from './readingPace'
import { getReadingStreak, touchReadingStreak } from './readingStreak'
import { getReadingTimeMs, persistReadingTimeMs } from './readingTime'
import { recordReadingSession } from './sessionToast'
import { useReaderConfig } from './useReaderConfig'
import { useReaderCursor } from './useReaderCursor'
import { useReadingFlow } from './useReadingFlow'

type Props = {
  bookId: string
  chapter?: string
}

type SheetKind = 'menu' | 'toc' | 'settings' | 'search' | 'bookmarks' | 'highlights' | null

/**
 * Minimal splash shown while the manifest + initial chapter resolve. Once
 * chapters stream in on demand (and the cache is warm on re-opens), this
 * window is sub-second on any book — no per-chapter progress to surface.
 */
function LoadingPane({
  background,
  color,
  title,
}: {
  background: string
  color: string
  title: string
}) {
  const { t } = useTranslation()
  return (
    <YStack
      flex={1}
      backgroundColor={background}
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="$xl"
      gap="$lg"
    >
      <Text
        fontFamily="$body"
        fontStyle="italic"
        fontSize="$5"
        color={color}
        opacity={0.75}
        textAlign="center"
      >
        {title}
      </Text>
      <Text fontFamily="$body" fontSize="$1" color={color} opacity={0.55}>
        {t('books.opening', { defaultValue: 'Opening…' })}
      </Text>
    </YStack>
  )
}

export function BookReader({ bookId, chapter }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const hintSeen = usePreferencesStore((s) => s.bookReaderHintSeen)
  const setHintSeen = usePreferencesStore((s) => s.setBookReaderHintSeen)
  const [showHint, setShowHint] = useState(!hintSeen)

  const bookEntry = useMemo(() => getBookEntry(bookId), [bookId])

  const lang = useMemo(() => {
    if (!bookEntry) return 'en-US'
    const langs = bookEntry.languages ?? []
    return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
  }, [bookEntry, contentLanguage])

  const { flow: leaves, readableIds } = useReadingFlow(bookEntry, lang)

  const titleLookup = useMemo(
    () => (bookEntry?.toc ? buildTitleLookup(bookEntry.toc, lang) : new Map<string, string>()),
    [bookEntry?.toc, lang],
  )

  const rawConfig = useReaderConfig()
  const cursor = useReaderCursor(bookId)

  // Per-book palette override. Tracked as state so toggling from the settings
  // sheet re-renders without unmounting; null = no override (use global).
  const [paletteOverride, setPaletteOverride] = useState<ReaderPaletteId | undefined>(() =>
    bookId ? getBookPaletteOverride(bookId) : undefined,
  )

  // Floor foliate's margin at the safe-area insets so text never bleeds into
  // the notch or home indicator. +56 bottom also clears the page-indicator
  // text. Override `lang` so WebKit picks the right hyphenation dictionary.
  // Apply the per-book palette override AFTER the global palette so the
  // chosen colors win.
  const config = useMemo(() => {
    const base = {
      ...rawConfig,
      marginPx: Math.max(rawConfig.marginPx, insets.top + 16, insets.bottom + 56),
      lang,
    }
    if (!paletteOverride) return base
    const palette = resolvePalette(paletteOverride, rawConfig.isDark)
    return {
      ...base,
      background: palette.background,
      color: palette.color,
      isDark: palette.isDark,
    }
  }, [rawConfig, insets.top, insets.bottom, lang, paletteOverride])

  const { startIndex, startFraction } = useMemo(() => {
    if (leaves.length === 0) return { startIndex: 0, startFraction: 0 }
    if (chapter) {
      const idx = leaves.findIndex((l) => l.id === chapter)
      if (idx >= 0) return { startIndex: idx, startFraction: 0 }
    }
    const pos = cursor.initial.position
    if (pos) {
      const idx = leaves.findIndex((l) => l.id === pos.chapterId)
      if (idx >= 0) return { startIndex: idx, startFraction: pos.fraction }
    }
    return { startIndex: 0, startFraction: 0 }
  }, [leaves, chapter, cursor.initial])

  // Session = manifest + CSS + a lazy chapter fetcher backed by a 32-entry
  // LRU. Two HTTP round-trips on a cold cache (catalog + manifest) before
  // we can render anything, both of which are also cached forever.
  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
    refetch,
  } = useQuery({
    queryKey: ['book-session', bookId, lang],
    queryFn: () => openBookSession(bookId, lang),
    enabled: !!bookEntry && leaves.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  // The first chapter needs to be in hand BEFORE we paint the WebView host
  // HTML (foliate has to open *something*). Subsequent chapters stream in
  // via the requestChapter bridge. The body already arrives with its title
  // heading promoted by the session — no client-side title wrapping needed.
  const {
    data: initialChapter,
    isLoading: initialChapterLoading,
    isError: initialChapterError,
  } = useQuery({
    queryKey: ['book-chapter', bookId, lang, startIndex],
    queryFn: () => session?.getChapter(startIndex),
    enabled: !!session && cursor.initial.loaded && leaves.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const isLoading = sessionLoading || initialChapterLoading || !cursor.initial.loaded
  const isError = sessionError || initialChapterError

  // Frontispiece reads the persisted map to show remaining-time estimates
  // without re-stripping every chapter. Each new body schedules a debounced
  // flush — quiet sessions write zero times. Final flush on unmount.
  const chapterTimingsRef = useRef<Map<string, ChapterTiming>>(new Map())
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const recordTiming = useCallback(
    (chapterId: string, body: string) => {
      const timings = chapterTimingsRef.current
      if (timings.has(chapterId)) return
      timings.set(chapterId, estimateChapterTiming(body))
      if (persistTimeoutRef.current) return
      persistTimeoutRef.current = setTimeout(() => {
        persistTimeoutRef.current = undefined
        void persistChapterTimings(bookId, new Map(chapterTimingsRef.current))
      }, 5_000)
    },
    [bookId],
  )
  useEffect(
    () => () => {
      if (!persistTimeoutRef.current) return
      clearTimeout(persistTimeoutRef.current)
      void persistChapterTimings(bookId, new Map(chapterTimingsRef.current))
    },
    [bookId],
  )

  const [chapterIndex, setChapterIndex] = useState(0)
  const [fraction, setFraction] = useState(0)
  const [pagesLeft, setPagesLeft] = useState(0)
  const [chapterPages, setChapterPages] = useState(0)
  const [chromeShown, setChromeShown] = useState(false)
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [footnoteHtml, setFootnoteHtml] = useState<string | undefined>(undefined)
  const [navStack, setNavStack] = useState<Array<{ index: number; fraction: number }>>([])
  const [completed, setCompleted] = useState<Set<string>>(() => listCompletedChapters(bookId))
  // Title of the chapter that just hit 0.95; cleared after 2.5s. Drives
  // ChapterCompleteToast.
  const [justCompletedTitle, setJustCompletedTitle] = useState<string | undefined>(undefined)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => listBookmarks(bookId))
  // Pull the current persisted list into local state. Called after every
  // bookmark mutation (add / remove) so the scrubber ticks + sheet stay in
  // sync — see the lifted-state design in `bookmarks` + `highlights` stores.
  const refreshBookmarks = useCallback(() => {
    setBookmarks(listBookmarks(bookId))
  }, [bookId])
  const bookmarkFractions = useMemo(() => {
    const id = leaves[chapterIndex]?.id
    if (!id) return undefined
    return bookmarks.filter((b) => b.chapterId === id).map((b) => b.fraction)
  }, [bookmarks, leaves, chapterIndex])

  const [highlights, setHighlights] = useState<Highlight[]>(() => listHighlights(bookId))
  const refreshHighlights = useCallback(() => {
    setHighlights(listHighlights(bookId))
  }, [bookId])
  // Shared shape-mapper: store-color name (`yellow` / `pink` / …) → bridge
  // BootstrapHighlight (with the resolved CSS color + boolean note marker).
  // Both the optimistic single-paint path and the bulk-replay useEffect map
  // through here so the WebView always sees the same shape.
  const toBootstrapPayload = useCallback(
    (input: {
      id: string
      chapterIndex: number
      anchor: Highlight['anchor']
      color: HighlightColor
      hasNote?: boolean
    }): BootstrapHighlight => ({
      id: input.id,
      chapterIndex: input.chapterIndex,
      anchor: input.anchor,
      color: paintColorFor(input.color, config.isDark),
      hasNote: !!input.hasNote,
    }),
    [config.isDark],
  )
  // Single entry point for painting a highlight in the WebView. The bridge's
  // addHighlight is idempotent (sweeps any existing rects for the same id
  // before drawing).
  const paintHighlight = useCallback(
    (h: {
      id: string
      chapterIndex: number
      anchor: Highlight['anchor']
      color: HighlightColor
      hasNote?: boolean
    }) => {
      foliateRef.current?.addHighlight(toBootstrapPayload(h))
    },
    [toBootstrapPayload],
  )
  const [foliateReady, setFoliateReady] = useState(false)
  // Scrubber dot fractions = anchor.startOffset / chapter plain-text length.
  // Foliate's column-flow doesn't expose offset→page in RN, but the linear
  // approximation is plenty accurate for a 5pt dot on a 200pt scrubber.
  const highlightMarkers = useMemo(() => {
    const id = leaves[chapterIndex]?.id
    if (!id || !session) return undefined
    const body = session.getCachedChapter(chapterIndex)
    if (!body) return undefined
    const total = stripHtml(body).length
    if (total === 0) return undefined
    return highlights
      .filter((h) => h.chapterId === id)
      .map((h) => ({
        id: h.cursorId,
        fraction: Math.max(0, Math.min(1, h.anchor.startOffset / total)),
        color: HIGHLIGHT_COLORS[h.color].swatch,
      }))
  }, [highlights, leaves, chapterIndex, session])
  // Anchored toolbar state. `editingHighlightId` is undefined for a fresh
  // selection (the user just dragged text) and set when the user tapped an
  // existing highlight rectangle — the toolbar shows the trash action in that
  // mode.
  const [selection, setSelection] = useState<
    | {
        chapterIndex: number
        text: string
        anchor: { startOffset: number; endOffset: number }
        rect: { x: number; y: number; width: number; height: number }
      }
    | undefined
  >(undefined)
  const [editingHighlightId, setEditingHighlightIdState] = useState<string | undefined>(undefined)
  // When set, the note editor sheet is open for that highlight id. The
  // highlight is always persisted *before* the editor opens (so the user can
  // edit a note on a freshly-created highlight without coupling to a save).
  const [noteEditorForId, setNoteEditorForId] = useState<string | undefined>(undefined)
  // Stable mirrors read inside the message handler so we don't rebuild it on
  // every highlights / editing change. `highlightsRef` is synced via the
  // useEffect because `setHighlights` is called from multiple async paths;
  // `editingHighlightIdRef` must be set inline at every change to close a
  // race where a centerTap immediately follows a highlightTap and would
  // otherwise see the stale ref.
  const highlightsRef = useRef<Highlight[]>(highlights)
  const editingHighlightIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    highlightsRef.current = highlights
  }, [highlights])
  const setEditingHighlightId = useCallback((id: string | undefined) => {
    editingHighlightIdRef.current = id
    setEditingHighlightIdState(id)
  }, [])

  const foliateRef = useRef<FoliateReaderHandle>(null)
  // Per-mount set of chapters we've already marked completed — prevents the
  // event store from being hammered if the reader pages back and forth across
  // the 0.95 boundary.
  const justMarkedRef = useRef<Set<string>>(new Set())
  const turnsRef = useRef<PageTurn[]>([])
  const [minutesPerPage, setMinutesPerPage] = useState<number | undefined>(undefined)
  // Tracks the last relocate's index+page so we can fire a page-turn haptic
  // only on actual page changes. `at` rate-limits to 250ms so scrubbing
  // doesn't machine-gun the Taptic engine.
  const lastTurnRef = useRef<{ index: number; page: number; at: number } | null>(null)
  // Throttles scrubber drags to ~15 Hz so we don't flood the WebView with
  // injectJavaScript goTo calls during a 60 fps gesture.
  const lastScrubAtRef = useRef(0)

  // Touch the per-book streak once per mount — same-day touches are no-ops
  // inside touchReadingStreak so re-mounting today doesn't double-count.
  useEffect(() => {
    void touchReadingStreak(bookId)
  }, [bookId])

  useEffect(() => {
    if (!justCompletedTitle) return
    const tid = setTimeout(() => setJustCompletedTitle(undefined), 2500)
    return () => clearTimeout(tid)
  }, [justCompletedTitle])

  // Per-session reading time accrual. The local accumulator owns the running
  // total so concurrent AppState flushes (iOS fires `inactive` then
  // `background` back-to-back) don't race a read-then-write against the
  // cursor store. Only `background` triggers a flush; `inactive` resets the
  // session start. Initial total seeded from the persisted value on mount.
  const sessionStartRef = useRef(Date.now())
  const totalMsRef = useRef(getReadingTimeMs(bookId))
  // Counters scoped to this mount, surfaced via `recordReadingSession` on
  // unmount so the frontispiece can show a celebratory toast.
  const sessionMsRef = useRef(0)
  const sessionPagesRef = useRef(0)
  const sessionChaptersDoneRef = useRef(0)
  useEffect(() => {
    const flush = () => {
      const elapsed = Date.now() - sessionStartRef.current
      sessionStartRef.current = Date.now()
      if (elapsed < 1000) return
      totalMsRef.current += elapsed
      sessionMsRef.current += elapsed
      void persistReadingTimeMs(bookId, totalMsRef.current)
    }
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') flush()
      else if (s === 'active') sessionStartRef.current = Date.now()
    })
    return () => {
      sub.remove()
      flush()
      // Only worth a toast for sessions where the user actually read something.
      if (sessionMsRef.current > 30_000 || sessionPagesRef.current > 3) {
        recordReadingSession({
          bookId,
          minutes: Math.max(1, Math.round(sessionMsRef.current / 60_000)),
          pages: sessionPagesRef.current,
          chaptersFinished: sessionChaptersDoneRef.current,
        })
      }
    }
  }, [bookId])

  const onMessage = useCallback(
    (msg: FoliateMessage) => {
      switch (msg.type) {
        case 'centerTap':
          void lightTap()
          // If the selection toolbar is up, dismiss it instead of toggling
          // chrome — matches the Apple Books / iOS Quick Look pattern.
          if (editingHighlightIdRef.current) {
            setEditingHighlightId(undefined)
            setSelection(undefined)
            return
          }
          setChromeShown((s) => !s)
          return
        case 'requestChapter': {
          if (!session) return
          const id = leaves[msg.index]?.id
          void session
            .getChapter(msg.index)
            .then((body) => {
              if (id) recordTiming(id, body)
              foliateRef.current?.provideChapter(msg.index, body)
            })
            .catch((err) => {
              console.warn(`[BookReader] requestChapter ${msg.index} failed:`, err)
            })
          return
        }
        case 'relocate': {
          setChapterIndex(msg.index)
          setFraction(msg.fraction)
          setPagesLeft(Math.max(0, msg.pages - msg.page))
          setChapterPages(msg.pages)
          // ±2 lookahead keeps page-flips through a section boundary instant.
          if (session) {
            for (const off of [-2, -1, 1, 2]) {
              const i = msg.index + off
              if (i < 0 || i >= leaves.length) continue
              session.preloadChapter(i)
            }
          }
          // Page-turn haptic + session page counter. Skip the first relocate
          // (initial load) and any relocate that fires within 250ms of the
          // previous one (scrubbing).
          const now = Date.now()
          const prev = lastTurnRef.current
          if (prev && (prev.index !== msg.index || prev.page !== msg.page)) {
            sessionPagesRef.current += 1
            if (now - prev.at > 250) void selectionTick()
          }
          lastTurnRef.current = { index: msg.index, page: msg.page, at: now }
          turnsRef.current = appendTurn(turnsRef.current, now)
          const mpp = estimateMinutesPerPage(turnsRef.current)
          if (mpp !== undefined) setMinutesPerPage(mpp)
          const chapterId = leaves[msg.index]?.id
          if (chapterId) {
            cursor.save({ chapterId, fraction: msg.fraction })
            const cached = session?.getCachedChapter(msg.index)
            if (cached) recordTiming(chapterId, cached)
            if (msg.fraction >= 0.95 && !justMarkedRef.current.has(chapterId)) {
              justMarkedRef.current.add(chapterId)
              sessionChaptersDoneRef.current += 1
              const completedTitle = titleLookup.get(chapterId)
              void markChapterCompleted(bookId, chapterId).then(() => {
                void successBuzz()
                setCompleted((s) => (s.has(chapterId) ? s : new Set(s).add(chapterId)))
                if (completedTitle) setJustCompletedTitle(completedTitle)
              })
            }
          }
          return
        }
        case 'footnoteTap':
          setFootnoteHtml(msg.html)
          return
        case 'selectionChange':
          setSelection({
            chapterIndex: msg.chapterIndex,
            text: msg.text,
            anchor: msg.anchor,
            rect: msg.rect,
          })
          setEditingHighlightId(undefined)
          return
        case 'selectionCleared':
          // Only clear when not in edit mode — tapping inside the WebView while
          // the edit toolbar is up shouldn't dismiss without a fresh selection.
          setSelection((s) => (editingHighlightIdRef.current ? s : undefined))
          return
        case 'highlightTap': {
          const hl = highlightsRef.current.find((h) => h.cursorId === msg.id)
          if (!hl) return
          setSelection({
            chapterIndex: msg.chapterIndex,
            text: hl.text,
            anchor: hl.anchor,
            rect: msg.rect,
          })
          setEditingHighlightId(msg.id)
          return
        }
        case 'ready':
          setFoliateReady(true)
          return
        case 'crossRefTap': {
          // Accept exact, suffix, and stripped-extension matches so the same
          // handler works whether authors write "summa-st-1-q1-a1" or
          // "ST.Iaq1a1.html" or "../ST.Iaq1a1".
          const href = msg.href
          const candidates = [
            href,
            href.replace(/\.x?html?$/, ''),
            href.replace(/^.*\//, ''),
            href.replace(/^.*\//, '').replace(/\.x?html?$/, ''),
          ]
          const idx = leaves.findIndex((l) => candidates.includes(l.id))
          if (idx < 0) {
            console.warn(`[BookReader] cross-ref href did not match any leaf: ${href}`)
            return
          }
          setNavStack((s) => [...s, { index: chapterIndex, fraction }])
          foliateRef.current?.goTo(idx, 0)
          return
        }
      }
    },
    [
      leaves,
      cursor.save,
      chapterIndex,
      fraction,
      bookId,
      titleLookup,
      setEditingHighlightId,
      session,
      recordTiming,
    ],
  )

  // Replay the persisted highlight set into the WebView whenever the engine
  // signals ready OR the local highlight state changes. Filter out anchors
  // whose chapter no longer exists in the TOC (corpus update renamed/removed
  // a leaf) — those would otherwise paint nothing and leak into the WebView's
  // per-chapter map.
  useEffect(() => {
    if (!foliateReady) return
    const payload = highlights
      .map((h) => {
        const idx = leaves.findIndex((l) => l.id === h.chapterId)
        if (idx < 0) return undefined
        return toBootstrapPayload({
          id: h.cursorId,
          chapterIndex: idx,
          anchor: h.anchor,
          color: h.color,
          hasNote: !!h.note,
        })
      })
      .filter((x): x is NonNullable<typeof x> => x !== undefined)
    foliateRef.current?.setHighlights(payload)
  }, [foliateReady, highlights, leaves, toBootstrapPayload])

  const handleBackNav = useCallback(() => {
    setNavStack((s) => {
      const prev = s[s.length - 1]
      if (!prev) return s
      foliateRef.current?.goTo(prev.index, prev.fraction)
      return s.slice(0, -1)
    })
  }, [])

  const handleSelectChapter = useCallback(
    (id: string) => {
      const idx = leaves.findIndex((l) => l.id === id)
      if (idx >= 0) foliateRef.current?.goTo(idx, 0)
      setSheet(null)
    },
    [leaves],
  )

  const currentChapterId = leaves[chapterIndex]?.id
  const currentChapterTitle = currentChapterId ? titleLookup.get(currentChapterId) : undefined
  const handleAddBookmark = useCallback(async () => {
    if (!currentChapterId) return
    await addBookmark(bookId, { chapterId: currentChapterId, fraction }, currentChapterTitle)
    refreshBookmarks()
    void successBuzz()
  }, [bookId, currentChapterId, currentChapterTitle, fraction, refreshBookmarks])
  const handleRemoveBookmark = useCallback(
    async (cursorId: string) => {
      await removeBookmark(cursorId)
      refreshBookmarks()
      void lightTap()
    },
    [refreshBookmarks],
  )

  // Create-from-selection flow shared by handlePickColor + handleOpenNote.
  // Returns the saved highlight (with cursorId) so callers can chain a
  // post-save action (close the toolbar, open the note editor, etc.).
  const persistNewHighlight = useCallback(
    async (color: HighlightColor): Promise<Highlight | undefined> => {
      if (!selection || !currentChapterId) return undefined
      const saved = await addHighlightToStore(bookId, {
        chapterId: currentChapterId,
        anchor: selection.anchor,
        text: selection.text,
        color,
      })
      refreshHighlights()
      paintHighlight({
        id: saved.cursorId,
        chapterIndex: selection.chapterIndex,
        anchor: saved.anchor,
        color: saved.color,
      })
      foliateRef.current?.clearSelection()
      return saved
    },
    [bookId, currentChapterId, selection, refreshHighlights, paintHighlight],
  )

  const handlePickColor = useCallback(
    async (color: HighlightColor) => {
      if (!selection || !currentChapterId) return
      void lightTap()
      if (editingHighlightId) {
        await updateHighlightInStore(editingHighlightId, { color })
        paintHighlight({
          id: editingHighlightId,
          chapterIndex: selection.chapterIndex,
          anchor: selection.anchor,
          color,
          hasNote: !!highlightsRef.current.find((h) => h.cursorId === editingHighlightId)?.note,
        })
        refreshHighlights()
        setSelection(undefined)
        setEditingHighlightId(undefined)
        return
      }
      await persistNewHighlight(color)
      setSelection(undefined)
      void successBuzz()
    },
    [
      selection,
      currentChapterId,
      editingHighlightId,
      setEditingHighlightId,
      paintHighlight,
      persistNewHighlight,
      refreshHighlights,
    ],
  )

  const handleCopySelection = useCallback(() => {
    if (!selection) return
    void lightTap()
    foliateRef.current?.copyText(selection.text)
    foliateRef.current?.clearSelection()
    setSelection(undefined)
    setEditingHighlightId(undefined)
  }, [selection, setEditingHighlightId])

  // Bridge + store + local-state delete — used by the in-line toolbar and the
  // highlights sheet. Callers handle their own surrounding UI state (clearing
  // selection in the toolbar case, closing the sheet row, etc.).
  const removeHighlightById = useCallback(
    async (cursorId: string) => {
      foliateRef.current?.removeHighlight(cursorId)
      await removeHighlightFromStore(cursorId)
      refreshHighlights()
    },
    [refreshHighlights],
  )

  const handleRemoveHighlight = useCallback(async () => {
    if (!editingHighlightId) return
    void lightTap()
    await removeHighlightById(editingHighlightId)
    setSelection(undefined)
    setEditingHighlightId(undefined)
  }, [editingHighlightId, setEditingHighlightId, removeHighlightById])

  const handleOpenNote = useCallback(async () => {
    if (!selection || !currentChapterId) return
    void lightTap()
    if (editingHighlightId) {
      setNoteEditorForId(editingHighlightId)
      return
    }
    // Persist a default-yellow highlight first so the note has something to
    // attach to (notes are highlights with a `note` field).
    const saved = await persistNewHighlight('yellow')
    if (saved) setNoteEditorForId(saved.cursorId)
  }, [selection, currentChapterId, editingHighlightId, persistNewHighlight])

  const noteEditorTarget = noteEditorForId
    ? highlights.find((h) => h.cursorId === noteEditorForId)
    : undefined

  const handleSaveNote = useCallback(
    async (note: string, color: HighlightColor) => {
      if (!noteEditorForId || !noteEditorTarget) return
      const trimmed = note.trim()
      await updateHighlightInStore(noteEditorForId, {
        note: trimmed.length > 0 ? trimmed : undefined,
        color,
      })
      const idx = leaves.findIndex((l) => l.id === noteEditorTarget.chapterId)
      if (idx >= 0) {
        paintHighlight({
          id: noteEditorForId,
          chapterIndex: idx,
          anchor: noteEditorTarget.anchor,
          color,
          hasNote: trimmed.length > 0,
        })
      }
      refreshHighlights()
      setNoteEditorForId(undefined)
      setSelection(undefined)
      setEditingHighlightId(undefined)
      void successBuzz()
    },
    [
      noteEditorForId,
      noteEditorTarget,
      leaves,
      paintHighlight,
      setEditingHighlightId,
      refreshHighlights,
    ],
  )

  const handleDeleteNote = useCallback(async () => {
    if (!noteEditorForId || !noteEditorTarget) return
    void lightTap()
    await updateHighlightInStore(noteEditorForId, { note: undefined })
    const idx = leaves.findIndex((l) => l.id === noteEditorTarget.chapterId)
    if (idx >= 0) {
      paintHighlight({
        id: noteEditorForId,
        chapterIndex: idx,
        anchor: noteEditorTarget.anchor,
        color: noteEditorTarget.color,
      })
    }
    refreshHighlights()
    setNoteEditorForId(undefined)
  }, [noteEditorForId, noteEditorTarget, leaves, refreshHighlights, paintHighlight])

  if (!bookEntry) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$lg" paddingTop={insets.top + 24}>
        <Text fontFamily="$body" color="$colorSecondary">
          {t('browse.bookNotFound', { defaultValue: 'Book not found.' })}
        </Text>
      </YStack>
    )
  }

  const bookTitle = localizeContent(bookEntry.name)

  if (isError) {
    return (
      <YStack flex={1} backgroundColor={config.background} justifyContent="center">
        <ReaderErrorState onRetry={() => refetch()} />
      </YStack>
    )
  }

  if (isLoading || !session || initialChapter === undefined) {
    return <LoadingPane background={config.background} color={config.color} title={bookTitle} />
  }

  const currentPosition = currentChapterId ? { chapterId: currentChapterId, fraction } : undefined

  return (
    <View flex={1} backgroundColor={config.background}>
      <FoliateReader
        ref={foliateRef}
        chapterCount={leaves.length}
        initialChapter={initialChapter}
        initialIndex={startIndex}
        initialFraction={startFraction}
        config={config}
        onMessage={onMessage}
      />

      <ReaderOverlay
        title={bookTitle}
        chapter={chapterIndex + 1}
        chapters={leaves.length}
        pagesLeft={pagesLeft}
        minutesLeft={
          minutesPerPage !== undefined && pagesLeft > 0
            ? Math.max(1, Math.round(pagesLeft * minutesPerPage))
            : undefined
        }
        fraction={fraction}
        pages={chapterPages}
        page={Math.max(1, chapterPages - pagesLeft)}
        bookmarkFractions={bookmarkFractions}
        highlightMarkers={highlightMarkers}
        chromeShown={chromeShown}
        canGoBack={navStack.length > 0}
        isDark={config.isDark}
        color={config.color}
        onClose={() => router.back()}
        onMenu={() => setSheet('menu')}
        onBack={handleBackNav}
        onScrub={(f) => {
          const now = Date.now()
          if (now - lastScrubAtRef.current < 66) return
          lastScrubAtRef.current = now
          foliateRef.current?.goTo(chapterIndex, f)
        }}
        onScrubEnd={(f) => {
          lastScrubAtRef.current = Date.now()
          foliateRef.current?.goTo(chapterIndex, f)
        }}
      />

      <ReaderMenuSheet
        open={sheet === 'menu'}
        onClose={() => setSheet(null)}
        onContents={bookEntry.toc && bookEntry.toc.length > 0 ? () => setSheet('toc') : undefined}
        onSearch={() => setSheet('search')}
        onBookmarks={() => setSheet('bookmarks')}
        onHighlights={() => setSheet('highlights')}
        onSettings={() => setSheet('settings')}
      />

      <ReaderHighlightsSheet
        open={sheet === 'highlights'}
        onClose={() => setSheet(null)}
        highlights={highlights}
        leaves={leaves}
        titleLookup={titleLookup}
        onSelect={(highlight, idx) => foliateRef.current?.goToAnchor(idx, highlight.anchor)}
        onRemove={removeHighlightById}
      />

      {bookEntry.toc && (
        <ReaderTocSheet
          open={sheet === 'toc'}
          onClose={() => setSheet(null)}
          toc={bookEntry.toc}
          readableIds={readableIds}
          currentChapterId={currentChapterId}
          completedChapterIds={completed}
          chapterTimings={chapterTimingsRef.current}
          onSelect={handleSelectChapter}
        />
      )}

      <ReaderSettingsSheet
        open={sheet === 'settings'}
        onClose={() => setSheet(null)}
        bookOverride={paletteOverride}
        onSetBookOverride={(id) => {
          setPaletteOverride(id)
          if (id) void setBookPaletteOverride(bookId, id)
          else void clearBookPaletteOverride(bookId)
        }}
        stats={{
          minutesRead:
            totalMsRef.current > 60_000 ? Math.round(totalMsRef.current / 60_000) : undefined,
          streakDays: getReadingStreak(bookId) || undefined,
          completedChapters: completed.size,
          totalChapters: leaves.length,
        }}
      />

      <ReaderSearchSheet
        open={sheet === 'search'}
        onClose={() => setSheet(null)}
        bookId={bookId}
        lang={lang}
        manifest={bookEntry}
        session={session}
        leaves={leaves}
        titleLookup={titleLookup}
        onSelect={(idx, query) => foliateRef.current?.goToWithFind(idx, query)}
      />

      <ReaderBookmarksSheet
        open={sheet === 'bookmarks'}
        onClose={() => setSheet(null)}
        bookmarks={bookmarks}
        canAdd={!!currentPosition}
        onAdd={handleAddBookmark}
        onRemove={handleRemoveBookmark}
        leaves={leaves}
        titleLookup={titleLookup}
        onSelect={(idx, frac) => foliateRef.current?.goTo(idx, frac)}
      />

      <FootnoteSheet content={footnoteHtml} onClose={() => setFootnoteHtml(undefined)} />

      <ReaderSelectionToolbar
        rect={selection?.rect}
        mode={editingHighlightId ? 'edit' : 'create'}
        hasNote={
          editingHighlightId
            ? !!highlights.find((h) => h.cursorId === editingHighlightId)?.note
            : false
        }
        isDark={config.isDark}
        onPickColor={handlePickColor}
        onNote={handleOpenNote}
        onCopy={handleCopySelection}
        onRemove={handleRemoveHighlight}
      />

      <ReaderNoteEditor
        open={!!noteEditorTarget}
        onClose={() => setNoteEditorForId(undefined)}
        highlightId={noteEditorForId}
        excerpt={noteEditorTarget?.text}
        chapterTitle={noteEditorTarget ? titleLookup.get(noteEditorTarget.chapterId) : undefined}
        initialNote={noteEditorTarget?.note ?? ''}
        initialColor={noteEditorTarget?.color ?? 'yellow'}
        onSave={handleSaveNote}
        onDeleteNote={noteEditorTarget?.note ? handleDeleteNote : undefined}
      />

      <ChapterCompleteToast
        title={justCompletedTitle}
        isDark={config.isDark}
        color={config.color}
      />

      {showHint ? (
        <ReaderTapHint
          color={config.color}
          background={config.background}
          onDismiss={() => {
            setShowHint(false)
            setHintSeen(true)
          }}
        />
      ) : null}
    </View>
  )
}
