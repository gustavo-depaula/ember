import { memo, type ReactNode, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, type TextStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useTheme, View, XStack, YStack } from 'tamagui'
import { ReadingLanguage, ReadingParagraph } from '@/components/ReadingParagraph'
import { useReadingStyle } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'
import type { StyledSegment } from '@/lib/typography/justifyText'

import { ChapterFrame } from './ChapterFrame'
import { type StudiedWord, useWordLooks, type WordLooks, wordSegments } from './pageWords'

// The verse marker: same face as the text, set small and muted. It is a run of
// its own rather than a reason to skip justification — justif prices each run
// at its own size, so the marker costs the line exactly what it draws.
const verseNumberScale = 0.55

/**
 * One verse, justified with its marker rather than around it.
 *
 * The marker is `atomic`: a number is one object, so it is never hyphenated and
 * the gap that sets it off from the text does not flex. Everything else on the
 * line is ordinary elastic prose.
 *
 * Memoised on flat props: justifying a verse is the costly part of a page, so
 * a verse is set again only when its own text, marker or marks change.
 */
const VerseLine = memo(function VerseLine({
  verse,
  numberSizePx,
  numberRender,
  keys,
  tokenize,
  studied,
  looks,
  onWordPress,
  onWordLongPress,
  numberLabel,
  mark,
  split,
}: {
  verse: Verse
  /** The marker as printed, where it says more than the number: "19 · Vulg. 4:1". */
  numberLabel?: string
  /** The codex's paragraph mark closing the verse: open (פ) or closed (ס). */
  mark?: 'p' | 's'
  /** A verse of poetry: the slot its second line starts at. */
  split?: number
  numberSizePx: number
  /** Resolved style for the marker — see `numberRender` in the parent. */
  numberRender: TextStyle
  /** What each of the verse's word slots is studied by, on a page with word data: each becomes its own tap target. */
  keys?: (string | undefined)[]
  /** The edition's cut of a verse into word slots. */
  tokenize?: (text: string) => string[]
  /** The word studied, where it or its lemma stands in this verse. */
  studied?: StudiedWord
  looks: WordLooks
  onWordPress?: (verse: number, index: number) => void
  onWordLongPress?: (verse: number) => void
}) {
  const lines = useMemo<StyledSegment[][]>(() => {
    const number: StyledSegment = {
      text: numberLabel ?? `${verse.verse}`,
      style: 'regular',
      fontSizePx: numberSizePx,
      render: numberRender,
      atomic: true,
    }
    // The paragraph letter, small and muted as the verse marker is, where the
    // codex sets it: after the verse's last word.
    const closing: StyledSegment[] = mark
      ? [
          { text: '  ', style: 'regular' },
          {
            text: mark === 'p' ? '\u05e4' : '\u05e1',
            style: 'regular',
            fontSizePx: numberSizePx,
            render: numberRender,
            atomic: true,
          },
        ]
      : []
    if (!keys || !tokenize || !onWordPress || !onWordLongPress) {
      return [[number, { text: `  ${verse.text}`, style: 'regular' }, ...closing]]
    }
    const slots = tokenize(verse.text)
    const part = (from: number, to: number) =>
      wordSegments({
        verse: verse.verse,
        offset: from,
        slots: slots.slice(from, to),
        keys: keys.slice(from, to),
        studied,
        looks,
        onPress: onWordPress,
        onLongPress: onWordLongPress,
      })
    const gap: StyledSegment = { text: '  ', style: 'regular' }
    if (split === undefined) return [[number, gap, ...part(0, slots.length), ...closing]]
    return [
      [number, gap, ...part(0, split)],
      [...part(split, slots.length), ...closing],
    ]
  }, [
    verse,
    numberLabel,
    mark,
    split,
    numberSizePx,
    numberRender,
    keys,
    tokenize,
    studied,
    looks,
    onWordPress,
    onWordLongPress,
  ])

  if (lines.length === 1) return <ReadingParagraph source={lines[0]} />
  // Poetry: each half its own line, set ragged — the breaks are the verse's —
  // and the second indented from where Hebrew lines start, the right, as a
  // printed psalter sets it.
  return (
    <YStack>
      <ReadingParagraph source={lines[0]} ragged />
      <View paddingRight={20}>
        <ReadingParagraph source={lines[1]} ragged />
      </View>
    </YStack>
  )
})

/** The other edition's verse, set once for as long as its text and look hold. */
const BesideLine = memo(function BesideLine({
  text,
  language,
  render,
}: {
  text: string
  language: string
  render: TextStyle
}) {
  const source = useMemo<StyledSegment[]>(
    () => [{ text, style: 'regular', render }],
    [text, render],
  )
  return (
    <ReadingLanguage language={language}>
      <ReadingParagraph source={source} />
    </ReadingLanguage>
  )
})

