import { ChevronLeft, X } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { useBibleStore } from '@/stores/bibleStore'

import {
  type CommentarySource,
  entriesForVerse,
  excerpt,
  readingMinutes,
  spanForVerse,
  spanLabel,
} from '../commentary'
import { type useChapterCommentary, useEntryVoices, type VersePaneState } from '../hooks'
import { isReferenceKind } from '../references'
import { CommentaryVoices } from './CommentaryVoices'
import { VerseReferenceList } from './VerseReferences'

/** How much of the screen the half page takes where it opens. */
export const paneFraction = 0.46

/** What the half page shows and does, whatever frame it is set in. */
export type VersePaneProps = {
  bookId: string
  bookName: string
  chapter: number
  /** The verse it is open on; none, and it is closed. */
  verse: number | undefined
  commentary: ReturnType<typeof useChapterCommentary>
  pane: VersePaneState
  /** Where it opens, and how far it may be drawn up, where it is drawn by hand. */
  initialHeight: number
  maxHeight: number
  /** The place a citation was followed from, to go back to. */
  cameFrom?: string
  /** The height the reader left it at, to open at next time. */
  onResize: (height: number) => void
  onClose: () => void
  onReadOn: (sourceId: string) => void
  onOpenPlace: (bookId: string, chapter: number, verse: number) => void
  onReturn: () => void
}

// About what fills the half page at the default size; more than that is read
// on a page of its own.
const excerptBudget = 700

/** What one commentator says of the verse: its opening, and the way to the rest. */
function Commentary({
  source,
  verse,
  commentary,
  onReadOn,
}: {
  source: CommentarySource
  verse: number
  commentary: ReturnType<typeof useChapterCommentary>
  onReadOn: (sourceId: string) => void
}) {
  const { t } = useTranslation()
  const { bySource } = commentary
  const entries = entriesForVerse(bySource[source.id] ?? [], verse)
  const words = useEntryVoices(entries)
  const voices = words.byEntry.flat()
  const span = spanForVerse(bySource[source.id] ?? [], verse)

  if (commentary.error ?? words.error) {
    return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  }
  if (commentary.isLoading || words.isLoading) return <PrayerSpinner />
  // A lecture with no Father named in it: the line offered it, so say so.
  if (voices.length === 0) {
    return (
      <Typography variant="caption" fontSize="$3">
        {t('bible.commentary.silent', { source: source.name, verse })}
      </Typography>
    )
  }
  const shown = excerpt(voices, excerptBudget)
  const readOn = t('bible.commentary.readOn', { count: readingMinutes(voices) })
  return (
    <YStack gap="$md">
      {span && span.from !== span.to ? (
        <Typography variant="label" fontSize="$1" color="$colorBurgundy" letterSpacing={1.5}>
          {t('bible.commentary.together', { verses: spanLabel(span) }).toUpperCase()}
        </Typography>
      ) : undefined}
      <CommentaryVoices voices={shown.voices} />
      {shown.cut ? (
        <Pressable
          onPress={() => onReadOn(source.id)}
          hitSlop={12}
          accessibilityRole="link"
          accessibilityLabel={readOn}
        >
          <Typography variant="caption" fontSize="$3" color="$colorBurgundy">
            {readOn}
          </Typography>
        </Pressable>
      ) : undefined}
    </YStack>
  )
}

