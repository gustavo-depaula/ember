import { type Href, useLocalSearchParams, useRouter } from 'expo-router'
import { Check, ChevronDown, ChevronRight, Search } from 'lucide-react-native'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import type { TocNode } from '@/content/manifestTypes'
import { getCursor } from '@/db/repositories'
import { BookHero } from '@/features/books/BookHero'
import { useBookManifest } from '@/features/books/hooks'
import {
  ancestorGroupIds,
  buildCompletedLeafIndex,
  buildLeafCountIndex,
  buildTitleLookup,
  collectAllSectionIds,
  countTocNodes,
  type FlatTocItem,
  flattenToc,
  hasNestedSections,
  localizedTitle,
} from '@/features/books/reader/bookContent'
import { listCompletedChapters } from '@/features/books/reader/chapterCompletions'
import { loadChapterMinutes } from '@/features/books/reader/chapterTimings'
import { ReaderTocSheet } from '@/features/books/reader/ReaderTocSheet'
import { getReadingStreak } from '@/features/books/reader/readingStreak'
import { getReadingTimeMs } from '@/features/books/reader/readingTime'
import { parseReaderPosition } from '@/features/books/reader/useReaderCursor'
import { useReadingFlow } from '@/features/books/reader/useReadingFlow'
import { SessionToast } from '@/features/books/SessionToast'
import { PrologueProse } from '@/features/collections'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { AddToCollectionSheet, LibraryActionRow } from '@/features/library'
import { localizeContent } from '@/lib/i18n'
import { formatSoftRelative } from '@/lib/softRelative'
import { useNowPlayingClearance } from '@/stores/creatorsStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