/** What makes a page's words studiable, in Greek or Hebrew. */
export type WordStudyProps = {
  /** Each verse's slots' keys (see `wordSegments`): with these, every word is a tap target. */
  keys: Record<number, (string | undefined)[]>
  tokenize: (text: string) => string[]
  studied: StudiedWord | undefined
  onWordPress: (verse: number, index: number) => void
  onWordLongPress: (verse: number) => void
}

/** Another edition read beside the page, verse by verse: under each verse, or in a column. */
export type BesideProps = {
  texts: Record<number, string>
  language: string
  columns: boolean
  /** The page's share of the width, in columns. */
  split: number
  onSplit: (split: number) => void
}

/**
 * What an edition prints beyond its words: the Vulgate's number beside a verse
 * numbered otherwise, the codex's paragraph marks after a verse, and the slot
 * where a verse of poetry breaks into its second line.
 */
export type PageLayout = {
  /** The Vulgate's chapter, where the whole chapter is numbered otherwise there. */
  vulgateChapter?: number
  numbers?: Record<number, string>
  marks?: Record<number, 'p' | 's'>
  splits?: Record<number, number>
}

/** The verse whose commentary is open, and the passage that commentary covers. */
export type MarkedVerses = { verse: number; from: number; to: number }

export function ChapterContent({
  bookName,
  chapter,
  verses,
  language,
  fallback,
  completedBy,
  moved,
  marked,
  study,
  beside,
  layout: printed,
  onVersePress,
  onVerseLayout,
}: {
  bookName: string
  chapter: number
  verses: Verse[]
  /** The edition's language, to hyphenate the verses by and set them in a face that has it. */
  language: string
  fallback?: boolean
  /** The edition the chapter is read from, where it completes the one chosen. */
  completedBy?: string
  moved?: { label: string; onPress: () => void }
  marked?: MarkedVerses
  study?: WordStudyProps
  beside?: BesideProps
  /** How the edition sets its verses, where it differs from plain prose. */
  layout?: PageLayout
  /** `y` is the verse's top within this component, for scrolling it into view. */
  onVersePress?: (verse: number, y: number) => void
  /** Each verse's top as it is laid out, for a reader that turns to a verse untapped. */
  onVerseLayout?: (verse: number, y: number) => void
}) {
  const { t } = useTranslation()
  const readingStyle = useReadingStyle()
  const theme = useTheme()
  const numberSizePx = Math.round(readingStyle.fontSize * verseNumberScale)
  // A run's `render` is applied as a raw RN style, where Tamagui tokens do NOT
  // resolve — so the token is read off the theme here. Memoised because
  // `justifyText` groups runs by the identity of this object, and a fresh one
  // per verse would mint a run per verse.
  const numberRender = useMemo(
    () => ({ color: theme.colorSecondary?.val as string }),
    [theme.colorSecondary],
  )
  const markedNumberRender = useMemo(
    () => ({ color: theme.colorBurgundy?.val as string }),
    [theme.colorBurgundy],
  )
  const looks = useWordLooks()
  const tops = useRef(new Map<number, number>())

  if (verses.length === 0) return undefined

  const studied = study?.studied
  const lines = verses.map((v) => {
    const inPassage = marked !== undefined && marked.from <= v.verse && v.verse <= marked.to
    const keys = study?.keys[v.verse]
    // Only this verse's own marks: another verse's word being studied leaves
    // this one's segments (and so its line breaks) untouched.
    const marks =
      studied && (studied.verse === v.verse || keys?.some((key) => key === studied.lemma))
        ? studied
        : undefined
    const verseLine = (
      <VerseLine
        verse={v}
        numberSizePx={numberSizePx}
        numberRender={marked?.verse === v.verse ? markedNumberRender : numberRender}
        keys={keys}
        tokenize={study?.tokenize}
        studied={marks}
        looks={looks}
        onWordPress={study?.onWordPress}
        onWordLongPress={study?.onWordLongPress}
        numberLabel={printed?.numbers?.[v.verse]}
        mark={printed?.marks?.[v.verse]}
        split={printed?.splits?.[v.verse]}
      />
    )
    const besideText = beside?.texts[v.verse]
    const line = (() => {
      if (!beside || !besideText) return verseLine
      const other = (
        // Muted as the verse marker is: the page's own text leads.
        <BesideLine text={besideText} language={beside.language} render={numberRender} />
      )
      if (beside.columns) {
        return (
          <XStack gap={columnGap}>
            <View flex={beside.split}>{verseLine}</View>
            <View flex={1 - beside.split}>{other}</View>
          </XStack>
        )
      }
      return (
        <YStack gap={2} paddingBottom="$xs">
          {verseLine}
          {other}
        </YStack>
      )
    })()
    // An open paragraph leaves a line's space before the next, a closed one a little.
    const paragraphGap = (() => {
      const after = printed?.marks?.[v.verse]
      if (after === 'p') return Math.round(readingStyle.lineHeight * 0.6)
      if (after === 's') return Math.round(readingStyle.lineHeight * 0.2)
      return 0
    })()
    if (!onVersePress) {
      return (
        <View key={v.verse} marginBottom={paragraphGap}>
          {line}
        </View>
      )
    }
    return (
      <Pressable
        key={v.verse}
        style={{ marginBottom: paragraphGap }}
        onLayout={(e) => {
          const { y } = e.nativeEvent.layout
          tops.current.set(v.verse, y)
          onVerseLayout?.(v.verse, y)
        }}
        onPress={() => onVersePress(v.verse, tops.current.get(v.verse) ?? 0)}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.verseCommentary', { n: v.verse })}
        accessibilityState={{ selected: marked?.verse === v.verse }}
        aria-selected={marked?.verse === v.verse}
      >
        {/* The wash runs past the text on every side, across the gap
        between verses, so a marked passage reads as one block. */}
        <View
          backgroundColor={inPassage ? '$backgroundSurface' : 'transparent'}
          marginHorizontal={-6}
          paddingHorizontal={6}
          marginVertical={-2}
          paddingVertical={2}
        >
          {line}
        </View>
      </Pressable>
    )
  })

  const page = <ReadingLanguage language={language}>{lines}</ReadingLanguage>
  return (
    <ChapterFrame
      bookName={bookName}
      chapter={chapter}
      fallback={fallback}
      completedBy={completedBy}
      moved={moved}
      vulgateChapter={printed?.vulgateChapter}
      gap="$xs"
    >
      {beside?.columns ? (
        <Columns split={beside.split} onSplit={beside.onSplit}>
          {page}
        </Columns>
      ) : (
        <View>{page}</View>
      )}
    </ChapterFrame>
  )
}

