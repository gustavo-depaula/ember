import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { InlineRetry, Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { BackHeader } from '@/features/chant/BackHeader'
import { ChantRow } from '@/features/chant/ChantRow'
import { groupTitle } from '@/features/chant/ChantSearch'
import { romanMode, sectionLabel } from '@/features/chant/chants'
import { useChantEntries, useChantPlaces, useChantTexts } from '@/features/chant/hooks'
import {
  type ChantEntry,
  type ChantPlace,
  genreOrder,
  type OccasionId,
  occasionContents,
  searchChants,
} from '@/features/chant/library'
import { chantPageHref } from '@/features/chant/routes'
import type { ChantGenre } from '@/features/chant/textKey'
import { localizeContent } from '@/lib/i18n'

type Row =
  | { kind: 'label'; key: string; title: string }
  | { kind: 'place'; key: string; place: ChantPlace }
  | { kind: 'chant'; key: string; id: string }

const chantRow = (id: string): Row => ({ kind: 'chant', key: id, id })
const genreRank = (entry: ChantEntry) => genreOrder.indexOf(entry.genre as ChantGenre)

// A list of chants the library gathers: every chant of a form, of a mode, of
// an occasion (with the Masses and days that belong to it), or all a search found
// of one form. Each chant says where it is sung.
export default function ChantListScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const { genre, mode, occasion, q } = useLocalSearchParams<{
    genre?: string
    mode?: string
    occasion?: OccasionId
    q?: string
  }>()
  const { places, data: books, isError, refetch } = useChantPlaces()
  const texts = useChantTexts(!!q)
  const entries = useChantEntries()

  const rows = useMemo((): Row[] => {
    if (occasion) {
      if (!books) return []
      const { places: pages, chants } = occasionContents(books, occasion)
      const label = (key: string, title: string): Row[] => [{ kind: 'label', key, title }]
      return [
        ...(pages.length ? label('l-places', t('chant.places')) : []),
        ...pages.map(
          (place): Row => ({ kind: 'place', key: `${place.book.id}/${place.section.id}`, place }),
        ),
        ...(chants.length ? label('l-prayers', t('chant.prayers')) : []),
        ...chants.map(chantRow),
      ]
    }
    const pool = q ? searchChants(q, entries, texts.data ?? undefined) : entries
    const wanted = pool.filter((entry) => {
      if (genre) return genre === 'prayers' ? !entry.genre : entry.genre === genre
      if (mode) return entry.mode === mode
      return true
    })
    // A search keeps its own order; a form's chants go by name, a mode's by form then name.
    const sorted = q
      ? wanted
      : [...wanted].sort(
          (a, b) => (mode ? genreRank(a) - genreRank(b) : 0) || a.name.localeCompare(b.name),
        )
    return sorted.map((entry) => chantRow(entry.id))
  }, [books, entries, genre, mode, occasion, q, t, texts.data])

  const title = (() => {
    if (occasion) return t(`chant.occasion.${occasion}`)
    if (mode) return t('chant.mode', { mode: romanMode(mode) })
    if (genre) return groupTitle(t, genre === 'prayers' ? undefined : (genre as ChantGenre))
    return t('chant.library')
  })()

  const renderItem = useCallback(
    ({ item }: { item: Row }) => {
      if (item.kind === 'label')
        return (
          <Typography variant="label" paddingTop="$lg" paddingBottom="$xs">
            {item.title}
          </Typography>
        )
      if (item.kind === 'chant') return <ChantRow id={item.id} places={places.get(item.id)} />
      const { book, section } = item.place
      const name = sectionLabel(section)
      return (
        <Pressable
          onPress={() => router.push(chantPageHref(book.id, section.id))}
          accessibilityRole="link"
          accessibilityLabel={t('a11y.openChants', { name })}
        >
          <XStack
            minHeight={44}
            paddingVertical="$sm"
            alignItems="center"
            gap="$md"
            borderBottomWidth={1}
            borderColor="$borderColor"
          >
            <YStack flex={1}>
              <Typography fontSize="$3" numberOfLines={1}>
                {name}
              </Typography>
              <Typography variant="annotation">{localizeContent(book.name)}</Typography>
            </YStack>
            <ChevronRight size={18} color={theme.colorSecondary.val} />
          </XStack>
        </Pressable>
      )
    },
    [places, router, t, theme],
  )

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <Stack.Screen options={{ title }} />
      <BackHeader />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        data={rows}
        renderItem={renderItem}
        keyExtractor={(row) => row.key}
        initialNumToRender={20}
        ListHeaderComponent={
          <YStack gap="$xs" paddingBottom="$sm">
            <Typography variant="screen-title">{title}</Typography>
            {q && <Typography variant="annotation">{`“${q}” · ${rows.length}`}</Typography>}
            {!q && !occasion && <Typography variant="annotation">{rows.length}</Typography>}
            {isError && <InlineRetry onRetry={() => refetch()} />}
          </YStack>
        }
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}