const nativeTabBarClearance = 56

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const nowPlaying = useNowPlayingClearance()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const background = theme.background?.val ?? '#000000'

  const [addingToCollection, setAddingToCollection] = useState(false)
  const [browsingToc, setBrowsingToc] = useState(false)

  const scrollY = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y
  })

  const bookRef = `book/${bookId}`
  // Resolve the manifest on demand; the catalog hints (`entry`) carry the title
  // and languages meanwhile.
  const { data: book, entry } = useBookManifest(bookId)

  const lang = useMemo(() => {
    const langs = book?.languages ?? entry?.langs ?? []
    return langs.includes(contentLanguage) ? contentLanguage : (langs[0] ?? 'en-US')
  }, [book?.languages, entry?.langs, contentLanguage])

  const { flow: leaves, readableIds } = useReadingFlow(book, lang)
  const titleLookup = useMemo(
    () => (book?.toc ? buildTitleLookup(book.toc, lang) : new Map<string, string>()),
    [book?.toc, lang],
  )
  // 200 nodes is roughly the boundary where eager-rendering one
  // Pressable+ZoomLink per node still feels snappy; beyond that the
  // frontispiece collapses to a compact top-level view + a tap-to-open
  // virtualized sheet (Catholic Encyclopedia is 12k+ nodes).
  const tocTooLarge = useMemo(
    () => (book?.toc ? countTocNodes(book.toc) > 200 : false),
    [book?.toc],
  )

  const completed = useMemo(
    () => (bookId ? listCompletedChapters(bookId) : new Set<string>()),
    [bookId],
  )
  const chapterMinutes = useMemo(() => (bookId ? loadChapterMinutes(bookId) : undefined), [bookId])
  const readingTimeMs = useMemo(() => (bookId ? getReadingTimeMs(bookId) : 0), [bookId])
  const streakDays = useMemo(() => (bookId ? getReadingStreak(bookId) : 0), [bookId])
  const minutesRemaining = useMemo(() => {
    if (!chapterMinutes || leaves.length === 0) return undefined
    let total = 0
    for (const leaf of leaves) {
      if (completed.has(leaf.id)) continue
      const m = chapterMinutes[leaf.id]
      if (typeof m === 'number') total += m
    }
    return total > 0 ? total : undefined
  }, [chapterMinutes, leaves, completed])

  const cursor = getCursor(bookRef)
  const position = cursor ? parseReaderPosition(cursor.position) : undefined
  const resumeChapterId = position?.chapterId

  // Collapsible-tree state for the inline Sumário. Seeded once the manifest
  // loads: small trees open fully (the familiar outline); huge trees stay
  // collapsed to the top level, with the resume chapter's ancestors opened so
  // it's reachable.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const seededExpand = useRef(false)
  useEffect(() => {
    if (seededExpand.current || !book?.toc) return
    seededExpand.current = true
    setExpandedIds(
      tocTooLarge ? ancestorGroupIds(book.toc, resumeChapterId) : collectAllSectionIds(book.toc),
    )
  }, [book?.toc, tocTooLarge, resumeChapterId])

  const flatToc = useMemo(
    () => (book?.toc ? flattenToc(book.toc, expandedIds) : []),
    [book?.toc, expandedIds],
  )
  const toggleTocExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])
  const expandAllToc = useCallback(() => {
    if (book?.toc) setExpandedIds(collectAllSectionIds(book.toc))
  }, [book?.toc])
  const collapseAllToc = useCallback(() => setExpandedIds(new Set()), [])
  const showTocExpandControls = useMemo(
    () => (book?.toc ? hasNestedSections(book.toc) || tocTooLarge : false),
    [book?.toc, tocTooLarge],
  )

  // Leaf totals (and finished counts) for every group row, walked once instead
  // of recursing per row on each scroll frame — the Encyclopedia's letters span
  // ~1,300 chapters each.
  const tocLeafCounts = useMemo(
    () => (book?.toc ? buildLeafCountIndex(book.toc) : new Map<string, number>()),
    [book?.toc],
  )
  const tocCompletedCounts = useMemo(
    () => (book?.toc ? buildCompletedLeafIndex(book.toc, completed) : new Map<string, number>()),
    [book?.toc, completed],
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

  const ctaLabel = resumeChapterId ? t('book.continue') : t('book.startReading')

  const currentLeafIndex = position ? leaves.findIndex((l) => l.id === position.chapterId) : -1
  const progressFraction =
    leaves.length > 0 && currentLeafIndex >= 0
      ? (currentLeafIndex + (position?.fraction ?? 0)) / leaves.length
      : 0

  const readerHref = (chapter?: string): Href => ({
    pathname: '/browse/book/[bookId]/read',
    params: chapter ? { bookId, chapter } : { bookId },
  })

  const hasToc = !!book?.toc && book.toc.length > 0

  return (
    <>
      {/* One virtualized list for the whole screen: the hero + meta live in the
          header so the collapsible Sumário can virtualize (a list can't nest in
          a ScrollView). onScroll still feeds the hero's parallax. */}
      <Animated.FlatList
        data={flatToc}
        keyExtractor={tocKeyExtractor}
        getItemLayout={tocGetItemLayout}
        renderItem={({ item }) => (
          <TocTreeRow
            item={item}
            lang={lang}
            currentChapterId={resumeChapterId}
            completed={completed}
            leafCounts={tocLeafCounts}
            completedCounts={tocCompletedCounts}
            buildHref={readerHref}
            onToggle={toggleTocExpand}
          />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: background }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + nativeTabBarClearance + nowPlaying,
        }}
        contentInsetAdjustmentBehavior="never"
        ListHeaderComponent={
          <>
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
                  minutesRemaining={minutesRemaining}
                  minutesRead={
                    readingTimeMs > 60_000 ? Math.round(readingTimeMs / 60_000) : undefined
                  }
                  streakDays={streakDays > 1 ? streakDays : undefined}
                  updatedAt={position?.updatedAt}
                  label={resumeChapterId ? titleLookup.get(resumeChapterId) : undefined}
                />
              )}

              {description && <PrologueProse text={description} />}

              {hasToc ? (
                <SumarioHeading
                  showExpandControls={showTocExpandControls}
                  showSearch={tocTooLarge}
                  onExpandAll={expandAllToc}
                  onCollapseAll={collapseAllToc}
                  onSearch={() => setBrowsingToc(true)}
                />
              ) : null}
            </YStack>
          </>
        }
      />

      <AddToCollectionSheet
        itemRef={bookRef}
        open={addingToCollection}
        onClose={() => setAddingToCollection(false)}
      />

      {book?.toc ? (
        <ReaderTocSheet
          open={browsingToc}
          onClose={() => setBrowsingToc(false)}
          toc={book.toc}
          readableIds={readableIds}
          currentChapterId={resumeChapterId}
          completedChapterIds={completed}
          onSelect={(chapterId) => {
            setBrowsingToc(false)
            router.push(readerHref(chapterId))
          }}
        />
      ) : null}

      {bookId ? <SessionToast bookId={bookId} /> : null}
    </>
  )
}

