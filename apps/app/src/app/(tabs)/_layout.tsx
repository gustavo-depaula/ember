import { usePathname } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { darkTheme, lightTheme } from '@/config/themes'
import { NowPlayingBar } from '@/features/creators/audio/NowPlayingBar'
import { useCreatorsStore } from '@/stores/creatorsStore'

// Native iOS 26 Liquid Glass tab bar (and native selection morph) come for
// free from UITabBarController; the search role gives the separate circular
// search affordance that expands into a field, exactly like Apple Podcasts.
// The now-playing pill lives in the BottomAccessory so it stays anchored above
// the bar and persists across navigation (detail routes are nested in (home)).
export default function TabsLayout() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const nowPlaying = useCreatorsStore((s) => s.nowPlaying)

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: lightTheme.accent, dark: darkTheme.accent })
      : lightTheme.accent

  // Hide the accessory entirely on the playing item's own page (the full
  // player is shown there) — otherwise the accessory renders an empty pill.
  const showPlayer = !!nowPlaying && !pathname?.endsWith(`/episode/${nowPlaying.itemId}`)

  return (
    <NativeTabs tintColor={tintColor}>
      {showPlayer ? (
        <NativeTabs.BottomAccessory>
          <NowPlayingBar />
        </NativeTabs.BottomAccessory>
      ) : null}

      {/* Edge-to-edge so the home flourish can bleed up into the notch;
          ScreenLayout's manual safe-area padding owns the insets. */}
      <NativeTabs.Trigger name="(home)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t('nav.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="new" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>{t('nav.new')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="library" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          md="library_books"
        />
        <NativeTabs.Trigger.Label>{t('nav.library')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>{t('nav.searchPlaceholder')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
