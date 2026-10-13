import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { useTranslation } from 'react-i18next'
import { DynamicColorIOS, Platform } from 'react-native'

import { darkTheme, lightTheme } from '@/config/themes'

const todayIcon = require('../../assets/nav-icons/today.png')
const youIcon = require('../../assets/nav-icons/you.png')
const searchIcon = require('../../assets/nav-icons/search.png')

const sections = [
  { name: '(prayers)', label: 'nav.prayers', icon: 'hands.and.sparkles' },
  { name: '(bible)', label: 'nav.bible', icon: 'book.closed' },
  { name: '(library)', label: 'nav.library', icon: 'books.vertical' },
  { name: '(saints)', label: 'nav.saints', icon: 'person.2' },
  { name: '(calendar)', label: 'nav.calendar', icon: 'calendar' },
] as const

/** The app's tabs, on the system tab bar. Android has its own (`AppTabs.android.tsx`). */
export function AppTabs() {
  const { t } = useTranslation()

  // A phone's bar has room for the illuminated art alone. An iPad sets its
  // tabs as words on the bar and as rows in the sidebar, where the system's own
  // symbols sit level with its type.
  const pad = Platform.OS === 'ios' && Platform.isPad

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
      // iPad and Mac: the bar can open into the system sidebar, as Apple's own
      // apps do. No effect on a phone.
      sidebarAdaptable
    >
      {/* Every tab resolves to the one shared array group; edge-to-edge so the
          Today flourish can bleed up into the notch — ScreenLayout's manual
          safe-area padding owns the insets. */}
      {/* A phone's icons are full-color illuminated art. renderingMode="original"
          is essential — the default ("template") would tint these to a flat gold
          silhouette. An original-mode image renders at its logical point size
          and the bar won't scale it down, so each icon ships as a name/@2x/@3x
          set resampled to ~32pt tall (search too) from assets/nav-icons/source/.
          Today and You are icon-only there, so the art takes the label's room. */}
      <NativeTabs.Trigger name="(today)" disableAutomaticContentInsets>
        {pad ? (
          <NativeTabs.Trigger.Icon sf={{ default: 'sun.max', selected: 'sun.max.fill' }} />
        ) : (
          <NativeTabs.Trigger.Icon src={todayIcon} renderingMode="original" />
        )}
        <NativeTabs.Trigger.Label hidden={!pad}>{t('nav.today')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(you)" disableAutomaticContentInsets>
        {pad ? (
          <NativeTabs.Trigger.Icon
            sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          />
        ) : (
          <NativeTabs.Trigger.Icon src={youIcon} renderingMode="original" />
        )}
        <NativeTabs.Trigger.Label hidden={!pad}>{t('nav.you')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* The sections an iPad has room to keep one tap away. A phone reaches
          them through Today and Search, so its bar stays at three. */}
      {sections.map(({ name, label, icon }) => (
        <NativeTabs.Trigger key={name} name={name} hidden={!pad} disableAutomaticContentInsets>
          <NativeTabs.Trigger.Icon sf={icon} />
          <NativeTabs.Trigger.Label>{t(label)}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}

      {/* role="search" keeps the circular expand-into-search-field affordance;
          on a phone the custom icon overrides the system glyph. */}
      <NativeTabs.Trigger name="(search)" role="search" disableAutomaticContentInsets>
        {!pad && <NativeTabs.Trigger.Icon src={searchIcon} renderingMode="original" />}
        <NativeTabs.Trigger.Label>{t('nav.searchPlaceholder')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
