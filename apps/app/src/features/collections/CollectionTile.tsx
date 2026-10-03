/**
 * One collection item as a self-contained jewel card — the title (and, for a
 * practice, its watercolor icon) live *inside* the card on a deep tone, so a
 * reading with no cover art still reads as a deliberate plate rather than a bare
 * initial. Practices and art-less books draw their generated cover instead
 * (holy card, breviary page, bound volume — see features/covers), so an item
 * reads the same inside a collection as on the shelves.
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
  CollectionItemManifest,
  PracticeManifest,
} from '@/content/manifestTypes'
import { useBookManifest } from '@/features/books/hooks'
import { articleAspect, coverFor, GeneratedCover, type TileCover } from '@/features/covers'
import { artFor } from '@/features/explore/artMap'
import { blockInk, toneByIndex } from '@/features/explore/bgColor'
import { findTocNode } from '@/features/explore/meditationSubtitle'
import { useAllSlots } from '@/features/plan-of-life'
import { practiceHref } from '@/features/practices/practiceHref'
import { localizeContent } from '@/lib/i18n'
import { collectionHref } from './navigation'

// `book/<id>#<chapter>` names one chapter of a book — a single encyclical out
// of a volume of them — so the catalog entry is the book's.
function splitChapterRef(ref: string): { itemRef: string; bookChapter?: string } {
  const hash = ref.indexOf('#')
  if (hash === -1) return { itemRef: ref }
  return { itemRef: ref.slice(0, hash), bookChapter: ref.slice(hash + 1) }
}

export function isReadingRef(ref: string): boolean {
  const entry = getEntry(splitChapterRef(ref).itemRef)
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
  series,
}: {
  item: CollectionItem
  width: number | string
  aspectRatio: number
  /** The collection's name, printed as a tract's kicker. */
  series?: string
}) {
  const allSlots = useAllSlots()
  const { itemRef, bookChapter } = splitChapterRef(item.ref)
  const entry = getEntry(itemRef)
  const id = bareId(itemRef)
  // Book manifests aren't warmed, and the chapter's title lives in the book's TOC.
  const chapterBook = useBookManifest(bookChapter ? id : undefined).data
  const tone = toneByIndex(toneIndexForRef(item.ref))

  let title = item.label
  let icon: string | undefined
  let image = artFor(item.ref)
  let href: Href
  let inPlan = false

  if (entry?.kind === 'book' && bookChapter) {
    title = title ??
      findTocNode(chapterBook?.toc, bookChapter)?.title ??
      entry.name ?? { 'en-US': id }
    href = { pathname: '/browse/book/[bookId]/read', params: { bookId: id, chapter: bookChapter } }
  } else if (entry?.kind === 'book') {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    title = title ?? body?.name ?? entry.name ?? { 'en-US': id }
    href = { pathname: '/browse/book/[bookId]', params: { bookId: id } }
  } else if (entry?.kind === 'chapter') {
    const body = getRememberedManifest<ChapterManifest>(entry.hash)
    title = title ?? body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }
    href = { pathname: '/browse/chapters/[chapterId]', params: { chapterId: id } }
  } else if (entry?.kind === 'collection') {
    // Collection→collection refs let a curated collection point at another —
    // e.g. "The Fathers of the Church" featuring "St. Thomas Aquinas" as a
    // jewel tile. The tile uses the linked collection's own name + art and
    // navigates into that collection's screen. If no art is registered, the
    // collection's icon stands in as a small kicker.
    const body = getRememberedManifest<CollectionItemManifest>(entry.hash)
    title = title ?? body?.name ?? entry.name ?? { 'en-US': id }
    href = collectionHref(item.ref)
    if (!image) icon = body?.icon ?? entry.icon ?? 'book'
  } else {
    const body = getRememberedManifest<PracticeManifest>(entry?.hash ?? '')
    title = title ?? body?.name ?? entry?.name ?? { 'en-US': id }
    icon = body?.icon ?? entry?.icon ?? 'prayer'
    image = undefined
    inPlan = allSlots.some((s) => s.enabled && s.practice_id === id)
    href = practiceHref(id)
  }

  const label = localizeContent(title)
  const cover = (() => {
    if (image || !entry || typeof width !== 'number') return undefined
    // One chapter out of a book reads as a tract, not as the whole volume.
    const c: TileCover | undefined = bookChapter ? { kind: 'article' } : coverFor(entry)
    return c?.kind === 'article' ? { ...c, kicker: series } : c
  })()
  // A small kicker glyph, not a hero illustration — the headline leads.
  const iconSize = typeof width === 'number' ? Math.round(width * 0.17) : 24

  if (cover && typeof width === 'number') {
    // A generated cover keeps its own proportions: a book or tract as tall as
    // the jewel tiles, a card square — all on the row's baseline like books on a shelf.
    const coverWidth = (() => {
      const tall = width / aspectRatio
      if (cover.kind === 'book') return Math.round(tall / 1.5)
      if (cover.kind === 'article') return Math.round(tall / articleAspect)
      return width
    })()
    return (
      <ZoomLink href={href}>
        <AnimatedPressable accessibilityRole="link" accessibilityLabel={label}>
          <YStack flex={1} justifyContent="flex-end">
            <YStack>
              <GeneratedCover cover={cover} title={label} tone={tone} width={coverWidth} />
              {inPlan && <InPlanBadge inset={coverWidth * 0.1} />}
            </YStack>
          </YStack>
        </AnimatedPressable>
      </ZoomLink>
    )
  }

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
          {inPlan && <InPlanBadge inset={8} />}
        </YStack>
      </AnimatedPressable>
    </ZoomLink>
  )
}

function InPlanBadge({ inset }: { inset: number }) {
  return (
    <YStack
      position="absolute"
      top={inset}
      right={inset}
      width={20}
      height={20}
      borderRadius={10}
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgba(0,0,0,0.4)"
    >
      <Check size={12} color={blockInk} />
    </YStack>
  )
}
