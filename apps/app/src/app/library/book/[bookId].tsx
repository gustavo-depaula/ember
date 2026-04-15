import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, List, Type } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, useColorScheme } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'
import { ReadingConfigModal, ScreenLayout } from '@/components'
import { getBookDirUri, getBookEntry } from '@/content/registry'
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
import { readingScale } from '@/hooks/useReadingStyle'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

type ReadingPosition = { chapterId: string; page: number }

function cursorId(libraryId: string, bookId: string) {
  return `book/${libraryId}/${bookId}`
}

export default function BookReaderScreen() {
  const { bookId, libraryId } = useLocalSearchParams<{ bookId: string; libraryId: string }>()
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
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

  const bookEntry = bookId && libraryId ? getBookEntry(bookId, libraryId) : undefined

  const lang = useMemo(() => {
    if (!bookEntry) return 'en-US'
    return bookEntry.languages.includes(contentLanguage) ? contentLanguage : bookEntry.languages[0]
  }, [bookEntry, contentLanguage])

  const bookDirUri = bookId && libraryId ? getBookDirUri(bookId, libraryId) : undefined

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
      lineHeightPx: readingScale.lineHeight[lineHeightStep - 1],
      textAlign,
      margin,
    }),
    [fontSizeStep, lineHeightStep, textAlign, margin],
  )
  const initialConfigRef = useRef(readerConfig)

  // Load saved reading position
  useEffect(() => {
    if (!libraryId || !bookId || leaves.length === 0) return
    const cursor = getCursor(cursorId(libraryId, bookId))
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
  }, [libraryId, bookId, leaves])

  // Save reading position
  const savePosition = useCallback(() => {
    if (!libraryId || !bookId || !currentChapterId) return
    const pos: ReadingPosition = {
      chapterId: currentChapterId,
      page: currentPageRef.current,
    }
    setCursor(cursorId(libraryId, bookId), JSON.stringify(pos))
  }, [libraryId, bookId, currentChapterId])

  useEffect(() => {
    return () => {
      savePosition()
    }
  }, [savePosition])

  const { data: bookContent, isLoading } = useQuery({
    queryKey: ['book', bookId, lang],
    queryFn: () =>
      loadBookContent(
        // biome-ignore lint/style/noNonNullAssertion: guarded by enabled
        bookDirUri!,
        lang,
        leaves.map((l) => l.id),
      ),
    enabled: !!bookDirUri && leaves.length > 0,
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

  const handleMessage = useCallback((msg: ReaderMessage) => {
    if (msg.type === 'pageInfo') {
      currentPageRef.current = msg.currentPage
      setPageDisplay({ current: msg.currentPage, total: msg.totalPages })
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
  }, [])

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

  if (isLoading || !positionLoaded) {
    return (
      <ScreenLayout>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator color={theme.accent.val} />
        </YStack>
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
            >
              <ChevronLeft size={24} color={theme.color.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$3" color="$color" numberOfLines={1}>
                {title}
              </Text>
            </YStack>
            <Pressable onPress={() => setConfigVisible(true)} hitSlop={8}>
              <Type size={20} color={theme.color.val} />
            </Pressable>
            {bookEntry.toc && bookEntry.toc.length > 0 && (
              <Pressable onPress={() => setTocVisible(true)} hitSlop={8}>
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
              {t('library.chapterNotFound')}
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
