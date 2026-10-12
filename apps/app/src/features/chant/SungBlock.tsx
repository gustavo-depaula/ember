import { type ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { parseDoInline } from '@/components/prayer/parseDoInline'
import { Typography } from '@/components/typography'
import type { ChantPrimitive, Primitive } from '@/content/primitives'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { ChantBlock } from './ChantBlock'

/**
 * A text and its chant, two faces of one block: the text as it is read, and
 * beside it, a page-turn to the right, the score. A small staff by the title
 * says there is one and turns to it; so does sliding the block sideways. Most
 * who pray from the app read; the one who sings finds the notes in the place
 * of the words, not after them.
 */
export function SungBlock({
  text,
  chants,
  renderText,
}: {
  text: Primitive[]
  chants: ChantPrimitive[]
  renderText: (primitive: Primitive, index: number) => ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const pager = useRef<ScrollView>(null)
  const [sung, setSung] = useState(false)
  // Kept exact: a page a fraction narrower than the pager lets a hair of the next face show.
  const [width, setWidth] = useState(0)
  const [heights, setHeights] = useState({ text: 0, score: 0 })
  // Engraving a score is work: it waits until the reader first turns towards it.
  const [engraved, setEngraved] = useState(false)

  // The title stays put over both faces, and the staff sits on its line.
  const title = text[0]?.type === 'heading' ? text[0] : undefined
  const body = title ? text.slice(1) : text
  // Under the notes, what they say: the Latin is in the score, so one who reads
  // in another language gets the words back, quietly. Of a psalm only its
  // antiphon, once: the verses are long and the score has them all.
  const latin = usePreferencesStore((s) => s.contentLanguage) === 'la'
  const gloss = latin ? [] : glossOf(body)

  function turn(to: boolean) {
    setEngraved(true)
    setSung(to)
    pager.current?.scrollTo({ x: to ? width : 0, animated: true })
  }

  // A chant with no text of its own to turn from is simply shown.
  if (text.length === 0) {
    return (
      <YStack gap="$lg" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 &&
          chants.map((chant) => (
            <ChantBlock
              key={`${chant.part}-${chant.name}`}
              chant={chant}
              width={width}
              // One piece under its own title needs no second naming of what it is.
              named={chants.length > 1 || !title}
            />
          ))}
      </YStack>
    )
  }

  // The pager is as tall as the face it shows; left alone it would take the
  // taller one's height and leave a gap under the other.
  const height = (sung ? heights.score : heights.text) || undefined

  return (
    <YStack onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <XStack alignItems="flex-start" gap="$sm">
        <YStack flex={1}>{title ? renderText(title, 0) : null}</YStack>
        <Pressable
          onPress={() => turn(!sung)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t(sung ? 'a11y.hideChant' : 'a11y.showChant', {
            name: chants[0].name,
          })}
          accessibilityState={{ selected: sung }}
          aria-selected={sung}
          // Lowered onto the title's own line, which sits under the heading's top padding.
          style={{ minHeight: 32, marginTop: title ? 14 : 0, justifyContent: 'center' }}
        >
          <Staff color={sung ? theme.color.val : theme.accentHover.val} />
          <View
            height={1.5}
            alignSelf="stretch"
            marginTop={4}
            backgroundColor={sung ? '$accent' : 'transparent'}
          />
        </Pressable>
      </XStack>
      {width > 0 && (
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ height }}
          contentContainerStyle={{ alignItems: 'flex-start' }}
          onScrollBeginDrag={() => setEngraved(true)}
          onMomentumScrollEnd={(e) => setSung(e.nativeEvent.contentOffset.x > width / 2)}
        >
          <YStack
            width={width}
            gap="$md"
            onLayout={(e) => {
              const text = e.nativeEvent.layout.height
              setHeights((was) => ({ ...was, text }))
            }}
          >
            {body.map(renderText)}
          </YStack>
          <YStack
            width={width}
            gap="$lg"
            paddingBottom="$sm"
            onLayout={(e) => {
              const score = e.nativeEvent.layout.height
              setHeights((was) => ({ ...was, score }))
            }}
          >
            {engraved &&
              chants.map((chant) => (
                <ChantBlock
                  key={`${chant.part}-${chant.name}`}
                  chant={chant}
                  width={Math.floor(width)}
                  // One piece under its own title needs no second naming of what it is.
                  named={chants.length > 1 || !title}
                />
              ))}
            {engraved && gloss.length > 0 && (
              <YStack gap="$xs">
                {gloss.map((line) => (
                  <Typography key={line} variant="caption" fontSize="$2">
                    {line}
                  </Typography>
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  )
}

// A proper of the Mass runs to a few lines; a psalm or a hymn to dozens, which
// under a score would be the whole text over again.
const glossLines = 4

/**
 * The words of a text as plain lines, for the gloss under its score: a short
 * text whole, and of a long one only what is marked in it, each mark once —
 * of a psalm, its antiphon.
 */
function glossOf(body: Primitive[]): string[] {
  const plain = (text: string, markup?: 'do') =>
    (markup === 'do'
      ? parseDoInline(text)
          .filter((run) => run.kind !== 'mark')
          .map((run) => run.text)
          .join('')
      : text.replace(/[*_]/g, '')
    ).trim()
  const marks = new Set<string>()
  const marked = body.flatMap((primitive) =>
    primitive.type === 'verses'
      ? primitive.items
          .filter((item) => item.mark && !marks.has(item.mark) && marks.add(item.mark))
          .map((item) => plain(item.text.primary, primitive.markup))
      : [],
  )
  const lines = body
    .flatMap((primitive) =>
      primitive.type === 'text'
        ? primitive.text.primary.split('\n').map((line) => plain(line, primitive.markup))
        : [],
    )
    .filter(Boolean)
  return [...marked, ...(lines.length <= glossLines ? lines : [])]
}

/** Three square notes climbing a four-line staff: the sign that a text has its chant. */
function Staff({ color }: { color: string }) {
  return (
    <Svg width={22} height={18} viewBox="0 0 22 18">
      <Path
        d="M0 2.5h22M0 6.8h22M0 11.1h22M0 15.4h22"
        stroke={color}
        strokeWidth={0.9}
        opacity={0.55}
      />
      <Rect x={3} y={9} width={4.2} height={4.2} fill={color} />
      <Rect x={8.6} y={4.7} width={4.2} height={4.2} fill={color} />
      <Rect x={14.4} y={0.4} width={4.2} height={4.2} fill={color} />
      <Rect x={8.5} y={4.7} width={0.9} height={8.5} fill={color} />
    </Svg>
  )
}
