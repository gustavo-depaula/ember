import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
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
import { FootnoteSheet } from './FootnoteSheet'
import {
  type FoliateMessage,
  FoliateReader,
  type FoliateReaderHandle,
} from './foliate/FoliateReader'
import { ReaderBookmarksSheet } from './ReaderBookmarksSheet'
import { ReaderMenuSheet } from './ReaderMenuSheet'
import { ReaderOverlay } from './ReaderOverlay'
import { ReaderSearchSheet } from './ReaderSearchSheet'
import { ReaderSettingsSheet } from './ReaderSettingsSheet'
import { ReaderTocSheet } from './ReaderTocSheet'
import { useReaderConfig } from './useReaderConfig'
import { useReaderCursor } from './useReaderCursor'

type Props = {
  bookId: string
  chapter?: string
}

type SheetKind = 'menu' | 'toc' | 'settings' | 'search' | 'bookmarks' | null

const BAR_WIDTH = 220

function computeProgressFraction(p: LoadProgress | undefined): number {
  if (!p) return 0
  const ratio = p.total > 0 ? p.completed / p.total : 0
  if (p.phase === 'manifest') return ratio * 0.1
  if (p.phase === 'chapters') return 0.1 + ratio * 0.6
  return 0.7 + ratio * 0.3
}

const phaseToKey = {
  manifest: 'books.loadingManifest',
  chapters: 'books.loadingChapters',
  images: 'books.loadingImages',
} as const

function LoadingPane({
  background,
  color,
  title,
  progress,
}: {
  background: string
  color: string
  title: string
  progress: LoadProgress | undefined
}) {
  const { t } = useTranslation()
  const fillWidth = useSharedValue(0)

  // React batches setLoadProgress calls within the same task — 200+ chapters
  // resolving in one tick would otherwise snap from 0 to 100% in one frame.
  useEffect(() => {
    fillWidth.value = withTiming(computeProgressFraction(progress) * BAR_WIDTH, { duration: 300 })
  }, [progress, fillWidth])

  const fillStyle = useAnimatedStyle(() => ({ width: fillWidth.value }))
  const statusKey = progress ? phaseToKey[progress.phase] : 'books.opening'

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
      <View
        width={BAR_WIDTH}
        height={3}
        backgroundColor={color}
        opacity={0.15}
        borderRadius={2}
        overflow="hidden"
      >
        <Animated.View style={[{ height: 3, backgroundColor: color }, fillStyle]} />
      </View>
      <Text fontFamily="$body" fontSize="$1" color={color} opacity={0.55}>
        {t(statusKey, {
          defaultValue: 'Opening…',
          done: progress?.completed ?? 0,
          total: progress?.total ?? 0,
        })}
      </Text>
    </YStack>
  )
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

  // Floor foliate's margin at the safe-area insets so text never bleeds into
  // the notch or home indicator. +56 bottom also clears the page-indicator
  // text. Override `lang` so WebKit picks the right hyphenation dictionary.
  const config = useMemo(
    () => ({
      ...rawConfig,
      marginPx: Math.max(rawConfig.marginPx, insets.top + 16, insets.bottom + 56),
      lang,
    }),
    [rawConfig, insets.top, insets.bottom, lang],
  )

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

  const [chapterIndex, setChapterIndex] = useState(0)
  const [fraction, setFraction] = useState(0)
  const [pagesLeft, setPagesLeft] = useState(0)
  const [chromeShown, setChromeShown] = useState(false)
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [footnoteHtml, setFootnoteHtml] = useState<string | undefined>(undefined)
  const [navStack, setNavStack] = useState<Array<{ index: number; fraction: number }>>([])

  const foliateRef = useRef<FoliateReaderHandle>(null)

  const onMessage = useCallback(
    (msg: FoliateMessage) => {
      switch (msg.type) {
        case 'centerTap':
          setChromeShown((s) => !s)
          return
        case 'relocate': {
          setChapterIndex(msg.index)
          setFraction(msg.fraction)
          setPagesLeft(Math.max(0, msg.pages - msg.page))
          const chapterId = leaves[msg.index]?.id
          if (chapterId) cursor.save({ chapterId, fraction: msg.fraction })
          return
        }
        case 'footnoteTap':
          setFootnoteHtml(msg.html)
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
    [leaves, cursor.save, chapterIndex, fraction],
  )

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
    return (
      <LoadingPane
        background={config.background}
        color={config.color}
        title={bookTitle}
        progress={loadProgress}
      />
    )
  }

  const currentChapterId = leaves[chapterIndex]?.id
  const currentPosition = currentChapterId ? { chapterId: currentChapterId, fraction } : undefined

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
        chapter={chapterIndex + 1}
        chapters={leaves.length}
        pagesLeft={pagesLeft}
        chromeShown={chromeShown}
        canGoBack={navStack.length > 0}
        isDark={config.isDark}
        color={config.color}
        onClose={() => router.back()}
        onMenu={() => setSheet('menu')}
        onBack={handleBackNav}
      />

      <ReaderMenuSheet
        open={sheet === 'menu'}
        onClose={() => setSheet(null)}
        onContents={bookEntry.toc && bookEntry.toc.length > 0 ? () => setSheet('toc') : undefined}
        onSearch={() => setSheet('search')}
        onBookmarks={() => setSheet('bookmarks')}
        onSettings={() => setSheet('settings')}
      />

      {bookEntry.toc && (
        <ReaderTocSheet
          open={sheet === 'toc'}
          onClose={() => setSheet(null)}
          toc={bookEntry.toc}
          currentChapterId={currentChapterId}
          onSelect={handleSelectChapter}
        />
      )}

      <ReaderSettingsSheet open={sheet === 'settings'} onClose={() => setSheet(null)} />

      <ReaderSearchSheet
        open={sheet === 'search'}
        onClose={() => setSheet(null)}
        bodies={chapters}
        leaves={leaves}
        titleLookup={titleLookup}
        onSelect={(idx) => foliateRef.current?.goTo(idx, 0)}
      />

      <ReaderBookmarksSheet
        open={sheet === 'bookmarks'}
        onClose={() => setSheet(null)}
        bookId={bookId}
        currentPosition={currentPosition}
        currentChapterTitle={currentChapterId ? titleLookup.get(currentChapterId) : undefined}
        leaves={leaves}
        titleLookup={titleLookup}
        onSelect={(idx, frac) => foliateRef.current?.goTo(idx, frac)}
      />

      <FootnoteSheet content={footnoteHtml} onClose={() => setFootnoteHtml(undefined)} />
    </View>
  )
}
