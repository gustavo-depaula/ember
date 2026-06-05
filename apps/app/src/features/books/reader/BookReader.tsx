import { useNavigation, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack } from 'tamagui'
import { PrayerSpinner, ReaderErrorState, ScreenLayout } from '@/components'
import { useImageViewer } from '@/components/ImageViewerContext'
import { getBookEntry } from '@/content/resolver'
import { ReaderTocSheet } from '@/features/books/ReaderTocSheet'
import { buildTitleLookup, flattenTocLeaves } from '@/features/books/toc'
import { useSaveToggle } from '@/features/library'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { BookReaderChrome, BookReaderFooter } from './BookReaderChrome'
import BookReaderSurface from './BookReaderSurface.dom'
import { resolveLayout } from './layoutMode'
import type { ChapterCrossInfo, GalleryTapInfo, PageInfo, ReaderTheme } from './protocol'
import { ReaderSettingsSheet } from './ReaderSettingsSheet'
import { useReaderBuffer } from './useReaderBuffer'
import { useReaderConfig } from './useReaderConfig'
import { type ReadingPosition, useReaderCursor } from './useReaderCursor'

type Props = { bookId: string; initialChapterParam?: string }

/**
 * Book reader orchestrator. Owns chapter selection, cursor save/restore,
 * and chrome visibility; delegates the page surface to the DOM Component
 * and the chrome to Tamagui components.
 */
