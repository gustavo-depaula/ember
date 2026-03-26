// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { memo } from 'react'
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg'
import { useTheme } from 'tamagui'

type IconName = 'sunrise' | 'book' | 'rosary' | 'moon' | 'quill' | 'cross'

export const WatercolorIcon = memo(function WatercolorIcon({
	name,
	size = 40,
}: {
	name: IconName
	size?: number
}) {
	const theme = useTheme()
	const gold = theme.accent.val
	const goldBright = theme.goldBright.val
	const red = theme.floralRed.val
	const blue = theme.floralBlue.val
	const orange = theme.floralOrange.val
	const green = theme.vineGreen.val

	const icons: Record<IconName, () => React.JSX.Element> = {
		sunrise: () => (
			<G>
				{/* Warm glow layers */}
				<Circle cx="20" cy="24" r="14" fill={orange} opacity={0.1} />
				<Circle cx="20" cy="24" r="10" fill={orange} opacity={0.15} />
				{/* Hills */}
				<Path d="M0 30 Q10 22 20 28 Q30 22 40 30 L40 40 L0 40Z" fill={green} opacity={0.25} />
				<Path d="M0 32 Q10 26 20 30 Q30 26 40 32 L40 40 L0 40Z" fill={green} opacity={0.3} />
				{/* Sun disc */}
				<Circle cx="20" cy="22" r="7" fill={goldBright} opacity={0.7} />
				<Circle cx="20" cy="22" r="5" fill={gold} opacity={0.9} />
				{/* Rays */}
				{Array.from({ length: 8 }, (_, i) => {
					const angle = (i * 45 * Math.PI) / 180
					const x1 = 20 + Math.cos(angle) * 9
					const y1 = 22 + Math.sin(angle) * 9
					const x2 = 20 + Math.cos(angle) * 14
					const y2 = 22 + Math.sin(angle) * 14
					return (
						<Line
							key={i}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={goldBright}
							strokeWidth={1.2}
							opacity={0.5}
							strokeLinecap="round"
						/>
					)
				})}
			</G>
		),

		book: () => (
			<G>
				{/* Book wash */}
				<Rect x="6" y="10" width="28" height="22" rx="2" fill={blue} opacity={0.08} />
				{/* Left page */}
				<Path
					d="M20 8 C14 8 8 10 8 10 L8 32 C8 32 14 30 20 30Z"
					fill="#F5F0E0"
					stroke={blue}
					strokeWidth={0.8}
					opacity={0.8}
				/>
				{/* Right page */}
				<Path
					d="M20 8 C26 8 32 10 32 10 L32 32 C32 32 26 30 20 30Z"
					fill="#FBF8F0"
					stroke={blue}
					strokeWidth={0.8}
					opacity={0.8}
				/>
				{/* Spine */}
				<Line x1="20" y1="8" x2="20" y2="30" stroke={blue} strokeWidth={1} opacity={0.6} />
				{/* Text lines */}
				<Line x1="11" y1="15" x2="17" y2="15" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				<Line x1="11" y1="18" x2="16" y2="18" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				<Line x1="11" y1="21" x2="17" y2="21" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				<Line x1="23" y1="15" x2="29" y2="15" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				<Line x1="23" y1="18" x2="28" y2="18" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				<Line x1="23" y1="21" x2="29" y2="21" stroke={blue} strokeWidth={0.5} opacity={0.3} />
				{/* Bookmark ribbon */}
				<Path d="M22 8 L22 5 L25 7 L22 9" fill={red} opacity={0.6} />
			</G>
		),

		rosary: () => (
			<G>
				{/* Bead loop */}
				{Array.from({ length: 10 }, (_, i) => {
					const angle = (i * 36 * Math.PI) / 180 - Math.PI / 2
					const cx = 20 + Math.cos(angle) * 12
					const cy = 18 + Math.sin(angle) * 12
					return (
						<Circle
							key={i}
							cx={cx}
							cy={cy}
							r={2}
							fill={gold}
							opacity={0.7}
							stroke={gold}
							strokeWidth={0.3}
						/>
					)
				})}
				{/* Connecting thread */}
				<Ellipse
					cx="20"
					cy="18"
					rx="12"
					ry="12"
					stroke={gold}
					strokeWidth={0.5}
					fill="none"
					opacity={0.4}
				/>
				{/* Cross pendant */}
				<Line x1="20" y1="30" x2="20" y2="38" stroke={gold} strokeWidth={1.5} opacity={0.8} />
				<Line x1="16" y1="33" x2="24" y2="33" stroke={gold} strokeWidth={1.5} opacity={0.8} />
				{/* Center bead */}
				<Circle cx="20" cy="6" r="2.5" fill={goldBright} opacity={0.8} />
			</G>
		),

		moon: () => (
			<G>
				{/* Glow */}
				<Circle cx="18" cy="20" r="16" fill={blue} opacity={0.08} />
				<Circle cx="18" cy="20" r="12" fill={blue} opacity={0.1} />
				{/* Crescent */}
				<Path d="M24 8 A14 14 0 0 0 24 32 A10 10 0 0 1 24 8Z" fill={blue} opacity={0.6} />
				<Path d="M24 10 A12 12 0 0 0 24 30 A8 8 0 0 1 24 10Z" fill={blue} opacity={0.3} />
				{/* Stars */}
				<Circle cx="12" cy="12" r="1.5" fill={goldBright} opacity={0.7} />
				<Circle cx="8" cy="22" r="1" fill={goldBright} opacity={0.5} />
				<Circle cx="14" cy="28" r="1.2" fill={goldBright} opacity={0.6} />
				<Circle cx="30" cy="14" r="0.8" fill={goldBright} opacity={0.4} />
			</G>
		),

		quill: () => (
			<G>
				{/* Inkwell */}
				<Path
					d="M8 28 L8 36 Q8 38 10 38 L18 38 Q20 38 20 36 L20 28Z"
					fill={blue}
					opacity={0.5}
					stroke={blue}
					strokeWidth={0.5}
				/>
				<Ellipse cx="14" cy="28" rx="6" ry="2" fill={blue} opacity={0.7} />
				{/* Ink surface */}
				<Ellipse cx="14" cy="28" rx="5" ry="1.5" fill={blue} opacity={0.3} />
				{/* Quill feather */}
				<Path d="M16 28 L30 6 L34 4 L32 8 L18 30" stroke={gold} strokeWidth={0.8} fill="none" />
				<Path
					d="M30 6 Q28 10 24 14 Q30 8 34 4 Q32 8 28 12 Q32 6 30 6Z"
					fill={orange}
					opacity={0.4}
				/>
				{/* Feather barbs */}
				<Path d="M28 8 Q34 6 36 2" stroke={orange} strokeWidth={0.5} fill="none" opacity={0.5} />
				<Path d="M26 12 Q32 10 34 6" stroke={orange} strokeWidth={0.4} fill="none" opacity={0.4} />
				<Path d="M24 16 Q30 14 32 10" stroke={orange} strokeWidth={0.4} fill="none" opacity={0.3} />
			</G>
		),

		cross: () => (
			<G>
				{/* Glow */}
				<Circle cx="20" cy="20" r="14" fill={gold} opacity={0.08} />
				{/* Cross body */}
				<Rect x="17" y="4" width="6" height="32" rx="1" fill={gold} opacity={0.7} />
				<Rect x="8" y="12" width="24" height="6" rx="1" fill={gold} opacity={0.7} />
				{/* Brighter inner cross */}
				<Rect x="18" y="5" width="4" height="30" rx="0.5" fill={goldBright} opacity={0.8} />
				<Rect x="9" y="13" width="22" height="4" rx="0.5" fill={goldBright} opacity={0.8} />
				{/* Center gem */}
				<Circle cx="20" cy="15" r="2.5" fill={red} opacity={0.7} />
				<Circle cx="20" cy="15" r="1.5" fill={red} opacity={0.4} />
				{/* Terminal flourishes */}
				<Circle cx="20" cy="4" r="1.5" fill={gold} opacity={0.6} />
				<Circle cx="20" cy="36" r="1.5" fill={gold} opacity={0.6} />
				<Circle cx="8" cy="15" r="1.5" fill={gold} opacity={0.6} />
				<Circle cx="32" cy="15" r="1.5" fill={gold} opacity={0.6} />
			</G>
		),
	}

	const renderIcon = icons[name]

	return (
		<Svg width={size} height={size} viewBox="0 0 40 40">
			{renderIcon()}
		</Svg>
	)
})
