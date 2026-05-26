import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { darkTheme, lightTheme } from '@/config/themes'

// Native iOS 26 Liquid Glass tab bar (and native selection morph) come for
// free from UITabBarController; the search role gives the separate circular
// search affordance that expands into a field, exactly like Apple Podcasts.
export default function TabsLayout() {
  const { t } = useTranslation()

  const tintColor =
    Platform.OS === 'ios'
      ? DynamicColorIOS({ light: lightTheme.accent, dark: darkTheme.accent })
      : lightTheme.accent

  return (
    <NativeTabs tintColor={tintColor}>
      {/* Edge-to-edge so the home flourish can bleed up into the notch;
          ScreenLayout's manual safe-area padding owns the insets. */}
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>{t('nav.home')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="new">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
        <NativeTabs.Trigger.Label>{t('nav.new')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="library">
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
