import type { BilingualText } from '@ember/content-engine'
import { Image, type ImageLoadEventData } from 'expo-image'
import { useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { Text, YStack } from 'tamagui'
import { useImageViewer } from '@/components/ImageViewerContext'
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri'

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
  const resolvedSrc = useResolvedImageUri(src)
  const [aspectRatio, setAspectRatio] = useState(1)

  const onLoad = (event: ImageLoadEventData) => {
    const w = event.source?.width
    const h = event.source?.height
    if (w && h) setAspectRatio(w / h)
  }

  return (
    <YStack alignItems="center" gap="$xs" paddingVertical="$sm">
      <Pressable
        onPress={() =>
          openViewer([
            {
              src: resolvedSrc,
              caption: caption?.primary,
              attribution: attribution?.primary,
            },
          ])
        }
      >
        <Image
          source={{ uri: resolvedSrc }}
          style={[styles.image, { width: imageWidth, aspectRatio }]}
          contentFit="contain"
          onLoad={onLoad}
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
        <Text fontFamily="$body" fontSize="$1" color="$colorMuted" textAlign="center">
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
