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

  // Slide the tab bar away on full-screen reading surfaces (Apple's "hide
  // bottom bar when pushed" pattern) — these screens carry their own back /
  // settings chrome and want the page to dominate.
  const hideTabBar = pathname?.includes('/pray/') || pathname?.endsWith('/read') || false

  return (
    <NativeTabs
      tintColor={tintColor}
      // Junicode italic on every tab label. NOTE: a NATIVE tab-bar label resolves
      // fontFamily via UIKit, which knows the font by its PostScript name (hyphen:
      // 'Junicode-MediumItalic') — NOT the expo-font useFonts key (underscore:
      // 'Junicode_MediumItalic'), which silently falls back to the system font.
      // tintColor still owns the selected gold, so we set family + size only.
      labelStyle={{ fontFamily: 'Junicode-Light', fontSize: 12 }}
      minimizeBehavior="onScrollDown"
      hidden={hideTabBar}
    >
      {showPlayer ? (
        <NativeTabs.BottomAccessory>
          <NowPlayingBar />
        </NativeTabs.BottomAccessory>
      ) : null}

      {/* Today/Explore/Library/You all resolve to the shared array group
          (today,explore,library,you); edge-to-edge so the Today flourish can
          bleed up into the notch — ScreenLayout's manual safe-area padding owns
          the insets. */}
      {/* Full-color illuminated icons. renderingMode="original" is essential —
          the default ("template") would tint these to a flat gold silhouette. */}
      <NativeTabs.Trigger name="(today)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/today.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.today')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(explore)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/explore.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.explore')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(library)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/library.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.library')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(you)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/you.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.you')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* role="search" keeps the circular expand-into-search-field affordance;
          the custom icon overrides the system glyph. */}
      <NativeTabs.Trigger name="(search)" role="search" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/search.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.searchPlaceholder')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
