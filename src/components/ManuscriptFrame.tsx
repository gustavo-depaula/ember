import type { ReactNode } from 'react'
import { Image, StyleSheet } from 'react-native'
import { View, YStack } from 'tamagui'

const corners = {
	topLeft: require('../../assets/textures/corner_top_left.png'),
	topRight: require('../../assets/textures/corner_top_right.png'),
	bottomLeft: require('../../assets/textures/corner_bottom_left.png'),
	bottomRight: require('../../assets/textures/corner_bottom_right.png'),
}

const cornerSize = 48

export function ManuscriptFrame({
	children,
	light = false,
	ornate = false,
}: {
	children: ReactNode
	light?: boolean
	ornate?: boolean
}) {
	const showCorners = !light
	const outerBorder = light ? 0.5 : ornate ? 1.5 : 1
	const innerBorder = light ? 0 : 0.5
	const innerPadding = light ? 0 : 4

	return (
		<YStack
			borderWidth={outerBorder}
			borderColor={ornate ? '$accent' : '$accentSubtle'}
			padding={innerPadding}
			position="relative"
			overflow="visible"
		>
			{showCorners && (
				<>
					<View position="absolute" top={-16} left={-16}>
						<Image source={corners.topLeft} style={styles.corner} resizeMode="contain" />
					</View>
					<View position="absolute" top={-16} right={-16}>
						<Image source={corners.topRight} style={styles.corner} resizeMode="contain" />
					</View>
					<View position="absolute" bottom={-16} left={-16}>
						<Image source={corners.bottomLeft} style={styles.corner} resizeMode="contain" />
					</View>
					<View position="absolute" bottom={-16} right={-16}>
						<Image source={corners.bottomRight} style={styles.corner} resizeMode="contain" />
					</View>
				</>
			)}

			<YStack
				borderWidth={innerBorder}
				borderColor={ornate ? '$accentSubtle' : '$accent'}
				padding="$lg"
				style={innerBorder > 0 ? styles.inner : undefined}
			>
				{children}
			</YStack>
		</YStack>
	)
}

const styles = StyleSheet.create({
	corner: {
		width: cornerSize,
		height: cornerSize * 0.6,
	},
	inner: {
		borderStyle: 'solid',
	},
})
