import { memo, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, type TextStyle, View, type ViewStyle } from 'react-native'
import { useTheme } from 'tamagui'

import { useReadingFontSizePx } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'

import { grammarTerms } from '../hebrew/morphology'
import { syllables } from '../hebrew/sound'
import {
  type HebrewWord,
  hebrewTokens,
  isStudiable,
  type MorphFields,
  mainPiece,
} from '../hebrew/words'
import { ChapterFrame } from './ChapterFrame'
import type { StudiedWord } from './pageWords'

type Looks = {
  row: ViewStyle
  words: ViewStyle
  cell: ViewStyle
  studiedCell: ViewStyle
  pieces: ViewStyle
  piece: ViewStyle
  number: TextStyle
  markedNumber: TextStyle
  word: TextStyle
  studiedWord: TextStyle
  pieceWord: TextStyle
  sound: TextStyle
  gloss: TextStyle
  grammar: TextStyle
}

/**
 * A Hebrew chapter as an interlinear, right to left: each word a small stack,
 * the Hebrew over its gloss, and under them, where the reader asked, its sound
 * and its parsing. With Pieces, each word is cut at its joints and every piece
 * stands over its own gloss — וּ "and" · בַ "in the" · בַּיִת "house". A word is
 * studied as on the page; the verse number opens the verse.
 *
 * Plain React Native views with styles resolved once, as the Greek
 * interlinear is: a chapter is a thousand stacks.
 */
export function HebrewInterlinear({
  bookName,
  chapter,
  fallback,
  completedBy,
  vulgateChapter,
  verses,
  words,
  morphology,
  pieces,
  sound,
  parsing,
  studied,
  markedVerse,
  onWordPress,
  onWordLongPress,
  onVersePress,
  onVerseLayout,
}: {
  bookName: string
  chapter: number
  fallback?: boolean
  completedBy?: string
  vulgateChapter?: number
  /** The verses as the page shows them, with the pointing chosen. */
  verses: Verse[]
  words: Record<number, HebrewWord[]>
  morphology: Record<string, MorphFields> | undefined
  pieces: boolean
  sound: boolean
  parsing: boolean
  studied: StudiedWord | undefined
  markedVerse: number | undefined
  onWordPress: (verse: number, index: number) => void
  onWordLongPress: (verse: number) => void
  onVersePress: (verse: number, y: number) => void
  onVerseLayout: (verse: number, y: number) => void
}) {
  const fontSize = useReadingFontSizePx()
  const theme = useTheme()
  const color = theme.color?.val as string
  const muted = theme.colorSecondary?.val as string
  const burgundy = theme.colorBurgundy?.val as string
  const surface = theme.backgroundSurface?.val as string

  const looks = useMemo<Looks>(() => {
    // Pointed Hebrew needs more size and more leading than Latin to read.
    const hebrewSize = Math.round(fontSize * 1.3)
    const small = Math.round(fontSize * 0.62)
    const hebrew = {
      fontFamily: 'EzraSIL',
      fontSize: hebrewSize,
      lineHeight: Math.round(hebrewSize * 1.5),
      color,
      writingDirection: 'rtl',
    } as const
    const face = { fontFamily: 'EBGaramond_400Regular', fontWeight: '400' } as const
    const number = { ...face, fontSize: small, lineHeight: hebrew.lineHeight, color: muted }
    const cell = { paddingHorizontal: 3, borderRadius: 4, alignItems: 'center' } as const
    return {
      row: { flexDirection: 'row-reverse', gap: 8 },
      words: {
        flex: 1,
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        columnGap: 14,
        rowGap: 12,
      },
      cell,
      studiedCell: { ...cell, backgroundColor: surface },
      pieces: { flexDirection: 'row-reverse', gap: 6 },
      piece: { alignItems: 'center' },
      number,
      markedNumber: { ...number, color: burgundy },
      word: hebrew,
      studiedWord: { ...hebrew, color: burgundy },
      pieceWord: { ...hebrew, fontSize: Math.round(hebrewSize * 0.85) },
      sound: {
        ...face,
        fontSize: small,
        lineHeight: Math.round(small * 1.4),
        color: muted,
        fontStyle: 'italic',
      },
      gloss: { ...face, fontSize: small + 1, lineHeight: Math.round((small + 1) * 1.4), color },
      grammar: {
        ...face,
        fontSize: small - 2,
        lineHeight: Math.round((small - 2) * 1.4),
        color: muted,
        letterSpacing: 0.3,
      },
    }
  }, [fontSize, color, muted, burgundy, surface])

  return (
    <ChapterFrame
      bookName={bookName}
      chapter={chapter}
      fallback={fallback}
      completedBy={completedBy}
      vulgateChapter={vulgateChapter}
      gap="$lg"
    >
      {verses.map((v) => (
        <InterlinearVerse
          key={v.verse}
          verse={v}
          words={words[v.verse]}
          morphology={morphology}
          pieces={pieces}
          sound={sound}
          parsing={parsing}
          studiedIndex={studied?.verse === v.verse ? studied.index : undefined}
          marked={markedVerse === v.verse}
          looks={looks}
          onWordPress={onWordPress}
          onWordLongPress={onWordLongPress}
          onVersePress={onVersePress}
          onVerseLayout={onVerseLayout}
        />
      ))}
    </ChapterFrame>
  )
}

