import { useQuery } from '@tanstack/react-query'
import { type Href, useLocalSearchParams } from 'expo-router'
import { Check, ChevronRight } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { ZoomLink } from '@/components/ZoomLink'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { BookEntry, TocNode } from '@/content/manifestTypes'
import { getCursor } from '@/db/repositories'
import { BookHero } from '@/features/books/BookHero'
import { buildTitleLookup, flattenTocLeaves } from '@/features/books/reader/bookContent'
import { listCompletedChapters } from '@/features/books/reader/chapterCompletions'
import { parseReaderPosition } from '@/features/books/reader/useReaderCursor'
import { PrologueProse } from '@/features/collections'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { AddToCollectionSheet, LibraryActionRow } from '@/features/library'
import { localizeContent } from '@/lib/i18n'
import { formatSoftRelative } from '@/lib/softRelative'
import { useNowPlayingClearance } from '@/stores/creatorsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const nativeTabBarClearance = 56

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const nowPlaying = useNowPlayingClearance()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const background = theme.background?.val ?? '#000000'

  const [addingToCollection, setAddingToCollection] = useState(false)

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const bookRef = `book/${bookId}`
  const entry = getEntry(bookRef)

  // Eager-fetch the manifest (rather than waiting on the background warmer) so
  // an unwarmed book resolves fast; the catalog hints carry the title meanwhile.
  const { data: book } = useQuery({
    queryKey: ['book-manifest', entry?.hash],
    queryFn: () => ensureManifestBody<BookEntry>(entry?.hash ?? ''),
    enabled: !!entry,
    staleTime: Number.POSITIVE_INFINITY,
  })

  const lang = useMemo(() => {
    const langs = book?.languages ?? entry?.langs ?? []
    return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
  }, [book?.languages, entry?.langs, contentLanguage])

  const leaves = useMemo(() => (book?.toc ? flattenTocLeaves(book.toc) : []), [book?.toc])
  const titleLookup = useMemo(
    () => (book?.toc ? buildTitleLookup(book.toc, lang) : new Map<string, string>()),
    [book?.toc, lang],
  )

  if (!entry) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Typography variant="interface" tone="muted">
          {t('browse.bookNotFound', { defaultValue: 'Book not found.' })}
        </Typography>
      </YStack>
    )
  }

  const name = localizeContent((book?.name ?? entry.name ?? { 'en-US': bookId ?? '' }) as never)
  const authorSrc = book?.author ?? entry.author
  const author = authorSrc ? localizeContent(authorSrc as never) : undefined
  const description = book?.description ? localizeContent(book.description) : undefined

  const cursor = getCursor(bookRef)
  const position = cursor ? parseReaderPosition(cursor.position) : undefined
  const resumeChapterId = position?.chapterId
  const ctaLabel = resumeChapterId ? t('book.continue') : t('book.startReading')
  const completed = bookId ? listCompletedChapters(bookId) : new Set<string>()

  const currentLeafIndex = position ? leaves.findIndex((l) => l.id === position.chapterId) : -1
  const progressFraction =
    leaves.length > 0 && currentLeafIndex >= 0
      ? (currentLeafIndex + (position?.fraction ?? 0)) / leaves.length
      : 0

  const readerHref = (chapter?: string): Href => ({
    pathname: '/browse/book/[bookId]/read',
    params: chapter ? { bookId, chapter } : { bookId },
  })

  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying,
        }}
        contentInsetAdjustmentBehavior="never"
      >
        <BookHero
          name={name}
          author={author}
          ctaLabel={ctaLabel}
          tone={toneByIndex(toneIndexForId(bookRef))}
          scrollY={scrollY}
          readHref={readerHref()}
        />

        {/* Opaque column over the hero's lower bleed; paddingTop clears the
            floating capsule that straddles the seam. */}
        <YStack
          width="100%"
          maxWidth={640}
          alignSelf="center"
          paddingHorizontal="$lg"
          paddingTop={40}
          gap="$lg"
          backgroundColor="$background"
        >
          <LibraryActionRow
            itemId={bookRef}
            kind="book"
            onAddToCollection={() => setAddingToCollection(true)}
          />

          {progressFraction > 0 && (
            <BookProgressLine
              fraction={progressFraction}
              currentLeafIndex={currentLeafIndex}
              totalLeaves={leaves.length}
              completedCount={completed.size}
              updatedAt={position?.updatedAt}
              label={resumeChapterId ? titleLookup.get(resumeChapterId) : undefined}
            />
          )}

          {description && <PrologueProse text={description} />}

          {book?.toc && book.toc.length > 0 && (
            <Contents
              toc={book.toc}
              lang={lang}
              currentChapterId={resumeChapterId}
              completed={completed}
              buildHref={readerHref}
            />
          )}
        </YStack>
      </Animated.ScrollView>

      <AddToCollectionSheet
        itemRef={bookRef}
        open={addingToCollection}
        onClose={() => setAddingToCollection(false)}
      />
    </>
  )
}

