import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { ScreenLayout } from '@/components'
import {
  ChurchesMap,
  countActiveFilters,
  emptyFilter,
  type MassFilter,
  MassFilterSheet,
  MassTimesHeader,
  MassTimesList,
  type MassTimesNearby,
  useMassTimesNearby,
  type ViewMode,
} from '@/features/mass-times'

// Mass Times root: the map is the primary surface — it stretches edge to edge with a single glass
// header floating on top — and a list mode shares that same header. Both share one location + query
// (useMassTimesNearby) and one filter, edited through the bottom sheet.
export default function MassTimesScreen() {
  const [mode, setMode] = useState<ViewMode>('map')
  const [filter, setFilter] = useState<MassFilter>(emptyFilter)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const nearby = useMassTimesNearby(filter)

  // Ask for location up front: this is what lights the blue dot and pulls real nearby results. iOS
  // shows the system dialog only once; later calls just read the status, so a guarded single fire.
  const askedRef = useRef(false)
  useEffect(() => {
    if (askedRef.current) return
    askedRef.current = true
    void nearby.location.request()
  }, [nearby.location])

  const shared = {
    nearby,
    filter,
    mode,
    onMode: setMode,
    onOpenFilters: () => setFiltersOpen(true),
  }

  return (
    <>
      {mode === 'map' ? <MapView {...shared} /> : <ListView {...shared} />}
      <MassFilterSheet
        open={filtersOpen}
        filter={filter}
        onChange={setFilter}
        onClose={() => setFiltersOpen(false)}
      />
    </>
  )
}

type ViewProps = {
  nearby: MassTimesNearby
  filter: MassFilter
  mode: ViewMode
  onMode: (mode: ViewMode) => void
  onOpenFilters: () => void
}

// Full-bleed map with the shared header floating on top as one glass bar.
function MapView({ nearby, filter, mode, onMode, onOpenFilters }: ViewProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <YStack flex={1} backgroundColor="$background">
      <ChurchesMap nearby={nearby} />
      <YStack position="absolute" top={insets.top + 8} left={0} right={0} paddingHorizontal="$md">
        <MassTimesHeader
          variant="glass"
          view={mode}
          filterCount={countActiveFilters(filter)}
          onBack={() => router.back()}
          onToggleView={() => onMode('list')}
          onOpenFilters={onOpenFilters}
        />
      </YStack>
    </YStack>
  )
}

// List mode: the same header on the standard padded screen, above the nearby list.
function ListView({ nearby, filter, mode, onMode, onOpenFilters }: ViewProps) {
  const router = useRouter()

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <MassTimesHeader
          variant="plain"
          view={mode}
          filterCount={countActiveFilters(filter)}
          onBack={() => router.back()}
          onToggleView={() => onMode('map')}
          onOpenFilters={onOpenFilters}
          onSearch={() => router.push('/mass-times/search')}
        />
        <MassTimesList nearby={nearby} />
      </YStack>
    </ScreenLayout>
  )
}