const InterlinearVerse = memo(function InterlinearVerse({
  verse,
  words = [],
  morphology,
  pieces,
  sound,
  parsing,
  studiedIndex,
  marked,
  looks,
  onWordPress,
  onWordLongPress,
  onVersePress,
  onVerseLayout,
}: {
  verse: Verse
  words?: HebrewWord[]
  morphology: Record<string, MorphFields> | undefined
  pieces: boolean
  sound: boolean
  parsing: boolean
  studiedIndex: number | undefined
  marked: boolean
  looks: Looks
  onWordPress: (verse: number, index: number) => void
  onWordLongPress: (verse: number) => void
  onVersePress: (verse: number, y: number) => void
  onVerseLayout: (verse: number, y: number) => void
}) {
  const { t } = useTranslation()
  const top = useRef(0)
  const n = verse.verse
  const slots = hebrewTokens(verse.text)

  return (
    <View
      style={looks.row}
      onLayout={(e) => {
        top.current = e.nativeEvent.layout.y
        onVerseLayout(n, top.current)
      }}
    >
      <Pressable
        onPress={() => onVersePress(n, top.current)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.verseCommentary', { n })}
        accessibilityState={{ selected: marked }}
      >
        <Text style={marked ? looks.markedNumber : looks.number}>{n}</Text>
      </Pressable>
      <View style={looks.words}>
        {slots.map((slot, index) => {
          const word = words[index]
          // The second half of a word joined to the one before is studied there,
          // and a paseq is punctuation: neither has a stack of its own.
          if (!isStudiable(word)) {
            return word?.j ? undefined : (
              // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
              <Text key={index} style={looks.word}>
                {slot}
              </Text>
            )
          }
          const isStudied = studiedIndex === index
          const main = mainPiece(word) ?? word.p[0]
          const fields = morphology?.[main[2]]
          const code = main[2]
          return (
            <Pressable
              // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
              key={index}
              onPress={() => onWordPress(n, index)}
              onLongPress={() => onWordLongPress(n)}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.studyWord', { word: slot })}
              accessibilityState={{ selected: isStudied }}
              style={isStudied ? looks.studiedCell : looks.cell}
            >
              {pieces && word.p.length > 1 ? (
                <View style={looks.pieces}>
                  {word.p.map(([d, gloss, , hebrew], i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: a word's pieces are positional
                    <View key={`${d}-${i}`} style={looks.piece}>
                      <Text
                        style={
                          isStudied
                            ? { ...looks.pieceWord, color: looks.studiedWord.color }
                            : looks.pieceWord
                        }
                      >
                        {hebrew}
                      </Text>
                      <Text style={looks.gloss}>{gloss || '—'}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <>
                  <Text style={isStudied ? looks.studiedWord : looks.word}>{slot}</Text>
                  <Text style={looks.gloss}>
                    {word.p
                      .map(([, gloss]) => gloss)
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </Text>
                </>
              )}
              {sound && word.t ? (
                <Text style={looks.sound}>
                  {syllables(word.t)
                    .map((s) => (s.stressed ? s.text.toUpperCase() : s.text))
                    .join('·')}
                </Text>
              ) : undefined}
              {parsing ? (
                <Text style={looks.grammar}>{(fields && grammarTerms(fields)) ?? code}</Text>
              ) : undefined}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
})
