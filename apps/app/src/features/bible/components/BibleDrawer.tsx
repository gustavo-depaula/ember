import { useQueries } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Type } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  type ScrollView as RNScrollView,
  type View as RNView,
  StyleSheet,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, useTheme, View, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { findTranslation, type Translation, translationsFor } from '@/lib/bibleTranslations'
import { type Book, getChapter } from '@/lib/content'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { type CanonDivisionId, canonDivisions, divisionOfBook, divisionStartingAt } from '../canon'
import type { BiblePlace } from '../recents'

const chaptersPerRow = 5
const indexWidth = 40
// The floating tab bar sits over the foot of the drawer.
const tabBarClearance = 120
const ribbonColors = ['$colorBurgundy', '$accent', '$colorGreen'] as const

/**
 * The Bible's one drawer: its title, the places last read, and every book with
 * its chapters, an index of the canon's divisions down the edge. The title
 * slides the drawer across to the editions.
 */
export function BibleDrawer({
  width,
  open,
  books,
  bookId,
  chapter,
  onNavigate,
  onOpenReadingConfig,
}: {
  width: number
  open: boolean
  books: Book[]
  bookId: string
  chapter: number
  onNavigate: (bookId: string, chapter: number) => void
  onOpenReadingConfig: () => void
}) {
  const insets = useSafeAreaInsets()
  const [panel, setPanel] = useState<'books' | 'editions'>('books')
  const slide = useSharedValue(0)

  // A closed drawer reopens on its books.
  useEffect(() => {
    if (!open) setPanel('books')
  }, [open])

  useEffect(() => {
    slide.value = withTiming(panel === 'editions' ? -width : 0, { duration: 260 })
  }, [panel, width, slide])

  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value }] }))

  return (
    <View width={width} overflow="hidden" paddingTop={insets.top + 12}>
      <Animated.View style={[styles.panels, { width: width * 2 }, slideStyle]}>
        <View width={width}>
          <BooksPanel
            open={open}
            books={books}
            bookId={bookId}
            chapter={chapter}
            onNavigate={onNavigate}
            onOpenEditions={() => setPanel('editions')}
            onOpenReadingConfig={onOpenReadingConfig}
          />
        </View>
        <View width={width}>
          <EditionsPanel
            visible={panel === 'editions'}
            bookId={bookId}
            chapter={chapter}
            onBack={() => setPanel('books')}
          />
        </View>
      </Animated.View>
    </View>
  )
}

