import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui'
import {
  ignoreSafeArea,
  interactiveDismissDisabled,
  type PresentationDetent,
  presentationBackground,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers'
import { CalendarCheck, ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Skeleton, Typography } from '@/components'
import type { NearbyChurch } from '@/lib/mass-times'
import { nextService, useChurch, useChurchSearch, wallClockNow } from '@/lib/mass-times'
import { useDebounced } from '@/lib/useDebounced'
import { useCheckInCount } from '../checkins'
import { useFavoritesStore } from '../favorites'
import { dayLabel, daysAway, formatDistanceKm, formatTimeOfDay } from '../format'
import { type MassFilter, type MassTimesNearby, passesFilter } from '../useMassTimesNearby'
import { ChurchDetail } from './ChurchDetail'
import { ChurchesMap } from './ChurchesMap'
import { ChurchListItem } from './ChurchListItem'
import { type ChurchRowData, ChurchSearchRow } from './ChurchSearchRow'
import { FilterChips } from './FilterChips'
import { useGlassTile } from './glass'
import { LocationBar } from './LocationBar'
import { MassLog } from './MassLog'
import type { CameraIdle } from './NativeChurchesMap'
import { QueryError } from './QueryError'
import { SavedChurches } from './SavedChurches'
import { clockFigures, Hairline, SectionLabel } from './SheetType'

type Selected = { id: string; name: string; lat?: number; lng?: number }
type SheetView = { kind: 'browse' } | { kind: 'detail'; church: Selected } | { kind: 'log' }

// Stable detent identities (the native selection compares by value — keep them steady). PEEK is a fixed
// height sized to the search bar (grabber + search row + home-indicator inset), so minimized the sheet
// shrinks to just the search field, Apple-Maps style — not a fraction that leaves content peeking.
const PEEK: PresentationDetent = { height: 96 }
const HALF: PresentationDetent = { fraction: 0.55 }
const FULL: PresentationDetent = 'large'
const DETENTS = [PEEK, HALF, FULL]

// The whole map + sheet surface, the Apple Maps way. Everything lives in ONE SwiftUI `Host`: the map
// is the Host's background content (so `presentationBackgroundInteraction` keeps it LIVE behind the
// sheet), and the native `BottomSheet` rides over it. Tapping a pin or row swaps the sheet to that
// church's detail in place (and swings the map to it) — never a new page.
// Paper with the map faintly behind it: the default sheet glass lets the map's colours wash through
// the text, a solid sheet loses the sense of the map underneath.
const sheetOpacity = 'CC'

export function ChurchSheet({
  nearby,
  locale,
  filter,
  onFilter,
  onRegionChange,
}: {
  nearby: MassTimesNearby
  locale: string
  filter: MassFilter
  onFilter: (filter: MassFilter) => void
  onRegionChange?: (region: CameraIdle) => void
}) {
  // One mode at a time: browse/search, a selected church's detail, or the check-in log. A discriminated
  // union (not two booleans) keeps the three exclusive and carries the selected church with the detail.
  const theme = useTheme()
  const [view, setView] = useState<SheetView>({ kind: 'browse' })
  const [detent, setDetent] = useState<PresentationDetent>(PEEK)
  const [query, setQuery] = useState('')

  const openDetail = (church: Selected) => {
    setView({ kind: 'detail', church })
    setDetent(HALF) // lift the sheet so the detail is visible
  }
  const browse = () => setView({ kind: 'browse' })

  // Authoritative coordinates for the map to focus, resolved from the detail query (shares the cache
  // with the detail pane — no extra round-trip). This makes every selection source recenter the map,
  // even saved/search rows whose tap payload carries no lat/lng.
  const detailId = view.kind === 'detail' ? view.church.id : undefined
  const { data: detailChurch } = useChurch(detailId)
  const focused =
    view.kind === 'detail'
      ? {
          id: view.church.id,
          lat: detailChurch?.lat ?? view.church.lat,
          lng: detailChurch?.lng ?? view.church.lng,
        }
      : undefined

  return (
    // ignoreSafeArea="all" so the hosted map bleeds edge to edge (through the notch + home indicator)
    // instead of the SwiftUI host insetting it and leaving black bars.
    <Host style={StyleSheet.absoluteFill} ignoreSafeArea="all">
      <RNHostView>
        <View style={styles.fill}>
          <ChurchesMap
            nearby={nearby}
            focused={focused}
            onSelectChurch={(c) => openDetail({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })}
            onDismiss={browse}
            onRegionChange={onRegionChange}
          />
        </View>
      </RNHostView>

      <BottomSheet isPresented onIsPresentedChange={noop}>
        <Group
          modifiers={[
            presentationDetents(DETENTS, { selection: detent, onSelectionChange: setDetent }),
            presentationBackground(`${theme.background?.val ?? '#FFFFFF'}${sheetOpacity}`),
            presentationBackgroundInteraction('enabled'),
            interactiveDismissDisabled(true),
            presentationDragIndicator('visible'),
            // Let the content fill through the home-indicator safe area instead of stopping above it
            // and leaving a bare strip of sheet material (the "footer" seam).
            ignoreSafeArea({ edges: 'bottom' }),
          ]}
        >
          <RNHostView>
            <View style={styles.fill}>
              {view.kind === 'detail' ? (
                // Keyed by church so switching pins resets the pane — scroll position and the
                // check-in and feedback forms belong to the church they were opened on.
                <ChurchDetailPane key={view.church.id} churchId={view.church.id} onBack={browse} />
              ) : view.kind === 'log' ? (
                <LogPane
                  onBack={browse}
                  onSelectChurch={(c) => openDetail({ id: c.id, name: c.name })}
                />
              ) : (
                <BrowseSearch
                  nearby={nearby}
                  locale={locale}
                  filter={filter}
                  onFilter={onFilter}
                  query={query}
                  onQuery={setQuery}
                  onFocusSearch={() => setDetent(FULL)}
                  onOpenLog={() => {
                    setView({ kind: 'log' })
                    setDetent(HALF)
                  }}
                  onSelectNearby={(c) =>
                    openDetail({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })
                  }
                  onSelectRow={(c) => openDetail({ id: c.id, name: c.name })}
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
  const insets = useSafeAreaInsets()
  const [scrolled, setScrolled] = useState(false)
  return (
    <View style={styles.fill}>
      <SheetPaneHeader onBack={onBack} ruled={scrolled} />
      <ScrollView
        nestedScrollEnabled
        scrollEventThrottle={32}
        onScroll={(e) => {
          const next = e.nativeEvent.contentOffset.y > 4
          if (next !== scrolled) setScrolled(next)
        }}
        style={styles.fill}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ChurchDetail churchId={churchId} />
      </ScrollView>
    </View>
  )
}

// The check-in history as a sheet sub-view (like place mode), with a back to browse. Tapping an entry
// opens that church in place.
function LogPane({
  onBack,
  onSelectChurch,
}: {
  onBack: () => void
  onSelectChurch: (church: { id: string; name: string }) => void
}) {
  const { t } = useTranslation()
  return (
    <View style={styles.fill}>
      <SheetPaneHeader onBack={onBack} />
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        <SectionLabel rule>{t('massTimes.massLog')}</SectionLabel>
        <MassLog onSelectChurch={onSelectChurch} />
      </View>
    </View>
  )
}

// Shared sub-view header: a back-to-browse button, set well clear of the
// grabber — a control pressed against it reads as cramped. `ruled` draws its bottom edge once content
// scrolls beneath it, so text sliced at that edge reads as passing under the header, not as clipped.
function SheetPaneHeader({ onBack, ruled }: { onBack: () => void; ruled?: boolean }) {
  return (
    <YStack>
      <XStack paddingHorizontal={12} paddingTop={12}>
        <SheetBackButton onPress={onBack} />
      </XStack>
      <YStack opacity={ruled ? 1 : 0}>
        <Hairline />
      </YStack>
    </YStack>
  )
}

function SheetBackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('massTimes.back')}
    >
      <XStack height={44} paddingLeft={4} paddingRight="$sm" alignItems="center" gap={4}>
        <ChevronLeft size={22} color={theme.color?.val} />
        <Typography variant="interface" fontSize="$3">
          {t('massTimes.nearbyHeading')}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}

// Browse + inline search in one list (Apple Maps style): typing in the search field swaps the nearby
// list for full-text results, in place — no separate page.
function BrowseSearch({
  nearby,
  locale,
  filter,
  onFilter,
  query,
  onQuery,
  onFocusSearch,
  onOpenLog,
  onSelectNearby,
  onSelectRow,
}: {
  nearby: MassTimesNearby
  locale: string
  filter: MassFilter
  onFilter: (filter: MassFilter) => void
  query: string
  onQuery: (q: string) => void
  onFocusSearch: () => void
  onOpenLog: () => void
  onSelectNearby: (church: NearbyChurch) => void
  onSelectRow: (church: ChurchRowData) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const tile = useGlassTile()
  const checkInCount = useCheckInCount()
  const churches = nearby.churches ?? []

  const debounced = useDebounced(query.trim(), 250)
  const searching = debounced.length >= 2
  const search = useChurchSearch(debounced, nearby.kind, nearby.center)
  const favorites = useFavoritesStore((s) => s.favorites)
  const results = (search.data ?? []).filter((c) => passesFilter(c, filter, favorites))

  return (
    <View style={styles.fill}>
      {/* Pinned search bar (Apple Maps style): stays put while the list scrolls beneath it, and is all
          that shows at the peek detent. */}
      <XStack
        gap="$sm"
        alignItems="center"
        paddingHorizontal={20}
        paddingTop={16}
        paddingBottom={12}
      >
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
            <AnimatedPressable onPress={() => onQuery('')} hitSlop={8} accessibilityRole="button">
              <X size={16} color={theme.colorSecondary?.val} />
            </AnimatedPressable>
          ) : null}
        </XStack>
      </XStack>
      <YStack paddingBottom="$sm">
        <FilterChips filter={filter} onChange={onFilter} />
      </YStack>

      <FlatList
        style={styles.fill}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={searching ? results : churches}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) =>
          searching ? (
            <ChurchSearchRow church={item as ChurchRowData} onSelect={onSelectRow} />
          ) : (
            <ChurchListItem
              church={item as NearbyChurch}
              locale={locale}
              kind={nearby.kind}
              onSelect={onSelectNearby}
            />
          )
        }
        ItemSeparatorComponent={Hairline}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          searching ? null : (
            <YStack gap="$lg" paddingTop="$sm" paddingBottom={4}>
              <LocationBar location={nearby.location} />
              <NextMassNearby churches={churches} locale={locale} onSelect={onSelectNearby} />
              <SavedChurches onSelect={onSelectRow} />
              {checkInCount > 0 ? (
                <AnimatedPressable
                  onPress={onOpenLog}
                  accessibilityRole="button"
                  accessibilityLabel={t('massTimes.massLog')}
                >
                  <XStack minHeight={44} alignItems="center" gap="$md">
                    <CalendarCheck size={20} color={theme.colorSecondary?.val} />
                    <Typography variant="interface" fontSize="$3" flex={1}>
                      {t('massTimes.massLog')}
                    </Typography>
                    <Typography variant="annotation">{checkInCount}</Typography>
                    <ChevronRight size={18} color={theme.colorSecondary?.val} />
                  </XStack>
                </AnimatedPressable>
              ) : null}
              {churches.length > 0 ? (
                <SectionLabel rule>{t('massTimes.nearbyHeading')}</SectionLabel>
              ) : null}
            </YStack>
          )
        }
        ListEmptyComponent={
          searching ? (
            search.isError ? (
              <QueryError onRetry={() => search.refetch()} />
            ) : search.isLoading ? (
              <YStack gap="$sm">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={56} borderRadius={8} />
                ))}
              </YStack>
            ) : (
              <YStack paddingTop="$md" alignItems="center">
                <Typography variant="annotation">{t('massTimes.noResults')}</Typography>
              </YStack>
            )
          ) : nearby.isError ? (
            <QueryError onRetry={nearby.refetch} />
          ) : nearby.isLoading ? (
            <YStack gap="$sm">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={56} borderRadius={8} />
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
    </View>
  )
}

