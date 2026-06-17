import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  interactiveDismissDisabled,
  type PresentationDetent,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { ChevronLeft, Church, Search, SlidersHorizontal, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Skeleton, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, useChurchSearch, wallClockNow } from '@/lib/mass-times'
import { useDebounced } from '@/lib/useDebounced'
import { dayLabel, formatDistanceKm, formatTimeOfDay } from '../format'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { ChurchDetail } from './ChurchDetail'
import { ChurchesMap } from './ChurchesMap'
import { ChurchListItem } from './ChurchListItem'
import { type ChurchRowData, ChurchSearchRow } from './ChurchSearchRow'
import { useGlassTile } from './glass'
import { LocationBar } from './LocationBar'
import { SavedChurches } from './SavedChurches'

type Selected = { id: string; name: string; lat?: number; lng?: number }

// Stable detent identities (the native selection compares by value — keep them steady).
const PEEK: PresentationDetent = { fraction: 0.16 }
const HALF: PresentationDetent = { fraction: 0.55 }
const FULL: PresentationDetent = 'large'
const DETENTS = [PEEK, HALF, FULL]

// The whole map + sheet surface, the Apple Maps way. Everything lives in ONE SwiftUI `Host`: the map
// is the Host's background content (so `presentationBackgroundInteraction` keeps it LIVE behind the
// sheet), and the native `BottomSheet` rides over it. Tapping a pin or row swaps the sheet to that
// church's detail in place (and swings the map to it) — never a new page.
export function ChurchSheet({
  nearby,
  locale,
  filterCount,
  onOpenFilters,
}: {
  nearby: MassTimesNearby
  locale: string
  filterCount: number
  onOpenFilters: () => void
}) {
  const [selected, setSelected] = useState<Selected | undefined>(undefined)
  const [detent, setDetent] = useState<PresentationDetent>(PEEK)
  const [query, setQuery] = useState('')

  const select = (church: Selected) => {
    setSelected(church)
    setDetent(HALF) // lift the sheet so the detail is visible
  }

  return (
    // ignoreSafeArea="all" so the hosted map bleeds edge to edge (through the notch + home indicator)
    // instead of the SwiftUI host insetting it and leaving black bars.
    <Host style={StyleSheet.absoluteFill} ignoreSafeArea="all">
      <RNHostView>
        <View style={styles.fill}>
          <ChurchesMap
            nearby={nearby}
            focused={selected}
            bottomInset={150}
            onSelectChurch={(c) => select({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })}
          />
        </View>
      </RNHostView>

      <BottomSheet isPresented onIsPresentedChange={noop}>
        <Group
          modifiers={[
            presentationDetents(DETENTS, { selection: detent, onSelectionChange: setDetent }),
            presentationBackgroundInteraction('enabled'),
            interactiveDismissDisabled(true),
            presentationDragIndicator('visible'),
          ]}
        >
          <RNHostView>
            <View style={styles.fill}>
              {selected ? (
                <ChurchDetailPane churchId={selected.id} onBack={() => setSelected(undefined)} />
              ) : (
                <BrowseSearch
                  nearby={nearby}
                  locale={locale}
                  filterCount={filterCount}
                  query={query}
                  onQuery={setQuery}
                  onFocusSearch={() => setDetent(FULL)}
                  onOpenFilters={onOpenFilters}
                  onSelectNearby={(c) => select({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })}
                  onSelectRow={(c) => select({ id: c.id, name: c.name })}
                />
              )}
            </View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  )
}

function noop() {}

// Place mode: the full church detail in the sheet, with a back affordance to the browse list.
function ChurchDetailPane({ churchId, onBack }: { churchId: string; onBack: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const tile = useGlassTile()
  return (
    <View style={styles.fill}>
      <XStack paddingHorizontal="$md" paddingTop="$xs" paddingBottom="$sm">
        <AnimatedPressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('massTimes.back')}
        >
          <XStack
            backgroundColor={tile}
            borderRadius={18}
            height={36}
            paddingHorizontal="$sm"
            alignItems="center"
            gap="$xs"
          >
            <ChevronLeft size={18} color={theme.colorSecondary?.val} />
            <Typography variant="annotation">{t('massTimes.nearbyHeading')}</Typography>
          </XStack>
        </AnimatedPressable>
      </XStack>
      <ScrollView
        nestedScrollEnabled
        style={styles.fill}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ChurchDetail churchId={churchId} />
      </ScrollView>
    </View>
  )
}

