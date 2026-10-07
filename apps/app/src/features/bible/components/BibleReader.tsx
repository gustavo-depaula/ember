import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { View, YStack } from 'tamagui'

import {
  PrayerSpinner,
  ReaderErrorState,
  ReadingConfigModal,
  ScreenLayout,
  TwoColumnReaderHeader,
} from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import type { Book } from '@/lib/content'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { spanForVerse } from '../commentary'
import { useBooks, useChapter, useChapterCommentary, usePrefetchAdjacentChapters } from '../hooks'
import { BibleDrawer } from './BibleDrawer'
import { ChapterContent } from './ChapterContent'
import { ChapterNav } from './ChapterNav'
import { CommentaryPane } from './CommentaryPane'

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }
const noBooks: Book[] = []
// How long a chapter stays open before it counts as read, so that leafing
// through the drawer to look something up moves no place.
const readingDwellMs = 20_000
// Where a tapped verse comes to rest below the top of the page, so the line
// before it stays in view.
const verseRestOffset = 72

export function BibleReader({ initialDrawerOpen = false }: { initialDrawerOpen?: boolean }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const bottomClearance = useBottomClearance()
  const drawerWidth = Math.min(screenWidth * 0.8, 360)
  const stripWidth = drawerWidth + screenWidth

  const translation = usePreferencesStore((s) => s.translation)
  const { bookId, chapter, setPosition, recordReading } = useBibleStore()
  const commentarySource = useBibleStore((s) => s.commentarySource)

  const slideX = useSharedValue(initialDrawerOpen ? drawerWidth : 0)
  const startX = useSharedValue(0)
  const [panelOpen, setPanelOpen] = useState(initialDrawerOpen)
  const [readingConfigVisible, setReadingConfigVisible] = useState(false)

  // The verse whose commentary is open in the lower half; none, and the page
  // is whole.
  const [commentedVerse, setCommentedVerse] = useState<number>()
  const [paneHeight, setPaneHeight] = useState(Math.round(screenHeight * 0.46))
  const scrollRef = useRef<ScrollView>(null)
  const chapterTop = useRef(0)
  const commentary = useChapterCommentary(bookId, chapter, commentedVerse !== undefined)
  const closeCommentary = useCallback(() => setCommentedVerse(undefined), [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new chapter is the trigger
  useEffect(() => {
    setCommentedVerse(undefined)
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [bookId, chapter])

  const marked = (() => {
    if (commentedVerse === undefined) return undefined
    const source =
      commentary.sources.find((s) => s.id === commentarySource) ?? commentary.sources[0]
    const span = spanForVerse(commentary.bySource[source.id] ?? [], commentedVerse)
    return {
      verse: commentedVerse,
      from: span?.from ?? commentedVerse,
      to: span?.to ?? commentedVerse,
    }
  })()

  function handleVersePress(verse: number, y: number) {
    if (verse === commentedVerse) {
      closeCommentary()
      return
    }
    setCommentedVerse(verse)
    scrollRef.current?.scrollTo({ y: Math.max(0, chapterTop.current + y - verseRestOffset) })
  }

  function openVersePage() {
    if (commentedVerse === undefined) return
    router.push({
      pathname: '/bible/verse',
      params: { bookId, chapter: String(chapter), verse: String(commentedVerse) },
    })
  }

  const {
    data: books = noBooks,
    isError: booksError,
    refetch: refetchBooks,
  } = useBooks(translation)
  const {
    data: chapterData,
    isLoading,
    isError: chapterError,
    refetch: refetchChapter,
  } = useChapter(translation, bookId, chapter)
  usePrefetchAdjacentChapters(translation, bookId, chapter, books)

  const currentBook = books.find((b) => b.id === bookId)
  const bookName = t(`bookName.${bookId}`, { defaultValue: currentBook?.name ?? bookId })

  useEffect(() => {
    if (books.length === 0 || !chapterData) return
    const timer = setTimeout(() => recordReading(books), readingDwellMs)
    return () => clearTimeout(timer)
    // A new chapter arrives as new `chapterData`, which restarts the wait.
  }, [books, chapterData, recordReading])

  const handleNavigate = useCallback(
    (newBookId: string, newChapter: number) => {
      setPosition(newBookId, newChapter)
    },
    [setPosition],
  )

  function openDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(drawerWidth, springConfig)
  }

  function closeDrawer() {
    setPanelOpen(false)
    slideX.value = withSpring(0, springConfig)
  }

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        .onStart(() => {
          startX.value = slideX.value
        })
        .onUpdate((e) => {
          slideX.value = clamp(startX.value + e.translationX, 0, drawerWidth)
        })
        .onEnd((e) => {
          // Closing is easy: any meaningful drag or flick back snaps shut.
          const closing = startX.value > 0 && (e.translationX < -20 || e.velocityX < -300)
          // Opening asks for more commitment.
          const opening = slideX.value > drawerWidth * 0.4 || e.velocityX > 800
          const open = !closing && opening
          slideX.value = withSpring(open ? drawerWidth : 0, springConfig)
          runOnJS(setPanelOpen)(open)
        }),
    [slideX, startX, drawerWidth],
  )

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -drawerWidth + slideX.value }],
  }))

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideX.value, [0, drawerWidth], [1, 0.4]),
  }))

  function renderContent() {
    if (booksError || chapterError) {
      return (
        <ReaderErrorState
          onRetry={() => {
            if (booksError) refetchBooks()
            if (chapterError) refetchChapter()
          }}
        />
      )
    }
    if (isLoading) {
      return <PrayerSpinner />
    }
    if (!chapterData) return undefined
    return (
      <>
        <View
          onLayout={(e) => {
            chapterTop.current = e.nativeEvent.layout.y
          }}
        >
          <ChapterContent
            bookName={bookName}
            chapter={chapter}
            verses={chapterData.verses}
            fallback={chapterData.fallback}
            marked={marked}
            onVersePress={handleVersePress}
          />
        </View>
        <ChapterNav bookId={bookId} chapter={chapter} books={books} onNavigate={handleNavigate} />
      </>
    )
  }

  return (
    <View flex={1} backgroundColor="$background" overflow="hidden">
      {readingConfigVisible ? (
        <ReadingConfigModal
          visible={readingConfigVisible}
          onClose={() => setReadingConfigVisible(false)}
        />
      ) : undefined}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.strip, { width: stripWidth }, stripStyle]}>
          <View style={styles.drawer}>
            <BibleDrawer
              width={drawerWidth}
              open={panelOpen}
              books={books}
              bookId={bookId}
              chapter={chapter}
              onNavigate={(newBookId, newChapter) => {
                handleNavigate(newBookId, newChapter)
                closeDrawer()
              }}
              onOpenReadingConfig={() => setReadingConfigVisible(true)}
            />
          </View>

          <Animated.View style={[{ width: screenWidth }, dimStyle]}>
            <View flex={1}>
              {/* The page scrolls here and not in ScreenLayout, so a tapped
                verse can be brought up clear of the commentary below it. */}
              <ScreenLayout scroll={false} modal>
                <ScrollView
                  ref={scrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: commentedVerse === undefined ? bottomClearance : 24,
                  }}
                >
                  <YStack flex={1}>
                    <TwoColumnReaderHeader
                      variant="plain"
                      leftLabel={bookName}
                      rightValue={String(chapter)}
                      onLeftPress={openDrawer}
                      onRightPress={openDrawer}
                      leftA11yLabel={t('a11y.selectBook')}
                      rightA11yLabel={t('a11y.selectChapter')}
                    />
                    {renderContent()}
                  </YStack>
                </ScrollView>
              </ScreenLayout>
            </View>
            {commentedVerse !== undefined ? (
              <CommentaryPane
                chapter={chapter}
                verse={commentedVerse}
                commentary={commentary}
                initialHeight={paneHeight}
                maxHeight={Math.round(screenHeight * 0.8)}
                onResize={setPaneHeight}
                onClose={closeCommentary}
                onReadOn={openVersePage}
              />
            ) : undefined}
            {panelOpen ? (
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeDrawer}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.closeModal')}
              />
            ) : undefined}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    flexDirection: 'row',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(128,128,128,0.3)',
  },
})
