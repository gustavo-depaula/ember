import { Tabs } from 'expo-router/js-tabs'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { AndroidTabBar } from '@/components/AndroidTabBar'
import { darkTheme, lightTheme } from '@/config/themes'

const todayIcon = require('../../../assets/nav-icons/today.png')
const youIcon = require('../../../assets/nav-icons/you.png')
const searchIcon = require('../../../assets/nav-icons/search.png')

export default Platform.OS === 'android' ? AndroidTabsLayout : TabsLayout

function AndroidTabsLayout() {
  const { t } = useTranslation()
  const tabs = {
    '(today)': { icon: todayIcon, label: t('nav.today') },
    '(you)': { icon: youIcon, label: t('nav.you') },
    '(search)': { icon: searchIcon, label: t('nav.searchPlaceholder') },
  }
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AndroidTabBar {...props} tabs={tabs} />}
    >
      <Tabs.Screen name="(today)" options={{ title: tabs['(today)'].label }} />
      <Tabs.Screen name="(you)" options={{ title: tabs['(you)'].label }} />
      <Tabs.Screen name="(search)" options={{ title: tabs['(search)'].label }} />
    </Tabs>
  )
}

function TabsLayout() {
  const { t } = useTranslation()

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: lightTheme.accent, dark: darkTheme.accent })
      : lightTheme.accent

  return (
    <NativeTabs
      tintColor={tintColor}
      // A native tab-bar label resolves fontFamily via UIKit by PostScript name
      // (hyphen: 'Junicode-Light'), not the expo-font useFonts key (underscore:
      // 'Junicode_Light'), which silently falls back to the system font.
      // tintColor owns the selected gold, so set family + size only.
      labelStyle={{ fontFamily: 'Junicode-Light', fontSize: 12 }}
      minimizeBehavior="onScrollDown"
    >
      {/* Today/You/Search all resolve to the shared array group
          (today,you,search); edge-to-edge so the Today flourish can
          bleed up into the notch — ScreenLayout's manual safe-area padding owns
          the insets. */}
      {/* Full-color illuminated icons. renderingMode="original" is essential —
          the default ("template") would tint these to a flat gold silhouette.
          An original-mode image renders at its logical point size and the bar
          won't scale it down, so each icon ships as a name/@2x/@3x set resampled
          to ~32pt tall (search too) from assets/nav-icons/source/. Today and
          You are icon-only, so the art takes the room the label used to. */}
      <NativeTabs.Trigger name="(today)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon src={todayIcon} renderingMode="original" />
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(you)" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon src={youIcon} renderingMode="original" />
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>

      {/* role="search" keeps the circular expand-into-search-field affordance;
          the custom icon overrides the system glyph. */}
      <NativeTabs.Trigger name="(search)" role="search" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon src={searchIcon} renderingMode="original" />
        <NativeTabs.Trigger.Label>{t('nav.searchPlaceholder')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
