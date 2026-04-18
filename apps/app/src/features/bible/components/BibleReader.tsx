import { useRouter } from 'expo-router'
import { Home } from 'lucide-react-native'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, YStack } from 'tamagui'

import {
  PrayerSpinner,
  ReaderErrorState,
  ReadingConfigBadge,
  ReadingConfigModal,
  ScreenLayout,
} from '@/components'
import type { Book } from '@/lib/content'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { useBooks, useChapter, usePrefetchAdjacentChapters } from '../hooks'
import { ChapterContent } from './ChapterContent'
import { ChapterNav } from './ChapterNav'
import { ReaderHeader } from './ReaderHeader'
import { TranslationBadge } from './TranslationBadge'
import { TranslationModal } from './TranslationModal'

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }

export function BibleReader() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  const bookDrawerWidth = Math.min(screenWidth * 0.7, 340)
  const chapterDrawerWidth = Math.min(screenWidth * 0.22, 80)
  const stripWidth = bookDrawerWidth + screenWidth + chapterDrawerWidth

  const insets = useSafeAreaInsets()
  const translation = usePreferencesStore((s) => s.translation)
  const { bookId, chapter, setPosition } = useBibleStore()

  const slideX = useSharedValue(0)
  const startX = useSharedValue(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const [translationModalVisible, setTranslationModalVisible] = useState(false)
  const [readingConfigVisible, setReadingConfigVisible] = useState(false)

  const { data: books = [], isError: booksError, refetch: refetchBooks } = useBooks(translation)
  const {
    data: chapterData,
    isLoading,
    isError: chapterError,
    refetch: refetchChapter,
  } = useChapter(translation, bookId, chapter)
  usePrefetchAdjacentChapters(translation, bookId, chapter, books)

  const currentBook = books.find((b) => b.id === bookId)
  const bookName = t(`bookName.${bookId}`, { defaultValue: currentBook?.name ?? bookId })
  const totalChapters = currentBook?.chapters ?? 1

  const handleNavigate = useCallback(
    (newBookId: string, newChapter: number) => {
      setPosition(newBookId, newChapter)
    },
    [setPosition],
  )

  function openBookDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(bookDrawerWidth, springConfig)
  }

  function openChapterDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(-chapterDrawerWidth, springConfig)
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
          const min = startX.value > 0 ? 0 : -chapterDrawerWidth
          const max = startX.value < 0 ? 0 : bookDrawerWidth
          slideX.value = clamp(startX.value + e.translationX, min, max)
        })
        .onEnd((e) => {
          const closingFromBook = startX.value > 0
          const closingFromChapter = startX.value < 0

          // Closing is easy — any meaningful drag or flick in the close direction snaps shut
          if (closingFromBook && (e.translationX < -20 || e.velocityX < -300)) {
            slideX.value = withSpring(0, springConfig)
            runOnJS(setPanelOpen)(false)
            return
          }
          if (closingFromChapter && (e.translationX > 20 || e.velocityX > 300)) {
            slideX.value = withSpring(0, springConfig)
            runOnJS(setPanelOpen)(false)
            return
          }

          // Opening requires more commitment
          if (slideX.value > bookDrawerWidth * 0.4 || (slideX.value > 0 && e.velocityX > 800)) {
            slideX.value = withSpring(bookDrawerWidth, springConfig)
            runOnJS(setPanelOpen)(true)
            return
          }
          if (
            slideX.value < -chapterDrawerWidth * 0.4 ||
            (slideX.value < 0 && e.velocityX < -800)
          ) {
            slideX.value = withSpring(-chapterDrawerWidth, springConfig)
            runOnJS(setPanelOpen)(true)
            return
          }

          slideX.value = withSpring(0, springConfig)
          runOnJS(setPanelOpen)(false)
        }),
    [slideX, startX, bookDrawerWidth, chapterDrawerWidth],
  )

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -bookDrawerWidth + slideX.value }],
  }))

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideX.value, [-chapterDrawerWidth, 0, bookDrawerWidth], [0.4, 1, 0.4]),
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
        <ChapterContent
          bookName={bookName}
          chapter={chapter}
          verses={chapterData.verses}
          fallback={chapterData.fallback}
        />
        <ChapterNav bookId={bookId} chapter={chapter} books={books} onNavigate={handleNavigate} />
      </>
    )
  }

  return (
    <View flex={1} backgroundColor="$background" overflow="hidden">
      {translationModalVisible ? (
        <TranslationModal
          visible={translationModalVisible}
          onClose={() => setTranslationModalVisible(false)}
        />
      ) : undefined}
      {readingConfigVisible ? (
        <ReadingConfigModal
          visible={readingConfigVisible}
          onClose={() => setReadingConfigVisible(false)}
        />
      ) : undefined}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.strip, { width: stripWidth }, stripStyle]}>
          {/* Book list */}
          <View style={[styles.bookPanel, { width: bookDrawerWidth }]}>
            <YStack flex={1} paddingTop={insets.top + 12}>
              <YStack paddingHorizontal="$md" paddingBottom="$md" gap="$sm">
                <TranslationBadge onPress={() => setTranslationModalVisible(true)} />
                <ReadingConfigBadge onPress={() => setReadingConfigVisible(true)} />
              </YStack>
              <BookList
                books={books}
                currentBookId={bookId}
                onSelectBook={(id) => {
                  handleNavigate(id, 1)
                  closeDrawer()
                }}
              />
            </YStack>
          </View>

          {/* Reading content */}
          <Animated.View style={[{ width: screenWidth }, dimStyle]}>
            <ScreenLayout>
              <YStack flex={1}>
                <ReaderHeader
                  bookName={bookName}
                  chapter={chapter}
                  onBookPress={openBookDrawer}
                  onChapterPress={openChapterDrawer}
                />
                <YStack alignItems="center">
                  <Pressable
                    onPress={() => router.push('/')}
                    hitSlop={12}
                    accessibilityRole="link"
                    accessibilityLabel={t('a11y.home')}
                  >
                    <Home size={20} color={theme.colorSecondary.val} />
                  </Pressable>
                </YStack>
                {renderContent()}
              </YStack>
            </ScreenLayout>
            {panelOpen ? (
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeDrawer}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.closeModal')}
              />
            ) : undefined}
          </Animated.View>

          {/* Chapter numbers */}
          <View style={[styles.chapterPanel, { width: chapterDrawerWidth }]}>
            <YStack flex={1} paddingTop={insets.top + 12}>
              <ChapterList
                totalChapters={totalChapters}
                currentChapter={chapter}
                onSelectChapter={(ch) => {
                  handleNavigate(bookId, ch)
                  closeDrawer()
                }}
              />
            </YStack>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

