import type { BilingualText } from '@ember/content-engine'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, YStack } from 'tamagui'
import { useImageViewer } from '@/components/ImageViewerContext'

export function ImageBlock({
  src,
  caption,
  attribution,
}: {
  src: string
  caption?: BilingualText
  attribution?: BilingualText
}) {
  const { width } = useWindowDimensions()
  const imageWidth = Math.min(width - 96, 500)
  const { openViewer } = useImageViewer()

  return (
    <YStack alignItems="center" gap="$xs" paddingVertical="$sm">
      <Pressable
        onPress={() =>
          openViewer([
            {
              src,
              caption: caption?.primary,
              attribution: attribution?.primary,
            },
          ])
        }
      >
        <Image
          source={{ uri: src }}
          style={[styles.image, { width: imageWidth, height: imageWidth * 1.2 }]}
          contentFit="contain"
        />
      </Pressable>
      {caption && (
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$color"
          textAlign="center"
          fontStyle="italic"
          paddingHorizontal="$md"
        >
          {caption.primary}
        </Text>
      )}
      {attribution && (
        <Text fontFamily="$body" fontSize={11} color="$colorMuted" textAlign="center">
          {attribution.primary}
        </Text>
      )}
    </YStack>
  )
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
  },
})
