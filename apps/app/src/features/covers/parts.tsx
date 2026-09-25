import type { ReactNode } from 'react'
import { type StyleProp, Text, type TextStyle } from 'react-native'
import Svg, { Circle, LinearGradient, Path, Stop } from 'react-native-svg'

import { type BlockTone, blockInk, blockLabelInk } from '@/features/explore/bgColor'

/** Inks for the generated covers — raw hexes like the block tones, so a cover reads the same in parchment and Tenebrae. */
export const coverInk = {
  cream: blockInk,
  gold: blockLabelInk,
  paper: '#F3EAD6',
  paperDeep: '#E6D8BC',
  vellum: '#FBF5E8',
  text: '#2A1F16',
  textSoft: '#5B4A38',
  rubric: '#9B2226',
}

export const coverFonts = {
  title: 'EBGaramond_600SemiBold',
  body: 'EBGaramond_400Regular',
  italic: 'EBGaramond_400Regular_Italic',
  caps: 'Cinzel_400Regular',
  capsBold: 'Cinzel_600SemiBold',
  blackletter: 'UnifrakturMaguntia',
}

/** Title size as a fraction of the cover width — long titles step down so they fit in ~4 lines. */
export function titleScale(title: string) {
  if (title.length > 28) return 0.088
  if (title.length > 20) return 0.098
  return 0.112
}

/** Cover text never follows Dynamic Type: a cover is a picture, sized to its box. */
export function CoverText({
  children,
  style,
  lines,
}: {
  children: ReactNode
  style: StyleProp<TextStyle>
  lines?: number
}) {
  return (
    <Text
      allowFontScaling={false}
      numberOfLines={lines}
      adjustsFontSizeToFit={lines !== undefined}
      minimumFontScale={0.6}
      style={style}
    >
      {children}
    </Text>
  )
}

/** The tone's diagonal (top-left → bottom-right), as on the art-less blocks. */
export function ToneGradient({ id, tone }: { id: string; tone: BlockTone }) {
  return (
    <LinearGradient id={id} x1="0.25" y1="0" x2="0.75" y2="1">
      <Stop offset="0" stopColor={tone.from} />
      <Stop offset="1" stopColor={tone.to} />
    </LinearGradient>
  )
}

const glyphPaths = {
  greek: 'M9.5 2h5v7.5H22v5h-7.5V22h-5v-7.5H2v-5h7.5z',
  pattee: 'M9 1h6l-1.6 8.4L21.8 8v8l-8.4-1.4L15 23H9l1.6-8.4L2.2 16V8l8.4 1.4z',
  star: 'M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z',
}

/** Crosses and the corner fleuron drawn as paths — the ✚/✠ glyphs fall back to emoji-ish system fonts on iOS. */
export function Glyph({
  kind,
  size,
  color,
}: {
  kind: keyof typeof glyphPaths
  size: number
  color: string
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={glyphPaths[kind]} fill={color} />
    </Svg>
  )
}

/**
 * The scalloped lace edge of a holy card: a ring of dots whose centres sit on
 * the card's inner edge, so half of each bulges out. Returns the dots only; the
 * caller paints the card body over their centres.
 */
export function LaceDots({ size, color }: { size: number; color: string }) {
  const count = 16
  const step = size / count
  const r = step * 0.37
  const dots: Array<[number, number]> = []
  const near = step / 2
  const far = size - step / 2
  for (let i = 0; i < count; i++) {
    const c = near + i * step
    dots.push([c, near], [c, far])
    // Corners already came from the top and bottom rows.
    if (i > 0 && i < count - 1) dots.push([near, c], [far, c])
  }
  return (
    <>
      {dots.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={color} />
      ))}
    </>
  )
}
