import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, YStack } from 'tamagui'

import { ReaderErrorState } from '@/components/ReaderErrorState'
import { getBookEntry } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

import {
  buildTitleLookup,
  flattenTocLeaves,
  getChapterBody,
  type LoadProgress,
  loadBookContent,
} from './bookContent'
import { FoliateReader, type FoliateReaderHandle } from './foliate/FoliateReader'
import { ReaderMenuSheet } from './ReaderMenuSheet'
import { ReaderOverlay } from './ReaderOverlay'
import { ReaderSettingsSheet } from './ReaderSettingsSheet'
import { ReaderTocSheet } from './ReaderTocSheet'
import { useReaderConfig } from './useReaderConfig'
import { useReaderCursor } from './useReaderCursor'

type Props = {
  bookId: string
  chapter?: string
}

// Map the three load phases to a smooth 0..1 fill so the bar never resets.
// Manifest: 0..0.1, chapters: 0.1..0.7, images: 0.7..1.0.
function computeProgressFraction(p: LoadProgress | undefined): number {
  if (!p) return 0
  const ratio = p.total > 0 ? p.completed / p.total : 0
  if (p.phase === 'manifest') return ratio * 0.1
  if (p.phase === 'chapters') return 0.1 + ratio * 0.6
  return 0.7 + ratio * 0.3
}

export function BookReader({ bookId, chapter }: Props) {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)

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

  const rawConfig = useReaderConfig()
  const cursor = useReaderCursor(bookId)

  // Foliate's `margin` attribute drives the iframe's top/bottom column inset
  // (single value for both). Floor it at the safe-area insets so the text
  // never bleeds into the notch / home indicator, AND leave room below for
  // the bottom Liquid Glass pill (height 36 + 12 inset margin + 8 buffer).
  const config = useMemo(
    () => ({
      ...rawConfig,
      marginPx: Math.max(rawConfig.marginPx, insets.top + 16, insets.bottom + 56),
    }),
    [rawConfig, insets.top, insets.bottom],
  )

  // Resolve where to start. An explicit `chapter` (from frontispiece TOC) wins
  // over the saved cursor; otherwise restore where the reader left off; else
  // open at the first leaf.
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

  const [loadProgress, setLoadProgress] = useState<LoadProgress | undefined>(undefined)

  const {
    data: bookContent,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['book-content', bookId, lang, leaves.length],
    queryFn: () =>
      loadBookContent(
        bookId,
        lang,
        leaves.map((l) => l.id),
        setLoadProgress,
      ),
    enabled: !!bookEntry && leaves.length > 0 && cursor.initial.loaded,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const chapters = useMemo(() => {
    if (!bookContent) return undefined
    return leaves.map((l) => getChapterBody(bookContent, l.id, titleLookup.get(l.id)))
  }, [bookContent, leaves, titleLookup])

  const [pageState, setPageState] = useState({
    index: 0,
    page: 1,
    pages: 1,
    fraction: 0,
  })
  const [chromeShown, setChromeShown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tocOpen, setTocOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const foliateRef = useRef<FoliateReaderHandle>(null)

  // Debounced cursor save — held in a ref so onMessage stays identity-stable.
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const onMessage = useCallback(
    (msg: { type: string } & Record<string, unknown>) => {
      if (msg.type === 'centerTap') {
        setChromeShown((s) => !s)
        return
      }
      if (msg.type === 'relocate') {
        const index = msg.index as number
        const fraction = msg.fraction as number
        const page = msg.page as number
        const pages = msg.pages as number
        setPageState({ index, page, pages, fraction })
        const chapterId = leaves[index]?.id
        if (!chapterId) return
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          cursor.save({ chapterId, fraction })
        }, 1000)
      }
    },
    [leaves, cursor.save],
  )

  const handleSelectChapter = useCallback(
    (id: string) => {
      const idx = leaves.findIndex((l) => l.id === id)
      if (idx >= 0) foliateRef.current?.goTo(idx, 0)
      setTocOpen(false)
    },
    [leaves],
  )

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

  if (isLoading || !cursor.initial.loaded || !chapters) {
    // Themed loading: the AppleZoom morph just landed and the user expects to
    // see *this* book opening, not a black void. Show the title + a phased
    // progress bar so big books (Aquinas) don't look hung.
    const fraction = computeProgressFraction(loadProgress)
    const statusKey =
      loadProgress?.phase === 'images'
        ? 'books.loadingImages'
        : loadProgress?.phase === 'chapters'
          ? 'books.loadingChapters'
          : loadProgress?.phase === 'manifest'
            ? 'books.loadingManifest'
            : 'books.opening'
    return (
      <YStack
        flex={1}
        backgroundColor={config.background}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$xl"
        gap="$lg"
      >
        <Text
          fontFamily="$body"
          fontStyle="italic"
          fontSize="$5"
          color={config.color}
          opacity={0.75}
          textAlign="center"
        >
          {bookTitle}
        </Text>
        <View
          width={220}
          height={3}
          backgroundColor={config.color}
          opacity={0.15}
          borderRadius={2}
          overflow="hidden"
        >
          <View
            width={`${Math.round(fraction * 100)}%`}
            height={3}
            backgroundColor={config.color}
            opacity={1}
          />
        </View>
        <Text fontFamily="$body" fontSize="$1" color={config.color} opacity={0.55}>
          {t(statusKey, {
            defaultValue: 'Opening…',
            done: loadProgress?.completed ?? 0,
            total: loadProgress?.total ?? 0,
          })}
        </Text>
      </YStack>
    )
  }

  const currentChapterId = leaves[pageState.index]?.id

  return (
    <View flex={1} backgroundColor={config.background}>
      <FoliateReader
        ref={foliateRef}
        chapters={chapters}
        initialIndex={startIndex}
        initialFraction={startFraction}
        config={config}
        onMessage={onMessage}
      />

      <ReaderOverlay
        title={bookTitle}
        page={pageState.page}
        pages={pageState.pages}
        chromeShown={chromeShown}
        background={config.background}
        color={config.color}
        onClose={() => router.back()}
        onMenu={() => setMenuOpen(true)}
      />

      <ReaderMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onContents={
          bookEntry.toc && bookEntry.toc.length > 0
            ? () => {
                setMenuOpen(false)
                setTocOpen(true)
              }
            : undefined
        }
        onSettings={() => {
          setMenuOpen(false)
          setSettingsOpen(true)
        }}
      />

      {bookEntry.toc && (
        <ReaderTocSheet
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          toc={bookEntry.toc}
          currentChapterId={currentChapterId}
          onSelect={handleSelectChapter}
        />
      )}

      <ReaderSettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  )
}
