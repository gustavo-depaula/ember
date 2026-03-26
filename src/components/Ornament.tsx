// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import Svg, { Circle, G, Line, Path } from 'react-native-svg'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { leafPath } from './ornaments/svgHelpers'

export function OrnamentalRule({ symbol = '\u2720' }: { symbol?: string }) {
	const theme = useTheme()
	const subtle = theme.accentSubtle.val
	const green = theme.vineGreen.val
	const greenDark = theme.vineGreenDark.val

	return (
		<XStack alignItems="center" gap="$sm" paddingVertical="$lg">
			<View flex={1} alignItems="flex-end">
				<Svg width="100%" height={20} viewBox="0 0 200 20" preserveAspectRatio="xMaxYMid meet">
					<Line x1="0" y1="10" x2="165" y2="10" stroke={subtle} strokeWidth={0.75} />
					{/* Trefoil endpoint */}
					<Path
						d="M168 6 Q172 2 176 6 Q180 10 176 14 Q172 18 168 14 Q164 10 168 6Z"
						fill={subtle}
						opacity={0.6}
					/>
					<Path
						d={leafPath(160, 10, 6, 180)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.6}
					/>
					<Path
						d={leafPath(140, 10, 5, 0)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.4}
					/>
					<Circle cx="120" cy="10" r="1.5" fill={subtle} opacity={0.4} />
					<Path
						d={leafPath(100, 10, 4, 180)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.3}
					/>
				</Svg>
			</View>
			<Text fontFamily="$heading" fontSize="$2" color="$accent">
				{symbol}
			</Text>
			<View flex={1}>
				<Svg width="100%" height={20} viewBox="0 0 200 20" preserveAspectRatio="xMinYMid meet">
					{/* Trefoil endpoint */}
					<Path
						d="M32 6 Q28 2 24 6 Q20 10 24 14 Q28 18 32 14 Q36 10 32 6Z"
						fill={subtle}
						opacity={0.6}
					/>
					<Line x1="35" y1="10" x2="200" y2="10" stroke={subtle} strokeWidth={0.75} />
					<Path
						d={leafPath(40, 10, 6, 0)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.6}
					/>
					<Path
						d={leafPath(60, 10, 5, 180)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.4}
					/>
					<Circle cx="80" cy="10" r="1.5" fill={subtle} opacity={0.4} />
					<Path
						d={leafPath(100, 10, 4, 0)}
						fill={green}
						stroke={greenDark}
						strokeWidth={0.3}
						opacity={0.3}
					/>
				</Svg>
			</View>
		</XStack>
	)
}