export function BookReader({ bookId, initialChapterParam }: Props) {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { openViewer } = useImageViewer()
  const { saved, toggle: toggleSave } = useSaveToggle(`book/${bookId}`, 'book')

  // The DOM surface owns horizontal swipes; the iOS root-stack edge swipe
  // would close the book — disable it only while the reader is mounted so
  // the frontispiece keeps its swipe-back.
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: walk up the navigator tree
    let root: any = navigation
    while (root?.getParent?.()) root = root.getParent()
    root?.setOptions?.({ gestureEnabled: false })
    return () => {
      root?.setOptions?.({ gestureEnabled: true })
    }
  }, [navigation])

  const systemScheme = useColorScheme()
  const themePref = usePreferencesStore((s) => s.theme)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const bookLayoutPref = usePreferencesStore((s) => s.bookLayout)

  const resolvedTheme: ReaderTheme =
    themePref === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePref
  const layout = resolveLayout(bookLayoutPref)
  const config = useReaderConfig()

  const bookEntry = useMemo(() => getBookEntry(bookId), [bookId])

  const lang = useMemo(() => {
    if (!bookEntry) return 'en-US'
    const langs = bookEntry.languages ?? []
    return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
  }, [bookEntry, contentLanguage])

  const leaves = useMemo(
    () => (bookEntry?.toc ? flattenTocLeaves(bookEntry.toc) : []),
    [bookEntry?.toc],
  )
  const titleLookup = useMemo(
    () => (bookEntry?.toc ? buildTitleLookup(bookEntry.toc, lang) : new Map<string, string>()),
    [bookEntry?.toc, lang],
  )

  const cursor = useReaderCursor(bookId)

  // Initial chapter resolution: explicit `chapter` param wins, then cursor,
  // then first leaf.
  const initialChapterId = useMemo(() => {
    if (leaves.length === 0) return undefined
    if (initialChapterParam && leaves.some((l) => l.id === initialChapterParam)) {
      return initialChapterParam
    }
    if (cursor.initial && leaves.some((l) => l.id === cursor.initial?.chapterId)) {
      return cursor.initial.chapterId
    }
    return leaves[0].id
  }, [leaves, initialChapterParam, cursor.initial])

  const [currentChapterId, setCurrentChapterId] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (currentChapterId === undefined && initialChapterId) {
      setCurrentChapterId(initialChapterId)
    }
  }, [currentChapterId, initialChapterId])

  const [pageDisplay, setPageDisplay] = useState({ current: 0, total: 1 })
  const [restoreToPage, setRestoreToPage] = useState<number | undefined>(undefined)
  const restoreHandledRef = useRef(false)

  // Seed restoreToPage from the cursor exactly once after we know what
  // chapter we're starting on.
  useEffect(() => {
    if (
      !restoreHandledRef.current &&
      cursor.initial &&
      currentChapterId === cursor.initial.chapterId &&
      cursor.initial.page > 0
    ) {
      setRestoreToPage(cursor.initial.page)
      restoreHandledRef.current = true
    }
  }, [cursor.initial, currentChapterId])

  const { window: chapterWindow, isLoading } = useReaderBuffer({
    bookId,
    book: bookEntry,
    lang,
    leaves,
    currentChapterId,
    titleLookup,
  })

  // --- callbacks (memoised so the DOM bridge doesn't re-serialise) ---
  const onReady = useCallback(() => {}, [])

  const onPageChange = useCallback(
    (info: PageInfo) => {
      setPageDisplay({ current: info.page, total: info.totalPages })
      if (currentChapterId) {
        cursor.save({ chapterId: currentChapterId, page: info.page })
      }
    },
    [cursor, currentChapterId],
  )

  const onChapterCross = useCallback(
    (info: ChapterCrossInfo) => {
      const idx = leaves.findIndex((l) => l.id === currentChapterId)
      if (idx < 0) return
      const nextIdx = info.direction === 'next' ? idx + 1 : idx - 1
      const target = leaves[nextIdx]
      if (!target) return
      // landingPage = 0 for next-cross; -1 for prev-cross (surface
      // interprets -1 as "last page of new chapter").
      const landed = Math.max(0, info.landingPage)
      setPageDisplay({ current: landed, total: 1 })
      setRestoreToPage(info.landingPage)
      restoreHandledRef.current = false
      setCurrentChapterId(target.id)
      cursor.save({ chapterId: target.id, page: landed })
    },
    [leaves, currentChapterId, cursor],
  )

  const [chromeVisible, setChromeVisible] = useState(true)
  const [tocVisible, setTocVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)

  const onCenterTap = useCallback(() => {
    setChromeVisible((v) => !v)
  }, [])

  const onBackSwipe = useCallback(() => {
    router.back()
  }, [router])

  const onGalleryTap = useCallback(
    (info: GalleryTapInfo) => {
      openViewer(
        info.items.map((item) => ({
          src: item.src,
          caption: item.caption ?? undefined,
          attribution: item.attribution ?? undefined,
        })),
        info.index,
      )
    },
    [openViewer],
  )

  // Manual chapter selection via TOC — start at page 0, clear restore.
  const navigateChapter = useCallback(
    (id: string) => {
      setCurrentChapterId(id)
      setRestoreToPage(undefined)
      restoreHandledRef.current = true
      setPageDisplay({ current: 0, total: 1 })
      cursor.save({ chapterId: id, page: 0 })
    },
    [cursor],
  )

  const goBack = useCallback(() => router.back(), [router])

  // Derived chrome data
  const currentIndex = leaves.findIndex((l) => l.id === currentChapterId)
  const chapterTitle = currentChapterId ? titleLookup.get(currentChapterId) : undefined
  // Paginated mode reports {page, total} per chapter and we use the partial
  // for sub-chapter progress; scroll mode reports nothing useful, so we fall
  // back to chapter-grain progress.
  const progress =
    leaves.length === 0
      ? 0
      : layout === 'paginated'
        ? (currentIndex + pageDisplay.current / Math.max(1, pageDisplay.total)) / leaves.length
        : currentIndex / leaves.length
  const bookTitle = bookEntry ? localizeContent(bookEntry.name) : ''

  if (!bookEntry) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            Book not found.
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  if (isLoading && !chapterWindow) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  if (!chapterWindow) {
    return (
      <ScreenLayout>
        <ReaderErrorState onRetry={() => setCurrentChapterId(initialChapterId)} />
      </ScreenLayout>
    )
  }

  return (
    <YStack
      flex={1}
      backgroundColor={resolvedTheme === 'dark' ? '#0E0D0C' : '#FAF6F0'}
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      <BookReaderChrome
        visible={chromeVisible}
        title={bookTitle}
        progress={progress}
        saved={saved}
        showToc={!!bookEntry.toc?.length}
        onBack={goBack}
        onToggleSave={toggleSave}
        onOpenSettings={() => setSettingsVisible(true)}
        onOpenToc={() => setTocVisible(true)}
      />

      <YStack flex={1}>
        <BookReaderSurface
          // Expo DOM Components wrap our React tree in: outer container View
          // → WebView. BOTH need flex:1 inside a flex parent — the WebView
          // alone with flex:1 collapses to 0 height because its container
          // View has no defined height. (Symptom: chrome visible, body blank.)
          dom={{
            style: { flex: 1, backgroundColor: 'transparent' },
            containerStyle: { flex: 1, backgroundColor: 'transparent' },
          }}
          window={chapterWindow}
          config={config}
          theme={resolvedTheme}
          layout={layout}
          restoreToPage={restoreToPage}
          onReady={onReady}
          onPageChange={onPageChange}
          onChapterCross={onChapterCross}
          onCenterTap={onCenterTap}
          onBackSwipe={onBackSwipe}
          onGalleryTap={onGalleryTap}
        />
        {/* Scroll mode has no swipe handler in the DOM surface; a transparent
            native overlay over the middle of the screen lets the user still
            tap to toggle chrome. Paginated mode handles its own tap zones
            (left/center/right) inside the surface. */}
        {layout === 'scroll' ? (
          <Pressable
            onPress={onCenterTap}
            style={{
              position: 'absolute',
              top: '40%',
              left: '30%',
              right: '30%',
              bottom: '40%',
            }}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.toggleReaderChrome')}
          />
        ) : null}
      </YStack>

      <BookReaderFooter
        visible={chromeVisible}
        chapterTitle={chapterTitle}
        pageDisplay={layout === 'paginated' ? pageDisplay : undefined}
      />

      {tocVisible && currentChapterId && bookEntry.toc ? (
        <ReaderTocSheet
          toc={bookEntry.toc}
          currentChapterId={currentChapterId}
          onSelectChapter={navigateChapter}
          onClose={() => setTocVisible(false)}
        />
      ) : null}

      <ReaderSettingsSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </YStack>
  )
}
