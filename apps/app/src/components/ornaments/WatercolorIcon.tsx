// biome-ignore-all lint/suspicious/noArrayIndexKey: static decorative SVG elements never reorder
import { memo } from 'react'
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg'
import { useTheme } from 'tamagui'

export type IconName =
  | 'angel'
  | 'bell'
  | 'book'
  | 'candle'
  | 'clock'
  | 'confession'
  | 'cross'
  | 'eucharist'
  | 'mary'
  | 'mass'
  | 'mercy'
  | 'monstrance'
  | 'moon'
  | 'prayer'
  | 'quill'
  | 'reading'
  | 'rosary'
  | 'sacred-heart'
  | 'scroll'
  | 'sunrise'

export const practiceIconNames: IconName[] = [
  'angel',
  'bell',
  'book',
  'candle',
  'clock',
  'confession',
  'cross',
  'eucharist',
  'mary',
  'mass',
  'mercy',
  'monstrance',
  'moon',
  'prayer',
  'reading',
  'rosary',
  'sacred-heart',
  'scroll',
  'sunrise',
]

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

    prayer: () => (
      <G>
        {/* Soft glow */}
        <Circle cx="20" cy="18" r="14" fill={gold} opacity={0.08} />
        <Circle cx="20" cy="18" r="10" fill={gold} opacity={0.1} />
        {/* Left hand */}
        <Path
          d="M20 10 C16 10 14 14 14 18 C14 22 16 26 18 30 L20 30"
          fill={gold}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.6}
        />
        {/* Right hand */}
        <Path
          d="M20 10 C24 10 26 14 26 18 C26 22 24 26 22 30 L20 30"
          fill={goldBright}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.6}
        />
        {/* Fingers */}
        <Path
          d="M17 12 L17 8 Q17 6 18 6 L18 11"
          stroke={gold}
          strokeWidth={0.8}
          fill="none"
          opacity={0.6}
        />
        <Path
          d="M19 11 L19 6 Q19 4.5 20 4.5 Q21 4.5 21 6 L21 11"
          stroke={gold}
          strokeWidth={0.8}
          fill="none"
          opacity={0.6}
        />
        <Path
          d="M23 12 L23 8 Q23 6 22 6 L22 11"
          stroke={gold}
          strokeWidth={0.8}
          fill="none"
          opacity={0.6}
        />
        {/* Light rays above */}
        <Line
          x1="20"
          y1="2"
          x2="20"
          y2="4"
          stroke={goldBright}
          strokeWidth={0.8}
          opacity={0.4}
          strokeLinecap="round"
        />
        <Line
          x1="15"
          y1="3"
          x2="16"
          y2="5"
          stroke={goldBright}
          strokeWidth={0.6}
          opacity={0.3}
          strokeLinecap="round"
        />
        <Line
          x1="25"
          y1="3"
          x2="24"
          y2="5"
          stroke={goldBright}
          strokeWidth={0.6}
          opacity={0.3}
          strokeLinecap="round"
        />
        {/* Cuff detail */}
        <Path
          d="M14 28 Q17 26 20 27 Q23 26 26 28"
          stroke={gold}
          strokeWidth={0.8}
          fill="none"
          opacity={0.4}
        />
      </G>
    ),

    bell: () => (
      <G>
        {/* Glow */}
        <Circle cx="20" cy="22" r="14" fill={gold} opacity={0.08} />
        {/* Bell body */}
        <Path
          d="M12 28 C12 16 14 10 20 10 C26 10 28 16 28 28Z"
          fill={gold}
          opacity={0.6}
          stroke={gold}
          strokeWidth={0.6}
        />
        {/* Inner highlight */}
        <Path d="M15 28 C15 18 16 12 20 12 C24 12 25 18 25 28Z" fill={goldBright} opacity={0.3} />
        {/* Rim */}
        <Path
          d="M10 28 Q10 32 14 32 L26 32 Q30 32 30 28"
          stroke={gold}
          strokeWidth={1.2}
          fill={gold}
          opacity={0.7}
        />
        {/* Clapper */}
        <Line
          x1="20"
          y1="26"
          x2="20"
          y2="34"
          stroke={gold}
          strokeWidth={1.5}
          opacity={0.8}
          strokeLinecap="round"
        />
        <Circle cx="20" cy="35" r="2" fill={goldBright} opacity={0.8} />
        {/* Crown / top */}
        <Circle cx="20" cy="8" r="2.5" fill={goldBright} opacity={0.7} />
        <Line x1="20" y1="10" x2="20" y2="12" stroke={gold} strokeWidth={1} opacity={0.6} />
      </G>
    ),

    candle: () => (
      <G>
        {/* Warm glow */}
        <Circle cx="20" cy="10" r="10" fill={orange} opacity={0.1} />
        <Circle cx="20" cy="10" r="6" fill={orange} opacity={0.15} />
        {/* Flame outer */}
        <Path d="M20 2 Q24 8 22 12 Q20 16 18 12 Q16 8 20 2Z" fill={orange} opacity={0.6} />
        {/* Flame inner */}
        <Path d="M20 5 Q22 8 21 11 Q20 13 19 11 Q18 8 20 5Z" fill={goldBright} opacity={0.8} />
        {/* Wick */}
        <Line x1="20" y1="12" x2="20" y2="15" stroke={gold} strokeWidth={0.8} opacity={0.5} />
        {/* Candle body */}
        <Rect x="15" y="15" width="10" height="20" rx="1" fill={gold} opacity={0.5} />
        <Rect x="16" y="15" width="8" height="20" rx="0.5" fill={goldBright} opacity={0.3} />
        {/* Wax drip */}
        <Path d="M15 15 Q14 17 15 18" stroke={gold} strokeWidth={0.8} fill="none" opacity={0.4} />
        <Path d="M25 15 Q26 18 25 19" stroke={gold} strokeWidth={0.8} fill="none" opacity={0.4} />
        {/* Base */}
        <Ellipse cx="20" cy="35" rx="7" ry="2" fill={gold} opacity={0.5} />
      </G>
    ),

    angel: () => (
      <G>
        {/* Glow */}
        <Circle cx="20" cy="18" r="14" fill={goldBright} opacity={0.08} />
        {/* Left wing */}
        <Path
          d="M16 16 Q6 10 4 18 Q6 24 14 22"
          fill={gold}
          opacity={0.4}
          stroke={gold}
          strokeWidth={0.5}
        />
        <Path d="M14 17 Q8 13 6 18 Q8 22 13 21" fill={goldBright} opacity={0.3} />
        {/* Right wing */}
        <Path
          d="M24 16 Q34 10 36 18 Q34 24 26 22"
          fill={gold}
          opacity={0.4}
          stroke={gold}
          strokeWidth={0.5}
        />
        <Path d="M26 17 Q32 13 34 18 Q32 22 27 21" fill={goldBright} opacity={0.3} />
        {/* Robe */}
        <Path
          d="M16 20 L14 36 L26 36 L24 20Z"
          fill={blue}
          opacity={0.4}
          stroke={blue}
          strokeWidth={0.5}
        />
        <Path d="M17 20 L15 36 L25 36 L23 20Z" fill={blue} opacity={0.2} />
        {/* Head */}
        <Circle cx="20" cy="14" r="4" fill={gold} opacity={0.5} />
        <Circle cx="20" cy="14" r="3" fill={goldBright} opacity={0.3} />
        {/* Halo */}
        <Ellipse
          cx="20"
          cy="9"
          rx="5"
          ry="1.5"
          stroke={goldBright}
          strokeWidth={1}
          fill="none"
          opacity={0.7}
        />
        <Ellipse
          cx="20"
          cy="9"
          rx="4"
          ry="1"
          stroke={goldBright}
          strokeWidth={0.5}
          fill={goldBright}
          opacity={0.2}
        />
      </G>
    ),

    mary: () => (
      <G>
        {/* Background glow */}
        <Circle cx="20" cy="18" r="14" fill={blue} opacity={0.08} />
        {/* Mantle / veil */}
        <Path
          d="M20 6 Q10 8 8 20 Q8 32 14 36 L26 36 Q32 32 32 20 Q30 8 20 6Z"
          fill={blue}
          opacity={0.45}
          stroke={blue}
          strokeWidth={0.5}
        />
        {/* Inner mantle highlight */}
        <Path
          d="M20 8 Q12 10 10 20 Q10 30 15 34 L25 34 Q30 30 30 20 Q28 10 20 8Z"
          fill={blue}
          opacity={0.2}
        />
        {/* Face */}
        <Circle cx="20" cy="15" r="4.5" fill={gold} opacity={0.4} />
        <Circle cx="20" cy="15" r="3.5" fill={goldBright} opacity={0.25} />
        {/* Stars on mantle */}
        <Circle cx="12" cy="22" r="1" fill={goldBright} opacity={0.6} />
        <Circle cx="28" cy="22" r="1" fill={goldBright} opacity={0.6} />
        <Circle cx="20" cy="32" r="1" fill={goldBright} opacity={0.5} />
        {/* Rose at heart */}
        <Circle cx="20" cy="24" r="2" fill={red} opacity={0.5} />
        <Circle cx="20" cy="24" r="1.2" fill={red} opacity={0.3} />
        {/* Halo */}
        <Ellipse
          cx="20"
          cy="9.5"
          rx="5.5"
          ry="1.5"
          stroke={goldBright}
          strokeWidth={0.8}
          fill="none"
          opacity={0.6}
        />
      </G>
    ),

    'sacred-heart': () => (
      <G>
        {/* Glow */}
        <Circle cx="20" cy="22" r="14" fill={red} opacity={0.08} />
        {/* Heart shape */}
        <Path
          d="M20 34 C12 28 6 22 6 16 Q6 10 12 10 Q16 10 20 14 Q24 10 28 10 Q34 10 34 16 C34 22 28 28 20 34Z"
          fill={red}
          opacity={0.6}
          stroke={red}
          strokeWidth={0.5}
        />
        {/* Heart inner glow */}
        <Path
          d="M20 30 C14 26 10 21 10 17 Q10 12 14 12 Q17 12 20 16 Q23 12 26 12 Q30 12 30 17 C30 21 26 26 20 30Z"
          fill={red}
          opacity={0.3}
        />
        {/* Crown of thorns */}
        <Ellipse
          cx="20"
          cy="20"
          rx="8"
          ry="4"
          stroke={gold}
          strokeWidth={1}
          fill="none"
          opacity={0.6}
        />
        {/* Thorn points */}
        <Line
          x1="13"
          y1="18"
          x2="11"
          y2="17"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="16"
          y1="17"
          x2="15"
          y2="15"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="24"
          y1="17"
          x2="25"
          y2="15"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="27"
          y1="18"
          x2="29"
          y2="17"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
        {/* Flame on top */}
        <Path d="M20 10 Q22 6 21 3 Q20 0 19 3 Q18 6 20 10Z" fill={orange} opacity={0.7} />
        <Path
          d="M20 9 Q21 6.5 20.5 4.5 Q20 3 19.5 4.5 Q19 6.5 20 9Z"
          fill={goldBright}
          opacity={0.6}
        />
        {/* Cross on top */}
        <Line
          x1="20"
          y1="1"
          x2="20"
          y2="6"
          stroke={gold}
          strokeWidth={1}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="18"
          y1="3"
          x2="22"
          y2="3"
          stroke={gold}
          strokeWidth={1}
          opacity={0.5}
          strokeLinecap="round"
        />
      </G>
    ),

    eucharist: () => (
      <G>
        {/* Glow */}
        <Circle cx="20" cy="18" r="14" fill={gold} opacity={0.08} />
        {/* Host (circle) */}
        <Circle
          cx="20"
          cy="10"
          r="8"
          fill={goldBright}
          opacity={0.6}
          stroke={gold}
          strokeWidth={0.8}
        />
        <Circle cx="20" cy="10" r="6" fill={goldBright} opacity={0.3} />
        {/* Cross on host */}
        <Line
          x1="20"
          y1="5"
          x2="20"
          y2="15"
          stroke={gold}
          strokeWidth={1}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="15"
          y1="10"
          x2="25"
          y2="10"
          stroke={gold}
          strokeWidth={1}
          opacity={0.5}
          strokeLinecap="round"
        />
        {/* Chalice cup */}
        <Path
          d="M13 22 Q13 18 16 18 L24 18 Q27 18 27 22 Q27 26 20 28 Q13 26 13 22Z"
          fill={gold}
          opacity={0.6}
          stroke={gold}
          strokeWidth={0.6}
        />
        {/* Cup highlight */}
        <Path
          d="M15 22 Q15 19 17 19 L23 19 Q25 19 25 22 Q25 25 20 26.5 Q15 25 15 22Z"
          fill={goldBright}
          opacity={0.3}
        />
        {/* Stem */}
        <Line
          x1="20"
          y1="28"
          x2="20"
          y2="33"
          stroke={gold}
          strokeWidth={1.5}
          opacity={0.7}
          strokeLinecap="round"
        />
        {/* Base */}
        <Ellipse
          cx="20"
          cy="34"
          rx="6"
          ry="2"
          fill={gold}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.5}
        />
        {/* Node on stem */}
        <Circle cx="20" cy="30" r="1.5" fill={goldBright} opacity={0.6} />
      </G>
    ),

    monstrance: () => (
      <G>
        {/* Outer glow */}
        <Circle cx="20" cy="16" r="15" fill={gold} opacity={0.06} />
        {/* Sunburst rays */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = 20 + Math.cos(angle) * 6
          const y1 = 16 + Math.sin(angle) * 6
          const x2 = 20 + Math.cos(angle) * 13
          const y2 = 16 + Math.sin(angle) * 13
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={goldBright}
              strokeWidth={i % 2 === 0 ? 1.5 : 0.8}
              opacity={i % 2 === 0 ? 0.6 : 0.35}
              strokeLinecap="round"
            />
          )
        })}
        {/* Outer ring */}
        <Circle cx="20" cy="16" r="8" stroke={gold} strokeWidth={1} fill="none" opacity={0.5} />
        {/* Inner luna / host */}
        <Circle
          cx="20"
          cy="16"
          r="4.5"
          fill={goldBright}
          opacity={0.7}
          stroke={gold}
          strokeWidth={0.8}
        />
        <Circle cx="20" cy="16" r="3" fill={goldBright} opacity={0.4} />
        {/* Cross on host */}
        <Line
          x1="20"
          y1="14"
          x2="20"
          y2="18"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.4}
          strokeLinecap="round"
        />
        <Line
          x1="18"
          y1="16"
          x2="22"
          y2="16"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.4}
          strokeLinecap="round"
        />
        {/* Stem */}
        <Line
          x1="20"
          y1="24"
          x2="20"
          y2="33"
          stroke={gold}
          strokeWidth={1.5}
          opacity={0.7}
          strokeLinecap="round"
        />
        {/* Node */}
        <Circle cx="20" cy="28" r="1.5" fill={goldBright} opacity={0.5} />
        {/* Base */}
        <Ellipse
          cx="20"
          cy="35"
          rx="7"
          ry="2.5"
          fill={gold}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.5}
        />
      </G>
    ),

    mercy: () => (
      <G>
        {/* Radiating glow */}
        <Circle cx="20" cy="20" r="16" fill={red} opacity={0.06} />
        <Circle cx="20" cy="20" r="12" fill={red} opacity={0.08} />
        {/* Rays of mercy */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x1 = 20 + Math.cos(angle) * 10
          const y1 = 20 + Math.sin(angle) * 10
          const x2 = 20 + Math.cos(angle) * 16
          const y2 = 20 + Math.sin(angle) * 16
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? red : goldBright}
              strokeWidth={1}
              opacity={0.35}
              strokeLinecap="round"
            />
          )
        })}
        {/* Heart shape */}
        <Path
          d="M20 32 C14 28 8 23 8 17 Q8 12 12 12 Q16 12 20 16 Q24 12 28 12 Q32 12 32 17 C32 23 26 28 20 32Z"
          fill={red}
          opacity={0.55}
          stroke={red}
          strokeWidth={0.5}
        />
        {/* Heart glow */}
        <Path
          d="M20 28 C16 26 12 22 12 18 Q12 14 15 14 Q17 14 20 17 Q23 14 25 14 Q28 14 28 18 C28 22 24 26 20 28Z"
          fill={red}
          opacity={0.25}
        />
        {/* Light from center */}
        <Circle cx="20" cy="20" r="3" fill={goldBright} opacity={0.4} />
        <Circle cx="20" cy="20" r="1.5" fill={goldBright} opacity={0.3} />
      </G>
    ),

    confession: () => (
      <G>
        {/* Sky wash */}
        <Circle cx="20" cy="16" r="14" fill={blue} opacity={0.08} />
        {/* Dove body */}
        <Path
          d="M20 12 Q16 12 14 16 Q12 20 16 22 L24 22 Q28 20 26 16 Q24 12 20 12Z"
          fill={blue}
          opacity={0.5}
          stroke={blue}
          strokeWidth={0.5}
        />
        {/* Dove highlight */}
        <Path
          d="M20 14 Q17 14 16 16 Q14 19 17 20 L23 20 Q26 19 25 16 Q23 14 20 14Z"
          fill={blue}
          opacity={0.25}
        />
        {/* Left wing */}
        <Path
          d="M14 16 Q8 10 6 14 Q8 18 14 18"
          fill={blue}
          opacity={0.4}
          stroke={blue}
          strokeWidth={0.5}
        />
        {/* Right wing */}
        <Path
          d="M26 16 Q32 10 34 14 Q32 18 26 18"
          fill={blue}
          opacity={0.4}
          stroke={blue}
          strokeWidth={0.5}
        />
        {/* Head */}
        <Circle cx="22" cy="13" r="2.5" fill={blue} opacity={0.5} />
        {/* Beak */}
        <Path d="M24.5 13 L27 12.5 L24.5 12" fill={gold} opacity={0.6} />
        {/* Eye */}
        <Circle cx="23" cy="12.5" r="0.6" fill={blue} opacity={0.8} />
        {/* Olive branch */}
        <Path d="M16 22 Q14 26 10 30" stroke={green} strokeWidth={0.8} fill="none" opacity={0.6} />
        <Ellipse
          cx="12"
          cy="25"
          rx="2"
          ry="1"
          fill={green}
          opacity={0.5}
          transform="rotate(-30 12 25)"
        />
        <Ellipse
          cx="10.5"
          cy="27.5"
          rx="2"
          ry="1"
          fill={green}
          opacity={0.4}
          transform="rotate(-40 10.5 27.5)"
        />
        <Ellipse
          cx="9.5"
          cy="30"
          rx="1.8"
          ry="0.8"
          fill={green}
          opacity={0.35}
          transform="rotate(-50 9.5 30)"
        />
      </G>
    ),

    reading: () => (
      <G>
        {/* Warm reading glow */}
        <Circle cx="20" cy="20" r="14" fill={orange} opacity={0.06} />
        {/* Book wash */}
        <Rect x="6" y="12" width="28" height="22" rx="2" fill={blue} opacity={0.08} />
        {/* Left page */}
        <Path
          d="M20 10 C14 10 8 12 8 12 L8 34 C8 34 14 32 20 32Z"
          fill="#F5F0E0"
          stroke={blue}
          strokeWidth={0.8}
          opacity={0.8}
        />
        {/* Right page */}
        <Path
          d="M20 10 C26 10 32 12 32 12 L32 34 C32 34 26 32 20 32Z"
          fill="#FBF8F0"
          stroke={blue}
          strokeWidth={0.8}
          opacity={0.8}
        />
        {/* Spine */}
        <Line x1="20" y1="10" x2="20" y2="32" stroke={blue} strokeWidth={1} opacity={0.6} />
        {/* Text lines */}
        <Line x1="11" y1="17" x2="17" y2="17" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="11" y1="20" x2="16" y2="20" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="11" y1="23" x2="17" y2="23" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="23" y1="17" x2="29" y2="17" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="23" y1="20" x2="28" y2="20" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="23" y1="23" x2="29" y2="23" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        {/* Small reading light / candle above */}
        <Path d="M30 4 Q32 2 31 6 Q30 8 29 6 Q28 2 30 4Z" fill={orange} opacity={0.5} />
        <Line x1="30" y1="6" x2="30" y2="10" stroke={gold} strokeWidth={0.6} opacity={0.4} />
        {/* Cross bookmark */}
        <Line
          x1="20"
          y1="8"
          x2="20"
          y2="4"
          stroke={red}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
        <Line
          x1="18.5"
          y1="5.5"
          x2="21.5"
          y2="5.5"
          stroke={red}
          strokeWidth={0.8}
          opacity={0.5}
          strokeLinecap="round"
        />
      </G>
    ),

    scroll: () => (
      <G>
        {/* Parchment wash */}
        <Rect x="8" y="8" width="24" height="24" rx="2" fill={gold} opacity={0.06} />
        {/* Main parchment body */}
        <Rect x="10" y="10" width="20" height="22" rx="1" fill={gold} opacity={0.3} />
        <Rect x="11" y="11" width="18" height="20" rx="0.5" fill={goldBright} opacity={0.2} />
        {/* Top roll */}
        <Ellipse
          cx="20"
          cy="10"
          rx="12"
          ry="3"
          fill={gold}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.5}
        />
        <Ellipse cx="20" cy="10" rx="11" ry="2.2" fill={goldBright} opacity={0.3} />
        {/* Bottom curl */}
        <Path
          d="M10 32 Q10 36 14 36 L26 36 Q30 36 30 32"
          stroke={gold}
          strokeWidth={0.8}
          fill={gold}
          opacity={0.4}
        />
        {/* Text lines */}
        <Line x1="14" y1="15" x2="26" y2="15" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="14" y1="18" x2="24" y2="18" stroke={blue} strokeWidth={0.5} opacity={0.25} />
        <Line x1="14" y1="21" x2="26" y2="21" stroke={blue} strokeWidth={0.5} opacity={0.3} />
        <Line x1="14" y1="24" x2="22" y2="24" stroke={blue} strokeWidth={0.5} opacity={0.25} />
        <Line x1="14" y1="27" x2="25" y2="27" stroke={blue} strokeWidth={0.5} opacity={0.2} />
        {/* Seal / ribbon */}
        <Circle cx="26" cy="32" r="2.5" fill={red} opacity={0.5} />
        <Circle cx="26" cy="32" r="1.5" fill={red} opacity={0.3} />
      </G>
    ),

    mass: () => (
      <G>
        {/* Sacred glow */}
        <Circle cx="20" cy="14" r="14" fill={gold} opacity={0.08} />
        <Circle cx="20" cy="14" r="8" fill={goldBright} opacity={0.06} />
        {/* Elevated host */}
        <Circle
          cx="20"
          cy="6"
          r="5.5"
          fill={goldBright}
          opacity={0.65}
          stroke={gold}
          strokeWidth={0.8}
        />
        <Circle cx="20" cy="6" r="4" fill={goldBright} opacity={0.3} />
        {/* Cross on host */}
        <Line
          x1="20"
          y1="3.5"
          x2="20"
          y2="8.5"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.45}
          strokeLinecap="round"
        />
        <Line
          x1="17.5"
          y1="6"
          x2="22.5"
          y2="6"
          stroke={gold}
          strokeWidth={0.8}
          opacity={0.45}
          strokeLinecap="round"
        />
        {/* Radiance from host */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const x1 = 20 + Math.cos(angle) * 7
          const y1 = 6 + Math.sin(angle) * 7
          const x2 = 20 + Math.cos(angle) * 10
          const y2 = 6 + Math.sin(angle) * 10
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={goldBright}
              strokeWidth={0.7}
              opacity={0.3}
              strokeLinecap="round"
            />
          )
        })}
        {/* Chalice cup */}
        <Path
          d="M13 22 Q13 18 16 17 L24 17 Q27 18 27 22 Q27 26 20 28 Q13 26 13 22Z"
          fill={gold}
          opacity={0.6}
          stroke={gold}
          strokeWidth={0.6}
        />
        <Path
          d="M15 21 Q15 19 17 18.5 L23 18.5 Q25 19 25 21 Q25 24 20 26 Q15 24 15 21Z"
          fill={goldBright}
          opacity={0.3}
        />
        {/* Stem */}
        <Line
          x1="20"
          y1="28"
          x2="20"
          y2="33"
          stroke={gold}
          strokeWidth={1.5}
          opacity={0.7}
          strokeLinecap="round"
        />
        {/* Node */}
        <Circle cx="20" cy="30" r="1.5" fill={goldBright} opacity={0.5} />
        {/* Base */}
        <Ellipse
          cx="20"
          cy="35"
          rx="7"
          ry="2.5"
          fill={gold}
          opacity={0.5}
          stroke={gold}
          strokeWidth={0.5}
        />
      </G>
    ),

    clock: () => (
      <G>
        {/* Glow */}
        <Circle cx="20" cy="20" r="16" fill={blue} opacity={0.08} />
        {/* Clock face */}
        <Circle cx="20" cy="20" r="14" stroke={blue} strokeWidth={1} fill="none" opacity={0.4} />
        <Circle cx="20" cy="20" r="13" stroke={blue} strokeWidth={0.5} fill={blue} opacity={0.06} />
        {/* Hour marks */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2
          const cx = 20 + Math.cos(angle) * 11.5
          const cy = 20 + Math.sin(angle) * 11.5
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 1.2 : 0.7}
              fill={gold}
              opacity={i % 3 === 0 ? 0.7 : 0.4}
            />
          )
        })}
        {/* Hour hand (pointing to 3, roughly) */}
        <Line
          x1="20"
          y1="20"
          x2="20"
          y2="10"
          stroke={gold}
          strokeWidth={1.5}
          opacity={0.7}
          strokeLinecap="round"
        />
        {/* Minute hand */}
        <Line
          x1="20"
          y1="20"
          x2="28"
          y2="17"
          stroke={gold}
          strokeWidth={1}
          opacity={0.5}
          strokeLinecap="round"
        />
        {/* Center dot */}
        <Circle cx="20" cy="20" r="1.5" fill={goldBright} opacity={0.8} />
        {/* Decorative ring */}
        <Circle cx="20" cy="20" r="3" stroke={gold} strokeWidth={0.5} fill="none" opacity={0.3} />
      </G>
    ),
  }

  const renderIcon = icons[name]

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" accessible={false}>
      {renderIcon()}
    </Svg>
  )
})
