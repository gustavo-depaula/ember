import { usePathname } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { darkTheme, lightTheme } from '@/config/themes'

export default function TabsLayout() {
  const { t } = useTranslation()
  const pathname = usePathname()

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: lightTheme.accent, dark: darkTheme.accent })
      : lightTheme.accent

  // If the tab bar stays mounted over the book reader, its WebView lingers as an
  // invisible touch-intercepting overlay and taps go dead app-wide after leaving
  // the book; hiding the bar lets the screen take the whole height and unmount
  // cleanly. On the Mass Times root map, its own sheet owns the bottom edge.
  const hideTabBar =
    pathname?.includes('/pray/') ||
    pathname?.endsWith('/read') ||
    pathname?.endsWith('/mass-times') ||
    false

  return (
    <NativeTabs
      tintColor={tintColor}
      // A native tab-bar label resolves fontFamily via UIKit by PostScript name
      // (hyphen: 'Junicode-Light'), not the expo-font useFonts key (underscore:
      // 'Junicode_Light'), which silently falls back to the system font.
      // tintColor owns the selected gold, so set family + size only.
      labelStyle={{ fontFamily: 'Junicode-Light', fontSize: 12 }}
      minimizeBehavior="onScrollDown"
      hidden={hideTabBar}
    >
      {/* Today/You/Search all resolve to the shared array group
          (today,you,search); edge-to-edge so the Today flourish can
          bleed up into the notch — ScreenLayout's manual safe-area padding owns
          the insets. */}
      {/* Full-color illuminated icons. renderingMode="original" is essential —
          the default ("template") would tint these to a flat gold silhouette.
          An original-mode image renders at its logical point size and the bar
          won't scale it down, so each icon ships as a name/@2x/@3x set resampled
          to ~28pt tall (search ~32pt) from assets/nav-icons/source/. */}
      <NativeTabs.Trigger name="(today)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon
          src={require('../../../assets/nav-icons/today.png')}
          renderingMode="original"
        />
        <NativeTabs.Trigger.Label>{t('nav.today')}</NativeTabs.Trigger.Label>
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
