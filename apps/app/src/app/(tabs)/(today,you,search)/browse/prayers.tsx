import { Image, type ImageSource } from 'expo-image'
import { Stack, useRouter } from 'expo-router'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'

import {
  HubFrame,
  HubHeader,
  PageHeader,
  RailBlock,
  RailLink,
  Typography,
  useHubIndexShown,
  useHubList,
  usePageWidth,
} from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { bareId, getEntry, isMetaId } from '@/content/contentIndex'
import { minutesText, practiceMinutes } from '@/content/duration'
import { getAllManifests, isAlternateForm } from '@/content/resolver'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { coverFor, GeneratedCover, type TileCover } from '@/features/covers'
import { artFor } from '@/features/explore/artMap'
import { toneForKey } from '@/features/explore/bgColor'
import { practiceHref } from '@/features/practices/practiceHref'
import {
  prayerDevotions as devotions,
  type PrayerFacet as Facet,
  prayerForms as forms,
} from '@/features/practices/prayerFacets'
import { localizeContent } from '@/lib/i18n'

type Prayer = {
  id: string
  title: string
  minutes?: string
  tags: Set<string>
  image?: ImageSource
  cover?: TileCover
}

// The row's tile is the one the practice wears on Today and in collections, in miniature.
const tileSize = 72
function has(prayer: Prayer, facet: Facet | undefined): boolean {
  return !facet || facet.tags.some((tag) => prayer.tags.has(tag))
}

// Every prayer in the corpus in one list, narrowed by form and by devotion.
export default function AllPrayersScreen() {
  const { t, i18n } = useTranslation()
  const catalogVersion = useCatalogVersion()
  const [formKey, setFormKey] = useState<string>()
  const [devotionKey, setDevotionKey] = useState<string>()
  // With room for it the two facets stand down the side, as on the website.
  const sideIndex = useHubIndexShown()

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion bumps as manifests warm; titles localize per language.
  const prayers = useMemo<Prayer[]>(
    () =>
      getAllManifests()
        .filter((m) => !isAlternateForm(m) && !isMetaId(m.id))
        .map((m) => {
          const entry = getEntry(m.id)
          return {
            id: bareId(m.id),
            title: localizeContent(m.name),
            minutes: minutesText(practiceMinutes(m)),
            tags: new Set([...(m.tags ?? []), ...(m.categories ?? [])]),
            image: artFor(m.id),
            cover: entry && coverFor(entry),
          }
        })
        .sort((a, b) => a.title.localeCompare(b.title)),
    [catalogVersion, i18n.language],
  )

  const form = forms.find((f) => f.key === formKey)
  const devotion = devotions.find((d) => d.key === devotionKey)
  const shown = useMemo(
    () => prayers.filter((p) => has(p, form) && has(p, devotion)),
    [prayers, form, devotion],
  )

  return (
    <HubFrame
      index={
        <>
          <RailBlock first>
            <FacetList
              allLabel={t('search.allForms')}
              facets={forms}
              labelFor={(key) => t(`search.form.${key}`)}
              selected={formKey}
              onSelect={setFormKey}
            />
          </RailBlock>
          <RailBlock>
            <FacetList
              allLabel={t('search.allDevotions')}
              facets={devotions}
              labelFor={(key) => t(`search.devotion.${key}`)}
              selected={devotionKey}
              onSelect={setDevotionKey}
            />
          </RailBlock>
        </>
      }
    >
      <Stack.Screen options={{ title: t('search.prayers') }} />
      <PrayerList
        shown={shown}
        facets={
          sideIndex ? undefined : (
            <>
              <FacetRow
                allLabel={t('search.allForms')}
                facets={forms}
                labelFor={(key) => t(`search.form.${key}`)}
                selected={formKey}
                onSelect={setFormKey}
              />
              <FacetRow
                allLabel={t('search.allDevotions')}
                facets={devotions}
                labelFor={(key) => t(`search.devotion.${key}`)}
                selected={devotionKey}
                onSelect={setDevotionKey}
              />
            </>
          )
        }
      />
    </HubFrame>
  )
}

// Two rows abreast once each has room for a title beside its tile.
const twoColumnsFrom = 640
const columnGap = 48

