import { Cinzel_400Regular, Cinzel_700Bold } from '@expo-google-fonts/cinzel'
import {
	EBGaramond_400Regular,
	EBGaramond_400Regular_Italic,
	EBGaramond_500Medium,
	EBGaramond_600SemiBold,
} from '@expo-google-fonts/eb-garamond'
import { PinyonScript_400Regular } from '@expo-google-fonts/pinyon-script'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { LogBox, useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { RibbonBookmarks } from '@/components/RibbonBookmarks'
import { config } from '@/config/tamagui.config'
import { useDbInit } from '@/db/client'
import { seedPractices, seedReadingProgress } from '@/db/seed'
import { usePreferencesStore } from '@/stores/preferencesStore'
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
		UnifrakturMaguntia: require('../../assets/fonts/UnifrakturMaguntia-Book.ttf'),
	})

	const { success: dbReady } = useDbInit()

	const systemScheme = useColorScheme()
	const { preference, hydrated: themeHydrated, hydrate: hydrateTheme } = useThemeStore()
	const { hydrated: prefsHydrated, hydrate: hydratePrefs } = usePreferencesStore()

	useEffect(() => {
		hydrateTheme()
		hydratePrefs()
	}, [hydrateTheme, hydratePrefs])

	const [seeded, setSeeded] = useState(false)

	useEffect(() => {
		if (dbReady) {
			Promise.all([seedPractices(), seedReadingProgress()]).then(() => setSeeded(true))
		}
	}, [dbReady])

	const ready = fontsLoaded && themeHydrated && prefsHydrated && dbReady && seeded

	useEffect(() => {
		if (ready) {
			SplashScreen.hideAsync()
		}
	}, [ready])

	if (!ready) return undefined

	const resolvedTheme = preference === 'system' ? (systemScheme ?? 'light') : preference

	return (
		<QueryClientProvider client={queryClient}>
			<TamaguiProvider config={config} defaultTheme={resolvedTheme}>
				<StatusBar hidden />
				<Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
				<RibbonBookmarks />
			</TamaguiProvider>
		</QueryClientProvider>
	)
}
