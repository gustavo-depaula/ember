import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

export function OrnamentalRule({ symbol = '\u2720' }: { symbol?: string }) {
	const theme = useTheme()
	const subtle = theme.accentSubtle.val

	return (
		<XStack alignItems="center" gap="$md" paddingVertical="$lg">
			<View flex={1} alignItems="flex-end">
				<Svg width={60} height={12} viewBox="0 0 60 12">
					<Line x1="0" y1="6" x2="52" y2="6" stroke={subtle} strokeWidth={0.75} />
					<Circle cx="56" cy="6" r="2.5" fill={subtle} />
				</Svg>
			</View>
			<Text fontFamily="$heading" fontSize="$2" color="$accent">
				{symbol}
			</Text>
			<View flex={1}>
				<Svg width={60} height={12} viewBox="0 0 60 12">
					<Circle cx="4" cy="6" r="2.5" fill={subtle} />
					<Line x1="8" y1="6" x2="60" y2="6" stroke={subtle} strokeWidth={0.75} />
				</Svg>
			</View>
		</XStack>
	)
}

export function HeaderFlourish() {
	const theme = useTheme()
	const color = theme.accentSubtle.val

	return (
		<YStack alignItems="center" paddingBottom="$sm">
			<Svg width={48} height={10} viewBox="0 0 48 10">
				<Path d="M4 5 Q12 1, 24 5 Q36 9, 44 5" stroke={color} strokeWidth={1} fill="none" />
				<Circle cx="24" cy="5" r="1.5" fill={color} />
			</Svg>
		</YStack>
	)
}

export function CornerFlourish({
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
		<Svg width={24} height={24} viewBox="0 0 24 24">
			<G transform={`rotate(${degrees}, 12, 12)`}>
				<Path d="M2 22 C2 12, 6 4, 22 2" stroke={color} strokeWidth={1} fill="none" />
				<Path d="M2 22 C8 20, 12 16, 14 8" stroke={color} strokeWidth={0.7} fill="none" />
			</G>
		</Svg>
	)
}
