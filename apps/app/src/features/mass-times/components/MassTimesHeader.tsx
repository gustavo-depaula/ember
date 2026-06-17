import { ChevronLeft, List, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react-native'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'
import { AnimatedPressable, GlassSurface, Typography } from '@/components'
import { selectionTick } from '@/lib/haptics'

export type ViewMode = 'list' | 'map'

// The one header for both the map and the list, so the two modes read as a single feature rather
// than two screens. Same Junicode title voice and gold marks as the church cards (the centerpiece);
// `variant="glass"` floats it over the map as a single bar, `variant="plain"` sits it on the list.
export function MassTimesHeader({
  variant,
  view,
  filterCount,
  onBack,
  onToggleView,
  onOpenFilters,
  onSearch,
}: {
  variant: 'glass' | 'plain'
  view: ViewMode
  filterCount: number
  onBack: () => void
  onToggleView: () => void
  onOpenFilters: () => void
  onSearch?: () => void
}) {
  const { t } = useTranslation()
  const isDark = useThemeName().startsWith('dark')
  const glass = variant === 'glass'

  const row = (
    <XStack
      alignItems="center"
      gap="$xs"
      paddingHorizontal={glass ? '$sm' : 0}
      paddingVertical={glass ? '$xs' : 0}
    >
      <HeaderButton icon={ChevronLeft} label={t('massTimes.back')} onPress={onBack} />
      {/* Same compact manuscript title on both variants, so the map bar and the list header read as
          one control, not two. */}
      <Typography
        variant="sacred-title"
        textAlign="left"
        fontSize={30}
        lineHeight={36}
        numberOfLines={1}
        flex={1}
        marginLeft="$xs"
      >
        {t('massTimes.title')}
      </Typography>
      {onSearch ? (
        <HeaderButton icon={Search} label={t('massTimes.searchPlaceholder')} onPress={onSearch} />
      ) : null}
      <HeaderButton
        icon={SlidersHorizontal}
        label={t('massTimes.filters')}
        active={filterCount > 0}
        badge={filterCount > 0}
        onPress={onOpenFilters}
      />
      <HeaderButton
        icon={view === 'map' ? List : MapIcon}
        label={t(view === 'map' ? 'massTimes.list' : 'massTimes.map')}
        onPress={() => {
          void selectionTick()
          onToggleView()
        }}
      />
    </XStack>
  )

  if (glass) {
    return (
      <GlassSurface isDark={isDark} style={{ borderRadius: 24 }}>
        {row}
      </GlassSurface>
    )
  }
  return row
}

function HeaderButton({
  icon: Icon,
  label,
  onPress,
  active,
  badge,
}: {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  onPress: () => void
  active?: boolean
  badge?: boolean
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <YStack padding="$sm">
        <Icon size={20} color={active ? theme.accent?.val : theme.colorSecondary?.val} />
        {badge ? (
          <YStack
            position="absolute"
            top={2}
            right={2}
            width={9}
            height={9}
            borderRadius={5}
            backgroundColor="$accent"
            borderWidth={2}
            borderColor={theme.background?.val}
          />
        ) : null}
      </YStack>
    </AnimatedPressable>
  )
}
