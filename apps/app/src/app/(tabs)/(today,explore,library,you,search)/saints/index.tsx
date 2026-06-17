import { Search } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TextInput } from 'react-native'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, View, XStack } from 'tamagui'

import { GlassSurface, ScreenLayout } from '@/components'
import { type SaintGrouping, SaintsGalleryHeader, SaintWall } from '@/features/saints/components'
import { useSaintsCatalog } from '@/features/saints/data/catalog'
import { normalizeForSearch } from '@/lib/search'

const searchBarHeight = 52
// Lift above the nav when the keyboard is closed. Under NativeTabs the
// safe-area bottom inset ALREADY includes the tab bar, so this is just a small
// gap above it — not the tab-bar height again (that double-count shoved it up).
const navGap = 8

export default function SaintsScreen() {
  const { saints, total, collectedCount } = useSaintsCatalog()
  const [grouping, setGrouping] = useState<SaintGrouping>('calendar')
  const [query, setQuery] = useState('')

  const searching = query.trim().length > 0

  const filtered = useMemo(() => {
    if (!searching) return saints
    const q = normalizeForSearch(query.trim())
    return saints.filter((s) => normalizeForSearch(s.name).includes(q))
  }, [saints, query, searching])

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenLayout>
        <SaintWall
          saints={filtered}
          grouping={grouping}
          searching={searching}
          ListHeaderComponent={
            searching ? undefined : (
              <SaintsGalleryHeader
                saints={saints}
                total={total}
                collectedCount={collectedCount}
                grouping={grouping}
                onGrouping={setGrouping}
              />
            )
          }
        />
        {/* Clears the floating search bar so the last cards aren't hidden. */}
        <View height={searchBarHeight + 24} />
      </ScreenLayout>

      <GallerySearch query={query} onQuery={setQuery} />
    </View>
  )
}

// A liquid-glass search field that rests just above the bottom nav and sticks
// to the keyboard when focused (so it's never hidden under it).
function GallerySearch({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()

  return (
    // Docked at the screen bottom; `closed` lifts it above the nav, and when the
    // keyboard opens it rides up to sit just above it (`opened` trims the gap).
    <KeyboardStickyView
      offset={{ closed: -(insets.bottom + navGap), opened: -navGap }}
      style={styles.dock}
    >
      <GlassSurface isDark={isDark} style={styles.pill}>
        <XStack alignItems="center" gap="$sm" paddingHorizontal="$md" height={searchBarHeight}>
          <Search size={18} color={theme.colorSecondary?.val} />
          <TextInput
            style={[styles.input, { color: theme.color?.val }]}
            value={query}
            onChangeText={onQuery}
            placeholder={t('saints.searchPlaceholder')}
            placeholderTextColor={theme.colorSecondary?.val}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel={t('saints.searchPlaceholder')}
          />
        </XStack>
      </GlassSurface>
    </KeyboardStickyView>
  )
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  pill: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: 'EBGaramond_400Regular',
    fontSize: 17,
  },
})