/** The half page's bar: the verse it is open on, the passage its commentator speaks of, and the way out. */
export function PaneBar({
  bookName,
  chapter,
  verse,
  commentary,
  pane,
  onClose,
}: Pick<VersePaneProps, 'bookName' | 'chapter' | 'commentary' | 'pane' | 'onClose'> & {
  verse: number
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const source = commentary.sources.find((s) => s.id === pane.kind)
  const span = source ? spanForVerse(commentary.bySource[source.id] ?? [], verse) : undefined
  return (
    <XStack alignItems="center" justifyContent="space-between" gap="$sm" minHeight={40}>
      <Typography variant="section-title">{`${bookName} ${chapter}:${verse}`}</Typography>
      <XStack alignItems="center" gap="$md">
        {span && span.from !== span.to ? (
          <Typography variant="label" fontSize="$1" color="$colorBurgundy">
            {`${chapter}:${spanLabel(span)}`}
          </Typography>
        ) : undefined}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.closeCommentary')}
        >
          <X size={18} color={theme.colorSecondary.val} />
        </Pressable>
      </XStack>
    </XStack>
  )
}

/**
 * The line of kinds and, under it, a page to each: everything on the verse, a
 * kind at a time. A tap on the line or a swipe across the page turns to
 * another kind, and the kind chosen stays as the reader moves from verse to
 * verse.
 */
export function PaneKinds({
  bookId,
  chapter,
  verse,
  commentary,
  pane,
  cameFrom,
  bottomPadding,
  onReadOn,
  onOpenPlace,
  onReturn,
}: Pick<
  VersePaneProps,
  | 'bookId'
  | 'chapter'
  | 'commentary'
  | 'pane'
  | 'cameFrom'
  | 'onReadOn'
  | 'onOpenPlace'
  | 'onReturn'
> & {
  verse: number
  /** What the last line must clear at the foot of the frame. */
  bottomPadding: number
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const setKind = useBibleStore((s) => s.setPaneKind)
  const { references, kind, kinds } = pane
  const { sources } = commentary
  const tabs = kinds.map((id) => {
    const commentator = sources.find((s) => s.id === id)
    if (commentator) return { id, label: commentator.name, count: undefined }
    return {
      id,
      label: t(`bible.kinds.${id}`),
      // Every verse has its other editions: a count of them would say nothing.
      count: isReferenceKind(id) && id !== 'translations' ? references.counts[id] : undefined,
    }
  })

  // The kind in hand is brought onto the line's visible stretch: it may be
  // the last of eight, chosen on another verse.
  const lineRef = useRef<ScrollView>(null)
  const tabLefts = useRef(new Map<string, number>())
  function showOnLine(id: string) {
    const left = tabLefts.current.get(id)
    if (left !== undefined) lineRef.current?.scrollTo({ x: Math.max(0, left - 72) })
  }

  // The pages follow the kind in hand: it changes under them when a tab is
  // tapped, and its place among them when a verse has other kinds to show.
  const pagesRef = useRef<ScrollView>(null)
  const page = kinds.indexOf(kind)
  function turnToPage() {
    pagesRef.current?.scrollTo({ x: page * width, animated: false })
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: the kind's page is the trigger
  useEffect(() => {
    showOnLine(kind)
    turnToPage()
  }, [kind, page, width])

  function onPageSettled(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const settled = kinds[Math.round(e.nativeEvent.contentOffset.x / width)]
    if (settled && settled !== kind) setKind(settled)
  }

  return (
    <YStack flex={1}>
      <View borderBottomWidth={1} borderBottomColor="$borderColor">
        <ScrollView
          ref={lineRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 20 }}
          accessibilityRole="tablist"
        >
          {tabs.map((tab) => {
            const selected = tab.id === kind
            return (
              <Pressable
                key={tab.id}
                onLayout={(e) => {
                  tabLefts.current.set(tab.id, e.nativeEvent.layout.x)
                  if (selected) showOnLine(tab.id)
                }}
                onPress={() => setKind(tab.id)}
                accessibilityRole="tab"
                accessibilityLabel={
                  tab.count ? t('a11y.verseKind', { name: tab.label, count: tab.count }) : tab.label
                }
                accessibilityState={{ selected }}
                aria-selected={selected}
              >
                <XStack
                  minHeight={40}
                  alignItems="center"
                  gap={6}
                  borderBottomWidth={2}
                  borderBottomColor={selected ? '$colorBurgundy' : 'transparent'}
                >
                  <Typography
                    variant="label"
                    fontSize="$1"
                    letterSpacing={1.5}
                    color={selected ? '$colorBurgundy' : '$color'}
                  >
                    {tab.label.toUpperCase()}
                  </Typography>
                  {tab.count ? (
                    <Typography
                      variant="annotation"
                      fontSize="$1"
                      marginLeft={4}
                      color={selected ? '$colorBurgundy' : '$colorSecondary'}
                    >
                      {tab.count}
                    </Typography>
                  ) : undefined}
                </XStack>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
      {cameFrom ? (
        <Pressable
          onPress={onReturn}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.backToPlace', { place: cameFrom })}
        >
          <XStack alignItems="center" gap="$xs" minHeight={36} paddingHorizontal={24}>
            <ChevronLeft size={16} color={theme.colorSecondary.val} />
            <Typography variant="annotation" fontSize="$2">
              {cameFrom}
            </Typography>
          </XStack>
        </Pressable>
      ) : undefined}
      <ScrollView
        ref={pagesRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: page * width, y: 0 }}
        onContentSizeChange={turnToPage}
        onMomentumScrollEnd={onPageSettled}
      >
        {kinds.map((id, i) => {
          const source = sources.find((s) => s.id === id)
          // The page in hand and the one to either side, so a swipe has
          // something to show; the rest are read when they are turned to.
          const near = Math.abs(i - page) <= 1
          return (
            <ScrollView
              // A new verse opens at its beginning, not where the last was left.
              key={`${bookId}-${chapter}-${verse}-${id}`}
              style={{ width }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: bottomPadding,
              }}
            >
              {near && isReferenceKind(id) ? (
                <VerseReferenceList
                  kind={id}
                  bookId={bookId}
                  chapter={chapter}
                  verse={verse}
                  references={references}
                  onOpenPlace={onOpenPlace}
                />
              ) : undefined}
              {near && source ? (
                <Commentary
                  source={source}
                  verse={verse}
                  commentary={commentary}
                  onReadOn={onReadOn}
                />
              ) : undefined}
            </ScrollView>
          )
        })}
      </ScrollView>
    </YStack>
  )
}
