import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface } from '@/components'
import {
  ChurchSheet,
  countActiveFilters,
  emptyFilter,
  type MapRegion,
  type MassFilter,
  MassFilterSheet,
  useMassTimesNearby,
} from '@/features/mass-times'

// Mass Times: one map-backed "places" surface (Apple Maps style). ChurchSheet owns the whole thing —
// a SwiftUI Host with the live map as background content and the native sheet riding on top — so the
// map stays interactive behind the sheet. The screen adds only the floating back button + filter sheet.
export default function MassTimesScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<MassFilter>(emptyFilter)
  const [filtersOpen, setFiltersOpen] = useState(false)
  // The viewed map region (undefined until the user pans) — lets the nearby results follow the map.
  const [region, setRegion] = useState<MapRegion>()
  const nearby = useMassTimesNearby(filter, region)

  // Ask for location up front: lights the blue dot + pulls real nearby results. iOS shows the dialog
  // only once; later calls just read status, so a guarded single fire.
  const askedRef = useRef(false)
  useEffect(() => {
    if (askedRef.current) return
    askedRef.current = true
    void nearby.location.request()
  }, [nearby.location])

  return (
    <YStack flex={1} backgroundColor="$background">
      <ChurchSheet
        nearby={nearby}
        locale={i18n.language}
        filterCount={countActiveFilters(filter)}
        onOpenFilters={() => setFiltersOpen(true)}
        onRegionChange={setRegion}
      />

      {/* Floating back button — the only top chrome, over the map. */}
      <YStack position="absolute" top={insets.top + 8} left="$md">
        <AnimatedPressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('massTimes.back')}
        >
          <GlassSurface
            isDark={isDark}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={22} color={theme.colorSecondary?.val} />
          </GlassSurface>
        </AnimatedPressable>
      </YStack>

      <MassFilterSheet
        open={filtersOpen}
        filter={filter}
        onChange={setFilter}
        onClose={() => setFiltersOpen(false)}
      />
    </YStack>
  )
}
