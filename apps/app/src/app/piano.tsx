import { useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import {
  type Accidental,
  type AccidentalPref,
  type ChordNote,
  type Clef,
  chordNoteMidi,
  getNoteName,
  identifyChord,
  MusicStaff,
  midiToStep,
  PianoKeyboard,
} from '@/features/piano-notation'

type Mode = 'solo' | 'chord'

const MIDDLE_C: ChordNote = { step: 28, accidental: '' }

export default function PianoScreen() {
  const [clef, setClef] = useState<Clef>('treble')
  const [mode, setMode] = useState<Mode>('solo')
  const [notes, setNotes] = useState<ChordNote[]>([MIDDLE_C])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0)
  const [accidentalPref, setAccidentalPref] = useState<AccidentalPref>('#')

  const selectedMidis = useMemo(() => new Set(notes.map(chordNoteMidi)), [notes])
  const selectedNote =
    selectedIdx !== null && selectedIdx >= 0 && selectedIdx < notes.length
      ? notes[selectedIdx]
      : undefined

  function handleMode(next: Mode) {
    if (next === mode) return
    if (next === 'solo') {
      const surviving = selectedNote ?? notes[0] ?? MIDDLE_C
      setNotes([surviving])
      setSelectedIdx(0)
    }
    setMode(next)
  }

  function handlePianoSelect(newMidi: number) {
    const newNote = midiToStep(newMidi, accidentalPref)
    if (mode === 'solo') {
      setNotes([newNote])
      setSelectedIdx(0)
      return
    }
    const existingIdx = notes.findIndex((n) => chordNoteMidi(n) === newMidi)
    if (existingIdx >= 0) {
      const next = notes.slice()
      next.splice(existingIdx, 1)
      setNotes(next)
      setSelectedIdx((prev) => {
        if (prev === null) return null
        if (prev === existingIdx) return null
        if (prev > existingIdx) return prev - 1
        return prev
      })
      return
    }
    const added = [...notes, newNote].sort((a, b) => a.step - b.step)
    const newIdx = added.findIndex((n) => chordNoteMidi(n) === newMidi)
    setNotes(added)
    setSelectedIdx(newIdx)
  }

  function handleSelectNote(idx: number) {
    setSelectedIdx(idx)
  }

  function handleTapEmpty(step: number) {
    if (mode === 'solo') {
      // Solo treats tap-on-empty as "place the note here". The single note
      // stays selected.
      setNotes((cur) => [{ step, accidental: cur[0]?.accidental ?? '' }])
      return
    }
    setSelectedIdx(null)
  }

  // Pan with a selection: move the selected note to the new step.
  function handleMoveSelected(step: number) {
    setNotes((cur) => {
      if (selectedIdx === null || selectedIdx < 0 || selectedIdx >= cur.length) return cur
      if (cur[selectedIdx].step === step) return cur
      const next = cur.slice()
      next[selectedIdx] = { ...next[selectedIdx], step }
      return next
    })
  }

  // Pan with no selection: transpose the whole chord so the chord shape stays
  // intact. `newLowest` is the new step for the lowest note.
  function handleTranspose(newLowest: number) {
    setNotes((cur) => {
      if (cur.length === 0) return cur
      const currentLowest = Math.min(...cur.map((n) => n.step))
      const delta = newLowest - currentLowest
      if (delta === 0) return cur
      return cur.map((n) => ({ ...n, step: n.step + delta }))
    })
  }

  // Accidental toggle: applies to the selected note and updates the spelling
  // pref used by future black-key piano taps.
  function handleAccidental(next: Accidental) {
    if (next === '#' || next === 'b') setAccidentalPref(next)
    setNotes((cur) => {
      if (selectedIdx === null || selectedIdx < 0 || selectedIdx >= cur.length) return cur
      if (cur[selectedIdx].accidental === next) return cur
      const arr = cur.slice()
      arr[selectedIdx] = { ...arr[selectedIdx], accidental: next }
      return arr
    })
  }

  function handleClear() {
    setNotes([])
    setSelectedIdx(null)
  }

  return (
    <ScreenLayout scroll={false}>
      <YStack gap="$lg" paddingVertical="$lg" flex={1}>
        <PageHeader title="Piano" />

        <XStack gap="$sm" justifyContent="center">
          <Tab label="Clave de Sol" active={clef === 'treble'} onPress={() => setClef('treble')} />
          <Tab label="Clave de Fá" active={clef === 'bass'} onPress={() => setClef('bass')} />
        </XStack>

        <XStack gap="$sm" justifyContent="center">
          <Tab label="Solo" active={mode === 'solo'} onPress={() => handleMode('solo')} />
          <Tab label="Acorde" active={mode === 'chord'} onPress={() => handleMode('chord')} />
        </XStack>

        <MusicStaff
          clef={clef}
          notes={notes}
          selectedIdx={selectedIdx}
          onSelectNote={handleSelectNote}
          onTapEmpty={handleTapEmpty}
          onMoveSelected={handleMoveSelected}
          onChangeStep={handleTranspose}
        />

        <NoteDisplay notes={notes} accidentalPref={accidentalPref} />

        <XStack gap="$md" justifyContent="center" alignItems="center">
          <AccidentalToggle
            accidental={selectedNote?.accidental ?? ''}
            disabled={!selectedNote}
            onChange={handleAccidental}
          />
          {mode === 'chord' && (
            <Pressable
              onPress={handleClear}
              disabled={notes.length === 0}
              accessibilityRole="button"
            >
              <YStack
                backgroundColor="$backgroundSurface"
                borderRadius="$lg"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                borderWidth={1}
                borderColor="$borderColor"
                opacity={notes.length === 0 ? 0.4 : 1}
              >
                <Text fontFamily="$heading" fontSize="$1" color="$color" letterSpacing={1}>
                  Limpar
                </Text>
              </YStack>
            </Pressable>
          )}
        </XStack>

        <YStack flex={1} justifyContent="flex-end">
          <PianoKeyboard selected={selectedMidis} onSelect={handlePianoSelect} />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

function NoteDisplay({
  notes,
  accidentalPref,
}: {
  notes: ChordNote[]
  accidentalPref: AccidentalPref
}) {
  if (notes.length === 0) {
    return (
      <YStack alignItems="center" gap="$xs">
        <Text fontFamily="$heading" fontSize="$5" color="$colorSecondary" letterSpacing={2}>
          —
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          Toque uma tecla
        </Text>
      </YStack>
    )
  }

  if (notes.length === 1) {
    const { letter, suffix, octave } = getNoteName(notes[0].step, notes[0].accidental)
    const midi = chordNoteMidi(notes[0])
    return (
      <YStack alignItems="center" gap="$xs">
        <Text fontFamily="$heading" fontSize="$5" color="$accent" letterSpacing={2}>
          {letter}
          {suffix}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          {octave}ª oitava
          {midi === 60 ? ' · central' : ''}
        </Text>
      </YStack>
    )
  }

  const chordName = identifyChord(notes.map(chordNoteMidi), accidentalPref)
  const noteList = notes
    .map((n) => {
      const { letter, suffix } = getNoteName(n.step, n.accidental)
      return letter + suffix
    })
    .join(' · ')

  return (
    <YStack alignItems="center" gap="$xs">
      <Text fontFamily="$heading" fontSize="$5" color="$accent" letterSpacing={2}>
        {chordName ?? noteList}
      </Text>
      {chordName && (
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
          {noteList}
        </Text>
      )}
    </YStack>
  )
}

function AccidentalToggle({
  accidental,
  disabled,
  onChange,
}: {
  accidental: Accidental
  disabled: boolean
  onChange: (next: Accidental) => void
}) {
  return (
    <XStack gap="$sm" opacity={disabled ? 0.4 : 1}>
      <AccidentalButton
        glyph="♭"
        active={accidental === 'b'}
        disabled={disabled}
        onPress={() => onChange('b')}
      />
      <AccidentalButton
        glyph="♮"
        active={accidental === ''}
        disabled={disabled}
        onPress={() => onChange('')}
      />
      <AccidentalButton
        glyph="♯"
        active={accidental === '#'}
        disabled={disabled}
        onPress={() => onChange('#')}
      />
    </XStack>
  )
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <YStack
        backgroundColor={active ? '$accent' : '$backgroundSurface'}
        borderRadius="$lg"
        paddingVertical="$sm"
        paddingHorizontal="$md"
      >
        <Text
          fontFamily="$heading"
          fontSize="$2"
          color={active ? '$background' : '$color'}
          letterSpacing={1}
        >
          {label}
        </Text>
      </YStack>
    </Pressable>
  )
}

function AccidentalButton({
  glyph,
  active,
  disabled,
  onPress,
}: {
  glyph: string
  active: boolean
  disabled: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={glyph}
    >
      <YStack
        backgroundColor={active ? '$accent' : '$backgroundSurface'}
        borderRadius="$lg"
        width={48}
        height={48}
        alignItems="center"
        justifyContent="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={24} color={active ? '$background' : '$color'}>
          {glyph}
        </Text>
      </YStack>
    </Pressable>
  )
}
