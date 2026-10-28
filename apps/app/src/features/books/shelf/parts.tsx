import { Image } from 'expo-image'
import { type Href, useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { GeneratedCover } from '@/features/covers'
import { ArtCoverCard } from '@/features/explore/ArtCoverCard'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { useHeldCards, useSaintsCatalog } from '@/features/saints'
import type { ShelfAuthor, ShelfBook } from './catalog'

export function bookHref(book: ShelfBook) {
  return { pathname: '/browse/book/[bookId]', params: { bookId: book.bareId } } as const
}

/** A book's cover with its title beneath, as the shelves have always drawn it. */
export function ShelfCover({
  book,
  size,
  subtitle,
}: {
  book: ShelfBook
  size: number
  subtitle?: string
}) {
  return (
    <ArtCoverCard
      title={book.title}
      subtitle={subtitle}
      image={artFor(book.id)}
      tone={toneForKey(book.id)}
      cover={book.cover}
      size={size}
      aspectRatio={1.5}
      radius={6}
      href={bookHref(book)}
    />
  )
}

const thumbWidth = 44

/** One book on a line: its cover small, its title, a line under it, and a figure at the end. */
export function BookRow({
  book,
  detail,
  trailing,
}: {
  book: ShelfBook
  detail?: string
  trailing?: string
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const image = artFor(book.id)
  return (
    <AnimatedPressable
      onPress={() => router.push(bookHref(book))}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: book.title })}
    >
      <XStack gap="$md" alignItems="center" paddingVertical="$xs" minHeight={56}>
        {image || !book.cover ? (
          <YStack
            width={thumbWidth}
            height={thumbWidth * 1.5}
            borderRadius={4}
            overflow="hidden"
            backgroundColor={toneForKey(book.id).from}
          >
            {image ? (
              <Image
                source={image}
                style={{ flex: 1 }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : null}
          </YStack>
        ) : (
          <GeneratedCover
            cover={book.cover}
            title={book.title}
            tone={toneForKey(book.id)}
            width={thumbWidth}
          />
        )}
        <YStack flex={1} gap={2}>
          <Typography fontSize="$3" numberOfLines={2}>
            {book.title}
          </Typography>
          {detail ? (
            <Typography variant="caption" numberOfLines={1}>
              {detail}
            </Typography>
          ) : null}
        </YStack>
        {trailing ? (
          <Typography variant="caption" fontVariant={['tabular-nums']}>
            {trailing}
          </Typography>
        ) : null}
      </XStack>
    </AnimatedPressable>
  )
}

/**
 * An author's face: their holy card, coloured once a copy is held and its sepia
 * print till then, as the album shows it; the name's initial for an author with
 * no card.
 */
export function AuthorFace({ author, size }: { author: ShelfAuthor; size: number }) {
  const { byId } = useSaintsCatalog()
  const held = useHeldCards()
  const saint = author.saint ? byId[author.saint] : undefined
  const face = saint && (held.has(saint.id) ? saint.cardThumb : saint.printThumb)
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 2}
      overflow="hidden"
      alignItems="center"
      justifyContent="center"
      backgroundColor="$backgroundSurface"
      borderWidth={1}
      borderColor="$accentSubtle"
    >
      {face ? (
        <Image
          source={face}
          style={{ width: size, height: size }}
          contentFit="cover"
          contentPosition="top"
          cachePolicy="memory-disk"
        />
      ) : (
        <Typography
          variant="label"
          fontSize={Math.round(size * 0.36)}
          lineHeight={Math.round(size * 0.5)}
          tone="muted"
        >
          {initialOf(author.name)}
        </Typography>
      )}
    </YStack>
  )
}

// "S. Agostinho" is filed under A, not S: the honorific is skipped.
const honorifics = /^(St\.|Sts\.|Santo|Santa|São|S\.|Bp\.|D\.|Fr\.|P\.|Madre|Mother|Pope|Papa)\s+/i

export function sortName(name: string): string {
  return name.replace(honorifics, '')
}

function initialOf(name: string): string {
  return Array.from(sortName(name))[0]?.toUpperCase() ?? ''
}

/** An author's face over their name, opening their shelf. */
export function AuthorTile({ author, size = 62 }: { author: ShelfAuthor; size?: number }) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/browse/books/author/[authorId]',
          params: { authorId: author.id },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: author.name })}
    >
      <YStack width={size + 18} alignItems="center" gap="$xs">
        <AuthorFace author={author} size={size} />
        <Typography variant="caption" textAlign="center" numberOfLines={2}>
          {author.name}
        </Typography>
      </YStack>
    </AnimatedPressable>
  )
}

export function ShelfLabel({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <XStack alignItems="baseline" justifyContent="space-between" gap="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {children}
      </Typography>
      {action}
    </XStack>
  )
}

/** "15 min" under an hour; past it, whole hours, since a long book's minutes are noise. */
export function useReadingTime(): (minutes: number | undefined) => string | undefined {
  const { t } = useTranslation()
  return (minutes) => {
    if (minutes === undefined) return undefined
    if (minutes < 60) return `${minutes} min`
    return t('shelf.hours', { count: Math.round(minutes / 60) })
  }
}

/** A line that opens a page of the shelf: a small cover, a name, what is inside. */
export function LinkRow({
  thumb,
  title,
  detail,
  href,
}: {
  thumb: ReactNode
  title: string
  detail?: string
  href: Href
}) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <AnimatedPressable
      onPress={() => router.push(href)}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: title })}
    >
      <XStack gap="$md" alignItems="center" paddingVertical="$xs" minHeight={56}>
        <YStack width={thumbWidth} alignItems="center">
          {thumb}
        </YStack>
        <YStack flex={1} gap={2}>
          <Typography fontSize="$3">{title}</Typography>
          {detail ? (
            <Typography variant="caption" numberOfLines={2}>
              {detail}
            </Typography>
          ) : null}
        </YStack>
        <Typography tone="muted" fontSize="$4">
          ›
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}

/** A book's cover at row size, from its catalog hint. */
export function BookThumb({ book }: { book: ShelfBook }) {
  if (!book.cover) return null
  return (
    <GeneratedCover
      cover={book.cover}
      title={book.title}
      tone={toneForKey(book.id)}
      width={thumbWidth}
    />
  )
}

/**
 * A row of typographic choices: the chosen one in ink over a gold rule, the
 * rest muted. Moves on tap, from local state.
 */
export function ShelfTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; detail?: string }>
  value: T | undefined
  onChange: (value: T) => void
}) {
  return (
    <XStack gap="$lg" flexWrap="wrap" rowGap="$sm">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <AnimatedPressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            hitSlop={8}
          >
            <YStack alignItems="center" gap={4} minHeight={32} justifyContent="flex-end">
              <XStack alignItems="baseline" gap={4}>
                <Typography fontSize="$3" tone={selected ? undefined : 'muted'}>
                  {option.label}
                </Typography>
                {option.detail ? (
                  <Typography variant="caption" fontVariant={['tabular-nums']}>
                    {option.detail}
                  </Typography>
                ) : null}
              </XStack>
              <YStack
                height={2}
                alignSelf="stretch"
                backgroundColor={selected ? '$accent' : 'transparent'}
              />
            </YStack>
          </AnimatedPressable>
        )
      })}
    </XStack>
  )
}

const languageCodes: Record<string, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  la: 'LA',
  it: 'IT',
  'fr-FR': 'FR',
}

/** "PT · EN · LA": the languages a book reads in. */
export function languagesOf(book: ShelfBook): string {
  return book.langs.map((l) => languageCodes[l] ?? l.toUpperCase()).join(' · ')
}
