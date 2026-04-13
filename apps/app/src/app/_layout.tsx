import '@/lib/i18n'

import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel'
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond'
import { CrimsonPro_400Regular } from '@expo-google-fonts/crimson-pro'
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  EBGaramond_700Bold_Italic,
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
import { TamaguiProvider, Theme } from 'tamagui'

import { TasselPull } from '@/components/TasselPull'
import { config } from '@/config/tamagui.config'
import { useDbInit } from '@/db/client'
import { seedCursors, seedPractices } from '@/db/seed'
import {
  checkAndUpdateBooks,
  downloadAndInstallBook,
  fetchRegistry,
  getInstalledBooks,
  loadInstalledBooks,
} from '@/features/books/libraryManager'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { initHearth } from '@/lib/hearth'
import { rescheduleAllReminders, setupNotifications } from '@/lib/notifications'
import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

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
    EBGaramond_700Bold,
    EBGaramond_700Bold_Italic,
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
  const {
    theme: themePreference,
    hydrated: prefsHydrated,
    hydrate: hydratePrefs,
  } = usePreferencesStore()
  const { hydrated: bibleHydrated, hydrate: hydrateBible } = useBibleStore()
  const { hydrated: catechismHydrated, hydrate: hydrateCatechism } = useCatechismStore()

  useEffect(() => {
    if (!dbReady) return
    // Hydrate all stores after DB is ready (they read from preferences table now)
    hydratePrefs()
    hydrateBible()
    hydrateCatechism()
    initHearth()
  }, [dbReady, hydratePrefs, hydrateBible, hydrateCatechism])

  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    if (!dbReady) return

    async function initBooks() {
      // Load already-installed books into the ContentRegistry
      await loadInstalledBooks()

      // If no books installed (first launch), download the default
      const installed = await getInstalledBooks()
      if (installed.length === 0) {
        const registry = await fetchRegistry()
        const defaultBook = registry.libraries.find((b) => b.tags?.includes('default'))
        if (defaultBook) {
          await downloadAndInstallBook(defaultBook)
        }
      }

      // Seed practices and cursors
      await Promise.all([seedPractices(), seedCursors()])
      setSeeded(true)
      setupNotifications().then(() => rescheduleAllReminders())

      if (installed.length > 0) {
        checkAndUpdateBooks()
          .then(async (updated) => {
            if (updated) await seedPractices()
          })
          .catch((err) => console.warn('Book update check failed:', err))
      }
    }

    initBooks()
  }, [dbReady])

  const ready =
    fontsLoaded && prefsHydrated && bibleHydrated && catechismHydrated && dbReady && seeded

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync()
    }
  }, [ready])

  const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
  const { themeName } = useLiturgicalTheme()

  if (!ready) return undefined

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
          {/* biome-ignore lint/suspicious/noExplicitAny: Tamagui sub-theme names are dynamically composed */}
          <Theme name={themeName as any}>
            <StatusBar hidden />
            <Stack
              screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 200 }}
            >
              <Stack.Screen name="index" options={{ title: 'Home' }} />
              <Stack.Screen name="plan" options={{ title: 'Plan of Life' }} />
              <Stack.Screen name="bible" options={{ title: 'Sacred Scripture' }} />
              <Stack.Screen name="catechism" options={{ title: 'Catechism' }} />
              <Stack.Screen name="saints" options={{ title: 'Saints' }} />
              <Stack.Screen name="settings" options={{ title: 'Settings' }} />
              <Stack.Screen name="pray" options={{ title: 'Prayer' }} />
              <Stack.Screen name="practices" options={{ title: 'Practices' }} />
              <Stack.Screen name="library" options={{ title: 'Library', gestureEnabled: false }} />
            </Stack>
            <TasselPull />
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
