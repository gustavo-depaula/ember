import { CalendarCheck, ChevronLeft, ChevronRight, Search, X } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, FlatList, Keyboard, StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Skeleton, Typography } from '@/components'
import { useMinuteOfDay } from '@/hooks/useCurrentHour'
import { selectionTick } from '@/lib/haptics'
import type { NearbyChurch } from '@/lib/mass-times'
import { useChurch, useChurchSearch } from '@/lib/mass-times'
import { useDebounced } from '@/lib/useDebounced'
import { type AgendaRow, agenda, type Bucket, bucketOf, type TravelMode } from '../agenda'
import { useCheckInCount } from '../checkins'
import type { MassFilter, MassTimesNearby } from '../useMassTimesNearby'
import { AgendaListItem } from './AgendaListItem'
import { ChurchDetail } from './ChurchDetail'
import { ChurchesMap } from './ChurchesMap'
import { type ChurchRowData, ChurchSearchRow } from './ChurchSearchRow'
import { useGlassTile } from './glass'
import { IntentSentence } from './IntentSentence'
import { LocationBar } from './LocationBar'
import { MapSheet, type SheetDetent } from './MapSheet'
import { MassLog } from './MassLog'
import type { CameraIdle } from './NativeChurchesMap'
import { QueryError } from './QueryError'
import { SavedChurches } from './SavedChurches'
import { Hairline, SectionLabel } from './SheetType'
import { SheetLiftContext } from './sheetLift'
import { VisitListItem } from './VisitListItem'

type Selected = { id: string; name: string; lat?: number; lng?: number }
type SheetView = { kind: 'browse' } | { kind: 'detail'; church: Selected } | { kind: 'log' }

// The whole map + sheet surface, the Apple Maps way: the live map behind, a sheet riding over it that
// never leaves. Tapping a pin or row swaps the sheet to that church's detail in place (and swings the
// map to it) — never a new page. `MapSheet` is the platform's way of drawing the two together.
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
  const [view, setView] = useState<SheetView>({ kind: 'browse' })
  const [detent, setDetent] = useState<SheetDetent>('peek')
  const [query, setQuery] = useState('')

  const openDetail = (church: Selected) => {
    setView({ kind: 'detail', church })
    setDetent('half') // lift the sheet so the detail is visible
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

  // Android's Back steps out of a church or the log to the list before it leaves the screen.
  const inBrowse = view.kind === 'browse'
  useEffect(() => {
    if (inBrowse) return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView({ kind: 'browse' })
      return true
    })
    return () => sub.remove()
  }, [inBrowse])

  // The keyboard draws over the sheet rather than pushing it, so a field in the
  // lower half would sit under it. Forms lift the sheet as they open (see
  // `sheetLift`); this catches a field focused after the sheet was dragged back down.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => setDetent('full'))
    return () => sub.remove()
  }, [])
  const lift = useCallback(() => setDetent('full'), [])

  return (
    <MapSheet
      detent={detent}
      onDetent={setDetent}
      map={
        <ChurchesMap
          nearby={nearby}
          focused={focused}
          onSelectChurch={(c) => openDetail({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })}
          onDismiss={browse}
          onRegionChange={onRegionChange}
        />
      }
    >
      {view.kind === 'detail' ? (
        // Keyed by church so switching pins resets the pane — scroll position and the
        // check-in and feedback forms belong to the church they were opened on.
        <SheetLiftContext.Provider value={lift}>
          <ChurchDetailPane key={view.church.id} churchId={view.church.id} onBack={browse} />
        </SheetLiftContext.Provider>
      ) : view.kind === 'log' ? (
        <LogPane onBack={browse} onSelectChurch={(c) => openDetail({ id: c.id, name: c.name })} />
      ) : (
        <BrowseSearch
          nearby={nearby}
          locale={locale}
          filter={filter}
          onFilter={onFilter}
          query={query}
          onQuery={setQuery}
          onFocusSearch={() => setDetent('full')}
          onOpenLog={() => {
            setView({ kind: 'log' })
            setDetent('half')
          }}
          onSelectNearby={(c) => openDetail({ id: c.id, name: c.name, lat: c.lat, lng: c.lng })}
          onSelectRow={(c) => openDetail({ id: c.id, name: c.name })}
        />
      )}
    </MapSheet>
  )
}

