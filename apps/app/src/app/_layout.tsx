import '@/lib/i18n'

import { featureFlags } from 'react-native-screens'

// Unblocks touch interactions while the iOS 26 zoom transition is still
// running — without these flags, taps are swallowed for the full ~0.5-1s
// of the Link.AppleZoom animation. Tracked in software-mansion/react-native-screens#3621.
featureFlags.experiment.iosPreventReattachmentOfDismissedScreens = true
featureFlags.experiment.ios26AllowInteractionsDuringTransition = true

import {
  MutationCache,
  notifyManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect, useState } from 'react'
import { Appearance, InteractionManager, LogBox, Platform, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { TamaguiProvider } from 'tamagui'

import { ConfirmHost, confirm } from '@/components'
import { BootLoadingScreen } from '@/components/BootLoadingScreen'
import { FloatingOfflineChip } from '@/components/OfflineChip'
import { appFonts } from '@/config/appFonts'
import { config } from '@/config/tamagui.config'
import { darkTheme, lightTheme } from '@/config/themes'
import { maybeRunCacheEviction } from '@/content/cacheMaintenance'
import { registerCccCatalog } from '@/content/cccCatalog'
import { registerEscrivaCatalog } from '@/content/escrivaCatalog'
import {
  hasCachedCatalog,
  loadCatalogFromHearth,
  warmCriticalManifests,
  warmDeferredManifests,
} from '@/content/resolver'
import { useDbInit } from '@/db/client'
import { seedCursors, seedPractices } from '@/db/seed'
import { useCheckInsStore } from '@/features/mass-times/checkins'
import { useFavoritesStore } from '@/features/mass-times/favorites'
import { rehydratePinned } from '@/features/pinning/pinningManager'
import { refileMisplacedCompletions } from '@/features/plan-of-life'
import { useKeepAwake } from '@/hooks/useKeepAwake'
import { registerDataSources } from '@/lib/data-sources/register'
import { useCrossTabSync } from '@/lib/db-shared/useCrossTabSync'
import { initHearth } from '@/lib/hearth'
import i18n from '@/lib/i18n'
import {
  cancelRetiredMassReminders,
  rescheduleAllReminders,
  setupNotifications,
} from '@/lib/notifications'
import { startStallMonitor } from '@/lib/stallMonitor'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

SplashScreen.preventAutoHideAsync()

if (__DEV__) startStallMonitor()

// RN 0.83 deprecation warning from Tamagui internals crashes LogBox with "cyclic object value"
LogBox.ignoreLogs(['props.pointerEvents is deprecated'])

// Query results reach React through notifyManager, which defaults to
// setTimeout(0). Expo resolves every native promise at immediate priority,
// ahead of timers, so while boot keeps native I/O in flight (blob reads,
// SQLite, fetch) timers starve and resolved queries sit unrendered. A
// microtask delivers each result as soon as it lands.
notifyManager.setScheduler(queueMicrotask)

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

  const [fontsLoaded] = useFonts(appFonts)

  const { success: dbReady } = useDbInit()

  const systemScheme = useColorScheme()
  const {
    theme: themePreference,
    hydrated: prefsHydrated,
    hydrate: hydratePrefs,
  } = usePreferencesStore()
  const { hydrated: bibleHydrated, hydrate: hydrateBible } = useBibleStore()
  const hydrateFavorites = useFavoritesStore((s) => s.hydrate)
  const hydrateCheckIns = useCheckInsStore((s) => s.hydrate)

  useEffect(() => {
    if (!dbReady) return
    hydratePrefs()
    hydrateBible()
    hydrateFavorites()
    hydrateCheckIns()
  }, [dbReady, hydratePrefs, hydrateBible, hydrateFavorites, hydrateCheckIns])

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
        // The Catechism + Compendium are external too (vatican.va). Their TOC is
        // static, so the books appear (with full contents) instantly and offline.
        registerCccCatalog()
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

        setBootStatus(i18n.t('boot.almostReady'))
        await Promise.all([seedPractices(), seedCursors()])
        await refileMisplacedCompletions()
        mark('seeded')
      } catch (err) {
        console.error('[startup] initCorpus failed:', err)
      } finally {
        setSeeded(true)
        setupNotifications()
          .then(() => rescheduleAllReminders())
          .then(() => cancelRetiredMassReminders())
          .catch((err) => console.error('[startup] notification setup failed', err))

        InteractionManager.runAfterInteractions(() => {
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

  // Core UI infra (fonts, theme, db, prefs) — gates the splash hide so we can
  // show a custom loading screen while the corpus warms.
  const coreReady = fontsLoaded && prefsHydrated && bibleHydrated && dbReady
  const ready = coreReady && seeded
  // First launch must download content (show the loader immediately); a
  // returning launch only reveals it if warming overruns the grace window.
  const showBootScreen = coreReady && !seeded && (firstLaunch === true || graceExpired)

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

  // Paint the native root view so its default white doesn't peek through
  // native transitions (Link.AppleZoom, swipe-back). The UIKit appearance
  // otherwise follows the device, so a light pref on a dark device resolves
  // freshly-attached tab VCs and the Liquid Glass bar dark for a frame on tab
  // switch; 'unspecified' lets 'system' keep following the device.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(rootBg)
    // Native-only: react-native-web has no `setColorScheme`, and calling it
    // throws out of the effect and takes the whole app down on web.
    if (Platform.OS !== 'web') {
      Appearance.setColorScheme(themePreference === 'system' ? 'unspecified' : themePreference)
    }
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

  // React Navigation's default white would also peek through native transitions.
  const baseNavTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme
  const navTheme = {
    ...baseNavTheme,
    colors: { ...baseNavTheme.colors, background: rootBg, card: rootBg },
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBg }}>
      {/* No keyboard preload: it focuses a hidden input at mount, and standing
          up UIKit's keyboard stack blocked the main thread — and with it every
          JS timer — for most of a second just as Today first painted. */}
      <KeyboardProvider preload={false}>
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