export function HeaderFlourish() {
	const theme = useTheme()
	const c = theme.accentSubtle.val
	const a = theme.accent.val
	const green = theme.vineGreen.val
	const greenDark = theme.vineGreenDark.val
	const red = theme.floralRed.val
	const blue = theme.floralBlue.val

	return (
		<YStack alignItems="center" paddingBottom="$sm">
			<Svg width={200} height={40} viewBox="0 0 200 40">
				{/* Left vine scrollwork */}
				<Path d="M8 20 C16 10, 28 8, 40 14" stroke={c} strokeWidth={1.2} fill="none" />
				<Path d="M12 20 C18 12, 28 10, 38 14" stroke={c} strokeWidth={0.6} fill="none" />
				<Path d="M8 20 C10 26, 16 28, 24 24" stroke={c} strokeWidth={0.7} fill="none" />
				<Circle cx="6" cy="20" r="1.8" fill={c} />

				{/* Left leaves */}
				<Path d={leafPath(18, 14, 6, -60)} fill={green} stroke={greenDark} strokeWidth={0.3} />
				<Path d={leafPath(30, 11, 5, -40)} fill={green} stroke={greenDark} strokeWidth={0.3} />
				<Path
					d={leafPath(14, 24, 5, 120)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.7}
				/>

				{/* Left flower bud */}
				<Circle cx="22" cy="10" r="3" fill={red} opacity={0.6} />
				<Circle cx="22" cy="10" r="1.2" fill={a} opacity={0.8} />

				{/* Right vine scrollwork (mirrored) */}
				<Path d="M192 20 C184 10, 172 8, 160 14" stroke={c} strokeWidth={1.2} fill="none" />
				<Path d="M188 20 C182 12, 172 10, 162 14" stroke={c} strokeWidth={0.6} fill="none" />
				<Path d="M192 20 C190 26, 184 28, 176 24" stroke={c} strokeWidth={0.7} fill="none" />
				<Circle cx="194" cy="20" r="1.8" fill={c} />

				{/* Right leaves */}
				<Path d={leafPath(182, 14, 6, -120)} fill={green} stroke={greenDark} strokeWidth={0.3} />
				<Path d={leafPath(170, 11, 5, -140)} fill={green} stroke={greenDark} strokeWidth={0.3} />
				<Path
					d={leafPath(186, 24, 5, 60)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.7}
				/>

				{/* Right flower bud */}
				<Circle cx="178" cy="10" r="3" fill={blue} opacity={0.6} />
				<Circle cx="178" cy="10" r="1.2" fill={a} opacity={0.8} />

				{/* Central cross motif — gold filled */}
				<Line x1="92" y1="14" x2="108" y2="14" stroke={a} strokeWidth={1} />
				<Line x1="100" y1="6" x2="100" y2="34" stroke={a} strokeWidth={1} />
				<Circle cx="100" cy="20" r="4" stroke={a} strokeWidth={1} fill={a} opacity={0.15} />
				<Circle cx="100" cy="20" r="2" fill={a} />

				{/* Connecting vine lines */}
				<Path d="M40 14 C50 16, 60 18, 70 18 L92 18" stroke={c} strokeWidth={0.6} fill="none" />
				<Path
					d="M108 18 L130 18 C140 18, 150 16, 160 14"
					stroke={c}
					strokeWidth={0.6}
					fill="none"
				/>

				{/* Small leaf accents along connecting lines */}
				<Path
					d={leafPath(55, 17, 4, -80)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.2}
					opacity={0.4}
				/>
				<Path
					d={leafPath(145, 17, 4, -100)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.2}
					opacity={0.4}
				/>
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
	const green = theme.vineGreen.val
	const greenDark = theme.vineGreenDark.val

	const degrees = {
		topLeft: 0,
		topRight: 90,
		bottomRight: 180,
		bottomLeft: 270,
	}[position]

	return (
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
				{/* Leaf accents */}
				<Path
					d={leafPath(8, 24, 5, -30)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.5}
				/>
				<Path
					d={leafPath(16, 14, 4, -50)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.4}
				/>
			</G>
		</Svg>
	)
}

export function VineBar({ height = 100 }: { height?: number }) {
	const theme = useTheme()
	const c = theme.accentSubtle.val
	const green = theme.vineGreen.val
	const greenDark = theme.vineGreenDark.val
	const red = theme.floralRed.val

	return (
		<Svg width={14} height={height} viewBox={`0 0 14 ${height}`}>
			<Line x1="7" y1="0" x2="7" y2={height} stroke={c} strokeWidth={0.75} />
			{Array.from({ length: Math.floor(height / 24) }, (_, i) => {
				const y = 12 + i * 24
				const showBerry = i % 2 === 0
				return (
					<G key={i}>
						{/* Left leaf — filled */}
						<Path d={leafPath(7, y, 6, 160)} fill={green} stroke={greenDark} strokeWidth={0.4} />
						{/* Right leaf — filled */}
						<Path
							d={leafPath(7, y + 12, 5, 20)}
							fill={green}
							stroke={greenDark}
							strokeWidth={0.4}
						/>
						{/* Junction dot */}
						<Circle cx="7" cy={y} r="1.5" fill={c} />
						{/* Berry at alternating junctions */}
						{showBerry && <Circle cx={3} cy={y + 6} r={1.8} fill={red} opacity={0.6} />}
					</G>
				)
			})}
		</Svg>
	)
}

export function PageBreakOrnament() {
	const theme = useTheme()
	const c = theme.accentSubtle.val
	const a = theme.accent.val
	const green = theme.vineGreen.val
	const greenDark = theme.vineGreenDark.val

	return (
		<YStack alignItems="center" paddingVertical="$lg">
			<Svg width={220} height={36} viewBox="0 0 220 36">
				{/* Left decorative arm */}
				<Line x1="10" y1="18" x2="80" y2="18" stroke={c} strokeWidth={0.75} />
				<Path
					d={leafPath(25, 18, 5, 90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.4}
				/>
				<Path
					d={leafPath(45, 18, 4, -90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.3}
				/>
				<Path
					d={leafPath(65, 18, 5, 90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.4}
				/>
				<Path d="M80 12 L86 18 L80 24 Z" fill={c} />
				<Circle cx="15" cy="18" r="2" fill={c} opacity={0.5} />

				{/* Central fleur-de-lis — gold filled */}
				<Path
					d="M110 4 C106 8, 106 12, 110 15 C114 12, 114 8, 110 4"
					stroke={a}
					strokeWidth={1}
					fill={a}
					opacity={0.3}
				/>
				<Path
					d="M100 18 C104 14, 108 13, 110 15 C108 17, 104 19, 100 18"
					stroke={a}
					strokeWidth={1}
					fill={a}
					opacity={0.3}
				/>
				<Path
					d="M120 18 C116 14, 112 13, 110 15 C112 17, 116 19, 120 18"
					stroke={a}
					strokeWidth={1}
					fill={a}
					opacity={0.3}
				/>
				<Line x1="110" y1="15" x2="110" y2="30" stroke={a} strokeWidth={1} />
				<Circle cx="110" cy="15" r="2" fill={a} />
				{/* Small leaf accents on the fleur-de-lis */}
				<Path
					d={leafPath(106, 22, 4, -150)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.2}
					opacity={0.5}
				/>
				<Path
					d={leafPath(114, 22, 4, -30)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.2}
					opacity={0.5}
				/>

				{/* Right decorative arm (mirrored) */}
				<Path d="M140 12 L134 18 L140 24 Z" fill={c} />
				<Line x1="140" y1="18" x2="210" y2="18" stroke={c} strokeWidth={0.75} />
				<Path
					d={leafPath(155, 18, 5, -90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.4}
				/>
				<Path
					d={leafPath(175, 18, 4, 90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.3}
				/>
				<Path
					d={leafPath(195, 18, 5, -90)}
					fill={green}
					stroke={greenDark}
					strokeWidth={0.3}
					opacity={0.4}
				/>
				<Circle cx="205" cy="18" r="2" fill={c} opacity={0.5} />
			</Svg>
		</YStack>
	)
}
