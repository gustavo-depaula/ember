import { Stack, useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Keyboard, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { PageHeader, Typography } from '@/components'
import { SearchField } from '@/components/SearchField'
import { useBottomClearance } from '@/components/tabAccessory'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { ChantRow } from '@/features/chant/ChantRow'
import {
  ChantSearchStart,
  groupTitle,
  type SearchRow,
  useChantSearchRows,
} from '@/features/chant/ChantSearch'
import { ChantWeek } from '@/features/chant/ChantWeek'
import { chantBookEntries } from '@/features/chant/chants'
import { useChantPlaces, useChantTexts } from '@/features/chant/hooks'
import { chantBookHref, chantListHref } from '@/features/chant/routes'
import { ToneFill } from '@/features/covers/parts'
import { type BlockTone, blockInk, jewelTones } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type BookEntry = ReturnType<typeof chantBookEntries>[number]

// Each book's spine: its initial on the jewel of what it serves.
const spines: Record<string, { initial: string; tone: BlockTone }> = {
  'chant-book/graduale': { initial: 'G', tone: jewelTones.burgundy },
  'chant-book/antiphonale': { initial: 'A', tone: jewelTones.marian },
  'chant-book/kyriale': { initial: 'K', tone: jewelTones.gold },
  'chant-book/cantus': { initial: 'C', tone: jewelTones.green },
}

// The chant library: the week's Masses first, for whoever sings today or
// prepares Sunday; then the search, which also holds the ways in by form, mode
// and occasion; then the books, each opening at its table of contents.
export default function ChantLibraryScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const catalogVersion = useCatalogVersion()
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  const searching = focused || query.length > 0
  const typed = useDeferredValue(query.trim())
  // The "see all" link reads the query when tapped, so typing does not re-render every row.
  const typedRef = useRef(typed)
  typedRef.current = typed

  const texts = useChantTexts(typed.length > 0)
  const { places } = useChantPlaces(typed.length > 0)
  const results = useChantSearchRows(typed, texts.data ?? undefined)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the catalog's books change with its version
  const books = useMemo(() => chantBookEntries(), [catalogVersion])

  const cancel = useCallback(() => {
    setQuery('')
    setFocused(false)
    Keyboard.dismiss()
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: SearchRow | BookEntry }) => {
      if (!('kind' in item))
        return (
          <BookRow
            name={localizeContent(item.name)}
            description={localizeContent(item.description)}
            spine={spines[item.id]}
            onPress={() => router.push(chantBookHref(item.id))}
          />
        )
      if (item.kind === 'group')
        return (
          <Typography
            variant="label"
            fontSize="$1"
            letterSpacing={1.4}
            color="$colorBurgundy"
            paddingTop="$lg"
            paddingBottom="$xs"
          >
            {`${groupTitle(t, item.genre)} · ${item.count}`}
          </Typography>
        )
      if (item.kind === 'more')
        return (
          <Pressable
            onPress={() =>
              router.push(chantListHref({ genre: item.genre ?? 'prayers', q: typedRef.current }))
            }
            accessibilityRole="link"
            accessibilityLabel={t('chant.seeAll', { count: item.count })}
          >
            <YStack minHeight={44} justifyContent="center">
              <Typography color="$colorMutedBlue">
                {t('chant.seeAll', { count: item.count })}
              </Typography>
            </YStack>
          </Pressable>
        )
      return <ChantRow id={item.id} places={places.get(item.id)} />
    },
    [places, router, t],
  )

  const data = (() => {
    if (!searching) return books
    return typed ? results : []
  })()

  const empty = (() => {
    if (!searching) return null
    if (!typed) return <ChantSearchStart />
    if (texts.isPending) return null
    return (
      <Typography tone="muted" paddingTop="$lg">
        {t('chant.noResults')}
      </Typography>
    )
  })()

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('chant.library') }} />
      <FlatList<SearchRow | BookEntry>
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={data}
        keyExtractor={keyOf}
        renderItem={renderItem}
        ListHeaderComponent={
          <YStack>
            {!searching && (
              <YStack paddingTop="$lg" gap="$md">
                <PageHeader title={t('chant.library')} />
                <Typography variant="label">{t('chant.thisWeek')}</Typography>
                <ChantWeek />
              </YStack>
            )}
            <XStack alignItems="center" gap="$md" marginTop={searching ? '$sm' : '$lg'}>
              <SearchField
                query={query}
                onQuery={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={t('chant.searchPlaceholder')}
                label={t('chant.searchPlaceholder')}
              />
              {searching && (
                <Pressable
                  onPress={cancel}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t('chant.cancel')}
                >
                  <Typography tone="muted">{t('chant.cancel')}</Typography>
                </Pressable>
              )}
            </XStack>
            {!searching && (
              <Typography variant="label" paddingTop="$xl" paddingBottom="$xs">
                {t('chant.books')}
              </Typography>
            )}
          </YStack>
        }
        ListEmptyComponent={empty}
        ListFooterComponent={
          searching ? null : (
            <Typography variant="reference" paddingTop="$lg">
              {t('chant.license')}
            </Typography>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}

const keyOf = (item: SearchRow | BookEntry) => ('kind' in item ? item.key : item.id)

function BookRow({
  name,
  description,
  spine,
  onPress,
}: {
  name: string
  description: string
  spine?: { initial: string; tone: BlockTone }
  onPress: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openChants', { name })}
    >
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$sm"
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <YStack width={44} height={56} alignItems="center" justifyContent="center">
          <ToneFill
            id={`spine-${name}`}
            tone={spine?.tone ?? jewelTones.green}
            width={44}
            height={56}
            radius={6}
          />
          <Text fontFamily="$title" fontSize={22} lineHeight={30} color={blockInk}>
            {spine?.initial ?? name[0]}
          </Text>
        </YStack>
        <YStack flex={1}>
          <Typography fontSize="$3">{name}</Typography>
          <Typography variant="annotation" numberOfLines={2}>
            {description}
          </Typography>
        </YStack>
        <ChevronRight size={18} color={theme.colorSecondary.val} />
      </XStack>
    </Pressable>
  )
}
