import { useQuery } from '@tanstack/react-query'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView, useWindowDimensions, type ViewToken } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { InlineRetry, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import {
  chantSummary,
  loadChant,
  loadChantBooks,
  romanMode,
  ScoreView,
  sectionOf,
} from '@/features/chant'
import { readingScale, useReadingFontSizePx } from '@/hooks/useReadingStyle'
import { localizeContent } from '@/lib/i18n'

const gutter = 20
// The page that fills the screen is the one being read.
const viewability = { itemVisiblePercentThreshold: 60 }
// A staff wider than this spreads its neumes too thin to read as phrases.
const maxScoreWidth = 720

// One chant in square notes. Opened from a section of its book, it is a page
// among that section's chants — the Kyrie, then a swipe to the Gloria.
export default function ChantScreen() {
  const { t } = useTranslation()
  const { chantId, section } = useLocalSearchParams<{ chantId: string; section?: string }>()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const catalogVersion = useCatalogVersion()
  const { width: pageWidth } = useWindowDimensions()
  const id = `chant/${chantId}`

  const booksQuery = useQuery({
    queryKey: ['chant-books', catalogVersion],
    queryFn: loadChantBooks,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const reading = booksQuery.data ? sectionOf(booksQuery.data, id, section)?.section : undefined
  const chants = useMemo(() => reading?.chants ?? [id], [reading, id])

  // The page shown, once the reader has moved; until then, the chant asked for.
  const [turnedTo, setTurnedTo] = useState<number>()
  const opensAt = Math.max(0, chants.indexOf(id))
  const index = turnedTo ?? opensAt
  const pager = useRef<FlatList<string>>(null)
  const strip = useRef<ScrollView>(null)
  const tabOffsets = useRef<number[]>([])

  const show = useCallback((next: number) => {
    setTurnedTo(next)
    strip.current?.scrollTo({ x: Math.max(0, (tabOffsets.current[next] ?? 0) - 48) })
  }, [])

  const onPageShown = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<string>[] }) => {
      const page = viewableItems[0]?.index
      if (typeof page === 'number') show(page)
    },
    [show],
  )

  const renderPage = useCallback(
    ({ item }: { item: string }) => <ChantPage id={item} pageWidth={pageWidth} />,
    [pageWidth],
  )

  const heading = reading ? localizeContent(reading.title) : chantSummary(id).name

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <Stack.Screen options={{ title: heading }} />
      <XStack alignItems="center" gap="$md" paddingVertical="$md" paddingHorizontal={gutter}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={24} color={theme.color.val} />
        </Pressable>
        <YStack flex={1}>
          <Typography variant="label" numberOfLines={1}>
            {heading}
          </Typography>
          {reading?.name && (
            <Typography variant="annotation" fontStyle="italic" numberOfLines={1}>
              {reading.name}
            </Typography>
          )}
        </YStack>
      </XStack>

      {chants.length > 1 && (
        <ScrollView
          ref={strip}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: gutter, gap: 20 }}
          accessibilityRole="tablist"
        >
          {chants.map((chant, i) => {
            const on = i === index
            const { name } = chantSummary(chant)
            return (
              <Pressable
                key={chant}
                onLayout={(e) => {
                  tabOffsets.current[i] = e.nativeEvent.layout.x
                }}
                onPress={() => {
                  show(i)
                  pager.current?.scrollToIndex({ index: i })
                }}
                accessibilityRole="tab"
                accessibilityLabel={name}
                accessibilityState={{ selected: on }}
                aria-selected={on}
              >
                <YStack minHeight={44} justifyContent="center">
                  <YStack
                    paddingBottom={3}
                    borderBottomWidth={1.5}
                    borderBottomColor={on ? '$accent' : 'transparent'}
                  >
                    <Typography fontSize="$3" color={on ? '$accent' : '$colorSecondary'}>
                      {name}
                    </Typography>
                  </YStack>
                </YStack>
              </Pressable>
            )
          })}
        </ScrollView>
      )}

      {booksQuery.isError && (
        <YStack paddingHorizontal={gutter}>
          <InlineRetry onRetry={() => booksQuery.refetch()} />
        </YStack>
      )}

      {/* Keyed by the section: its chants arrive with the book, and a pager
          cannot move its first page once it has mounted. */}
      {!booksQuery.isPending && (
        <FlatList
          key={`${reading?.id}:${pageWidth}`}
          ref={pager}
          style={{ flex: 1 }}
          data={chants}
          renderItem={renderPage}
          keyExtractor={(chant) => chant}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={opensAt}
          // Mounted already at the chant: initialScrollIndex alone scrolls
          // there a frame later, and the frame before shows the first page.
          contentOffset={{ x: pageWidth * opensAt, y: 0 }}
          getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
          onViewableItemsChanged={onPageShown}
          viewabilityConfig={viewability}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
        />
      )}
    </YStack>
  )
}

const ChantPage = memo(function ChantPage({ id, pageWidth }: { id: string; pageWidth: number }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const catalogVersion = useCatalogVersion()
  // The score follows the reader's text size, as every other page does.
  const scale = useReadingFontSizePx() / readingScale.fontSize[2]
  const scoreWidth = Math.min(pageWidth, maxScoreWidth) - gutter * 2

  const chantQuery = useQuery({
    queryKey: ['chant', id, catalogVersion],
    queryFn: async () => (await loadChant(id)) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const chant = chantQuery.data

  return (
    <ScrollView
      style={{ width: pageWidth }}
      contentContainerStyle={{
        width: scoreWidth,
        alignSelf: 'center',
        paddingTop: 16,
        paddingBottom: insets.bottom + bottomClearance + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {chantQuery.isError && <InlineRetry onRetry={() => chantQuery.refetch()} />}
      {chant === null && <Typography tone="muted">{t('chant.notFound')}</Typography>}
      {chant && (
        <YStack gap="$md">
          <YStack gap={2}>
            <Typography variant="sacred-title">{chant.name}</Typography>
            {chant.subtitle && (
              <Typography fontStyle="italic" tone="muted" textAlign="center">
                {chant.subtitle}
              </Typography>
            )}
            <Typography variant="annotation" textAlign="center">
              {[chant.mode && t('chant.mode', { mode: romanMode(chant.mode) }), chant.commentary]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </YStack>
          <ScoreView score={chant.score} width={scoreWidth} scale={scale} label={chant.name} />
          <Typography variant="reference" textAlign="center" paddingTop="$md">
            {[
              chant.book,
              chant.transcriber && t('chant.transcribedBy', { name: chant.transcriber }),
              t('chant.license'),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </YStack>
      )}
    </ScrollView>
  )
})
