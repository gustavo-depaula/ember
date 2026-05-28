import { Image, type ImageSource } from 'expo-image'
import { StyleSheet } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { type BlockTone, blockInk, blockLabelInk } from './bgColor'

export type FeatureBlockData = {
  key: string
  label: string
  title: string
  subtitle?: string
  image?: ImageSource
  tone: BlockTone
  onPress: () => void
}

/**
 * One big editorial card in the featured carousel. Full-bleed painting (or a
 * solid jewel tone when no art is mapped) with a lower-third caption — Cinzel
 * tracked label, manuscript headline, a whispered subtitle — all in cream so it
 * reads on either. A translucent scrim sits under the caption only over art.
 */
export function FeatureBlock({
  label,
  title,
  subtitle,
  image,
  tone,
  onPress,
}: Omit<FeatureBlockData, 'key'>) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="link" accessibilityLabel={title}>
      <YStack
        height={340}
        borderRadius={18}
        overflow="hidden"
        backgroundColor={tone.from}
        justifyContent="flex-end"
      >
        {image && (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
            accessibilityLabel={title}
          />
        )}
        <YStack
          padding="$lg"
          gap="$xs"
          backgroundColor={image ? 'rgba(0,0,0,0.42)' : 'transparent'}
        >
          <Typography
            variant="marker"
            textAlign="left"
            color={blockLabelInk}
            fontSize="$1"
            letterSpacing={2}
          >
            {label}
          </Typography>
          <Typography
            variant="sacred-title"
            textAlign="left"
            color={blockInk}
            fontSize={30}
            lineHeight={34}
            numberOfLines={3}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="whisper" color="rgba(245,239,226,0.82)" numberOfLines={2}>
              {subtitle}
            </Typography>
          )}
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}
