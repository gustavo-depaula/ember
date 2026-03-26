import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import type { ReactNode } from 'react'
import { ScrollView, YStack } from 'tamagui'

import { appFrameInsets } from './AppFrame'

const scrollContentStyle = { flexGrow: 1 }

export function ScreenLayout({
	children,
	scroll = true,
	padded = true,
}: {
	children: ReactNode
	scroll?: boolean
	padded?: boolean
}) {
	const tabBarHeight = useBottomTabBarHeight()

	const inner = (
		<YStack
			flex={1}
			backgroundColor="$background"
			paddingTop={appFrameInsets.top}
			paddingBottom={tabBarHeight + appFrameInsets.bottom}
		>
			<YStack
				flex={1}
				width="100%"
				maxWidth={640}
				alignSelf="center"
				paddingLeft={appFrameInsets.left + (padded ? 8 : 4)}
				paddingRight={appFrameInsets.right + (padded ? 8 : 4)}
			>
				{children}
			</YStack>
		</YStack>
	)

	if (!scroll) return inner

	return (
		<ScrollView flex={1} backgroundColor="$background" contentContainerStyle={scrollContentStyle}>
			{inner}
		</ScrollView>
	)
}
