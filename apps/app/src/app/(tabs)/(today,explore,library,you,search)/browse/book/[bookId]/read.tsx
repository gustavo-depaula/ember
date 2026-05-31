import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Bookmark, BookmarkCheck, ChevronLeft, List, Type } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useColorScheme } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'
import { PrayerSpinner, ReaderErrorState, ReadingConfigModal, ScreenLayout } from '@/components'
import { useImageViewer } from '@/components/ImageViewerContext'
import { getBookEntry } from '@/content/resolver'
import { getCursor, setCursor } from '@/db/repositories/cursors'
import {
  buildConfigCss,
  buildReaderShell,
  buildSequenceBody,
  buildTitleLookup,
  flattenTocLeaves,
  getChapterBody,
  loadBookContent,
  type ReaderConfig,
} from '@/features/books/bookReader'
import { ReaderTocSheet } from '@/features/books/ReaderTocSheet'
import type { ReaderMessage, ReaderWebViewHandle } from '@/features/books/ReaderWebView'
import { ReaderWebView } from '@/features/books/ReaderWebView'
import { useSaveToggle } from '@/features/library'
import { readingScale } from '@/hooks/useReadingStyle'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

type ReadingPosition = { chapterId: string; page: number }

function cursorId(bookId: string) {
  return `book/${bookId}`
}