// Inside the frame, so the list pads and sizes itself from the hub's own column.
function PrayerList({ shown, facets }: { shown: Prayer[]; facets?: ReactNode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { paddingLeft, paddingRight, onScroll, scrollEventThrottle } = useHubList()
  const pageWidth = usePageWidth()
  const columns = pageWidth >= twoColumnsFrom ? 2 : 1
  // Set, not flexed: the last of an odd count keeps to its own column.
  const rowWidth = columns > 1 ? (pageWidth - columnGap) / 2 : undefined

  const renderItem = useCallback(
    ({ item }: { item: Prayer }) => (
      <Pressable
        style={{ width: rowWidth }}
        onPress={() => router.push(practiceHref(item.id))}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.viewPractice', { name: item.title })}
      >
        <XStack
          paddingVertical="$sm"
          alignItems="center"
          gap="$md"
          borderBottomWidth={columns > 1 ? 0.5 : 0}
          borderBottomColor="$borderColor"
        >
          <PrayerTile prayer={item} />
          <YStack flex={1}>
            <Typography fontSize="$4" numberOfLines={2}>
              {item.title}
            </Typography>
            {item.minutes && <Typography variant="annotation">{item.minutes}</Typography>}
          </YStack>
        </XStack>
      </Pressable>
    ),
    [router, t, columns, rowWidth],
  )

  return (
    <FlatList
      // numColumns can't change on a mounted list.
      key={columns}
      numColumns={columns}
      columnWrapperStyle={columns > 1 ? { gap: columnGap } : undefined}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingLeft,
        paddingRight,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + bottomClearance + 24,
      }}
      contentInsetAdjustmentBehavior="never"
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      data={shown}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <>
          <HubHeader>
            <YStack paddingTop="$lg" paddingBottom="$md" gap="$sm">
              <PageHeader title={t('search.prayers')} />
              {facets}
            </YStack>
          </HubHeader>
          <Typography variant="annotation" paddingBottom="$sm">
            {t('catalog.prayerCount', { count: shown.length })}
          </Typography>
        </>
      }
      ListEmptyComponent={
        <Typography tone="muted" fontStyle="italic" paddingVertical="$lg">
          {t('search.noPrayers')}
        </Typography>
      }
      initialNumToRender={14}
      showsVerticalScrollIndicator={false}
    />
  )
}

const keyExtractor = (p: Prayer) => p.id

function PrayerTile({ prayer }: { prayer: Prayer }) {
  if (prayer.image)
    return (
      <Image
        source={prayer.image}
        style={{ width: tileSize, height: tileSize, borderRadius: 8 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    )
  if (!prayer.cover) return <YStack width={tileSize} height={tileSize} />
  return (
    <GeneratedCover
      cover={prayer.cover}
      title={prayer.title}
      tone={toneForKey(`practice/${prayer.id}`)}
      width={tileSize}
    />
  )
}

type FacetProps = {
  allLabel: string
  facets: Facet[]
  labelFor: (key: string) => string
  selected: string | undefined
  onSelect: (key: string | undefined) => void
}

/** The same options down a side column, one to a line. */
function FacetList({ allLabel, facets, labelFor, selected, onSelect }: FacetProps) {
  const options = [
    { key: undefined, label: allLabel },
    ...facets.map((f) => ({ key: f.key, label: labelFor(f.key) })),
  ]
  return options.map(({ key, label }) => (
    <RailLink
      key={key ?? 'all'}
      label={label}
      role="radio"
      selected={key === selected}
      onPress={() => onSelect(key)}
    />
  ))
}

/** One line of typographic options; the chosen one takes the gold and an underline. */
function FacetRow({ allLabel, facets, labelFor, selected, onSelect }: FacetProps) {
  const options = [
    { key: undefined, label: allLabel },
    ...facets.map((f) => ({ key: f.key, label: labelFor(f.key) })),
  ]
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -24 }}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 20 }}
    >
      {options.map(({ key, label }) => {
        const on = key === selected
        return (
          <Pressable
            key={key ?? 'all'}
            onPress={() => onSelect(key)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ checked: on }}
            aria-checked={on}
          >
            <YStack minHeight={44} justifyContent="center">
              <YStack
                paddingBottom={3}
                borderBottomWidth={1.5}
                borderBottomColor={on ? '$accent' : 'transparent'}
              >
                <Typography fontSize="$3" color={on ? '$accent' : '$colorSecondary'}>
                  {label}
                </Typography>
              </YStack>
            </YStack>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
