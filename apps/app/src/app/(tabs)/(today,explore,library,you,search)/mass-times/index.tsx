import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface } from '@/components'
import {
  ChurchesMap,
  ChurchSheet,
  countActiveFilters,
  emptyFilter,
  type MassFilter,
  MassFilterSheet,
  useMassTimesNearby,
} from '@/features/mass-times'

// Mass Times: one map-backed "places" surface (Apple Maps style). The full-bleed map is the canvas;
// a native iOS sheet rides on top of it (browse → tap a church → detail), the global tab bar steps
// aside, and a floating glass back button is the only top chrome.
export default function MassTimesScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<MassFilter>(emptyFilter)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const nearby = useMassTimesNearby(filter)

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
      <ChurchesMap
        nearby={nearby}
        onSelectChurch={(church) =>
          router.push({ pathname: '/mass-times/[churchId]', params: { churchId: church.id } })
        }
      />

      <ChurchSheet
        nearby={nearby}
        locale={i18n.language}
        filterCount={countActiveFilters(filter)}
        onSearch={() => router.push('/mass-times/search')}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      {/* Floating back button — the only top chrome, rendered last so it stays above the sheet host. */}
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
