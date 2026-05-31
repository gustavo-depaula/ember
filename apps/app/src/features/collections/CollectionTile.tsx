/**
 * One collection item as a self-contained jewel card — the title (and, for a
 * practice, its watercolor icon) live *inside* the card on a deep tone, so a
 * reading with no cover art still reads as a deliberate plate rather than a bare
 * initial. Reading items (book / chapter) and practice items (devotions,
 * prayers, litanies) share the same card; only the icon and route differ.
 */

import { Image } from 'expo-image'
import type { Href } from 'expo-router'
import { Check } from 'lucide-react-native'
import { StyleSheet } from 'react-native'
import { YStack } from 'tamagui'

import { AnimatedPressable, ZoomLink } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { Typography } from '@/components/typography'
import { bareId, getEntry, getRememberedManifest } from '@/content/contentIndex'
import type {
  BookEntry,
  ChapterManifest,
  CollectionItem,
  PracticeManifest,
} from '@/content/manifestTypes'
import { artFor } from '@/features/explore/artMap'
import { blockInk, toneByIndex } from '@/features/explore/bgColor'
import { useAllSlots } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

export function isReadingRef(ref: string): boolean {
  const entry = getEntry(ref)
  return entry?.kind === 'book' || entry?.kind === 'chapter'
}

// Stable tone per item so colours don't reshuffle as the catalog warms.
function toneIndexForRef(ref: string): number {
  let h = 0
  for (let i = 0; i < ref.length; i++) h = (h + ref.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Soft hyphens (U+00AD) let a long headline word break with a visible "-"
// instead of a hard mid-word cut; they stay invisible when the word fits. Seeded
// every 3 chars in words ≥8 long, keeping ≥3 chars on each side of a break.
const shy = String.fromCharCode(0xad)
const softHyphenate = (text: string): string =>
  text.replace(/[\p{L}]{8,}/gu, (word) => {
    const chars = Array.from(word)
    let out = ''
    for (let i = 0; i < chars.length; i++) {
      out += chars[i]
      const fromStart = i + 1
      if (fromStart >= 3 && chars.length - fromStart >= 3 && fromStart % 3 === 0) out += shy
    }
    return out
  })

export function CollectionTile({
  item,
  width,
  aspectRatio,
}: {
  item: CollectionItem
  width: number | string
  aspectRatio: number
}) {
  const allSlots = useAllSlots()
  const entry = getEntry(item.ref)
  const id = bareId(item.ref)
  const tone = toneByIndex(toneIndexForRef(item.ref))

  let title = item.label
  let icon: string | undefined
  let image = artFor(item.ref)
  let href: Href
  let inPlan = false

  if (entry?.kind === 'book') {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    title = title ?? body?.name ?? entry.name ?? { 'en-US': id }
    href = { pathname: '/browse/book/[bookId]', params: { bookId: id } }
  } else if (entry?.kind === 'chapter') {
    const body = getRememberedManifest<ChapterManifest>(entry.hash)
    title = title ?? body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }
    href = { pathname: '/browse/chapters/[chapterId]', params: { chapterId: id } }
  } else {
    const body = getRememberedManifest<PracticeManifest>(entry?.hash ?? '')
    title = title ?? body?.name ?? entry?.name ?? { 'en-US': id }
    icon = body?.icon ?? entry?.icon ?? 'prayer'
    image = undefined
    inPlan = allSlots.some((s) => s.enabled && s.practice_id === id)
    href = { pathname: '/practices/[manifestId]', params: { manifestId: id } }
  }

  const label = localizeContent(title)
  // A small kicker glyph, not a hero illustration — the headline leads.
  const iconSize = typeof width === 'number' ? Math.round(width * 0.17) : 24

  return (
    <ZoomLink href={href}>
      <AnimatedPressable accessibilityRole="link" accessibilityLabel={label}>
        <YStack
          width={width}
          aspectRatio={aspectRatio}
          borderRadius={4}
          overflow="hidden"
          backgroundColor={tone.from}
        >
          {image && (
            <Image
              source={image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              accessibilityLabel={label}
            />
          )}
          <YStack
            flex={1}
            padding="$md"
            justifyContent="space-between"
            backgroundColor={image ? 'rgba(0,0,0,0.4)' : 'transparent'}
          >
            {icon ? <PracticeIcon name={icon} size={iconSize} /> : <YStack />}
            <Typography
              variant="screen-title"
              color={blockInk}
              fontSize={19}
              lineHeight={24}
              textAlign="left"
            >
              {softHyphenate(label)}
            </Typography>
          </YStack>
          {inPlan && (
            <YStack
              position="absolute"
              top={8}
              right={8}
              width={20}
              height={20}
              borderRadius={10}
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgba(0,0,0,0.4)"
            >
              <Check size={12} color={blockInk} />
            </YStack>
          )}
        </YStack>
      </AnimatedPressable>
    </ZoomLink>
  )
}
