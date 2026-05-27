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
    <NativeTabs tintColor={tintColor} minimizeBehavior="onScrollDown">
      {showPlayer ? (
        <NativeTabs.BottomAccessory>
          <NowPlayingBar />
        </NativeTabs.BottomAccessory>
      ) : null}

      {/* Today/Explore/Library/You all resolve to the shared array group
          (today,explore,library,you); edge-to-edge so the Today flourish can
          bleed up into the notch — ScreenLayout's manual safe-area padding owns
          the insets. */}
      <NativeTabs.Trigger name="(today)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t('nav.today')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(explore)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf={{ default: 'safari', selected: 'safari.fill' }} md="explore" />
        <NativeTabs.Trigger.Label>{t('nav.explore')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(library)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          md="library_books"
        />
        <NativeTabs.Trigger.Label>{t('nav.library')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(you)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md="person"
        />
        <NativeTabs.Trigger.Label>{t('nav.you')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>{t('nav.searchPlaceholder')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
