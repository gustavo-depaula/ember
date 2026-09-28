import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { darkTheme, lightTheme } from '@/config/themes'

export default function TabsLayout() {
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
