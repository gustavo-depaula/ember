import { useCallback, useEffect, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

export function ProgressBar({ value, label }: { value: number; label?: string }) {
	const theme = useTheme()
	const clamped = Math.min(1, Math.max(0, value))
	const [trackWidth, setTrackWidth] = useState(0)
	const progress = useSharedValue(0)

	const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
		setTrackWidth(e.nativeEvent.layout.width)
	}, [])

	useEffect(() => {
		if (trackWidth > 0) {
			progress.value = withTiming(clamped * trackWidth, {
				duration: 800,
				easing: Easing.out(Easing.cubic),
			})
		}
	}, [clamped, trackWidth, progress])

	const barStyle = useAnimatedStyle(() => ({
		width: progress.value,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.accent.val,
	}))

	return (
		<YStack gap="$xs">
			{label && (
				<Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
					{label}
				</Text>
			)}
			<XStack
				height={8}
				backgroundColor="$borderColor"
				borderRadius="$sm"
				overflow="hidden"
				onLayout={onTrackLayout}
			>
				{trackWidth > 0 && <Animated.View style={barStyle} />}
			</XStack>
		</YStack>
	)
}
