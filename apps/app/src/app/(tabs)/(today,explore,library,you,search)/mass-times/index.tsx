import { useRouter } from 'expo-router'
import { ChevronLeft, List, Search, SlidersHorizontal } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, PageHeader, ScreenLayout, Typography } from '@/components'
import {
  ChurchesMap,
  countActiveFilters,
  emptyFilter,
  type MassFilter,
  MassFilterSheet,
  MassTimesList,
  type MassTimesNearby,
  useMassTimesNearby,
  type ViewMode,
  ViewToggle,
} from '@/features/mass-times'
import { selectionTick } from '@/lib/haptics'

// Mass Times root: the map is the primary surface — it stretches edge to edge with the controls
// floating on top — and a list mode is one tap away. Both share one location + query
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

const glassCircle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: 'center',
  justifyContent: 'center',
} as const

// Full-bleed map with floating glass controls: back · list on the left, title centered, filters on
// the right. `box-none` on the overlay lets map gestures pass through the gaps so only the actual
// buttons capture touches.
function MapView({ nearby, filter, onMode, onOpenFilters }: ViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const activeFilters = countActiveFilters(filter)

  return (
    <YStack flex={1} backgroundColor="$background">
      <ChurchesMap nearby={nearby} />
      <XStack
        position="absolute"
        top={insets.top + 8}
        left={0}
        right={0}
        paddingHorizontal="$md"
        alignItems="center"
        gap="$sm"
        pointerEvents="box-none"
      >
        <GlassCircleButton
          isDark={isDark}
          label={t('massTimes.back')}
          onPress={() => router.back()}
        >
          <ChevronLeft size={22} color={theme.colorSecondary?.val} />
        </GlassCircleButton>
        <GlassCircleButton
          isDark={isDark}
          label={t('massTimes.list')}
          onPress={() => {
            void selectionTick()
            onMode('list')
          }}
        >
          <List size={20} color={theme.colorSecondary?.val} />
        </GlassCircleButton>
        <YStack flex={1} alignItems="center" pointerEvents="box-none">
          <GlassSurface
            isDark={isDark}
            style={{ borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Typography variant="interface" fontSize="$5">
              {t('massTimes.title')}
            </Typography>
          </GlassSurface>
        </YStack>
        <GlassCircleButton
          isDark={isDark}
          label={t('massTimes.filters')}
          badge={activeFilters > 0}
          onPress={() => {
            void selectionTick()
            onOpenFilters()
          }}
        >
          <SlidersHorizontal size={20} color={theme.colorSecondary?.val} />
        </GlassCircleButton>
      </XStack>
    </YStack>
  )
}

function GlassCircleButton({
  isDark,
  label,
  onPress,
  badge,
  children,
}: {
  isDark: boolean
  label: string
  onPress: () => void
  badge?: boolean
  children: React.ReactNode
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <GlassSurface isDark={isDark} style={glassCircle}>
        {children}
      </GlassSurface>
      {badge ? (
        <YStack
          position="absolute"
          top={-1}
          right={-1}
          width={12}
          height={12}
          borderRadius={6}
          backgroundColor="$accent"
          borderWidth={2}
          borderColor={theme.background?.val}
        />
      ) : null}
    </AnimatedPressable>
  )
}

// List mode keeps the standard padded screen, with the same filter affordance plus search.
function ListView({ nearby, filter, mode, onMode, onOpenFilters }: ViewProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const activeFilters = countActiveFilters(filter)

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$lg">
        <PageHeader
          title={t('massTimes.title')}
          action={
            <XStack alignItems="center" gap="$md">
              <AnimatedPressable
                onPress={() => router.push('/mass-times/search')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.searchPlaceholder')}
              >
                <Search size={20} color={theme.colorSecondary?.val} />
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  void selectionTick()
                  onOpenFilters()
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.filters')}
              >
                <SlidersHorizontal
                  size={20}
                  color={activeFilters > 0 ? theme.accent?.val : theme.colorSecondary?.val}
                />
              </AnimatedPressable>
              <ViewToggle value={mode} onChange={onMode} />
            </XStack>
          }
        />
        <MassTimesList nearby={nearby} />
      </YStack>
    </ScreenLayout>
  )
}