// Place mode: the full church detail in the sheet, with a back affordance to the browse list.
function ChurchDetailPane({ churchId, onBack }: { churchId: string; onBack: () => void }) {
  const insets = useSafeAreaInsets()
  const [scrolled, setScrolled] = useState(false)
  return (
    <View style={styles.fill}>
      <SheetPaneHeader onBack={onBack} ruled={scrolled} />
      {/* Neither sheet makes way for the keyboard — Android's is drawn over, and the iOS one fills
          through the bottom safe area, keyboard included — so the pane scrolls a focused field clear. */}
      <KeyboardAwareScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        // Room under the focused field for the buttons that submit it.
        bottomOffset={110}
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
      </KeyboardAwareScrollView>
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

  const [mode, setMode] = useState<TravelMode>('foot')

  const debounced = useDebounced(query.trim(), 250)
  const searching = debounced.length >= 2
  // Search finds a church by name whatever it holds, so it ignores the sentence's kind.
  const search = useChurchSearch(debounced, undefined, nearby.center)

  const { intent, when } = filter
  // The timetable is cut from now, so it is recut as each minute turns.
  const minute = useMinuteOfDay()
  // biome-ignore lint/correctness/useExhaustiveDependencies: `minute` recuts the list from the new now
  const items = useMemo<ListItem[]>(() => {
    if (searching)
      return (search.data ?? []).map((church) => ({ type: 'search', id: church.id, church }))
    if (intent === 'visit')
      return churches.map((church) => ({ type: 'visit', id: church.id, church }))
    let last: Bucket | undefined
    return agenda(churches, intent, when).flatMap((row): ListItem[] => {
      const bucket = bucketOf(row, when)
      const id = `${row.church.id}-${row.upcoming.instant.toISOString()}-${row.upcoming.service.kind}`
      const item: ListItem = { type: 'row', id, row }
      if (bucket === last) return [item]
      last = bucket
      return [{ type: 'bucket', id: `bucket-${bucket}`, bucket }, item]
    })
  }, [searching, search.data, intent, when, churches, minute])
  const rowCount = items.filter((i) => i.type === 'row').length
  // Travel advice only for today, and only once we know where you are.
  const located = nearby.location.status === 'granted'
  const travelMode = located && (when === 'now' || when === 'today') ? mode : undefined

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
        <IntentSentence filter={filter} onChange={onFilter} />
      </YStack>

      <FlatList
        style={styles.fill}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // Rows draw their own top rule, so a bucket's label is never ruled off from its first row.
          const ruled = index > 0 && items[index - 1]?.type !== 'bucket'
          switch (item.type) {
            case 'search':
              return (
                <YStack>
                  {ruled ? <Hairline /> : null}
                  <ChurchSearchRow church={item.church} onSelect={onSelectRow} />
                </YStack>
              )
            case 'visit':
              return (
                <YStack>
                  {ruled ? <Hairline /> : null}
                  <VisitListItem
                    church={item.church}
                    when={when}
                    locale={locale}
                    onSelect={onSelectNearby}
                  />
                </YStack>
              )
            case 'bucket':
              return (
                <YStack paddingTop={index > 0 ? '$lg' : 0} paddingBottom={2}>
                  <SectionLabel>{t(`massTimes.bucket.${item.bucket}`)}</SectionLabel>
                </YStack>
              )
            case 'row':
              return (
                <YStack>
                  {ruled ? <Hairline /> : null}
                  <AgendaListItem
                    row={item.row}
                    mode={travelMode}
                    locale={locale}
                    onSelect={onSelectNearby}
                  />
                </YStack>
              )
          }
        }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          searching ? null : (
            <YStack gap="$lg" paddingTop="$sm" paddingBottom={4}>
              <LocationBar location={nearby.location} />
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
              {items.length > 0 ? (
                <XStack alignItems="center" gap="$md">
                  <YStack flex={1}>
                    <SectionLabel rule>
                      {intent === 'visit'
                        ? t('massTimes.nearbyHeading')
                        : t('massTimes.agendaCount', { count: rowCount })}
                    </SectionLabel>
                  </YStack>
                  {travelMode && intent !== 'visit' ? (
                    <TravelToggle mode={mode} onChange={setMode} />
                  ) : null}
                </XStack>
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
          ) : nearby.mode === 'counts' ? (
            <YStack paddingTop="$md" alignItems="center">
              <Typography variant="annotation">{t('massTimes.zoomIn')}</Typography>
            </YStack>
          ) : churches.length === 0 ? (
            <YStack gap="$xs" paddingTop="$md" alignItems="center">
              <Typography variant="interface">{t('massTimes.empty')}</Typography>
              <Typography variant="annotation">{t('massTimes.emptyHint')}</Typography>
            </YStack>
          ) : (
            <YStack gap="$xs" paddingTop="$md" alignItems="center">
              <Typography variant="interface">
                {t('massTimes.agendaEmpty', { when: t(`massTimes.sentence.when.${when}`) })}
              </Typography>
              <Typography variant="annotation">{t('massTimes.agendaEmptyHint')}</Typography>
            </YStack>
          )
        }
      />
    </View>
  )
}

type ListItem =
  | { type: 'search'; id: string; church: ChurchRowData }
  | { type: 'visit'; id: string; church: NearbyChurch }
  | { type: 'bucket'; id: string; bucket: Bucket }
  | { type: 'row'; id: string; row: AgendaRow }

// On foot or by car: the travel estimate behind "leave in 12 min". Two words in a soft pill, the
// chosen one lifted.
function TravelToggle({
  mode,
  onChange,
}: {
  mode: TravelMode
  onChange: (mode: TravelMode) => void
}) {
  const { t } = useTranslation()
  const tile = useGlassTile()
  const strong = useGlassTile(true)
  return (
    <XStack backgroundColor={tile} borderRadius={10} padding={2}>
      {(['foot', 'car'] as const).map((m) => (
        <AnimatedPressable
          key={m}
          onPress={() => {
            void selectionTick()
            onChange(m)
          }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t(`massTimes.mode.${m}`)}
          accessibilityState={{ selected: mode === m }}
        >
          <XStack
            height={28}
            paddingHorizontal={10}
            borderRadius={8}
            alignItems="center"
            backgroundColor={mode === m ? strong : 'transparent'}
          >
            <Typography
              variant="interface"
              fontSize="$1"
              color={mode === m ? '$color' : '$colorSecondary'}
            >
              {t(`massTimes.mode.${m}`)}
            </Typography>
          </XStack>
        </AnimatedPressable>
      ))}
    </XStack>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