/** The table of contents — an illuminated marker + a tappable chapter list. */
function Contents({
  toc,
  lang,
  currentChapterId,
  completed,
  buildHref,
}: {
  toc: TocNode[]
  lang: string
  currentChapterId?: string
  completed: Set<string>
  buildHref: (chapterId: string) => Href
}) {
  const { t } = useTranslation()
  return (
    <YStack gap="$md">
      <XStack alignItems="center" gap="$sm" paddingTop="$sm">
        <Typography fontSize="$1">✦</Typography>
        <Typography variant="screen-title" fontSize="$4" textAlign="left">
          {t('book.contents')}
        </Typography>
        <YStack flex={1} height={1} backgroundColor="$accentSubtle" />
      </XStack>
      <YStack>
        {toc.map((node) => (
          <TocNodeRow
            key={node.id}
            node={node}
            lang={lang}
            depth={0}
            currentChapterId={currentChapterId}
            completed={completed}
            buildHref={buildHref}
          />
        ))}
      </YStack>
    </YStack>
  )
}

function TocNodeRow({
  node,
  lang,
  depth,
  currentChapterId,
  completed,
  buildHref,
}: {
  node: TocNode
  lang: string
  depth: number
  currentChapterId?: string
  completed: Set<string>
  buildHref: (chapterId: string) => Href
}) {
  const theme = useTheme()
  const title =
    (node.title as Record<string, string>)[lang] ?? Object.values(node.title)[0] ?? node.id

  if (node.children?.length) {
    return (
      <YStack gap="$xs" paddingTop="$sm">
        <Typography variant="label" fontSize="$1" paddingLeft={depth * 16}>
          {title}
        </Typography>
        {node.children.map((child) => (
          <TocNodeRow
            key={child.id}
            node={child}
            lang={lang}
            depth={depth + 1}
            currentChapterId={currentChapterId}
            completed={completed}
            buildHref={buildHref}
          />
        ))}
      </YStack>
    )
  }

  const isCurrent = !!currentChapterId && node.id === currentChapterId
  const isCompleted = completed.has(node.id)

  return (
    <ZoomLink href={buildHref(node.id)}>
      <Pressable accessibilityRole="link" accessibilityLabel={title}>
        <XStack
          alignItems="center"
          gap="$sm"
          paddingVertical="$sm"
          paddingLeft={depth * 16}
          borderBottomWidth={0.5}
          borderColor="$accentSubtle"
        >
          <Typography
            variant="interface"
            fontSize="$3"
            flex={1}
            numberOfLines={2}
            color={isCurrent ? '$accent' : '$color'}
            opacity={isCompleted && !isCurrent ? 0.6 : 1}
          >
            {title}
          </Typography>
          {isCompleted ? (
            <Check size={14} color={theme.accent?.val ?? theme.colorSecondary?.val} />
          ) : null}
          <ChevronRight
            size={16}
            color={isCurrent ? theme.accent?.val : theme.colorSecondary?.val}
          />
        </XStack>
      </Pressable>
    </ZoomLink>
  )
}

function BookProgressLine({
  fraction,
  currentLeafIndex,
  totalLeaves,
  completedCount,
  updatedAt,
  label,
}: {
  fraction: number
  currentLeafIndex: number
  totalLeaves: number
  completedCount: number
  updatedAt?: number
  label?: string
}) {
  const { t } = useTranslation()
  const percent = Math.max(1, Math.round(fraction * 100))

  return (
    <YStack gap="$xs" paddingHorizontal="$xs">
      <XStack height={4} backgroundColor="$accentSubtle" borderRadius={2} overflow="hidden">
        <YStack width={`${percent}%`} height={4} backgroundColor="$accent" borderRadius={2} />
      </XStack>
      <XStack alignItems="center" gap="$xs" justifyContent="space-between">
        <Typography variant="label" fontSize="$1" color="$colorSecondary">
          {t('book.progressLine', {
            defaultValue: '{{percent}}% · Chapter {{current}} of {{total}}',
            percent,
            current: Math.max(1, currentLeafIndex + 1),
            total: totalLeaves,
          })}
        </Typography>
        {label ? (
          <Typography
            variant="label"
            fontSize="$1"
            color="$colorSecondary"
            numberOfLines={1}
            flex={1}
            textAlign="right"
            opacity={0.7}
          >
            {label}
          </Typography>
        ) : null}
      </XStack>
      <XStack alignItems="center" justifyContent="space-between">
        {completedCount > 0 ? (
          <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.7}>
            {t('book.chaptersFinished', {
              defaultValue: '{{done}} of {{total}} chapters finished',
              done: completedCount,
              total: totalLeaves,
            })}
          </Typography>
        ) : (
          <YStack />
        )}
        {updatedAt ? (
          <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.7}>
            {t('book.lastRead', {
              defaultValue: 'Last read {{when}}',
              when: formatSoftRelative(updatedAt, {
                justNow: t('common.justNow', { defaultValue: 'just now' }),
                aMomentAgo: t('common.aMomentAgo', { defaultValue: 'a moment ago' }),
              }),
            })}
          </Typography>
        ) : null}
      </XStack>
    </YStack>
  )
}
