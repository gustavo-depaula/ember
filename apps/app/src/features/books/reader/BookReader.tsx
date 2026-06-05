import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, YStack } from 'tamagui'

import { PrayerSpinner } from '@/components/PrayerSpinner'
import { ReaderErrorState } from '@/components/ReaderErrorState'
import { getBookEntry } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { buildTitleLookup, flattenTocLeaves, getChapterBody, loadBookContent } from './bookContent'
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

  const config = useReaderConfig()
  const cursor = useReaderCursor(bookId)

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

  if (isError) {
    return (
      <YStack flex={1} backgroundColor={config.background} justifyContent="center">
        <ReaderErrorState onRetry={() => refetch()} />
      </YStack>
    )
  }

  if (isLoading || !cursor.initial.loaded || !chapters) {
    return (
      <YStack
        flex={1}
        backgroundColor={config.background}
        justifyContent="center"
        alignItems="center"
      >
        <PrayerSpinner />
      </YStack>
    )
  }

  const bookTitle = localizeContent(bookEntry.name)
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