const tocRowHeight = 56

function tocKeyExtractor(item: FlatTocItem) {
  return item.node.id
}

function tocGetItemLayout(_: unknown, index: number) {
  return { length: tocRowHeight, offset: tocRowHeight * index, index }
}

function tocTitle(node: TocNode, lang: string): string {
  return localizedTitle(node.title, lang) ?? node.id
}

/** The ✦ Sumário marker, plus expand/collapse + search controls for big trees. */
function SumarioHeading({
  showExpandControls,
  showSearch,
  onExpandAll,
  onCollapseAll,
  onSearch,
}: {
  showExpandControls: boolean
  showSearch: boolean
  onExpandAll: () => void
  onCollapseAll: () => void
  onSearch: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <YStack gap="$sm" paddingTop="$sm">
      <XStack alignItems="center" gap="$sm">
        <Typography fontSize="$1">✦</Typography>
        <Typography variant="screen-title" fontSize="$4" textAlign="left">
          {t('book.contents')}
        </Typography>
        <YStack flex={1} height={1} backgroundColor="$accentSubtle" />
      </XStack>
      {showExpandControls || showSearch ? (
        <XStack alignItems="center" gap="$md">
          {showSearch ? (
            <Pressable
              onPress={onSearch}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('books.searchChapters', { defaultValue: 'Search chapters' })}
            >
              <XStack alignItems="center" gap="$xs">
                <Search size={14} color={theme.accent?.val} />
                <Typography variant="interface" fontSize="$1" color="$accent">
                  {t('books.searchChapters', { defaultValue: 'Search chapters' })}
                </Typography>
              </XStack>
            </Pressable>
          ) : null}
          {showExpandControls ? (
            <XStack gap="$md" marginLeft="auto">
              <Pressable onPress={onExpandAll} hitSlop={8} accessibilityRole="button">
                <Typography variant="interface" fontSize="$1" color="$accent">
                  {t('books.expandAll', { defaultValue: 'Expand all' })}
                </Typography>
              </Pressable>
              <Pressable onPress={onCollapseAll} hitSlop={8} accessibilityRole="button">
                <Typography variant="interface" fontSize="$1" color="$accent">
                  {t('books.collapseAll', { defaultValue: 'Collapse all' })}
                </Typography>
              </Pressable>
            </XStack>
          ) : null}
        </XStack>
      ) : null}
    </YStack>
  )
}

/** Constrains a TOC row to the same centered column the header meta uses. */
function TocRowFrame({ children }: { children: ReactNode }) {
  return (
    <YStack
      width="100%"
      maxWidth={640}
      alignSelf="center"
      paddingHorizontal="$lg"
      backgroundColor="$background"
    >
      {children}
    </YStack>
  )
}

/**
 * One row of the collapsible Sumário. Group nodes (with children) toggle
 * expand/collapse in place; leaf nodes open the reader. Fixed height so the
 * list virtualizes via getItemLayout — the 12k-chapter Encyclopedia stays smooth.
 */
