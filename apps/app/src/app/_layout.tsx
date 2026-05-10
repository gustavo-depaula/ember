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
import { BootLoadingScreen } from '@/components/BootLoadingScreen'
import { config } from '@/config/tamagui.config'
import { darkTheme, lightTheme } from '@/config/themes'
import {
  loadCatalogFromHearth,
  warmCriticalManifests,
  warmDeferredManifests,
} from '@/content/resolver'
import { evictTo } from '@/content/store'
import { useDbInit } from '@/db/client'
import { seedCursors, seedPractices } from '@/db/seed'
import { installAudioBackend } from '@/features/creators/audio/audioPlayer'
import { NowPlayingBar } from '@/features/creators/audio/NowPlayingBar'
import { FloatingOfflineChip } from '@/features/creators/components/OfflineChip'
import { drainPendingPins } from '@/features/creators/pinning/feedItemPin'
import { installCreatorPinning } from '@/features/creators/pinning/install'
import { pinnedHashes, rehydratePinned } from '@/features/pinning/pinningManager'
import { useKeepAwake } from '@/hooks/useKeepAwake'
import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'
import { registerDataSources } from '@/lib/data-sources/register'
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
    hydratePrefs()
    hydrateBible()
    hydrateCatechism()
  }, [dbReady, hydratePrefs, hydrateBible, hydrateCatechism])

  const [seeded, setSeeded] = useState(false)
  const [bootStatus, setBootStatus] = useState<string | undefined>(undefined)

  // 200MB cap. Pinned blobs are skipped during eviction; the cap is a soft
  // ceiling (pinned content can exceed it without dropping anything).
  const CACHE_BUDGET_BYTES = 200 * 1024 * 1024

  useEffect(() => {
    if (!dbReady) return

    async function runCacheEviction() {
      try {
        const protectedHashes = await pinnedHashes()
        const result = await evictTo(CACHE_BUDGET_BYTES, protectedHashes)
        if (result.deleted > 0) {
          console.log(
            `[startup] cache eviction: dropped ${result.deleted} blob(s); now ${(result.totalBytes / 1024 / 1024).toFixed(1)}MB`,
          )
        }
      } catch (err) {
        console.warn('[startup] cache eviction failed:', err)
      }
    }

    async function initCorpus() {
      try {
        registerDataSources()
        installAudioBackend()
        installCreatorPinning()
        await initHearth()

        setBootStatus(i18n.t('boot.fetchingCatalog'))
        // 2. Fetch catalog (network-first; falls back to SQLite cache).
        await loadCatalogFromHearth().catch((err) => {
          console.warn('[startup] catalog fetch failed; proceeding with cached catalog:', err)
        })

        setBootStatus(i18n.t('boot.preparingContent'))
        // 3. Rehydrate the user's pinned-items list and warm their manifests.
        await rehydratePinned().catch((err) => {
          console.warn('[startup] pinned rehydrate failed:', err)
        })

        // 4. Warm sync-resolver manifests before first paint; let the rest
        //    (books, chapters, collections) warm in parallel without blocking.
        await warmCriticalManifests().catch((err) => {
          console.warn('[startup] warm critical manifests failed:', err)
        })
        warmDeferredManifests().catch((err) => {
          console.warn('[startup] warm deferred manifests failed:', err)
        })

        setBootStatus(i18n.t('boot.almostReady'))
        await Promise.all([seedPractices(), seedCursors()])
      } catch (err) {
        console.error('[startup] initCorpus failed:', err)
      } finally {
        setSeeded(true)
        setupNotifications()
          .then(() => rescheduleAllReminders())
          .catch((err) => console.error('[startup] notification setup failed', err))

        InteractionManager.runAfterInteractions(() => {
          loadCatalogFromHearth()
            .then(() => Promise.all([warmCriticalManifests(), warmDeferredManifests()]))
            .then(() => seedPractices())
            .then(() => runCacheEviction())
            .catch((err) => console.warn('Background catalog refresh failed:', err))
        })
      }
    }

    initCorpus()
  }, [dbReady])

  useEffect(() => {
    if (!dbReady) return
    let sub: { remove: () => void } | undefined
    let cancelled = false
    void import('expo-network').then((Network) => {
      if (cancelled) return
      sub = Network.addNetworkStateListener((state) => {
        if (state.type === Network.NetworkStateType.WIFI && state.isConnected) {
          void drainPendingPins().catch(() => {})
        }
      })
    })
    return () => {
      cancelled = true
      sub?.remove()
    }
  }, [dbReady])

  // Core UI infra (fonts, theme, db, prefs) — gates the splash hide so we can
  // show a custom loading screen while the corpus warms.
  const coreReady = fontsLoaded && prefsHydrated && bibleHydrated && catechismHydrated && dbReady
  const ready = coreReady && seeded

  useEffect(() => {
    if (coreReady) SplashScreen.hideAsync()
  }, [coreReady])

  const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
  const { themeName } = useLiturgicalTheme()
  const rootBg = resolvedTheme === 'dark' ? darkTheme.background : lightTheme.background

  if (!coreReady) return undefined

  if (!ready) {
    return (
      <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
        {/* biome-ignore lint/suspicious/noExplicitAny: Tamagui sub-theme names are dynamically composed */}
        <Theme name={themeName as any}>
          <BootLoadingScreen status={bootStatus} />
        </Theme>
      </TamaguiProvider>
    )
  }

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
                name="browse"
                options={{ title: i18n.t('browse.title'), gestureEnabled: false }}
              />
              <Stack.Screen name="creators" options={{ title: i18n.t('creators.title') }} />
            </Stack>
            <FloatingOfflineChip />
            <NowPlayingBar />
            <AppFrame />
            <ConfirmHost />
          </Theme>
        </TamaguiProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
