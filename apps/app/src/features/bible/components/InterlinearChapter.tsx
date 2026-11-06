import { memo, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, type TextStyle, View, type ViewStyle } from 'react-native'
import { useTheme } from 'tamagui'

import { useReadingFontSizePx } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'

import { isUnchecked, verseTokens, type WordEntry } from '../words'
import { ChapterFrame } from './ChapterFrame'
import type { StudiedWord } from './pageWords'

/** Every style a word's stack is drawn with, resolved once per page look. */
type Looks = {
  row: ViewStyle
  words: ViewStyle
  cell: TextStyle
  studiedCell: TextStyle
  number: TextStyle
  markedNumber: TextStyle
  word: TextStyle
  studiedWord: TextStyle
  lemma: TextStyle
  gloss: TextStyle
  parsing: TextStyle
}

/**
 * A Greek chapter as an interlinear: each word a small stack, the word over
 * its gloss, and the lemma and parsing under it where the reader asked for
 * them. The stacks wrap as words do. A word is studied as on the plain page;
 * the verse number, or a word held, opens the verse.
 *
 * A chapter is near a thousand stacks, so they are plain React Native views
 * with styles resolved once here, not Tamagui components that each resolve
 * their own: drawn the Tamagui way, turning the lemma line on took seconds.
 */
export function InterlinearChapter({
  bookName,
  chapter,
  fallback,
  completedBy,
  verses,
  words,
  lemma,
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
  verses: Verse[]
  words: Record<number, WordEntry[]>
  lemma: boolean
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
    const small = Math.round(fontSize * 0.62)
    const face = { fontFamily: 'EBGaramond_400Regular', fontWeight: '400' } as const
    const word = { ...face, fontSize, lineHeight: fontSize * 1.4, color }
    const number = { ...face, fontSize: small, lineHeight: fontSize * 1.4, color: muted }
    const cell = { paddingHorizontal: 3, borderRadius: 4 }
    return {
      row: { flexDirection: 'row', gap: 8 },
      words: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 12 },
      cell,
      studiedCell: { ...cell, backgroundColor: surface },
      number,
      markedNumber: { ...number, color: burgundy },
      word,
      studiedWord: { ...word, color: burgundy },
      lemma: { ...face, fontSize: small, lineHeight: Math.round(small * 1.4), color: muted },
      gloss: { ...face, fontSize: small + 1, lineHeight: Math.round((small + 1) * 1.4), color },
      parsing: {
        ...face,
        fontSize: small - 2,
        lineHeight: Math.round((small - 2) * 1.4),
        color: muted,
        letterSpacing: 0.5,
      },
    }
  }, [fontSize, color, muted, burgundy, surface])

  return (
    <ChapterFrame
      bookName={bookName}
      chapter={chapter}
      fallback={fallback}
      completedBy={completedBy}
      gap="$lg"
    >
      {verses.map((v) => (
        <InterlinearVerse
          key={v.verse}
          verse={v}
          entries={words[v.verse]}
          lemma={lemma}
          parsing={parsing}
          // Only the verse a word is studied in is drawn again for it.
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
  entries = [],
  lemma,
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
  entries?: WordEntry[]
  lemma: boolean
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
        {verseTokens(verse.text).map((token, index) => {
          const entry = entries[index]
          const [lemmaOf, morph, gloss] = entry ?? []
          const isStudied = studiedIndex === index
          return (
            // One Text per word, its lines nested spans: a native view per
            // word, where a box of separate lines was four or five.
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
              key={index}
              onPress={() => onWordPress(n, index)}
              onLongPress={() => onWordLongPress(n)}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.studyWord', { word: token })}
              accessibilityState={{ selected: isStudied }}
              style={isStudied ? looks.studiedCell : looks.cell}
            >
              <Text style={isStudied ? looks.studiedWord : looks.word}>{token}</Text>
              {lemma ? <Text style={looks.lemma}>{`\n${lemmaOf ?? ''}`}</Text> : undefined}
              <Text style={looks.gloss}>{`\n${gloss || '—'}`}</Text>
              {parsing ? (
                <Text style={looks.parsing}>
                  {/* A parsing the taggers did not agree on is asked, not stated. */}
                  {`\n${morph ?? ''}${entry && isUnchecked(entry) ? ' ?' : ''}`}
                </Text>
              ) : undefined}
            </Text>
          )
        })}
      </View>
    </View>
  )
})