function TocTreeRow({
  item,
  lang,
  currentChapterId,
  completed,
  leafCounts,
  completedCounts,
  buildHref,
  onToggle,
}: {
  item: FlatTocItem
  lang: string
  currentChapterId?: string
  completed: Set<string>
  leafCounts: Map<string, number>
  completedCounts: Map<string, number>
  buildHref: (chapterId: string) => Href
  onToggle: (id: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const router = useRouter()
  const { node, depth, isLeaf, isExpanded } = item
  const title = tocTitle(node, lang)
  const indent = depth * 16

  if (!isLeaf) {
    const total = leafCounts.get(node.id) ?? 0
    const done = completedCounts.get(node.id) ?? 0
    return (
      <TocRowFrame>
        <Pressable
          onPress={() => onToggle(node.id)}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityState={{ expanded: isExpanded }}
          style={{ width: '100%' }}
        >
          <XStack
            height={tocRowHeight}
            alignItems="center"
            gap="$sm"
            paddingLeft={indent}
            borderBottomWidth={0.5}
            borderColor="$accentSubtle"
          >
            {isExpanded ? (
              <ChevronDown size={16} color={theme.colorSecondary?.val} />
            ) : (
              <ChevronRight size={16} color={theme.colorSecondary?.val} />
            )}
            <YStack flex={1} gap="$xs">
              <Typography variant="interface" fontSize="$3" numberOfLines={1}>
                {title}
              </Typography>
              <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.75}>
                {done > 0
                  ? `${done} / ${total}`
                  : t('book.sectionChapters', { defaultValue: '{{count}} chapters', count: total })}
              </Typography>
            </YStack>
          </XStack>
        </Pressable>
      </TocRowFrame>
    )
  }

  const isCurrent = !!currentChapterId && node.id === currentChapterId
  const isCompleted = completed.has(node.id)

  // Plain router.push instead of ZoomLink. AppleZoom triggered from a row
  // inside a scrollable list appears to leave a snapshot view that blocks
  // taps on the frontispiece after the modal dismisses. The Hero keeps its
  // zoom morph.
  return (
    <TocRowFrame>
      <Pressable
        onPress={() => router.push(buildHref(node.id))}
        accessibilityRole="link"
        accessibilityLabel={title}
        style={{ width: '100%' }}
      >
        <XStack
          height={tocRowHeight}
          alignItems="center"
          gap="$sm"
          paddingLeft={indent}
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
          {node.pointRange ? (
            <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.8}>
              {`${node.pointRange.from}–${node.pointRange.to}`}
            </Typography>
          ) : null}
          {isCompleted ? (
            <Check size={14} color={theme.accent?.val ?? theme.colorSecondary?.val} />
          ) : null}
          <ChevronRight
            size={16}
            color={isCurrent ? theme.accent?.val : theme.colorSecondary?.val}
          />
        </XStack>
      </Pressable>
    </TocRowFrame>
  )
}

function BookProgressLine({
  fraction,
  currentLeafIndex,
  totalLeaves,
  completedCount,
  minutesRemaining,
  minutesRead,
  streakDays,
  updatedAt,
  label,
}: {
  fraction: number
  currentLeafIndex: number
  totalLeaves: number
  completedCount: number
  minutesRemaining?: number
  minutesRead?: number
  streakDays?: number
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
      <XStack alignItems="center" justifyContent="space-between">
        {minutesRead ? (
          <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.7}>
            {t('book.totalReadTime', {
              defaultValue: 'Read for {{when}}',
              when: formatMinutes(minutesRead),
            })}
          </Typography>
        ) : (
          <YStack />
        )}
        {minutesRemaining ? (
          <Typography variant="label" fontSize="$1" color="$colorSecondary" opacity={0.7}>
            {t('book.timeToFinish', {
              defaultValue: '~{{when}} to finish',
              when: formatMinutes(minutesRemaining),
            })}
          </Typography>
        ) : null}
      </XStack>
      {streakDays ? (
        <Typography variant="label" fontSize="$1" color="$accent" opacity={0.85}>
          {t('book.streak', {
            defaultValue: '🔥 {{count}}-day reading streak',
            count: streakDays,
          })}
        </Typography>
      ) : null}
    </YStack>
  )
}