// Browse + inline search in one list (Apple Maps style): typing in the search field swaps the nearby
// list for full-text results, in place — no separate page.
function BrowseSearch({
  nearby,
  locale,
  filterCount,
  query,
  onQuery,
  onFocusSearch,
  onOpenFilters,
  onSelectNearby,
  onSelectRow,
}: {
  nearby: MassTimesNearby
  locale: string
  filterCount: number
  query: string
  onQuery: (q: string) => void
  onFocusSearch: () => void
  onOpenFilters: () => void
  onSelectNearby: (church: NearbyChurch) => void
  onSelectRow: (church: ChurchRowData) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const tile = useGlassTile()
  const churches = nearby.churches ?? []

  const debounced = useDebounced(query.trim(), 250)
  const searching = debounced.length >= 2
  const search = useChurchSearch(debounced)
  const results = search.data ?? []

  return (
    <FlatList
      style={styles.fill}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      data={searching ? results : churches}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) =>
        searching ? (
          <ChurchSearchRow church={item as ChurchRowData} onSelect={onSelectRow} onGlass />
        ) : (
          <ChurchListItem
            church={item as NearbyChurch}
            locale={locale}
            kind={nearby.kind}
            onSelect={onSelectNearby}
            onGlass
          />
        )
      }
      ItemSeparatorComponent={() => <YStack height="$sm" />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <YStack gap="$md" paddingTop="$xs" paddingBottom="$md">
          <XStack gap="$sm" alignItems="center">
            <XStack
              flex={1}
              backgroundColor={tile}
              borderRadius="$lg"
              paddingHorizontal="$md"
              alignItems="center"
              gap="$sm"
            >
              <Search size={18} color={theme.colorSecondary?.val} />
              <Input
                flex={1}
                value={query}
                onChangeText={onQuery}
                onFocus={onFocusSearch}
                placeholder={t('massTimes.searchPlaceholder')}
                placeholderTextColor="$colorSecondary"
                backgroundColor="transparent"
                borderWidth={0}
                paddingHorizontal={0}
                height={44}
                color="$color"
                fontFamily="$body"
                returnKeyType="search"
                accessibilityLabel={t('massTimes.searchPlaceholder')}
              />
              {query.length > 0 ? (
                <AnimatedPressable
                  onPress={() => onQuery('')}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <X size={16} color={theme.colorSecondary?.val} />
                </AnimatedPressable>
              ) : null}
            </XStack>
            <AnimatedPressable
              onPress={onOpenFilters}
              accessibilityRole="button"
              accessibilityLabel={t('massTimes.filters')}
            >
              <YStack
                backgroundColor={tile}
                borderRadius="$lg"
                alignItems="center"
                justifyContent="center"
                width={42}
                height={42}
              >
                <SlidersHorizontal
                  size={18}
                  color={filterCount > 0 ? theme.accent?.val : theme.colorSecondary?.val}
                />
              </YStack>
            </AnimatedPressable>
          </XStack>

          {searching ? null : (
            <>
              <LocationBar location={nearby.location} />
              <NextMassNearby churches={churches} locale={locale} />
              <SavedChurches onSelect={onSelectRow} onGlass />
              {churches.length > 0 ? (
                <Typography variant="label">{t('massTimes.nearbyHeading')}</Typography>
              ) : null}
            </>
          )}
        </YStack>
      }
      ListEmptyComponent={
        searching ? (
          search.isLoading ? (
            <YStack gap="$sm">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={72} borderRadius={12} />
              ))}
            </YStack>
          ) : (
            <YStack paddingTop="$md" alignItems="center">
              <Typography variant="annotation">{t('massTimes.noResults')}</Typography>
            </YStack>
          )
        ) : nearby.isLoading ? (
          <YStack gap="$sm">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={88} borderRadius={12} />
            ))}
          </YStack>
        ) : (
          <YStack gap="$xs" paddingTop="$md" alignItems="center">
            <Typography variant="interface">{t('massTimes.empty')}</Typography>
            <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
          </YStack>
        )
      }
    />
  )
}

// The devotional peek line: the soonest upcoming Mass among the nearby churches.
function NextMassNearby({ churches, locale }: { churches: NearbyChurch[]; locale: string }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const tile = useGlassTile()

  const soonest = useMemo(() => {
    let best: { church: NearbyChurch; instant: Date; date: Date; startTime: string } | undefined
    for (const church of churches) {
      const next = nextService(church.services, { timezone: church.timezone, kind: 'mass' })
      if (!next) continue
      if (!best || next.instant < best.instant) {
        best = {
          church,
          instant: next.instant,
          date: next.occurrence.date,
          startTime: next.occurrence.startTime,
        }
      }
    }
    return best
  }, [churches])

  if (!soonest) return null
  const now = wallClockNow(soonest.church.timezone)

  return (
    <XStack
      backgroundColor={tile}
      borderRadius="$lg"
      borderLeftWidth={3}
      borderLeftColor="$accent"
      paddingVertical="$sm"
      paddingHorizontal="$md"
      gap="$md"
      alignItems="center"
    >
      <Church size={20} color={theme.accent?.val} />
      <YStack flex={1} gap={1}>
        <Typography variant="reference" color="$accent">
          {t('massTimes.nextMassNearby')}
        </Typography>
        <Typography variant="interface" fontSize="$3" numberOfLines={1}>
          {soonest.church.name} · {dayLabel(soonest.date, now, t, locale)}{' '}
          {formatTimeOfDay(soonest.startTime, locale)}
        </Typography>
      </YStack>
      <Typography variant="annotation">
        {formatDistanceKm(soonest.church.distanceKm, locale)}
      </Typography>
    </XStack>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
