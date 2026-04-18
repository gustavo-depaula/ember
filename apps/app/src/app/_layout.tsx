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
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { InteractionManager, LogBox, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider, Theme } from 'tamagui'

import { ConfirmHost, confirm } from '@/components'
import { AppFrame } from '@/components/AppFrame'
import { config } from '@/config/tamagui.config'
import { darkTheme, lightTheme } from '@/config/themes'
import { useDbInit } from '@/db/client'
import { seedCursors, seedPractices } from '@/db/seed'
import {
  checkAndUpdateBooks,
  downloadAndInstallBook,
  fetchRegistry,
  getInstalledBooks,
  loadInstalledBooks,
} from '@/features/books/libraryManager'
import { useKeepAwake } from '@/hooks/useKeepAwake'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { initHearth } from '@/lib/hearth'
import i18n from '@/lib/i18n'
import { rescheduleAllReminders, setupNotifications } from '@/lib/notifications'
import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

SplashScreen.preventAutoHideAsync()

// RN 0.83 deprecation warning from Tamagui internals crashes LogBox with "cyclic object value"
LogBox.ignoreLogs(['props.pointerEvents is deprecated'])

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return
      const description =
        error instanceof Error && error.message ? error.message : i18n.t('error.tryAgainLater')
      confirm({
        title: i18n.t('error.somethingWrong'),
        description,
        singleAction: true,
      })
    },
  }),
})

if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = 'input, textarea { outline: none !important; }'
  document.head.appendChild(style)
}

export default function RootLayout() {
  useKeepAwake()

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
        InteractionManager.runAfterInteractions(() => {
          checkAndUpdateBooks()
            .then(async (updated) => {
              if (updated) await seedPractices()
            })
            .catch((err) => console.warn('Book update check failed:', err))
        })
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
  const rootBg = resolvedTheme === 'dark' ? darkTheme.background : lightTheme.background

  if (!ready) return undefined

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
          {/* biome-ignore lint/suspicious/noExplicitAny: Tamagui sub-theme names are dynamically composed */}
          <Theme name={themeName as any}>
            <StatusBar hidden />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 200,
                contentStyle: { backgroundColor: rootBg },
              }}
            >
              <Stack.Screen name="index" options={{ title: i18n.t('a11y.home') }} />
              <Stack.Screen name="plan" options={{ title: i18n.t('home.planOfLife') }} />
              <Stack.Screen name="bible" options={{ title: i18n.t('home.sacredScripture') }} />
              <Stack.Screen name="catechism" options={{ title: i18n.t('home.catechism') }} />
              <Stack.Screen name="saints" options={{ title: i18n.t('saints.title') }} />
              <Stack.Screen name="settings" options={{ title: i18n.t('settings.title') }} />
              <Stack.Screen name="pray" options={{ title: i18n.t('home.pray') }} />
              <Stack.Screen name="practices" options={{ title: i18n.t('practices.title') }} />
              <Stack.Screen
                name="library"
                options={{ title: i18n.t('library.title'), gestureEnabled: false }}
              />
            </Stack>
            <AppFrame />
            <ConfirmHost />
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
