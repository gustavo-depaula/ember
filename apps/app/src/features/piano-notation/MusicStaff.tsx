import { useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated'
import Svg, { Ellipse, Line, Text as SvgText } from 'react-native-svg'
import { useTheme } from 'tamagui'

import {
  accidentalToGlyph,
  BASS_ANCHOR_STEP,
  type ChordNote,
  type Clef,
  ledgerSteps,
  MAX_STEP,
  MIN_STEP,
  stepToY,
  TREBLE_ANCHOR_STEP,
} from './notes'

const WIDTH = 320
const HEIGHT = 180
const STAFF_TOP_Y = 70
const LINE_GAP = 12
const STEP_GAP = LINE_GAP / 2
const STAFF_BOTTOM_Y = STAFF_TOP_Y + 4 * LINE_GAP
const STAFF_LEFT_X = 20
const STAFF_RIGHT_X = WIDTH - 20
const CLEF_X = 46
const NOTE_X = WIDTH / 2
const NOTE_RX = 8
const NOTE_RY = 6
const ACCIDENTAL_DX = -22
const LEDGER_HALF = NOTE_RX + 5
const SECOND_OFFSET = NOTE_RX * 2 - 1
const PX_PER_STEP = STEP_GAP * 2
const HIT_THRESHOLD_Y = 10

// Engraving convention: notes a 2nd apart (1 step) can't share an x. The
// upper one shifts right of the implied stem; chains of 2nds alternate.
function noteXOffsets(sortedSteps: number[]): number[] {
  const offsets: number[] = []
  let lastWasRight = false
  for (let i = 0; i < sortedSteps.length; i++) {
    if (i > 0 && sortedSteps[i] === sortedSteps[i - 1] + 1 && !lastWasRight) {
      offsets.push(SECOND_OFFSET)
      lastWasRight = true
    } else {
      offsets.push(0)
      lastWasRight = false
    }
  }
  return offsets
}

export function MusicStaff({
  clef,
  notes,
  selectedIdx,
  onSelectNote,
  onTapEmpty,
  onMoveSelected,
  onChangeStep,
}: {
  clef: Clef
  notes: ChordNote[]
  /** Index in `notes` of the currently-selected note, or null. */
  selectedIdx: number | null
  /** Tap landed on a note → select it. */
  onSelectNote?: (idx: number) => void
  /** Tap landed on empty staff space → callers may deselect, or move a single
   * note to the tapped step. `step` is the diatonic step at the tap. */
  onTapEmpty?: (step: number) => void
  /** Pan with a selected note → move that note to the new step. */
  onMoveSelected?: (step: number) => void
  /** Pan with no selection → transpose the chord; `step` is the new lowest. */
  onChangeStep?: (step: number) => void
}) {
  const theme = useTheme()
  const lineColor = theme.color?.val ?? '#000'
  const noteColor = theme.accent?.val ?? '#000'
  const bgColor = theme.background?.val ?? '#fff'

  const gestureEnabled = notes.length > 0
  const steps = useMemo(() => notes.map((n) => n.step), [notes])
  const lowestStep = steps.length > 0 ? Math.min(...steps) : 28
  // Span constrains transpose so the highest note can't exceed MAX_STEP.
  const span = steps.length > 0 ? Math.max(...steps) - lowestStep : 0
  const maxLowest = MAX_STEP - span

  // The animated step represents either the selected note's step (single-note
  // drag) or the chord's lowest step (transpose) depending on selectedSV.
  const animatedStep = useSharedValue(0)
  const startStep = useSharedValue(0)
  const stepsSV = useSharedValue<number[]>(steps)
  const selectedSV = useSharedValue<number>(-1)

  useEffect(() => {
    stepsSV.value = steps
  }, [steps, stepsSV])

  useEffect(() => {
    selectedSV.value = selectedIdx ?? -1
  }, [selectedIdx, selectedSV])

  // Drive animatedStep from the appropriate source so external state changes
  // (selection switch, chord toggle) re-anchor the gesture baseline.
  useEffect(() => {
    if (selectedIdx !== null && selectedIdx >= 0 && selectedIdx < steps.length) {
      animatedStep.value = steps[selectedIdx]
    } else {
      animatedStep.value = lowestStep
    }
  }, [selectedIdx, steps, lowestStep, animatedStep])

  useAnimatedReaction(
    () => Math.round(animatedStep.value),
    (current, previous) => {
      if (previous === null || current === previous) return
      const sel = selectedSV.value
      if (sel >= 0) {
        if (onMoveSelected) runOnJS(onMoveSelected)(current)
      } else if (onChangeStep) {
        runOnJS(onChangeStep)(current)
      }
    },
    [onMoveSelected, onChangeStep],
  )

  const anchor = clef === 'treble' ? TREBLE_ANCHOR_STEP : BASS_ANCHOR_STEP
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .shouldCancelWhenOutside(false)
        .onStart(() => {
          const sel = selectedSV.value
          startStep.value = sel >= 0 && sel < stepsSV.value.length ? stepsSV.value[sel] : lowestStep
        })
        .onUpdate((e) => {
          const hasSel = selectedSV.value >= 0
          const lo = MIN_STEP
          const hi = hasSel ? MAX_STEP : maxLowest
          const next = startStep.value - e.translationY / PX_PER_STEP
          animatedStep.value = next < lo ? lo : next > hi ? hi : next
        })
        .onEnd(() => {
          animatedStep.value = Math.round(animatedStep.value)
        })
        .onFinalize((_e, success) => {
          if (success) animatedStep.value = Math.round(animatedStep.value)
        }),
    [animatedStep, startStep, selectedSV, stepsSV, lowestStep, maxLowest],
  )

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        const arr = stepsSV.value
        let bestIdx = -1
        let bestDist = HIT_THRESHOLD_Y
        for (let i = 0; i < arr.length; i++) {
          const noteY = STAFF_BOTTOM_Y - (arr[i] - anchor) * STEP_GAP
          const d = Math.abs(noteY - e.y)
          if (d < bestDist) {
            bestDist = d
            bestIdx = i
          }
        }
        if (bestIdx >= 0) {
          if (onSelectNote) runOnJS(onSelectNote)(bestIdx)
          return
        }
        const t = Math.round((STAFF_BOTTOM_Y - e.y) / STEP_GAP) + anchor
        const clamped = t < MIN_STEP ? MIN_STEP : t > MAX_STEP ? MAX_STEP : t
        if (onTapEmpty) runOnJS(onTapEmpty)(clamped)
      }),
    [anchor, stepsSV, onSelectNote, onTapEmpty],
  )

  const gesture = Gesture.Exclusive(pan, tap)

  const sortedNotes = useMemo(
    () => notes.map((n, origIdx) => ({ ...n, origIdx })).sort((a, b) => a.step - b.step),
    [notes],
  )
  const offsets = useMemo(() => noteXOffsets(sortedNotes.map((n) => n.step)), [sortedNotes])
  const ledgers = useMemo(() => {
    const set = new Set<number>()
    for (const n of notes) for (const s of ledgerSteps(n.step, clef)) set.add(s)
    return Array.from(set)
  }, [notes, clef])

  const hasRightOffset = offsets.some((o) => o > 0)
  const staffLineYs = [0, 1, 2, 3, 4].map((i) => STAFF_TOP_Y + i * LINE_GAP)

  const content = (
    <View
      style={{ width: WIDTH, height: HEIGHT, alignSelf: 'center' }}
      accessibilityRole="adjustable"
      accessibilityLabel="Music staff"
    >
      <Svg width={WIDTH} height={HEIGHT}>
        {staffLineYs.map((y) => (
          <Line
            key={y}
            x1={STAFF_LEFT_X}
            x2={STAFF_RIGHT_X}
            y1={y}
            y2={y}
            stroke={lineColor}
            strokeWidth={1}
          />
        ))}
        <Line
          x1={STAFF_LEFT_X}
          x2={STAFF_LEFT_X}
          y1={STAFF_TOP_Y}
          y2={STAFF_BOTTOM_Y}
          stroke={lineColor}
          strokeWidth={1.5}
        />
        <Line
          x1={STAFF_RIGHT_X}
          x2={STAFF_RIGHT_X}
          y1={STAFF_TOP_Y}
          y2={STAFF_BOTTOM_Y}
          stroke={lineColor}
          strokeWidth={1.5}
        />

        <SvgText
          x={CLEF_X}
          y={clef === 'treble' ? STAFF_BOTTOM_Y + 6 : STAFF_BOTTOM_Y - 6}
          fontSize={clef === 'treble' ? 84 : 64}
          fill={lineColor}
          textAnchor="middle"
          fontFamily="serif"
        >
          {clef === 'treble' ? '𝄞' : '𝄢'}
        </SvgText>

        {ledgers.map((s) => {
          const y = stepToY(s, clef, STAFF_BOTTOM_Y, STEP_GAP)
          const rightExtra = hasRightOffset ? SECOND_OFFSET : 0
          return (
            <Line
              key={`ledger-${s}`}
              x1={NOTE_X - LEDGER_HALF}
              x2={NOTE_X + LEDGER_HALF + rightExtra}
              y1={y}
              y2={y}
              stroke={lineColor}
              strokeWidth={1}
            />
          )
        })}

        {sortedNotes.map((n) => {
          if (!n.accidental) return null
          const dimmed = selectedIdx !== null && n.origIdx !== selectedIdx
          return (
            <SvgText
              key={`acc-${n.origIdx}`}
              x={NOTE_X + ACCIDENTAL_DX}
              y={stepToY(n.step, clef, STAFF_BOTTOM_Y, STEP_GAP) + 6}
              fontSize={22}
              fill={noteColor}
              textAnchor="middle"
              fontFamily="serif"
              opacity={dimmed ? 0.45 : 1}
            >
              {accidentalToGlyph(n.accidental)}
            </SvgText>
          )
        })}

        {sortedNotes.map((n, i) => {
          const isSelected = n.origIdx === selectedIdx
          const dimmed = selectedIdx !== null && !isSelected
          const r = isSelected ? 1.25 : 1
          return (
            <Ellipse
              key={`note-${n.origIdx}`}
              cx={NOTE_X + offsets[i]}
              cy={stepToY(n.step, clef, STAFF_BOTTOM_Y, STEP_GAP)}
              rx={NOTE_RX * r}
              ry={NOTE_RY * r}
              fill={bgColor}
              stroke={noteColor}
              strokeWidth={isSelected ? 3.5 : 2.5}
              opacity={dimmed ? 0.45 : 1}
            />
          )
        })}
      </Svg>
    </View>
  )

  if (!gestureEnabled) return content
  return <GestureDetector gesture={gesture}>{content}</GestureDetector>
}