// How many of the nearest churches compete for "next Mass near you" — a Mass starting in five
// minutes across town isn't the answer to "where can I go now".
const nextMassCandidates = 10

// The devotional headline: the soonest upcoming Mass among the nearest churches, time first so the
// answer never truncates. Tapping opens that church.
function NextMassNearby({
  churches,
  locale,
  onSelect,
}: {
  churches: NearbyChurch[]
  locale: string
  onSelect: (church: NearbyChurch) => void
}) {
  const { t } = useTranslation()

  const soonest = useMemo(() => {
    let best: { church: NearbyChurch; instant: Date; date: Date; startTime: string } | undefined
    for (const church of churches.slice(0, nextMassCandidates)) {
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
  const { church } = soonest
  const now = wallClockNow(church.timezone)
  const isToday = daysAway(soonest.date, now) <= 0

  return (
    <AnimatedPressable
      onPress={() => onSelect(church)}
      accessibilityRole="button"
      accessibilityLabel={t('massTimes.nextMassNearby')}
    >
      <YStack gap="$sm">
        <SectionLabel cross>{t('massTimes.nextMassNearby')}</SectionLabel>
        <XStack alignItems="center" gap="$md">
          <Typography
            variant="sacred-title"
            fontSize={44}
            lineHeight={52}
            fontVariant={[...clockFigures]}
          >
            {formatTimeOfDay(soonest.startTime)}
          </Typography>
          {/* Two tight lines spanning the time's height: the name's cap line level with the top of
              the figures, the day on their baseline. One line for the name, so the span holds. */}
          <YStack flex={1} top={-7}>
            <Typography variant="interface" fontSize={19} lineHeight={22} numberOfLines={1}>
              {church.name}
            </Typography>
            <Typography variant="annotation" fontSize={16} lineHeight={17}>
              <Typography
                variant="annotation"
                fontSize={16}
                color={isToday ? '$colorBurgundy' : '$colorSecondary'}
              >
                {dayLabel(soonest.date, now, t, locale)}
              </Typography>
              {church.distanceKm === undefined
                ? ''
                : ` · ${formatDistanceKm(church.distanceKm, locale)}`}
            </Typography>
          </YStack>
        </XStack>
      </YStack>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
