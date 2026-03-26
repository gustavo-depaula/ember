import { Tabs } from 'expo-router'
import { BookOpen, Grid3X3, Home, Settings } from 'lucide-react-native'
import { View } from 'tamagui'

import { appFrameInsets, frameColor } from '@/components/AppFrame'

function TabBarBackground() {
	return <View flex={1} backgroundColor={frameColor} />
}

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: '#F0D080',
				tabBarInactiveTintColor: '#D4A0A0',
				tabBarBackground: () => <TabBarBackground />,
				tabBarStyle: {
					backgroundColor: 'transparent',
					borderTopWidth: 0,
					elevation: 0,
					position: 'absolute',
					paddingLeft: appFrameInsets.left,
					paddingRight: appFrameInsets.right,
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
