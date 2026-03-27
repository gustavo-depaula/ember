import { useState } from 'react'
import { type LayoutChangeEvent, Platform } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

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
  return (
    <Text fontFamily="$body" fontSize="$4" lineHeight="$4" color="$color" textAlign="justify">
      <View style={{ float: 'left', marginRight: 6, marginBottom: -4 } as never}>
        <CapLetter letter={firstLetter} />
      </View>
      {rest}
    </Text>
  )
}

function NativeDropCap({ firstLetter, rest }: { firstLetter: string; rest: string }) {
  const [capHeight, setCapHeight] = useState(capSize + 4)

  function onCapLayout(e: LayoutChangeEvent) {
    setCapHeight(e.nativeEvent.layout.height)
  }

  // Estimate ~40 chars per line beside the cap, 2-3 lines tall
  const charsNextToCap = 90
  const beside = rest.slice(0, charsNextToCap)
  const below = rest.slice(charsNextToCap)

  return (
    <YStack>
      <XStack>
        <YStack marginRight={6} onLayout={onCapLayout}>
          <CapLetter letter={firstLetter} />
        </YStack>
        <Text
          flex={1}
          fontFamily="$body"
          fontSize="$4"
          lineHeight="$4"
          color="$color"
          textAlign="justify"
          maxHeight={capHeight}
          overflow="hidden"
        >
          {beside}
        </Text>
      </XStack>
      {below ? (
        <Text fontFamily="$body" fontSize="$4" lineHeight="$4" color="$color" textAlign="justify">
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
