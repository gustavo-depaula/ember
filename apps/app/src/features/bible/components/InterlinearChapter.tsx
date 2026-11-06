import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { useReadingFontSizePx, useReadingMargin, useReadingMaxWidth } from '@/hooks/useReadingStyle'
import type { Verse } from '@/lib/content'

import { isUnchecked, type WordEntry } from '../words'
import type { StudiedWord } from './greekWords'

/**
 * A Greek chapter as an interlinear: each word a small stack, the word over
 * its gloss, and the lemma and parsing under it where the reader asked for
 * them. The stacks wrap as words do. A word is studied as on the plain page;
 * the verse number, or a word held, opens the verse.
 */
export function InterlinearChapter({
  bookName,
  chapter,
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
  const { t } = useTranslation()
  const fontSize = useReadingFontSizePx()
  const margin = useReadingMargin()
  const maxWidth = useReadingMaxWidth()
  const tops = useRef(new Map<number, number>()).current
  const small = Math.round(fontSize * 0.62)

  return (
    <YStack
      gap="$lg"
      paddingVertical="$lg"
      paddingHorizontal={margin}
      width="100%"
      maxWidth={maxWidth}
      alignSelf="center"
    >
      <YStack alignItems="center" gap="$md" paddingBottom="$md">
        <Typography variant="label" tone="muted" fontSize="$5" textAlign="center">
          {bookName}
        </Typography>
        <Typography variant="label" tone="muted" fontSize="$4">
          {t('position.chapter', { n: chapter })}
        </Typography>
      </YStack>

      {verses.map((v) => {
        const entries = words[v.verse] ?? []
        return (
          <XStack
            key={v.verse}
            gap="$sm"
            onLayout={(e) => {
              const { y } = e.nativeEvent.layout
              tops.set(v.verse, y)
              onVerseLayout(v.verse, y)
            }}
          >
            <Pressable
              onPress={() => onVersePress(v.verse, tops.get(v.verse) ?? 0)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.verseCommentary', { n: v.verse })}
              accessibilityState={{ selected: markedVerse === v.verse }}
            >
              <Typography
                variant="verse-number"
                fontSize={small}
                lineHeight={fontSize * 1.4}
                color={markedVerse === v.verse ? '$colorBurgundy' : '$colorSecondary'}
              >
                {v.verse}
              </Typography>
            </Pressable>
            <XStack flex={1} flexWrap="wrap" columnGap={14} rowGap={12}>
              {v.text.split(/\s+/).map((token, index) => {
                const [lemmaOf, morph, gloss] = entries[index] ?? []
                const isStudied = studied?.verse === v.verse && studied.index === index
                return (
                  <Pressable
                    // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
                    key={index}
                    onPress={() => onWordPress(v.verse, index)}
                    onLongPress={() => onWordLongPress(v.verse)}
                    accessibilityRole="button"
                    accessibilityLabel={t('a11y.studyWord', { word: token })}
                    accessibilityState={{ selected: isStudied }}
                  >
                    <YStack
                      paddingHorizontal={3}
                      borderRadius={4}
                      backgroundColor={isStudied ? '$backgroundSurface' : 'transparent'}
                    >
                      <Typography
                        fontSize={fontSize}
                        lineHeight={fontSize * 1.4}
                        color={isStudied ? '$colorBurgundy' : '$color'}
                      >
                        {token}
                      </Typography>
                      {lemma ? (
                        <Typography fontSize={small} color="$colorSecondary">
                          {lemmaOf ?? ''}
                        </Typography>
                      ) : undefined}
                      <Typography fontSize={small + 1}>{gloss || '—'}</Typography>
                      {parsing ? (
                        <Typography variant="reference" fontSize={small - 2}>
                          {/* A parsing the taggers did not agree on is asked, not stated. */}
                          {`${morph ?? ''}${isUnchecked(entries[index]) ? ' ?' : ''}`}
                        </Typography>
                      ) : undefined}
                    </YStack>
                  </Pressable>
                )
              })}
            </XStack>
          </XStack>
        )
      })}
    </YStack>
  )
}
