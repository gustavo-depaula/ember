import { useState } from 'react'
import { type LayoutChangeEvent, Platform } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { useReadingFontSizePx, useReadingStyle } from '@/hooks/useReadingStyle'

const capSize = 52
const capWidth = 44
const underlineWidth = 28
const isWeb = Platform.OS === 'web'

function CapLetter({ letter }: { letter: string }) {
  return (
    <YStack alignItems="center">
      <Text
        fontFamily="$display"
        fontSize={capSize}
        lineHeight={capSize}
        color="$accent"
        width={capWidth}
        textAlign="center"
      >
        {letter}
      </Text>
      <View
        width={underlineWidth}
        height={1.5}
        backgroundColor="$accentSubtle"
        borderRadius="$full"
        marginTop={-4}
      />
    </YStack>
  )
}

function WebDropCap({ firstLetter, rest }: { firstLetter: string; rest: string }) {
  const readingStyle = useReadingStyle()
  return (
    <Text color="$color" {...readingStyle}>
      <View style={{ float: 'left', marginRight: 6, marginBottom: -4 } as never}>
        <CapLetter letter={firstLetter} />
      </View>
      {rest}
    </Text>
  )
}

function NativeDropCap({ firstLetter, rest }: { firstLetter: string; rest: string }) {
  const [capHeight, setCapHeight] = useState(capSize + 4)
  const readingStyle = useReadingStyle()
  const fontSizePx = useReadingFontSizePx()

  function onCapLayout(e: LayoutChangeEvent) {
    setCapHeight(e.nativeEvent.layout.height)
  }

  // Scale char estimate proportionally to font size (baseline: 90 chars at 19px)
  const charsNextToCap = Math.floor(90 * (19 / fontSizePx))
  const beside = rest.slice(0, charsNextToCap)
  const below = rest.slice(charsNextToCap)

  return (
    <YStack>
      <XStack>
        <YStack marginRight={6} onLayout={onCapLayout}>
          <CapLetter letter={firstLetter} />
        </YStack>
        <Text flex={1} color="$color" {...readingStyle} maxHeight={capHeight} overflow="hidden">
          {beside}
        </Text>
      </XStack>
      {below ? (
        <Text color="$color" {...readingStyle}>
          {below}
        </Text>
      ) : undefined}
    </YStack>
  )
}

export function DropCap({ text }: { text: string }) {
  if (text.length === 0) return undefined

  const firstLetter = text[0]
  const rest = text.slice(1)

  if (isWeb) {
    return <WebDropCap firstLetter={firstLetter} rest={rest} />
  }

  return <NativeDropCap firstLetter={firstLetter} rest={rest} />
}