/**
 * Two columns' worth of verses, with the rule between them. Only this measures
 * its width, so a plain or row-by-row page is never laid out twice for it.
 */
function Columns({
  split,
  onSplit,
  children,
}: {
  split: number
  onSplit: (split: number) => void
  children: ReactNode
}) {
  const [width, setWidth] = useState(0)
  return (
    <View
      onLayout={(e) => {
        const measured = e.nativeEvent.layout.width
        setWidth(measured)
      }}
    >
      {children}
      {width > 0 ? <ColumnRule width={width} split={split} onSplit={onSplit} /> : undefined}
    </View>
  )
}

const columnGap = 16
// Neither column narrower than a third: below that a justified line has
// room for two or three words.
const minSplit = 0.32
const maxSplit = 0.68

/**
 * The rule between the two columns of a parallel page, the full height of the
 * chapter. Dragged, only the rule moves; the columns are laid out again where
 * it is let go, since every verse's line breaks change with the width. A
 * double tap sets the columns even again.
 */
function ColumnRule({
  width,
  split,
  onSplit,
}: {
  width: number
  split: number
  onSplit: (split: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const offset = useSharedValue(0)
  const left = split * (width - columnGap) + columnGap / 2
  const gesture = useMemo(() => {
    const drag = Gesture.Pan()
      // Sooner than the reader's drawer swipe, so a drag on the rule is the rule's.
      .activeOffsetX([-2, 2])
      .onUpdate((e) => {
        offset.value = e.translationX
      })
      .onEnd((e) => {
        const next = Math.min(maxSplit, Math.max(minSplit, split + e.translationX / width))
        offset.value = 0
        runOnJS(onSplit)(next)
      })
    const even = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        runOnJS(onSplit)(0.5)
      })
    return Gesture.Exclusive(drag, even)
  }, [offset, split, width, onSplit])
  const moving = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }))
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="adjustable"
        accessibilityLabel={t('a11y.columnSplit')}
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: left - 12,
            width: 24,
            alignItems: 'center',
          },
          moving,
        ]}
      >
        <View
          width={StyleSheet.hairlineWidth}
          flex={1}
          backgroundColor={theme.borderColor?.val as string}
        />
      </Animated.View>
    </GestureDetector>
  )
}
