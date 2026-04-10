import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, ChevronRight, List } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { ScreenLayout } from '@/components'
import { getEpubEntry, getEpubFilePath } from '@/content/registry'
import { getCursor, setCursor } from '@/db/repositories/cursors'
import { EpubTocSheet } from '@/features/books/EpubTocSheet'
import type { EpubMessage, EpubWebViewHandle } from '@/features/books/EpubWebView'
import { EpubWebView } from '@/features/books/EpubWebView'
import {
  buildReaderShell,
  flattenTocLeaves,
  getChapterBody,
  loadEpub,
} from '@/features/books/epubReader'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

type ReadingPosition = { chapterId: string; page: number }

function cursorId(bookId: string, epubId: string) {
  return `epub/${bookId}/${epubId}`
}

export default function EpubReaderScreen() {
  const { epubId, bookId } = useLocalSearchParams<{ epubId: string; bookId: string }>()
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { contentLanguage } = usePreferencesStore()
  const webViewRef = useRef<EpubWebViewHandle>(null)

  const epubEntry = epubId && bookId ? getEpubEntry(epubId, bookId) : undefined

  const lang = useMemo(() => {
    if (!epubEntry) return 'en-US'
    return epubEntry.languages.includes(contentLanguage) ? contentLanguage : epubEntry.languages[0]
  }, [epubEntry, contentLanguage])

  const epubFilePath = epubId && bookId ? getEpubFilePath(epubId, lang, bookId) : undefined

  const leaves = useMemo(
    () => (epubEntry?.toc ? flattenTocLeaves(epubEntry.toc) : []),
    [epubEntry?.toc],
  )

  const [currentChapterId, setCurrentChapterId] = useState<string | undefined>()
  const [initialChapterId, setInitialChapterId] = useState<string | undefined>()
  const currentPageRef = useRef(0)
  const [pageDisplay, setPageDisplay] = useState({ current: 0, total: 1 })
  const [positionLoaded, setPositionLoaded] = useState(false)
  const restoredPageRef = useRef(0)

  // Load saved reading position
  useEffect(() => {
    if (!bookId || !epubId || leaves.length === 0) return
    getCursor(cursorId(bookId, epubId)).then((cursor) => {
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
    })
  }, [bookId, epubId, leaves])

  // Save reading position
  const savePosition = useCallback(() => {
    if (!bookId || !epubId || !currentChapterId) return
    const pos: ReadingPosition = {
      chapterId: currentChapterId,
      page: currentPageRef.current,
    }
    setCursor(cursorId(bookId, epubId), JSON.stringify(pos))
  }, [bookId, epubId, currentChapterId])

  useEffect(() => {
    return () => {
      savePosition()
    }
  }, [savePosition])

  const { data: epubContent, isLoading } = useQuery({
    queryKey: ['epub', epubId, lang],
    // biome-ignore lint/style/noNonNullAssertion: guarded by enabled
    queryFn: () => loadEpub(epubFilePath!, lang),
    enabled: !!epubFilePath,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const shellHtml = useMemo(() => {
    if (!epubContent || !initialChapterId) return undefined
    return buildReaderShell(epubContent, initialChapterId, isDark)
  }, [epubContent, isDark, initialChapterId])

  const currentIndex = useMemo(
    () => leaves.findIndex((l) => l.id === currentChapterId),
    [leaves, currentChapterId],
  )

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < leaves.length - 1

  const navigateChapter = useCallback(
    (id: string, startPage = 0) => {
      savePosition()
      currentPageRef.current = startPage
      setPageDisplay({ current: 0, total: 1 })
      setCurrentChapterId(id)
      if (epubContent) {
        const body = getChapterBody(epubContent, id)
        webViewRef.current?.loadChapter(body, startPage)
      }
    },
    [savePosition, epubContent],
  )

  // Stable ref for values that change on every chapter nav, so callbacks stay identity-stable
  const navRef = useRef({ currentIndex, hasNext, hasPrev, leaves, navigateChapter })
  navRef.current = { currentIndex, hasNext, hasPrev, leaves, navigateChapter }

  const goPrev = useCallback(() => {
    const { hasPrev, currentIndex, leaves, navigateChapter } = navRef.current
    if (hasPrev) navigateChapter(leaves[currentIndex - 1].id)
  }, [])

  const goNext = useCallback(() => {
    const { hasNext, currentIndex, leaves, navigateChapter } = navRef.current
    if (hasNext) navigateChapter(leaves[currentIndex + 1].id)
  }, [])

  const [tocVisible, setTocVisible] = useState(false)

  const handleMessage = useCallback((msg: EpubMessage) => {
    if (msg.type === 'pageInfo') {
      currentPageRef.current = msg.currentPage
      setPageDisplay({ current: msg.currentPage, total: msg.totalPages })
    }
    if (msg.type === 'boundary') {
      const { hasNext, hasPrev, currentIndex, leaves, navigateChapter } = navRef.current
      if (msg.direction === 'next' && hasNext) {
        navigateChapter(leaves[currentIndex + 1].id, 0)
      }
      if (msg.direction === 'prev' && hasPrev) {
        navigateChapter(leaves[currentIndex - 1].id, -1)
      }
    }
    if (msg.type === 'ready' && restoredPageRef.current > 0) {
      webViewRef.current?.goToPage(restoredPageRef.current)
      restoredPageRef.current = 0
    }
  }, [])

  const title = epubEntry ? localizeContent(epubEntry.name) : ''

  if (!epubEntry) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            EPUB not found.
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
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
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
        {epubEntry.toc && epubEntry.toc.length > 0 && (
          <Pressable onPress={() => setTocVisible(true)} hitSlop={8}>
            <List size={22} color={theme.color.val} />
          </Pressable>
        )}
      </XStack>

      <YStack flex={1} backgroundColor={isDark ? '#0E0D0C' : '#FAF6F0'}>
        {shellHtml ? (
          <EpubWebView ref={webViewRef} html={shellHtml} onMessage={handleMessage} />
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Text fontFamily="$body" color="$colorSecondary">
              {t('prayerBooks.chapterNotFound')}
            </Text>
          </YStack>
        )}
      </YStack>

      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Pressable onPress={goPrev} disabled={!hasPrev} hitSlop={8}>
          <XStack alignItems="center" gap="$xs" opacity={hasPrev ? 1 : 0.3}>
            <ChevronLeft size={16} color={theme.colorSecondary.val} />
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t('prayerBooks.previousChapter')}
            </Text>
          </XStack>
        </Pressable>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {pageDisplay.current + 1} / {pageDisplay.total}
        </Text>
        <Pressable onPress={goNext} disabled={!hasNext} hitSlop={8}>
          <XStack alignItems="center" gap="$xs" opacity={hasNext ? 1 : 0.3}>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {t('prayerBooks.nextChapter')}
            </Text>
            <ChevronRight size={16} color={theme.colorSecondary.val} />
          </XStack>
        </Pressable>
      </XStack>

      {tocVisible && currentChapterId && epubEntry.toc && (
        <EpubTocSheet
          toc={epubEntry.toc}
          currentChapterId={currentChapterId}
          onSelectChapter={navigateChapter}
          onClose={() => setTocVisible(false)}
        />
      )}
    </YStack>
  )
}
