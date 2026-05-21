import DateTimePicker from '@react-native-community/datetimepicker'
import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

type Preset = { id: string; start: string; end: string }

const PRESETS: Preset[] = [
  { id: 'bedtime', start: '21:00', end: '07:00' },
  { id: 'work', start: '09:00', end: '17:00' },
  { id: 'evening', start: '19:00', end: '23:00' },
  { id: 'morning', start: '06:00', end: '09:00' },
]

const ACCENT_INK = '#0E0D0C'

function parseToDate(value: string): Date {
  const [h, m] = value.split(':')
  const d = new Date()
  d.setHours(Number.parseInt(h, 10) || 0, Number.parseInt(m, 10) || 0, 0, 0)
  return d
}

function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function TimeRange({
  start,
  end,
  onChange,
}: {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [androidEditing, setAndroidEditing] = useState<'start' | 'end' | null>(null)

  const activePreset = PRESETS.find((p) => p.start === start && p.end === end)

  const renderTimePill = (value: string, which: 'start' | 'end') => {
    if (Platform.OS === 'ios') {
      return (
        <DateTimePicker
          value={parseToDate(value)}
          mode="time"
          display="compact"
          onChange={(_, selected) => {
            if (!selected) return
            const next = formatTime(selected)
            if (which === 'start') onChange(next, end)
            else onChange(start, next)
          }}
        />
      )
    }
    return (
      <>
        <Pressable
          onPress={() => setAndroidEditing(which)}
          accessibilityRole="button"
          accessibilityValue={{ text: value }}
        >
          <View
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$accent"
            minWidth={96}
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$3" color="$accent">
              {value}
            </Text>
          </View>
        </Pressable>
        {androidEditing === which && (
          <DateTimePicker
            value={parseToDate(value)}
            mode="time"
            display="default"
            onChange={(_, selected) => {
              setAndroidEditing(null)
              if (!selected) return
              const next = formatTime(selected)
              if (which === 'start') onChange(next, end)
              else onChange(start, next)
            }}
          />
        )}
      </>
    )
  }

  return (
    <YStack gap="$md">
      {/* 2x2 grid of preset chips. Two-row YStack with flex={1} children
          guarantees every chip is identical width regardless of label
          length — the previous flexWrap layout produced an asymmetric
          3-then-1 wrap because labels differed. */}
      <YStack gap="$xs">
        <XStack gap="$xs">
          <PresetChip
            t={t}
            preset={PRESETS[0]}
            active={activePreset?.id === PRESETS[0].id}
            onPress={() => onChange(PRESETS[0].start, PRESETS[0].end)}
          />
          <PresetChip
            t={t}
            preset={PRESETS[1]}
            active={activePreset?.id === PRESETS[1].id}
            onPress={() => onChange(PRESETS[1].start, PRESETS[1].end)}
          />
        </XStack>
        <XStack gap="$xs">
          <PresetChip
            t={t}
            preset={PRESETS[2]}
            active={activePreset?.id === PRESETS[2].id}
            onPress={() => onChange(PRESETS[2].start, PRESETS[2].end)}
          />
          <PresetChip
            t={t}
            preset={PRESETS[3]}
            active={activePreset?.id === PRESETS[3].id}
            onPress={() => onChange(PRESETS[3].start, PRESETS[3].end)}
          />
        </XStack>
      </YStack>

      <XStack alignItems="center" gap="$sm" justifyContent="center">
        {renderTimePill(start, 'start')}
        <View flex={1} height={1} backgroundColor="$accent" opacity={0.4} />
        <View
          width={6}
          height={6}
          borderRadius={3}
          backgroundColor={theme.accent.val}
          opacity={0.6}
        />
        <View flex={1} height={1} backgroundColor="$accent" opacity={0.4} />
        {renderTimePill(end, 'end')}
      </XStack>
    </YStack>
  )
}

function PresetChip({
  t,
  preset,
  active,
  onPress,
}: {
  t: TFunction
  preset: Preset
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ flex: 1 }}
    >
      <YStack
        paddingVertical={10}
        paddingHorizontal="$sm"
        borderRadius={14}
        borderWidth={1}
        borderColor={active ? '$accent' : '$borderColor'}
        backgroundColor={active ? '$accent' : 'transparent'}
        alignItems="center"
        gap={2}
      >
        <Text fontFamily="$body" fontSize="$2" color={active ? ACCENT_INK : '$color'}>
          {t(`custody.editor.fencePreset.${preset.id}.label`)}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color={active ? ACCENT_INK : '$colorSecondary'}>
          {preset.start}–{preset.end}
        </Text>
      </YStack>
    </Pressable>
  )
}
