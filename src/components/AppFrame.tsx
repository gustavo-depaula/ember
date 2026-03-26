import { memo } from 'react'
import { Image } from 'react-native'
import { View } from 'tamagui'

const cornerLeft = require('../../assets/textures/corner_top_left.png')

export const frameColor = '#FFFFFF'

const sideWidth = 12
const topHeight = 64
const bottomHeight = 14

export const appFrameInsets = {
	top: topHeight,
	left: sideWidth,
	right: sideWidth,
	bottom: bottomHeight,
}

function FrameStrip({ style }: { style: Record<string, number | string> }) {
	return <View position="absolute" pointerEvents="none" backgroundColor={frameColor} {...style} />
}

export const AppFrame = memo(function AppFrame() {
	return (
		<View
			position="absolute"
			top={0}
			left={0}
			right={0}
			bottom={0}
			zIndex={9999}
			pointerEvents="none"
		>
			<FrameStrip style={{ top: 0, left: 0, right: 0, height: topHeight }} />
			<FrameStrip style={{ bottom: 0, left: 0, right: 0, height: bottomHeight }} />
			<FrameStrip style={{ top: 0, left: 0, bottom: 0, width: sideWidth }} />
			<FrameStrip style={{ top: 0, right: 0, bottom: 0, width: sideWidth }} />
			<Image
				source={cornerLeft}
				style={{
					position: 'absolute',
					top: topHeight - 40,
					left: sideWidth - 10,
					width: 180,
					height: 180,
				}}
				resizeMode="contain"
			/>
		</View>
	)
})
