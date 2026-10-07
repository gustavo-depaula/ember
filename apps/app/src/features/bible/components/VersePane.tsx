import { ChevronLeft, X } from 'lucide-react-native'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
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

/**
 * The lower half of the divided page: everything on the verse marked above,
 * a kind at a time. A line of kinds runs under the bar (the commentators,
 * then what cites the verse), and the kind chosen stays as the reader moves
 * from verse to verse. The bar drags to give either half more room; dragged
 * to the foot, it closes.
 */
export function VersePane({
  bookId,
  bookName,
  chapter,
  verse,
  commentary,
  pane,
  initialHeight,
  maxHeight,
  cameFrom,
  onResize,
  onClose,
  onReadOn,
  onOpenPlace,
  onReturn,
}: {
  bookId: string
  bookName: string
  chapter: number
  verse: number
  commentary: ReturnType<typeof useChapterCommentary>
  pane: VersePaneState
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
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const setKind = useBibleStore((s) => s.setPaneKind)
  const { references, kind } = pane

  const { sources, bySource } = commentary
  const referenceKind = isReferenceKind(kind) ? kind : undefined
  const source = sources.find((s) => s.id === kind)
  const span = source ? spanForVerse(bySource[source.id] ?? [], verse) : undefined
  const tabs = pane.kinds.map((id) => {
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: the kind in hand is the trigger
  useEffect(() => showOnLine(kind), [kind])

  const minHeight = 120
  const height = useSharedValue(initialHeight)
  const startHeight = useSharedValue(initialHeight)
  const drag = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-6, 6])
        .onStart(() => {
          startHeight.value = height.value
        })
        .onUpdate((e) => {
          height.value = clamp(startHeight.value - e.translationY, 0, maxHeight)
        })
        .onEnd(() => {
          if (height.value < minHeight) runOnJS(onClose)()
          else runOnJS(onResize)(height.value)
        }),
    [height, startHeight, maxHeight, onClose, onResize],
  )
  const heightStyle = useAnimatedStyle(() => ({ height: height.value }))

  return (
    <Animated.View entering={FadeIn.duration(180)} style={heightStyle}>
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <GestureDetector gesture={drag}>
          <YStack paddingHorizontal="$lg" paddingTop={6}>
            <View
              alignSelf="center"
              width={36}
              height={3}
              borderRadius={2}
              backgroundColor="$borderColor"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
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
          </YStack>
        </GestureDetector>
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
                    tab.count
                      ? t('a11y.verseKind', { name: tab.label, count: tab.count })
                      : tab.label
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
        <ScrollView
          // A new verse opens at its beginning, not where the last was left.
          key={`${bookId}-${chapter}-${verse}-${kind}`}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 12,
            // The tab bar floats over the foot of the pane; the last line clears it.
            paddingBottom: insets.bottom + bottomClearance + 24,
          }}
        >
          {cameFrom ? (
            <Pressable
              onPress={onReturn}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.backToPlace', { place: cameFrom })}
            >
              <XStack alignItems="center" gap="$xs" minHeight={36} marginTop={-8}>
                <ChevronLeft size={16} color={theme.colorSecondary.val} />
                <Typography variant="annotation" fontSize="$2">
                  {cameFrom}
                </Typography>
              </XStack>
            </Pressable>
          ) : undefined}
          {referenceKind ? (
            <VerseReferenceList
              kind={referenceKind}
              bookId={bookId}
              chapter={chapter}
              verse={verse}
              references={references}
              onOpenPlace={onOpenPlace}
            />
          ) : undefined}
          {source ? (
            <Commentary source={source} verse={verse} commentary={commentary} onReadOn={onReadOn} />
          ) : undefined}
        </ScrollView>
      </YStack>
    </Animated.View>
  )
}
