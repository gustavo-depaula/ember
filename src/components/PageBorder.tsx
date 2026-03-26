import { memo } from 'react'
import { Dimensions } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { useTheme, View, XStack } from 'tamagui'

import { FloralCorner } from './ornaments'

const cornerSize = 56

export const PageBorder = memo(function PageBorder() {
	const theme = useTheme()
	const gold = theme.accent.val
	const { width: screenWidth } = Dimensions.get('window')
	const borderWidth = Math.min(screenWidth, 640)

	return (
		<XStack justifyContent="space-between" alignItems="flex-start">
			<FloralCorner position="topLeft" size={cornerSize} complexity="full" />
			<View flex={1} paddingTop={4}>
				<Svg width="100%" height={3} viewBox={`0 0 ${borderWidth} 3`} preserveAspectRatio="none">
					<Line x1="0" y1="1" x2={borderWidth} y2="1" stroke={gold} strokeWidth={1} opacity={0.3} />
				</Svg>
			</View>
			<FloralCorner position="topRight" size={cornerSize} complexity="full" />
		</XStack>
	)
})
