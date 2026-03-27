import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel'
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond'
import { CrimsonPro_400Regular } from '@expo-google-fonts/crimson-pro'
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond'
import { LibreBaskerville_400Regular } from '@expo-google-fonts/libre-baskerville'
import { Lora_400Regular } from '@expo-google-fonts/lora'
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather'
import { PinyonScript_400Regular } from '@expo-google-fonts/pinyon-script'
import { SourceSerif4_400Regular } from '@expo-google-fonts/source-serif-4'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { LogBox, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider } from 'tamagui'

import { TasselPull } from '@/components/TasselPull'
import { config } from '@/config/tamagui.config'
import { useDbInit } from '@/db/client'
import { seedPractices, seedReadingProgress } from '@/db/seed'
import { rescheduleAllReminders, setupNotifications } from '@/lib/notifications'
import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useReadingConfigStore } from '@/stores/readingConfigStore'
import { useThemeStore } from '@/stores/themeStore'

SplashScreen.preventAutoHideAsync()

// RN 0.83 deprecation warning from Tamagui internals crashes LogBox with "cyclic object value"
LogBox.ignoreLogs(['props.pointerEvents is deprecated'])

const queryClient = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    PinyonScript_400Regular,
    CrimsonPro_400Regular,
    Lora_400Regular,
    CormorantGaramond_400Regular,
    LibreBaskerville_400Regular,
    SourceSerif4_400Regular,
    Merriweather_400Regular,
    UnifrakturMaguntia: require('../../assets/fonts/UnifrakturMaguntia-Book.ttf'),
  })

  const { success: dbReady } = useDbInit()

  const systemScheme = useColorScheme()
  const { preference, hydrated: themeHydrated, hydrate: hydrateTheme } = useThemeStore()
  const { hydrated: prefsHydrated, hydrate: hydratePrefs } = usePreferencesStore()
  const { hydrated: bibleHydrated, hydrate: hydrateBible } = useBibleStore()
  const { hydrated: catechismHydrated, hydrate: hydrateCatechism } = useCatechismStore()
  const { hydrated: readingConfigHydrated, hydrate: hydrateReadingConfig } = useReadingConfigStore()

  useEffect(() => {
    hydrateTheme()
    hydratePrefs()
    hydrateBible()
    hydrateCatechism()
    hydrateReadingConfig()
  }, [hydrateTheme, hydratePrefs, hydrateBible, hydrateCatechism, hydrateReadingConfig])

  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (dbReady) {
      Promise.all([seedPractices(), seedReadingProgress()]).then(() => {
        setSeeded(true)
        setupNotifications().then(() => rescheduleAllReminders())
      })
    }
  }, [dbReady])

  const ready =
    fontsLoaded &&
    themeHydrated &&
    prefsHydrated &&
    bibleHydrated &&
    catechismHydrated &&
    readingConfigHydrated &&
    dbReady &&
    seeded

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync()
    }
  }, [ready])

  if (!ready) return undefined

  const resolvedTheme = preference === 'system' ? (systemScheme ?? 'light') : preference

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
          <StatusBar hidden />
          <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
          <TasselPull />
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
