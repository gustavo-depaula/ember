import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type ThemePreference = 'light' | 'dark' | 'system'

type ThemeState = {
	preference: ThemePreference
	hydrated: boolean
	setTheme: (theme: ThemePreference) => void
	hydrate: () => Promise<void>
}

export const useThemeStore = create<ThemeState>()(
	immer((set) => ({
		preference: 'system',
		hydrated: false,

		setTheme: (theme) => {
			set((state) => {
				state.preference = theme
			})
			AsyncStorage.setItem('theme', theme)
		},

		hydrate: async () => {
			const stored = await AsyncStorage.getItem('theme')
			set((state) => {
				if (stored === 'light' || stored === 'dark' || stored === 'system') {
					state.preference = stored
				}
				state.hydrated = true
			})
		},
	})),
)
