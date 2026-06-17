import '@/lib/i18n'

import { featureFlags } from 'react-native-screens'

// Unblocks touch interactions while the iOS 26 zoom transition is still
// running — without these flags, taps are swallowed for the full ~0.5-1s
// of the Link.AppleZoom animation. Tracked in software-mansion/react-native-screens#3621.
featureFlags.experiment.iosPreventReattachmentOfDismissedScreens = true
featureFlags.experiment.ios26AllowInteractionsDuringTransition = true

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
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect, useState } from 'react'
import { Appearance, AppState, InteractionManager, LogBox, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { TamaguiProvider } from 'tamagui'

import { ConfirmHost, confirm } from '@/components'
import { BootLoadingScreen } from '@/components/BootLoadingScreen'
import { flags } from '@/config/flags'
import { config } from '@/config/tamagui.config'
import { darkTheme, lightTheme } from '@/config/themes'
import { maybeRunCacheEviction } from '@/content/cacheMaintenance'
import { registerEscrivaCatalog, warmEscrivaBooks } from '@/content/escrivaCatalog'
import {
  hasCachedCatalog,
  loadCatalogFromHearth,
  warmCriticalManifests,
  warmDeferredManifests,
} from '@/content/resolver'
import { useDbInit } from '@/db/client'
import { listCommitments, reconcileAbandonedSessions } from '@/db/repositories/custody'
import { seedCursors, seedPractices } from '@/db/seed'
import { installAudioBackend } from '@/features/creators/audio/audioPlayer'
import { FloatingOfflineChip } from '@/features/creators/components/OfflineChip'
import { drainPendingPins } from '@/features/creators/pinning/feedItemPin'
import { installCreatorPinning } from '@/features/creators/pinning/install'
import { reconcileAllEnforcement } from '@/features/custody/enforcement'
import { setupCustodyNotifications } from '@/features/custody/notifications'
import { drainShieldEvents } from '@/features/custody/shieldEvents'
import { syncCommitmentSnapshots } from '@/features/custody/syncSnapshots'
import { useFavoritesStore } from '@/features/mass-times/favorites'
import { useExpirySweep } from '@/features/movements'
import { rehydratePinned } from '@/features/pinning/pinningManager'
import { useKeepAwake } from '@/hooks/useKeepAwake'
import { registerDataSources } from '@/lib/data-sources/register'
import { useCrossTabSync } from '@/lib/db-shared/useCrossTabSync'
import { initHearth } from '@/lib/hearth'
import i18n from '@/lib/i18n'
import { rescheduleAllReminders, setupNotifications } from '@/lib/notifications'
import { startStallMonitor } from '@/lib/stallMonitor'
import { useBibleStore } from '@/stores/bibleStore'
import { useCatechismStore } from '@/stores/catechismStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

SplashScreen.preventAutoHideAsync()

// Dev-only JS-thread stall detector (no-op in release builds): logs whenever
// the JS thread blocks long enough to freeze touches, with recent op marks.
if (__DEV__) startStallMonitor()

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

function CrossTabSync() {
  useCrossTabSync()
  return null
}

export default function RootLayout() {
  useKeepAwake()
  useExpirySweep()

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
    Junicode: require('../../assets/fonts/Junicode.ttf'),
    Junicode_Italic: require('../../assets/fonts/Junicode-Italic.ttf'),
    Junicode_Light: require('../../assets/fonts/Junicode-Light.ttf'),
    Junicode_LightItalic: require('../../assets/fonts/Junicode-LightItalic.ttf'),
    Junicode_Medium: require('../../assets/fonts/Junicode-Medium.ttf'),
    Junicode_MediumItalic: require('../../assets/fonts/Junicode-MediumItalic.ttf'),
    Junicode_SemiBold: require('../../assets/fonts/Junicode-SemiBold.ttf'),
    Junicode_SemiBoldItalic: require('../../assets/fonts/Junicode-SemiBoldItalic.ttf'),
    Junicode_Bold: require('../../assets/fonts/Junicode-Bold.ttf'),
    Junicode_BoldItalic: require('../../assets/fonts/Junicode-BoldItalic.ttf'),
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
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate)

  useEffect(() => {
    if (!dbReady) return
    hydratePrefs()
    hydrateBible()
    hydrateCatechism()
    hydrateFavorites()
  }, [dbReady, hydratePrefs, hydrateBible, hydrateCatechism, hydrateFavorites])

  const [seeded, setSeeded] = useState(false)
  const [bootStatus, setBootStatus] = useState<string | undefined>(undefined)
  // undefined until detected. Returning launches (cached catalog) boot from
  // local cache and keep the native splash up; only a true first launch shows
  // the branded loader.
  const [firstLaunch, setFirstLaunch] = useState<boolean | undefined>(undefined)
  const [graceExpired, setGraceExpired] = useState(false)

  useEffect(() => {
    if (!dbReady) return

    async function initCorpus() {
      const t0 = Date.now()
      const mark = (label: string) => {
        if (__DEV__) console.log(`[boot] ${label} (+${Date.now() - t0}ms)`)
      }
      try {
        registerDataSources()
        installAudioBackend()
        installCreatorPinning()
        mark('installed backends')
        await initHearth()
        mark('initHearth done')

        setFirstLaunch(!(await hasCachedCatalog()))

        setBootStatus(i18n.t('boot.fetchingCatalog'))
        // Cache-first on boot: returning users render from the cached catalog
        // without a network wait. The background refresh below revalidates.
        await loadCatalogFromHearth({ networkFirst: false }).catch((err) => {
          console.warn('[startup] catalog fetch failed; proceeding with cached catalog:', err)
        })
        // Escrivá's works are external (escriva.org, never in Hearth); register
        // their catalog entries + collection on top of the Hearth catalog so the
        // tiles appear immediately. Survives the background catalog refresh.
        registerEscrivaCatalog()
        mark('catalog loaded')

        setBootStatus(i18n.t('boot.preparingContent'))
        await rehydratePinned().catch((err) => {
          console.warn('[startup] pinned rehydrate failed:', err)
        })
        mark('pinned rehydrated')

        await warmCriticalManifests().catch((err) => {
          console.warn('[startup] warm critical manifests failed:', err)
        })
        mark('critical manifests warmed')
        warmDeferredManifests().catch((err) => {
          console.warn('[startup] warm deferred manifests failed:', err)
        })
        warmEscrivaBooks().catch((err) => {
          console.warn('[startup] warm Escrivá books failed:', err)
        })

        setBootStatus(i18n.t('boot.almostReady'))
        await Promise.all([seedPractices(), seedCursors()])
        mark('seeded')
      } catch (err) {
        console.error('[startup] initCorpus failed:', err)
      } finally {
        setSeeded(true)
        setupNotifications()
          .then(() => rescheduleAllReminders())
          .catch((err) => console.error('[startup] notification setup failed', err))

        if (flags.custody) {
          setupCustodyNotifications().catch((err) =>
            console.error('[startup] custody notifications setup failed', err),
          )
        }

        InteractionManager.runAfterInteractions(() => {
          if (flags.custody) {
            reconcileAbandonedSessions().catch((err) =>
              console.error('[startup] custody session reconciliation failed', err),
            )
            syncCommitmentSnapshots().catch((err) =>
              console.error('[startup] custody snapshot sync failed', err),
            )
            drainShieldEvents().catch((err) =>
              console.error('[startup] custody shield event drain failed', err),
            )
            // Re-apply iOS Family Controls enforcement for every active bound
            // commitment. Handles the cold-launch case where iOS shield state
            // may not match what SQLite says (reinstall, OS restore).
            listCommitments({ includeArchived: false })
              .then((all) => reconcileAllEnforcement(all))
              .catch((err) => console.error('[startup] custody enforcement reconcile failed', err))
          }
          loadCatalogFromHearth()
            .then(() => Promise.all([warmCriticalManifests(), warmDeferredManifests()]))
            .then(() => seedPractices())
            .then(() =>
              maybeRunCacheEviction().catch((err) =>
                console.warn('[startup] cache eviction failed:', err),
              ),
            )
            .catch((err) => console.warn('Background catalog refresh failed:', err))
        })
      }
    }

    initCorpus()
  }, [dbReady])

  useEffect(() => {
    if (!dbReady || !flags.custody) return
    // iOS sends `active` for transient interruptions (control center, share
    // sheet, notification banner). Debounce so a quick swipe-up doesn't run
    // the whole drain+sync loop.
    let lastRunAt = 0
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return
      const now = Date.now()
      if (now - lastRunAt < 2000) return
      lastRunAt = now
      void drainShieldEvents().catch(() => {})
      void syncCommitmentSnapshots().catch(() => {})
    })
    return () => {
      sub.remove()
    }
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
  // First launch must download content (show the loader immediately); a
  // returning launch only reveals it if warming overruns the grace window.
  const showBootScreen = coreReady && !seeded && (firstLaunch === true || graceExpired)

  // A returning launch warms from local cache; if it hasn't seeded within the
  // grace window, reveal the boot loader rather than holding the native splash
  // indefinitely.
  useEffect(() => {
    if (firstLaunch !== false || !coreReady || seeded) return
    const t = setTimeout(() => setGraceExpired(true), 450)
    return () => clearTimeout(t)
  }, [firstLaunch, coreReady, seeded])

  useEffect(() => {
    if (ready || showBootScreen) SplashScreen.hideAsync()
  }, [ready, showBootScreen])

  const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
  const rootBg = resolvedTheme === 'dark' ? darkTheme.background : lightTheme.background

  // Paint the native root view so it isn't the default white — otherwise it
  // peeks through during native transitions (Link.AppleZoom, swipe-back).
  // Also push the resolved theme into the native UIKit appearance: without this
  // the native layer follows the *device* (userInterfaceStyle: automatic), so an
  // explicit light pref on a dark device leaves freshly-attached tab VCs and the
  // Liquid Glass bar resolving dark for a frame on tab switch. 'unspecified' clears
  // the override so 'system' keeps following the device (and useColorScheme stays true).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(rootBg)
    Appearance.setColorScheme(themePreference === 'system' ? 'unspecified' : themePreference)
  }, [rootBg, themePreference])

  if (!coreReady) return undefined

  // Keep the native splash up (render nothing) until we either reach the app or
  // decide to show the loader — so fast cached boots never flash the Ember loader.
  if (!ready && !showBootScreen) return undefined

  if (showBootScreen) {
    return (
      <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
        <BootLoadingScreen status={bootStatus} />
      </TamaguiProvider>
    )
  }

  // Paint the navigation container background so it isn't React Navigation's
  // default white, which otherwise peeks through during native transitions
  // (Link.AppleZoom, interactive swipe-back).
  const baseNavTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme
  const navTheme = {
    ...baseNavTheme,
    colors: { ...baseNavTheme.colors, background: rootBg, card: rootBg },
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <CrossTabSync />
          <TamaguiProvider config={config} defaultTheme={resolvedTheme}>
            <StatusBar hidden />
            <ThemeProvider value={navTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: rootBg },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ title: i18n.t('a11y.home') }} />
              </Stack>
            </ThemeProvider>
            <FloatingOfflineChip />
            <ConfirmHost />
          </TamaguiProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}