function BookList({
  books,
  currentBookId,
  onSelectBook,
}: {
  books: Book[]
  currentBookId: string
  onSelectBook: (bookId: string) => void
}) {
  const { t } = useTranslation()

  return (
    <ScrollView flex={1}>
      <YStack paddingBottom="$xl">
        {books.map((book) => {
          const isCurrent = book.id === currentBookId
          const name = t(`bookName.${book.id}`, { defaultValue: book.name })
          return (
            <Pressable
              key={book.id}
              onPress={() => onSelectBook(book.id)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(128,128,128,0.15)' : 'transparent',
              })}
              accessibilityRole="button"
              accessibilityLabel={name}
              accessibilityState={{ selected: isCurrent }}
            >
              <YStack paddingVertical={10} paddingHorizontal="$md">
                <Text
                  fontFamily="$body"
                  fontSize="$5"
                  fontWeight={isCurrent ? '600' : '400'}
                  color={isCurrent ? '$color' : '$colorSecondary'}
                >
                  {name}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </YStack>
    </ScrollView>
  )
}

function ChapterList({
  totalChapters,
  currentChapter,
  onSelectChapter,
}: {
  totalChapters: number
  currentChapter: number
  onSelectChapter: (chapter: number) => void
}) {
  return (
    <ScrollView flex={1}>
      <YStack paddingBottom="$xl" alignItems="center">
        {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => {
          const isCurrent = ch === currentChapter
          return (
            <Pressable
              key={ch}
              onPress={() => onSelectChapter(ch)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(128,128,128,0.15)' : 'transparent',
                width: '100%',
              })}
              accessibilityRole="button"
              accessibilityLabel={String(ch)}
              accessibilityState={{ selected: isCurrent }}
            >
              <YStack minHeight={44} justifyContent="center" alignItems="center">
                <Text
                  fontFamily="$heading"
                  fontSize="$5"
                  fontWeight={isCurrent ? '700' : '400'}
                  color={isCurrent ? '$accent' : '$colorSecondary'}
                >
                  {ch}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </YStack>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    flexDirection: 'row',
  },
  bookPanel: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(128,128,128,0.3)',
  },
  chapterPanel: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(128,128,128,0.3)',
  },
})
