import type { ReactNode } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, YStack } from 'tamagui'

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
	const insets = useSafeAreaInsets()

	const inner = (
		<YStack
			flex={1}
			backgroundColor="$background"
			paddingTop={insets.top}
			paddingBottom={insets.bottom}
			paddingHorizontal={padded ? '$md' : undefined}
		>
			{children}
		</YStack>
	)

	if (!scroll) return inner

	// backgroundColor on ScrollView covers the overscroll/bounce area
	return (
		<ScrollView flex={1} backgroundColor="$background" contentContainerStyle={scrollContentStyle}>
			{inner}
		</ScrollView>
	)
}
