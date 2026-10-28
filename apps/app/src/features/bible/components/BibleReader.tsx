import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
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
import {
  useBooks,
  useChapter,
  useChapterCommentary,
  usePrefetchAdjacentChapters,
  useVersePane,
} from '../hooks'
import { isReferenceKind } from '../references'
import { BibleDrawer } from './BibleDrawer'
import { ChapterContent } from './ChapterContent'
import { ChapterNav } from './ChapterNav'
import { VersePane } from './VersePane'
import { paneFraction } from './VersePaneContent'

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }
const noBooks: Book[] = []
// How long a chapter stays open before it counts as read, so that leafing
// through the drawer to look something up moves no place.
const readingDwellMs = 20_000
// Where a tapped verse comes to rest below the top of the page, so the line
// before it stays in view.
const verseRestOffset = 72

type Place = { bookId: string; chapter: number; verse: number }

export function BibleReader({ initialDrawerOpen = false }: { initialDrawerOpen?: boolean }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const bottomClearance = useBottomClearance()
  const drawerWidth = Math.min(screenWidth * 0.8, 360)
  const stripWidth = drawerWidth + screenWidth

  const translation = usePreferencesStore((s) => s.translation)
  const { bookId, chapter, setPosition, recordReading } = useBibleStore()

  const slideX = useSharedValue(initialDrawerOpen ? drawerWidth : 0)
  const startX = useSharedValue(0)
  const [panelOpen, setPanelOpen] = useState(initialDrawerOpen)
  const [readingConfigVisible, setReadingConfigVisible] = useState(false)

  // The verse the lower half is open on; none, and the page is whole.
  const [commentedVerse, setCommentedVerse] = useState<number>()
  const [paneHeight, setPaneHeight] = useState(Math.round(screenHeight * paneFraction))
  const scrollRef = useRef<ScrollView>(null)
  const chapterTop = useRef(0)
  const verseTops = useRef(new Map<number, number>())
  // A verse of another chapter to open once that chapter is on the page, and
  // the verse to keep bringing into view while that chapter settles: a verse
  // is laid out more than once, as the lines above it are broken.
  const arriving = useRef<number | undefined>(undefined)
  const unrevealed = useRef<number | undefined>(undefined)
  // The places citations were followed from, the last one first to go back to.
  const [trail, setTrail] = useState<Place[]>([])
  const commentary = useChapterCommentary(bookId, chapter, commentedVerse !== undefined)
  const pane = useVersePane(bookId, chapter, commentedVerse, commentary)
  const closeCommentary = useCallback(() => setCommentedVerse(undefined), [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new chapter is the trigger
  useEffect(() => {
    const verse = arriving.current
    arriving.current = undefined
    unrevealed.current = verse
    setCommentedVerse(verse)
    // A chapter turned to by hand leaves the trail of citations behind.
    if (verse === undefined) setTrail([])
    scrollRef.current?.scrollTo({ y: 0, animated: false })
    const settled = setTimeout(() => {
      unrevealed.current = undefined
    }, 2000)
    return () => clearTimeout(settled)
  }, [bookId, chapter])

  const marked = (() => {
    if (commentedVerse === undefined) return undefined
    // Only a commentator speaks of a passage; what cites a verse is listed by the verse.
    const span = isReferenceKind(pane.kind)
      ? undefined
      : spanForVerse(commentary.bySource[pane.kind] ?? [], commentedVerse)
    return {
      verse: commentedVerse,
      from: span?.from ?? commentedVerse,
      to: span?.to ?? commentedVerse,
    }
  })()

  function reveal(y: number) {
    scrollRef.current?.scrollTo({ y: Math.max(0, chapterTop.current + y - verseRestOffset) })
  }

  function handleVersePress(verse: number, y: number) {
    if (verse === commentedVerse) {
      closeCommentary()
      return
    }
    unrevealed.current = undefined
    setCommentedVerse(verse)
    reveal(y)
  }

  function handleVerseLayout(verse: number, y: number) {
    verseTops.current.set(verse, y)
    if (unrevealed.current === verse) reveal(y)
  }

  function turnTo(place: Place) {
    if (place.bookId === bookId && place.chapter === chapter) {
      setCommentedVerse(place.verse)
      const y = verseTops.current.get(place.verse)
      if (y !== undefined) reveal(y)
      return
    }
    arriving.current = place.verse
    setPosition(place.bookId, place.chapter)
  }

  function followCitation(place: Place) {
    if (commentedVerse !== undefined) {
      setTrail([{ bookId, chapter, verse: commentedVerse }, ...trail])
    }
    turnTo(place)
  }

  function goBack() {
    const [last, ...earlier] = trail
    if (!last) return
    setTrail(earlier)
    turnTo(last)
  }

  function readOn(source: string) {
    if (commentedVerse === undefined) return
    router.push({
      pathname: '/bible/verse',
      params: { bookId, chapter: String(chapter), verse: String(commentedVerse), source },
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
  const cameFrom = (() => {
    const [last] = trail
    if (!last) return undefined
    const name = t(`bookName.${last.bookId}`, {
      defaultValue: books.find((b) => b.id === last.bookId)?.name ?? last.bookId,
    })
    return `${name} ${last.chapter}:${last.verse}`
  })()

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

  // On iOS the pane is a sheet over the page, not a part of it: the page keeps
  // its height, and its drawer swipe never starts under the sheet.
  const paneInPage = Platform.OS !== 'ios'
  const paneReach = commentedVerse === undefined || !paneInPage ? 0 : paneHeight
  // What the chapter's last verses must clear to be read with the pane open.
  const openFoot = paneInPage ? 24 : Math.round(screenHeight * paneFraction) + 24
  const pageHeight = useSharedValue(screenHeight)
  const paneReachPx = useSharedValue(0)
  useEffect(() => {
    paneReachPx.value = paneReach
  }, [paneReach, paneReachPx])
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        // The lower half has a line and pages of its own to slide sideways:
        // a touch that lands there is not for the drawer. Refused as it
        // lands, since a pan that has begun takes the touch from the
        // scrolling under it whether or not it ever opens anything.
        .onTouchesDown((e, state) => {
          if (e.allTouches[0].y > pageHeight.value - paneReachPx.value) state.fail()
        })
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
    [slideX, startX, drawerWidth, pageHeight, paneReachPx],
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
            onVerseLayout={handleVerseLayout}
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
        <Animated.View
          style={[styles.strip, { width: stripWidth }, stripStyle]}
          onLayout={(e) => {
            pageHeight.value = e.nativeEvent.layout.height
          }}
        >
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
                    paddingBottom: commentedVerse === undefined ? bottomClearance : openFoot,
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
            <VersePane
              bookId={bookId}
              bookName={bookName}
              chapter={chapter}
              verse={commentedVerse}
              commentary={commentary}
              pane={pane}
              initialHeight={paneHeight}
              maxHeight={Math.round(screenHeight * 0.8)}
              cameFrom={cameFrom}
              onResize={setPaneHeight}
              onClose={closeCommentary}
              onReadOn={readOn}
              onOpenPlace={(toBook, toChapter, verse) =>
                followCitation({ bookId: toBook, chapter: toChapter, verse })
              }
              onReturn={goBack}
            />
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
