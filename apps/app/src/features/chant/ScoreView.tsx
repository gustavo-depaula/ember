// biome-ignore-all lint/suspicious/noArrayIndexKey: the lines and marks of one layout never reorder
import { memo, useMemo } from 'react'
import Svg, { ClipPath, Defs, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg'
import { useTheme, YStack } from 'tamagui'
import { useProgressiveCount } from '@/hooks/useProgressiveCount'
import type { TextStyleName } from '@/lib/typography/fontMetrics'
import { inkPaths } from './inkPath'
import { layoutScore, noteInk, type ScoreLine, type ScoreText } from './layoutScore'

// The faces the lyrics were measured in (`layoutScore`), by the name each is
// loaded under. Every one is a family of its own on both platforms, so no
// weight or style is asked of it — asking is what sends Android to Roboto.
const faceFamily: Record<TextStyleName, string> = {
  regular: 'EBGaramond_400Regular',
  italic: 'EBGaramond_400Regular_Italic',
  bold: 'EBGaramond_700Bold',
  boldItalic: 'EBGaramond_700Bold_Italic',
}

/**
 * A chant score in square notes, set to `width`. One SVG per staff line, in a
 * column: the lines mount a few at a time, so a Credo does not hold the screen
 * while its forty staves are created.
 */
export function ScoreView({
  score,
  width,
  scale,
  label,
  lines,
  palette,
  sounding,
}: {
  score: string
  width: number
  scale: number
  label: string
  /** The note sounding now, by its place in the melody (`melodyOf`): drawn in red. */
  sounding?: number
  /** Show only the opening lines — an incipit, where the score is ornament. */
  lines?: number
  /** Colours for a score drawn on its own ground rather than the theme's page. */
  palette?: { ink: string; rubric: string }
}) {
  const theme = useTheme()
  const { layout, ink } = useMemo(() => {
    const whole = layoutScore(score, { width, scale })
    const laidOut = lines ? { ...whole, lines: whole.lines.slice(0, lines) } : whole
    return { layout: laidOut, ink: inkPaths(laidOut) }
  }, [score, width, scale, lines])
  const visible = useProgressiveCount(layout.lines.length, layout, 6, 8)
  const inkColor = palette?.ink ?? theme.color.val
  const rubricColor = palette?.rubric ?? theme.colorBurgundy.val

  return (
    <YStack accessible accessibilityRole="image" accessibilityLabel={label}>
      {layout.lines.slice(0, visible).map((line, i) => (
        <StaffLine
          key={i}
          line={line}
          width={width}
          ink={ink}
          inkColor={inkColor}
          rubricColor={rubricColor}
          // Only the line that holds the note is told of it, so the others stay as drawn.
          sounding={line.notes.some((note) => note.tone === sounding) ? sounding : undefined}
        />
      ))}
      {/* Hold the unmounted lines' room, so the page does not grow under a reader. */}
      <YStack height={layout.lines.slice(visible).reduce((sum, line) => sum + line.height, 0)} />
    </YStack>
  )
}

// Memoized on props that hold still while later lines mount beneath it: a
// line's path runs to ten thousand characters, and is built once.
const StaffLine = memo(function StaffLine({
  line,
  width,
  ink,
  inkColor,
  rubricColor,
  sounding,
}: {
  line: ScoreLine
  width: number
  ink: (line: ScoreLine) => string
  inkColor: string
  rubricColor: string
  sounding?: number
}) {
  const d = useMemo(() => ink(line), [ink, line])
  // The sounding note drawn again over itself in red; a stroke of several notes, only this note's end of it.
  const lit = useMemo(() => {
    if (sounding === undefined) return undefined
    const { marks, band } = noteInk(line, sounding)
    return marks.length ? { d: ink({ ...line, marks }), band } : undefined
  }, [ink, line, sounding])
  const colors = { ink: inkColor, rubric: rubricColor }
  const texts = line.marks.filter((mark): mark is ScoreText => mark.type === 'text')
  const strokes = line.marks.filter((mark) => mark.type === 'stroke')
  return (
    <Svg width={width} height={line.height} viewBox={`0 ${line.top} ${width} ${line.height}`}>
      <Path d={d} fill={inkColor} />
      {lit?.band && (
        <Defs>
          <ClipPath id="sounding">
            <Rect x={0} y={lit.band.top} width={width} height={lit.band.bottom - lit.band.top} />
          </ClipPath>
        </Defs>
      )}
      {lit && (
        <Path d={lit.d} fill={rubricColor} clipPath={lit.band ? 'url(#sounding)' : undefined} />
      )}
      {strokes.map((stroke, i) => (
        <Path key={i} d={stroke.d} stroke={inkColor} strokeWidth={stroke.weight} fill="none" />
      ))}
      {texts.map((text, i) => (
        <SvgText key={i} x={text.x} y={text.y} fontSize={text.size} textAnchor={text.anchor}>
          {text.runs.map((run, j) => (
            <TSpan key={j} fontFamily={faceFamily[run.face]} fill={colors[run.color]}>
              {run.text}
            </TSpan>
          ))}
        </SvgText>
      ))}
    </Svg>
  )
})