export default function BookReaderScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter?: string }>()
  const router = useRouter()
  const navigation = useNavigation()
  const theme = useTheme()

  // The reader WebView owns horizontal swipes (chapter nav); the iOS root-stack
  // edge-swipe would otherwise fire too and close the book. Disable the root
  // gesture only while the reader is mounted, so swipe-back works on the
  // frontispiece and everywhere else. (Moved here from browse/book/_layout so
  // the frontispiece keeps its swipe-back.)
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: walk up the navigator tree
    let root: any = navigation
    while (root?.getParent?.()) root = root.getParent()
    root?.setOptions?.({ gestureEnabled: false })
    return () => {
      root?.setOptions?.({ gestureEnabled: true })
    }
  }, [navigation])
  const { t } = useTranslation()
  const { saved, toggle: toggleSave } = useSaveToggle(bookId ? `book/${bookId}` : undefined, 'book')
  const insets = useSafeAreaInsets()
  const systemScheme = useColorScheme()
  const themePreference = usePreferencesStore((s) => s.theme)
  const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
  const isDark = resolvedTheme === 'dark'
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)
  const margin = usePreferencesStore((s) => s.margin)
  const webViewRef = useRef<ReaderWebViewHandle>(null)

  const bookEntry = bookId ? getBookEntry(bookId) : undefined

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

  const [currentChapterId, setCurrentChapterId] = useState<string | undefined>()
  const [initialChapterId, setInitialChapterId] = useState<string | undefined>()
  const currentPageRef = useRef(0)
  const [pageDisplay, setPageDisplay] = useState({ current: 0, total: 1 })
  const [positionLoaded, setPositionLoaded] = useState(false)
  const restoredPageRef = useRef(0)

  const readerConfig = useMemo<ReaderConfig>(
    () => ({
      fontSizePx: readingScale.fontSize[fontSizeStep - 1],
      lineHeightPx: Math.round(
        readingScale.fontSize[fontSizeStep - 1] * readingScale.leadingRatio[lineHeightStep - 1],
      ),
      textAlign,
      margin,
    }),
    [fontSizeStep, lineHeightStep, textAlign, margin],
  )
  const initialConfigRef = useRef(readerConfig)

  // Load reading position: an explicit `chapter` (from the frontispiece's TOC)
  // wins over the saved cursor; otherwise restore where the reader left off.
  useEffect(() => {
    if (!bookId || leaves.length === 0) return
    if (chapter && leaves.some((l) => l.id === chapter)) {
      setCurrentChapterId(chapter)
      setInitialChapterId((prev) => prev ?? chapter)
      setPositionLoaded(true)
      return
    }
    const cursor = getCursor(cursorId(bookId))
    if (cursor) {
      try {
        const pos = JSON.parse(cursor.position) as ReadingPosition
        const valid = leaves.some((l) => l.id === pos.chapterId)
        if (valid) {
          setCurrentChapterId(pos.chapterId)
          setInitialChapterId((prev) => prev ?? pos.chapterId)
          restoredPageRef.current = pos.page
          currentPageRef.current = pos.page
        } else {
          setCurrentChapterId(leaves[0].id)
          setInitialChapterId((prev) => prev ?? leaves[0].id)
        }
      } catch {
        setCurrentChapterId(leaves[0].id)
        setInitialChapterId((prev) => prev ?? leaves[0].id)
      }
    } else {
      setCurrentChapterId(leaves[0].id)
      setInitialChapterId((prev) => prev ?? leaves[0].id)
    }
    setPositionLoaded(true)
  }, [bookId, leaves, chapter])

  // Save reading position
  const savePosition = useCallback(() => {
    if (!bookId || !currentChapterId) return
    const pos: ReadingPosition = {
      chapterId: currentChapterId,
      page: currentPageRef.current,
    }
    setCursor(cursorId(bookId), JSON.stringify(pos))
  }, [bookId, currentChapterId])

  useEffect(() => {
    return () => {
      savePosition()
    }
  }, [savePosition])

  const {
    data: bookContent,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['book', bookId, lang],
    queryFn: () =>
      loadBookContent(
        // biome-ignore lint/style/noNonNullAssertion: guarded by enabled
        bookId!,
        lang,
        leaves.map((l) => l.id),
      ),
    enabled: !!bookId && !!bookEntry && leaves.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
  })

  // Ref tracks current chapter so the shell picks it up on language switch.
  // shellHtml only recomputes when bookContent or isDark changes (not on chapter nav).
  // key={lang} on the WebView forces a remount on language change.
  const chapterForShellRef = useRef<string | undefined>(undefined)
  if (currentChapterId) chapterForShellRef.current = currentChapterId

  const shellHtml = useMemo(() => {
    const chapterId = chapterForShellRef.current ?? initialChapterId
    if (!bookContent || !chapterId) return undefined
    const idx = leaves.findIndex((l) => l.id === chapterId)
    const prevId = idx > 0 ? leaves[idx - 1].id : undefined
    const nextId = idx < leaves.length - 1 ? leaves[idx + 1].id : undefined
    return buildReaderShell(
      bookContent,
      { prev: prevId, current: chapterId, next: nextId },
      isDark,
      titleLookup,
      initialConfigRef.current,
    )
  }, [bookContent, isDark, initialChapterId, titleLookup, leaves])

  // Live style updates when preferences change (skip initial render)
  const isFirstConfigRender = useRef(true)
  useEffect(() => {
    if (isFirstConfigRender.current) {
      isFirstConfigRender.current = false
      return
    }
    webViewRef.current?.updateStyles(buildConfigCss(readerConfig))
  }, [readerConfig])

  const currentIndex = useMemo(
    () => leaves.findIndex((l) => l.id === currentChapterId),
    [leaves, currentChapterId],
  )

  const navigateChapter = useCallback(
    (id: string, startPage = 0) => {
      savePosition()
      currentPageRef.current = startPage
      setPageDisplay({ current: 0, total: 1 })
      setCurrentChapterId(id)
      if (bookContent) {
        const idx = leaves.findIndex((l) => l.id === id)
        const prevId = idx > 0 ? leaves[idx - 1].id : undefined
        const nextId = idx < leaves.length - 1 ? leaves[idx + 1].id : undefined
        const html = buildSequenceBody(
          bookContent,
          { prev: prevId, current: id, next: nextId },
          titleLookup,
        )
        webViewRef.current?.loadSequence(html, startPage)
      }
    },
    [savePosition, bookContent, leaves, titleLookup],
  )

  // Stable ref for values that change on every chapter nav, so callbacks stay identity-stable
  const goBack = useCallback(() => router.back(), [router])
  const navRef = useRef({
    currentIndex,
    leaves,
    savePosition,
    goBack,
    bookContent,
    titleLookup,
  })
  navRef.current = {
    currentIndex,
    leaves,
    savePosition,
    goBack,
    bookContent,
    titleLookup,
  }

  const [tocVisible, setTocVisible] = useState(false)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [configVisible, setConfigVisible] = useState(false)

  const progress = useMemo(() => {
    if (leaves.length === 0) return 0
    return (currentIndex + pageDisplay.current / Math.max(1, pageDisplay.total)) / leaves.length
  }, [leaves.length, currentIndex, pageDisplay])

  const { openViewer } = useImageViewer()

  const handleMessage = useCallback(
    (msg: ReaderMessage) => {
      if (msg.type === 'pageInfo') {
        currentPageRef.current = msg.currentPage
        setPageDisplay({ current: msg.currentPage, total: msg.totalPages })
      }
      if (msg.type === 'galleryImageTap') {
        openViewer(
          msg.items.map((item) => ({
            src: item.src,
            caption: item.caption ?? undefined,
            attribution: item.attribution ?? undefined,
          })),
          msg.index,
        )
      }
      if (msg.type === 'chapterCross') {
        const {
          currentIndex,
          leaves,
          savePosition,
          bookContent: bc,
          titleLookup: tl,
        } = navRef.current
        savePosition()
        if (msg.direction === 'next' && currentIndex < leaves.length - 1) {
          const newIndex = currentIndex + 1
          setCurrentChapterId(leaves[newIndex].id)
          currentPageRef.current = msg.page
          const newNextId = newIndex + 1 < leaves.length ? leaves[newIndex + 1].id : undefined
          const bodyHtml = newNextId && bc ? getChapterBody(bc, newNextId, tl.get(newNextId)) : ''
          webViewRef.current?.refreshBuffer('next', bodyHtml)
        }
        if (msg.direction === 'prev' && currentIndex > 0) {
          const newIndex = currentIndex - 1
          setCurrentChapterId(leaves[newIndex].id)
          currentPageRef.current = msg.page
          const newPrevId = newIndex - 1 >= 0 ? leaves[newIndex - 1].id : undefined
          const bodyHtml = newPrevId && bc ? getChapterBody(bc, newPrevId, tl.get(newPrevId)) : ''
          webViewRef.current?.refreshBuffer('prev', bodyHtml)
        }
      }
      if (msg.type === 'backSwipe') {
        navRef.current.savePosition()
        navRef.current.goBack()
      }
      if (msg.type === 'centerTap') {
        setChromeVisible((v) => !v)
      }
      if (msg.type === 'ready' && restoredPageRef.current > 0) {
        webViewRef.current?.goToPage(restoredPageRef.current)
        restoredPageRef.current = 0
      }
    },
    [openViewer],
  )

  const title = bookEntry ? localizeContent(bookEntry.name) : ''

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

  if (isError) {
    return (
      <ScreenLayout>
        <ReaderErrorState onRetry={() => refetch()} />
      </ScreenLayout>
    )
  }

  if (isLoading || !positionLoaded) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  return (
    <YStack
      flex={1}
      backgroundColor={isDark ? '#0E0D0C' : '#FAF6F0'}
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      {chromeVisible && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
          <XStack
            alignItems="center"
            gap="$sm"
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Pressable
              onPress={() => {
                savePosition()
                router.back()
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$3" color="$color" numberOfLines={1}>
                {title}
              </Text>
            </YStack>
            <Pressable
              onPress={toggleSave}
              hitSlop={8}
              accessibilityRole="switch"
              accessibilityState={{ checked: saved }}
              accessibilityLabel={saved ? t('library.saved') : t('library.save')}
            >
              {saved ? (
                <BookmarkCheck size={20} color={theme.accent.val} />
              ) : (
                <Bookmark size={20} color={theme.color.val} />
              )}
            </Pressable>
            <Pressable
              onPress={() => setConfigVisible(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.readingSettings')}
            >
              <Type size={20} color={theme.color.val} />
            </Pressable>
            {bookEntry.toc && bookEntry.toc.length > 0 && (
              <Pressable
                onPress={() => setTocVisible(true)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.openTableOfContents')}
              >
                <List size={22} color={theme.color.val} />
              </Pressable>
            )}
          </XStack>
          <View height={2} backgroundColor="$borderColor">
            <View height={2} backgroundColor="$accent" width={`${progress * 100}%`} />
          </View>
        </Animated.View>
      )}

      <YStack flex={1}>
        {shellHtml ? (
          <ReaderWebView
            key={`${lang}-${isDark}`}
            ref={webViewRef}
            html={shellHtml}
            onMessage={handleMessage}
          />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text fontFamily="$body" color="$colorSecondary">
              {t('browse.chapterNotFound')}
            </Text>
          </YStack>
        )}
      </YStack>

      {chromeVisible && (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
          <XStack
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="$md"
            paddingVertical="$xs"
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {pageDisplay.current + 1} / {pageDisplay.total}
            </Text>
          </XStack>
        </Animated.View>
      )}

      {tocVisible && currentChapterId && bookEntry.toc && (
        <ReaderTocSheet
          toc={bookEntry.toc}
          currentChapterId={currentChapterId}
          onSelectChapter={navigateChapter}
          onClose={() => setTocVisible(false)}
        />
      )}

      <ReadingConfigModal visible={configVisible} onClose={() => setConfigVisible(false)} />
    </YStack>
  )
}
