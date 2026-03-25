import {
	CormorantGaramond_600SemiBold,
	CormorantGaramond_600SemiBold_Italic,
	CormorantGaramond_700Bold,
	CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond'
import {
	SourceSerif4_400Regular,
	SourceSerif4_400Regular_Italic,
	SourceSerif4_500Medium,
	SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { config } from '@/config/tamagui.config'
import { useThemeStore } from '@/stores/themeStore'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		CormorantGaramond_600SemiBold,
		CormorantGaramond_600SemiBold_Italic,
		CormorantGaramond_700Bold,
		CormorantGaramond_700Bold_Italic,
		SourceSerif4_400Regular,
		SourceSerif4_400Regular_Italic,
		SourceSerif4_500Medium,
		SourceSerif4_600SemiBold,
	})

	const systemScheme = useColorScheme()
	const { preference, hydrated, hydrate } = useThemeStore()

	useEffect(() => {
		hydrate()
	}, [hydrate])

	useEffect(() => {
		if (fontsLoaded && hydrated) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, hydrated])

	if (!fontsLoaded || !hydrated) return undefined

	const resolvedTheme = preference === 'system' ? (systemScheme ?? 'light') : preference

	return (
		<QueryClientProvider client={queryClient}>
			<TamaguiProvider config={config} defaultTheme={resolvedTheme}>
				<Stack screenOptions={{ headerShown: false }} />
			</TamaguiProvider>
		</QueryClientProvider>
	)
}
