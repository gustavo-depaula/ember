import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'
import Svg, { G, Path } from 'react-native-svg'
import { useTheme, View, YStack } from 'tamagui'

import { FloralCorner } from './ornaments'

function SimpleCornerOrnament({
	position,
}: {
	position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}) {
	const theme = useTheme()
	const color = theme.accentSubtle.val

	const degrees = {
		topLeft: 0,
		topRight: 90,
		bottomRight: 180,
		bottomLeft: 270,
	}[position]

	return (
		<View
			position="absolute"
			{...(position.includes('top') ? { top: -4 } : { bottom: -4 })}
			{...(position.includes('Left') ? { left: -4 } : { right: -4 })}
		>
			<Svg width={36} height={36} viewBox="0 0 36 36">
				<G transform={`rotate(${degrees}, 18, 18)`}>
					<Path d="M3 33 C3 18, 8 6, 33 3" stroke={color} strokeWidth={1.2} fill="none" />
					<Path d="M3 33 C10 30, 16 22, 19 10" stroke={color} strokeWidth={0.8} fill="none" />
					<Path
						d="M5 33 C12 28, 20 18, 22 6"
						stroke={color}
						strokeWidth={0.5}
						fill="none"
						opacity={0.5}
					/>
				</G>
			</Svg>
		</View>
	)
}

export function ManuscriptFrame({
	children,
	light = false,
	ornate = false,
}: {
	children: ReactNode
	light?: boolean
	ornate?: boolean
}) {
	const effectiveOrnate = ornate && !light
	const outerBorder = light ? 0.5 : effectiveOrnate ? 1.5 : 1
	const innerBorder = light ? 0 : effectiveOrnate ? 0.5 : 0.5
	const innerPadding = light ? 0 : effectiveOrnate ? 4 : 4

	return (
		<YStack
			borderWidth={outerBorder}
			borderColor={effectiveOrnate ? '$accent' : '$accentSubtle'}
			padding={innerPadding}
			position="relative"
			overflow="hidden"
		>
			{effectiveOrnate ? (
				<>
					<View position="absolute" top={-8} left={-8}>
						<FloralCorner position="topLeft" size={40} complexity="simple" />
					</View>
					<View position="absolute" top={-8} right={-8}>
						<FloralCorner position="topRight" size={40} complexity="simple" />
					</View>
					<View position="absolute" bottom={-8} left={-8}>
						<FloralCorner position="bottomLeft" size={40} complexity="simple" />
					</View>
					<View position="absolute" bottom={-8} right={-8}>
						<FloralCorner position="bottomRight" size={40} complexity="simple" />
					</View>
				</>
			) : !light ? (
				<>
					<SimpleCornerOrnament position="topLeft" />
					<SimpleCornerOrnament position="topRight" />
					<SimpleCornerOrnament position="bottomLeft" />
					<SimpleCornerOrnament position="bottomRight" />
				</>
			) : undefined}

			<YStack
				borderWidth={innerBorder}
				borderColor={effectiveOrnate ? '$accentSubtle' : '$accent'}
				padding="$lg"
				style={innerBorder > 0 ? styles.inner : undefined}
			>
				{children}
			</YStack>
		</YStack>
	)
}

const styles = StyleSheet.create({
	inner: {
		borderStyle: 'solid',
	},
})