function BooksPanel({
  open,
  books,
  bookId,
  chapter,
  onNavigate,
  onOpenEditions,
  onOpenReadingConfig,
}: {
  open: boolean
  books: Book[]
  bookId: string
  chapter: number
  onNavigate: (bookId: string, chapter: number) => void
  onOpenEditions: () => void
  onOpenReadingConfig: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const translation = usePreferencesStore((s) => s.translation)
  const places = useBibleStore((s) => s.places)
  const [openBook, setOpenBook] = useState<string | undefined>(bookId)
  const [division, setDivision] = useState<CanonDivisionId | undefined>()
  const scrollRef = useRef<RNScrollView>(null)
  const divisionTops = useRef(new Map<CanonDivisionId, number>())
  const bookTops = useRef(new Map<string, number>())

  // The drawer opens on the book being read, wherever it stands in the canon.
  // A jump without animation reports no scroll, so the index is told directly.
  function showBook(y: number) {
    scrollRef.current?.scrollTo({ y, animated: false })
    setDivision(
      divisionOfBook(
        bookId,
        books.map((b) => b.id),
      ),
    )
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the drawer opens or the book changes, not when showBook is re-created
  useEffect(() => {
    const y = bookTops.current.get(bookId)
    if (open && y !== undefined) showBook(y)
  }, [open, bookId])

  function scrollToDivision(id: CanonDivisionId) {
    const y = divisionTops.current.get(id)
    if (y === undefined) return
    scrollRef.current?.scrollTo({ y, animated: false })
    setDivision(id)
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y + 24
    const current = canonDivisions.findLast((d) => (divisionTops.current.get(d.id) ?? 0) <= y)
    if (current && current.id !== division) setDivision(current.id)
  }

  return (
    <YStack flex={1}>
      <XStack alignItems="center" paddingLeft="$md" paddingRight="$sm" paddingBottom="$sm">
        <Pressable
          onPress={onOpenEditions}
          style={styles.title}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.selectTranslation')}
        >
          <Typography variant="section-title" numberOfLines={1} flexShrink={1}>
            {findTranslation(translation)?.name ?? translation}
          </Typography>
          <ChevronRight size={18} color={theme.colorSecondary.val} />
        </Pressable>
        <Pressable
          onPress={onOpenReadingConfig}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={t('readingConfig.reading')}
        >
          <Type size={18} color={theme.colorSecondary.val} />
        </Pressable>
      </XStack>

      <PlaceList places={places} books={books} onNavigate={onNavigate} />

      <View flex={1}>
        <ScrollView
          ref={scrollRef}
          flex={1}
          onScroll={handleScroll}
          scrollEventThrottle={64}
          showsVerticalScrollIndicator={false}
        >
          <YStack paddingLeft="$md" paddingRight={indexWidth} paddingBottom={tabBarClearance}>
            {books.map((book) => {
              const startsDivision = divisionStartingAt(book.id)
              const isOpen = book.id === openBook
              const name = t(`bookName.${book.id}`, { defaultValue: book.name })
              return (
                <YStack
                  key={book.id}
                  onLayout={(e: LayoutChangeEvent) => {
                    const { y } = e.nativeEvent.layout
                    if (startsDivision) divisionTops.current.set(startsDivision, y)
                    // The first layout is also the first chance to show the book in hand.
                    if (book.id === bookId && !bookTops.current.has(book.id)) showBook(y)
                    bookTops.current.set(book.id, y)
                  }}
                >
                  {startsDivision ? (
                    <Typography
                      variant="label"
                      fontSize="$1"
                      letterSpacing={2}
                      textTransform="uppercase"
                      color="$colorBurgundy"
                      paddingTop="$md"
                      paddingBottom="$xs"
                    >
                      {t(`bible.divisions.${startsDivision}`)}
                    </Typography>
                  ) : undefined}
                  <Pressable
                    onPress={() => setOpenBook(isOpen ? undefined : book.id)}
                    style={styles.bookRow}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    accessibilityState={{ expanded: isOpen }}
                    aria-expanded={isOpen}
                  >
                    <Typography
                      variant="sacred-title"
                      fontSize="$3"
                      textAlign="left"
                      tone={isOpen || book.id === bookId ? 'default' : 'muted'}
                    >
                      {name}
                    </Typography>
                  </Pressable>
                  {isOpen ? (
                    <ChapterGrid
                      chapters={book.chapters}
                      current={book.id === bookId ? chapter : undefined}
                      onSelect={(n) => onNavigate(book.id, n)}
                    />
                  ) : undefined}
                </YStack>
              )
            })}
          </YStack>
        </ScrollView>
        <DivisionIndex current={division} onSelect={scrollToDivision} />
      </View>
    </YStack>
  )
}

function ChapterGrid({
  chapters,
  current,
  onSelect,
}: {
  chapters: number
  current?: number
  onSelect: (chapter: number) => void
}) {
  const { t } = useTranslation()
  return (
    <XStack flexWrap="wrap" paddingBottom="$sm">
      {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => {
        const isCurrent = n === current
        return (
          <Pressable
            key={n}
            onPress={() => onSelect(n)}
            style={styles.chapterCell}
            accessibilityRole="button"
            accessibilityLabel={t('bible.chapterAbbr', { n })}
            accessibilityState={{ selected: isCurrent }}
            aria-selected={isCurrent}
          >
            <View
              width={38}
              height={38}
              borderRadius={8}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isCurrent ? '$color' : 'transparent'}
            >
              <Typography
                fontSize="$3"
                fontVariant={['tabular-nums']}
                color={isCurrent ? '$background' : '$color'}
              >
                {n}
              </Typography>
            </View>
          </Pressable>
        )
      })}
    </XStack>
  )
}

// The canon's divisions down the drawer's edge: tap one to go there, or run a
// thumb along it to move through the whole Bible.
function DivisionIndex({
  current,
  onSelect,
}: {
  current?: CanonDivisionId
  onSelect: (id: CanonDivisionId) => void
}) {
  const { t } = useTranslation()
  const ref = useRef<RNView>(null)
  const box = useRef({ top: 0, height: 1 })

  function measure() {
    ref.current?.measureInWindow((_x, y, _w, height) => {
      box.current = { top: y, height: height || 1 }
    })
  }

  function selectAt(e: GestureResponderEvent) {
    const ratio = (e.nativeEvent.pageY - box.current.top) / box.current.height
    const index = Math.min(
      canonDivisions.length - 1,
      Math.max(0, Math.floor(ratio * canonDivisions.length)),
    )
    onSelect(canonDivisions[index].id)
  }

  return (
    <View
      ref={ref}
      onLayout={measure}
      position="absolute"
      top={0}
      bottom={0}
      right={0}
      width={indexWidth}
      paddingVertical="$sm"
      justifyContent="space-between"
      onMoveShouldSetResponder={() => true}
      onResponderGrant={measure}
      onResponderMove={selectAt}
    >
      {canonDivisions.map((d) => (
        <Pressable
          key={d.id}
          onPress={() => onSelect(d.id)}
          style={styles.indexItem}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={t(`bible.divisions.${d.id}`)}
        >
          <Typography
            variant="label"
            fontSize={9}
            letterSpacing={0.6}
            textTransform="uppercase"
            color={d.id === current ? '$colorBurgundy' : '$colorSecondary'}
          >
            {t(`bible.divisionAbbr.${d.id}`)}
          </Typography>
        </Pressable>
      ))}
    </View>
  )
}

