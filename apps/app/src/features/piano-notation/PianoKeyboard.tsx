import { memo, useEffect, useRef } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useTheme } from 'tamagui'

import { isBlackKey, PIANO_MAX_MIDI, PIANO_MIN_MIDI } from './notes'

const WHITE_W = 36
const WHITE_H = 132
const BLACK_W = 22
const BLACK_H = 84
const LABEL_H = 18
const TOTAL_H = WHITE_H + LABEL_H

type BlackKeyEntry = { midi: number; leftWhiteIdx: number }
const WHITE_MIDIS: number[] = []
const BLACK_KEYS: BlackKeyEntry[] = []
for (let m = PIANO_MIN_MIDI; m <= PIANO_MAX_MIDI; m++) {
  if (isBlackKey(m)) {
    BLACK_KEYS.push({ midi: m, leftWhiteIdx: WHITE_MIDIS.length - 1 })
  } else {
    WHITE_MIDIS.push(m)
  }
}
const TOTAL_WIDTH = WHITE_MIDIS.length * WHITE_W
const MIDDLE_C_WHITE_IDX = WHITE_MIDIS.indexOf(60)

export function PianoKeyboard({
  selected,
  onSelect,
}: {
  selected: ReadonlySet<number>
  onSelect: (midi: number) => void
}) {
  const theme = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const initialScrolled = useRef(false)

  useEffect(() => {
    if (initialScrolled.current || MIDDLE_C_WHITE_IDX < 0) return
    const target = MIDDLE_C_WHITE_IDX * WHITE_W - 120
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: Math.max(0, target), animated: false })
      initialScrolled.current = true
    })
  }, [])

  const accent = theme.accent?.val ?? '#a37b3e'
  const whiteBg = theme.background?.val ?? '#fff'
  const whiteSelectedBg = theme.accentSubtle?.val ?? accent
  const blackBg = theme.color?.val ?? '#222'
  const border = theme.borderColor?.val ?? '#ccc'
  const labelColor = theme.colorSecondary?.val ?? '#666'

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ height: TOTAL_H }}
    >
      <View style={{ width: TOTAL_WIDTH, height: TOTAL_H, position: 'relative' }}>
        {WHITE_MIDIS.map((m, idx) => (
          <WhiteKey
            key={m}
            midi={m}
            idx={idx}
            onSelect={onSelect}
            bg={selected.has(m) ? whiteSelectedBg : whiteBg}
            border={border}
            labelColor={labelColor}
          />
        ))}
        {BLACK_KEYS.map((bk) => (
          <BlackKey
            key={bk.midi}
            midi={bk.midi}
            leftWhiteIdx={bk.leftWhiteIdx}
            onSelect={onSelect}
            bg={selected.has(bk.midi) ? accent : blackBg}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const WhiteKey = memo(function WhiteKey({
  midi,
  idx,
  onSelect,
  bg,
  border,
  labelColor,
}: {
  midi: number
  idx: number
  onSelect: (midi: number) => void
  bg: string
  border: string
  labelColor: string
}) {
  const isC = midi % 12 === 0
  const octave = Math.floor(midi / 12) - 1
  return (
    <Pressable
      onPress={() => onSelect(midi)}
      accessibilityRole="button"
      accessibilityLabel={`MIDI ${midi}`}
      style={{
        position: 'absolute',
        left: idx * WHITE_W,
        top: 0,
        width: WHITE_W,
        height: WHITE_H,
      }}
    >
      <View
        style={{
          width: WHITE_W,
          height: WHITE_H,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
      {isC && (
        <View
          style={{
            position: 'absolute',
            top: WHITE_H,
            width: WHITE_W,
            height: LABEL_H,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 10, color: labelColor }}>{`Dó${octave}`}</Text>
        </View>
      )}
    </Pressable>
  )
})

const BlackKey = memo(function BlackKey({
  midi,
  leftWhiteIdx,
  onSelect,
  bg,
}: {
  midi: number
  leftWhiteIdx: number
  onSelect: (midi: number) => void
  bg: string
}) {
  const x = (leftWhiteIdx + 1) * WHITE_W - BLACK_W / 2
  return (
    <Pressable
      onPress={() => onSelect(midi)}
      accessibilityRole="button"
      accessibilityLabel={`MIDI ${midi}`}
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: BLACK_W,
        height: BLACK_H,
        zIndex: 2,
      }}
    >
      <View
        style={{
          width: BLACK_W,
          height: BLACK_H,
          backgroundColor: bg,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </Pressable>
  )
})
