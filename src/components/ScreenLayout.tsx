import type { ReactNode } from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, useThemeName, YStack } from 'tamagui'

import { PageBorder } from './PageBorder'

const parchmentTexture = require('../../assets/textures/parchment.png')
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
	const themeName = useThemeName()
	const isDark = themeName.startsWith('dark')

	const inner = (
		<YStack
			flex={1}
			backgroundColor="$background"
			paddingTop={insets.top}
			paddingBottom={insets.bottom}
			alignItems="center"
		>
			<ImageBackground
				source={parchmentTexture}
				resizeMode="repeat"
				style={styles.texture}
				imageStyle={{ opacity: isDark ? 0.06 : 0.45 }}
			>
				<YStack
					flex={1}
					width="100%"
					maxWidth={640}
					alignSelf="center"
				>
					<PageBorder />
					<YStack
						flex={1}
						paddingHorizontal={padded ? '$lg' : '$md'}
					>
						{children}
					</YStack>
				</YStack>
			</ImageBackground>
		</YStack>
	)

	if (!scroll) return inner

	return (
		<ScrollView flex={1} backgroundColor="$background" contentContainerStyle={scrollContentStyle}>
			{inner}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	texture: {
		flex: 1,
		width: '100%',
	},
})
