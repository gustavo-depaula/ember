import { MotiView } from 'moti'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Easing } from 'react-native-reanimated'

import { useLiturgicalTheme } from '@/hooks/useLiturgicalTheme'

// A luminous stained-glass mosaic that lights the floating iOS 26 tab bar from
// behind. We can't paint into the native liquid-glass material, so instead we
// give it colored light to refract — exactly like sunlight through a cathedral
// window. The SF Symbols stay crisp on top and read as the dark leaded figures.

// Geometry of the floating capsule we're lighting. The OS doesn't expose the
// native bar's frame, so these are tuned by eye — nudge per device if needed.
const bar = {
  bottom: 24, // gap between the capsule's bottom and the screen edge
  height: 58, // capsule height
  marginLeft: 26, // inset from the left screen edge
  marginRight: 96, // inset from the right — clears the separate search circle
}

// Saturated cathedral jewels. Kept far more vivid than the UI theme tokens
// because liquid glass desaturates and blurs heavily before the color reaches
// the eye. `azure` lifts the blue field; `white` is the warm glass glint.
const jewel = {
  cobalt: '#1E4FA0',
  azure: '#2E6BC8',
  ruby: '#A01828',
  gold: '#D4A63A',
  emerald: '#1E7A4F',
  violet: '#5B2C6F',
  rose: '#C27083',
  white: '#EDE6D2',
} as const
type JewelKey = keyof typeof jewel

// A diamond lattice ("quarries") rather than a square grid — the leading runs on
// the bias, which is what makes glass read as cathedral and not as floor tile.
// Colors come from a repeating 4×4 tile, not randomness: random placement clumps
// one color into patches, whereas a fixed tile glazes evenly. It's a blue/warm
// checkerboard — blues (cobalt/azure) on one diagonal, ruby with violet/gold/
// white/emerald glints on the other — so it's half blue, half warm with nothing
// dominating. Rose stays out; it's reserved for the season wash.
const tile: JewelKey[][] = [
  ['cobalt', 'ruby', 'azure', 'violet'],
  ['ruby', 'cobalt', 'white', 'azure'],
  ['azure', 'violet', 'cobalt', 'gold'],
  ['emerald', 'azure', 'ruby', 'cobalt'],
]

// Lozenge "quarries" — taller than wide, so they read as diamonds (the ♦ pip)
// rather than tilted squares. Each pane is a 45°-rotated square sized to span
// `pitchX` wide, then `stretch`ed vertically into an elongated diamond. Rows
// step by half the lozenge height and offset alternately so they tessellate.
const pitchX = 20 // horizontal diagonal & column spacing
const stretch = 1.7 // vertical elongation (>1 makes the taller, pointier diamond)
const leading = 2 // dark gap left between panes
const squareSide = (pitchX - leading) / Math.SQRT2 // rotates to pitchX-leading wide
const rowPitch = (pitchX * stretch) / 2

// How opaque each glass pane is. Kept low so the panes read as translucent
// colored light the bar refracts, not solid paint. `glint` (white) is lower
// still — a highlight should barely be there.
const paneAlpha = 0.36
const glintAlpha = 0.24

// A came frame set just inside the pill edge — the leaded border around the
// window. `inset` floats it off the edge; the radius stays concentric.
const frame = {
  inset: 4,
  width: 1.5,
  color: 'rgba(8, 6, 10, 0.5)',
}

function buildLattice(innerWidth: number, innerHeight: number) {
  const rows = Math.ceil(innerHeight / rowPitch) + 1
  const cols = Math.ceil(innerWidth / pitchX) + 1
  const panes: Array<{ id: string; left: number; top: number; color: JewelKey }> = []
  for (let r = 0; r < rows; r++) {
    const cy = r * rowPitch
    const offsetX = (r % 2) * (pitchX / 2)
    for (let c = 0; c < cols; c++) {
      const cx = c * pitchX + offsetX
      panes.push({
        id: `${r}-${c}`,
        left: cx - squareSide / 2,
        top: cy - squareSide / 2,
        color: tile[r % tile.length][c % tile[0].length],
      })
    }
  }
  return panes
}

// The window glows in the color of the day's liturgical season.
const seasonJewel: Record<string, JewelKey> = {
  advent: 'violet',
  lent: 'violet',
  septuagesima: 'violet',
  christmas: 'gold',
  easter: 'gold',
  epiphany: 'emerald',
  ordinary: 'emerald',
  'post-pentecost': 'emerald',
  martyr: 'ruby',
  rose: 'rose',
}

function withAlpha(hex: string, a: number) {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function StainedGlassBacklight() {
  const { themeName } = useLiturgicalTheme()
  const { width } = useWindowDimensions()

  // The liquid-glass tab bar only exists on iOS 26; elsewhere this would just
  // be an odd colored strip, so keep it native-only for now.
  if (Platform.OS !== 'ios') return undefined

  const seasonColor = jewel[seasonJewel[themeName] ?? 'gold']
  const lattice = buildLattice(width - bar.marginLeft - bar.marginRight, bar.height)

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: bar.marginLeft,
        right: bar.marginRight,
        bottom: bar.bottom,
        height: bar.height,
        borderRadius: bar.height / 2,
        overflow: 'hidden',
      }}
    >
      {/* Leading matrix — the dark cames between panes. Translucent so the bar
          still feels like glass over content, not an opaque painted block. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14, 11, 18, 0.28)' }]} />

      {/* The diamond field, breathing gently like candlelight through glass. */}
      <MotiView
        from={{ opacity: 0.82 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 6000,
          loop: true,
          repeatReverse: true,
          easing: Easing.inOut(Easing.sin),
        }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {lattice.map((pane) => (
          // Outer wrapper stretches vertically; inner square rotates 45°. Nesting
          // the transforms keeps the result a clean lozenge regardless of how RN
          // composes a combined transform array.
          <View
            key={pane.id}
            style={{
              position: 'absolute',
              left: pane.left,
              top: pane.top,
              width: squareSide,
              height: squareSide,
              transform: [{ scaleY: stretch }],
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 1,
                transform: [{ rotate: '45deg' }],
                backgroundColor: withAlpha(
                  jewel[pane.color],
                  pane.color === 'white' ? glintAlpha : paneAlpha,
                ),
              }}
            />
          </View>
        ))}
      </MotiView>

      {/* Season wash — unifies the field toward the liturgical color. */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(seasonColor, 0.14) }]} />

      {/* Came frame — a leaded border set just inside the window's edge. */}
      <View
        style={{
          position: 'absolute',
          top: frame.inset,
          left: frame.inset,
          right: frame.inset,
          bottom: frame.inset,
          borderRadius: bar.height / 2 - frame.inset,
          borderWidth: frame.width,
          borderColor: frame.color,
        }}
      />
    </View>
  )
}
