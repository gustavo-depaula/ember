import { Tabs } from 'expo-router'
import { BookOpen, Grid3X3, Home, Settings } from 'lucide-react-native'
import { useTheme } from 'tamagui'

export default function TabLayout() {
	const theme = useTheme()

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.accent.val,
				tabBarInactiveTintColor: theme.colorSecondary.val,
				tabBarStyle: {
					backgroundColor: theme.background.val,
					borderTopColor: theme.accentSubtle.val,
					borderTopWidth: 0.5,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="office"
				options={{
					title: 'Office',
					tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="plan"
				options={{
					title: 'Plan',
					tabBarIcon: ({ color, size }) => <Grid3X3 size={size} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Settings',
					tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
				}}
			/>
		</Tabs>
	)
}
