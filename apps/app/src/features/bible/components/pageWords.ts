import { useMemo } from 'react'
import { Platform, type TextStyle } from 'react-native'
import { useTheme } from 'tamagui'

import type { StyledSegment } from '@/lib/typography/justifyText'

/** The word on the study sheet: its verse, its slot in the verse, and what it is studied by (its lemma). */
export type StudiedWord = { verse: number; index: number; lemma: string }

/** Resolved styles (see `StyledSegment.render`): the studied word, and the page's other forms of its lemma. */
export type WordLooks = { studied: TextStyle; kin: TextStyle }

/**
 * The looks off the theme, as raw RN styles: a run's `render` is not a Tamagui
 * prop, so tokens do not resolve there. Memoised, since `justifyText` groups
 * runs by the identity of these objects.
 */
export function useWordLooks(): WordLooks {
  const theme = useTheme()
  return useMemo<WordLooks>(
    () => ({
      studied: {
        color: theme.colorBurgundy?.val as string,
        backgroundColor: theme.backgroundSurface?.val as string,
      },
      // The page's other forms of the studied word. iOS draws a dotted gold
      // underline; Android draws only a solid one in the text's own colour,
      // which reads as part of the text, so there the words are tinted.
      kin:
        Platform.OS === 'ios'
          ? {
              textDecorationLine: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: theme.gold?.val as string,
            }
          : { color: theme.accent?.val as string },
    }),
    [theme.colorBurgundy, theme.backgroundSurface, theme.gold, theme.accent],
  )
}

/**
 * A verse as one segment per word, each its own tap target: a tap studies the
 * word, a hold opens the verse. `slots` are the verse's word slots as its
 * edition cuts them, `keys` what each is studied by — a Greek lemma, a Hebrew
 * word's Strong's number — and undefined for a slot with nothing to study (a
 * paseq). The gaps between words are segments of their own and unpressable: a
 * gap belongs to the line. A Hebrew word joined by maqaf has no gap after it.
 */
export function wordSegments({
  verse,
  slots,
  keys,
  studied,
  looks,
  onPress,
  onLongPress,
  offset = 0,
}: {
  verse: number
  /** Where `slots` start in the verse, for a verse set in parts (a line of poetry). */
  offset?: number
  slots: string[]
  keys: (string | undefined)[]
  studied: StudiedWord | undefined
  looks: WordLooks
  onPress: (verse: number, index: number) => void
  onLongPress: (verse: number) => void
}): StyledSegment[] {
  const hold = () => onLongPress(verse)
  return slots.flatMap((slot, at): StyledSegment[] => {
    const index = at + offset
    const key = keys[at]
    const isStudied = studied?.verse === verse && studied.index === index
    const render = (() => {
      if (isStudied) return looks.studied
      if (studied && key !== undefined && key === studied.lemma) return looks.kin
      return undefined
    })()
    const word: StyledSegment =
      key === undefined
        ? { text: slot, style: 'regular' }
        : {
            text: slot,
            style: 'regular',
            render,
            onPress: () => onPress(verse, index),
            onLongPress: hold,
          }
    // The space before a word is a segment of its own, so the studied word's
    // wash and its kin's underline start at the word and not at the gap.
    if (at === 0 || slots[at - 1].endsWith('\u05be')) return [word]
    return [{ text: ' ', style: 'regular' }, word]
  })
}
