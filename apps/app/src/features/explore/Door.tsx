import { Image, type ImageSource } from 'expo-image'
import type { Href } from 'expo-router'
import type { ReactNode } from 'react'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { Typography } from '@/components/typography'
import { getEntry } from '@/content/contentIndex'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, GeneratedCover } from '@/features/covers'
import { localizeContent } from '@/lib/i18n'
import { toneForKey } from './bgColor'

// A door into a part of the catalogue: how much is inside, its name, and a hand
// of three things from it fanned on the right. The search lobby's doors and the
// Books screen's Explorar share it.

const doorHeight = 132
// Three covers held like a hand of cards: left, top, tilt.
const fanSlots = [
  { left: 2, top: 28, rotate: '-9deg' },
  { left: 40, top: 18, rotate: '-1deg' },
  { left: 80, top: 26, rotate: '8deg' },
]

export function Door({
  count,
  title,
  subtitle,
  href,
  children,
}: {
  count: number
  title: string
  subtitle: string
  href: Href
  children: ReactNode
}) {
  return (
    <ZoomLink href={href}>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={`${title}, ${count}`}>
        <XStack
          height={doorHeight}
          borderRadius={16}
          alignItems="center"
          backgroundColor="$backgroundSurface"
        >
          <YStack flex={1} paddingLeft="$lg" gap={2}>
            {/* Tall line box: iOS crops an italic display numeral at a tight one. */}
            <Typography variant="screen-title" fontSize={40} lineHeight={52} color="$accent">
              {count > 0 ? count : ' '}
            </Typography>
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {title}
            </Typography>
            <Typography variant="caption" numberOfLines={2}>
              {subtitle}
            </Typography>
          </YStack>
          <YStack
            width={150}
            height={doorHeight}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {children}
          </YStack>
        </XStack>
      </AnimatedPressable>
    </ZoomLink>
  )
}

export function Fanned({ index, children }: { index: number; children: ReactNode }) {
  const slot = fanSlots[index]
  return (
    <YStack
      position="absolute"
      left={slot.left}
      top={slot.top}
      transform={[{ rotate: slot.rotate }]}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 6 }}
      shadowOpacity={0.4}
      shadowRadius={10}
    >
      {children}
    </YStack>
  )
}

/** Three images held like a hand of cards: paintings, or the faces on holy cards. */
export function ImageFan({ images }: { images: ImageSource[] }) {
  return images.slice(0, fanSlots.length).map((image, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: a fixed hand of three, never reordered
    <Fanned key={i} index={i}>
      <Image
        source={image}
        style={{ width: 74, height: 96, borderRadius: 8 }}
        contentFit="cover"
        contentPosition="top"
        cachePolicy="memory-disk"
      />
    </Fanned>
  ))
}

/** Three books from the catalog, their generated covers fanned. */
export function BookFan({ ids }: { ids: string[] }) {
  useCatalogVersion()
  return ids.slice(0, fanSlots.length).map((id, i) => {
    const entry = getEntry(id)
    const cover = entry && coverFor(entry)
    if (!entry || !cover) return null
    return (
      <Fanned key={id} index={i}>
        <GeneratedCover
          cover={cover}
          title={localizeContent(entry.name ?? {})}
          tone={toneForKey(id)}
          width={66}
        />
      </Fanned>
    )
  })
}
