import type { TextStyle } from 'react-native'

import type { StyledSegment } from '@/lib/typography/justifyText'

import type { WordEntry } from '../words'

/** The word on the study sheet: its verse, its place in the verse, and its lemma. */
export type StudiedWord = { verse: number; index: number; lemma: string }

/** Resolved styles (see `StyledSegment.render`): the studied word, and the page's other forms of its lemma. */
export type WordLooks = { studied: TextStyle; kin: TextStyle }

/**
 * A Greek verse as one segment per word, each its own tap target: a tap
 * studies the word, a hold opens the verse. The gaps between words are
 * segments of their own and unpressable: a gap belongs to the line.
 */
export function greekSegments({
  verse,
  text,
  words,
  studied,
  looks,
  onPress,
  onLongPress,
}: {
  verse: number
  text: string
  words: WordEntry[]
  studied: StudiedWord | undefined
  looks: WordLooks
  onPress: (verse: number, index: number) => void
  onLongPress: (verse: number) => void
}): StyledSegment[] {
  const hold = () => onLongPress(verse)
  return text.split(/\s+/).flatMap((token, index): StyledSegment[] => {
    const lemma = words[index]?.[0]
    const isStudied = studied?.verse === verse && studied.index === index
    const render = (() => {
      if (isStudied) return looks.studied
      if (studied && lemma === studied.lemma) return looks.kin
      return undefined
    })()
    const word: StyledSegment = {
      text: token,
      style: 'regular',
      render,
      onPress: () => onPress(verse, index),
      onLongPress: hold,
    }
    // The space before a word is a segment of its own, so the studied word's
    // wash and its kin's underline start at the word and not at the gap.
    return index === 0 ? [word] : [{ text: ' ', style: 'regular' }, word]
  })
}