function Ribbon({ index }: { index: number }) {
  const theme = useTheme()
  const token = ribbonColors[index % ribbonColors.length]
  const color = theme[token.slice(1) as 'accent']?.val
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      width={9}
      alignItems="center"
    >
      <View width={9} height={13} backgroundColor={token} />
      {/* The swallowtail: two slanted halves leave a notch between them. */}
      <View
        width={0}
        height={0}
        borderLeftWidth={4.5}
        borderRightWidth={4.5}
        borderBottomWidth={5}
        borderLeftColor={color}
        borderRightColor={color}
        borderBottomColor="transparent"
      />
    </View>
  )
}

function PlaceList({
  places,
  books,
  onNavigate,
}: {
  places: BiblePlace[]
  books: Book[]
  onNavigate: (bookId: string, chapter: number) => void
}) {
  const { t } = useTranslation()
  if (places.length === 0) return undefined

  return (
    <YStack
      paddingHorizontal="$md"
      paddingBottom="$sm"
      borderBottomWidth={StyleSheet.hairlineWidth}
      borderBottomColor="$borderColor"
    >
      {places.map((place) => {
        const book = books.find((b) => b.id === place.bookId)
        const label = `${t(`bookName.${place.bookId}`, { defaultValue: book?.name ?? place.bookId })} ${place.chapter}`
        return (
          <Pressable
            key={place.bookId}
            onPress={() => onNavigate(place.bookId, place.chapter)}
            style={styles.placeRow}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.resumeReading', { place: label })}
          >
            <Ribbon index={place.ribbon} />
            <Typography flex={1} fontSize="$3" numberOfLines={1}>
              {label}
            </Typography>
          </Pressable>
        )
      })}
    </YStack>
  )
}

function EditionsPanel({
  visible,
  bookId,
  chapter,
  onBack,
}: {
  visible: boolean
  bookId: string
  chapter: number
  onBack: () => void
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const translation = usePreferencesStore((s) => s.translation)
  const setTranslation = usePreferencesStore((s) => s.setTranslation)

  const offered = translationsFor(i18n.language, Platform.OS === 'web')

  // Each edition shows how it opens the chapter in hand, so it is chosen by
  // reading it. Same key as the reader's own query: picking one costs no fetch.
  const specimens = useQueries({
    queries: offered.map((tr) => ({
      queryKey: ['chapter', tr.code, bookId, chapter],
      queryFn: () => getChapter(tr.code, bookId, chapter),
      enabled: visible,
    })),
  })

  const languages = [...new Set(offered.map((tr) => tr.language))]

  function renderEdition(tr: Translation) {
    const selected = tr.code === translation
    const specimen = specimens[offered.indexOf(tr)]?.data
    return (
      <Pressable
        key={tr.code}
        onPress={() => {
          setTranslation(tr.code)
          onBack()
        }}
        accessibilityRole="radio"
        accessibilityLabel={tr.name}
        accessibilityState={{ selected }}
        aria-checked={selected}
      >
        <YStack
          paddingVertical="$sm"
          gap={2}
          borderBottomWidth={StyleSheet.hairlineWidth}
          borderBottomColor="$borderColor"
        >
          <XStack alignItems="baseline" justifyContent="space-between" gap="$sm">
            <Typography
              variant="sacred-title"
              fontSize="$3"
              textAlign="left"
              flexShrink={1}
              tone={selected ? 'default' : 'muted'}
            >
              {tr.name}
              {selected ? <Typography color="$accent"> ✠</Typography> : undefined}
            </Typography>
            {tr.corpus ? undefined : (
              <Typography variant="caption">{t('bible.editionOnline')}</Typography>
            )}
          </XStack>
          <Typography variant="annotation">{tr.description}</Typography>
          {specimen && !specimen.fallback && specimen.verses[0] ? (
            <Typography
              fontSize="$2"
              numberOfLines={3}
              paddingTop={2}
              tone={selected ? 'default' : 'muted'}
            >
              {specimen.verses[0].text}
            </Typography>
          ) : undefined}
        </YStack>
      </Pressable>
    )
  }

  return (
    <YStack flex={1}>
      <Pressable
        onPress={onBack}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.backToBooks')}
      >
        <ChevronLeft size={20} color={theme.colorSecondary.val} />
        <Typography variant="section-title">{t('bible.editions')}</Typography>
      </Pressable>
      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <YStack paddingHorizontal="$md" paddingBottom={tabBarClearance}>
          {languages.map((language) => (
            <YStack key={language} accessibilityRole="radiogroup">
              <Typography
                variant="label"
                fontSize="$1"
                letterSpacing={2}
                textTransform="uppercase"
                color="$colorBurgundy"
                paddingTop="$md"
              >
                {t(`bible.editionLanguages.${language}`)}
              </Typography>
              {offered.filter((tr) => tr.language === language).map(renderEdition)}
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

const styles = StyleSheet.create({
  panels: { flex: 1, flexDirection: 'row' },
  title: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  bookRow: { minHeight: 44, justifyContent: 'center' },
  chapterCell: {
    width: `${100 / chaptersPerRow}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexItem: { alignItems: 'center', justifyContent: 'center', minHeight: 24 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
})
