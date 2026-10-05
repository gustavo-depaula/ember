import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import DateTimePicker from '@react-native-community/datetimepicker'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { pullDown } from '@/components/sheetController'
import { dayKeys } from '@/config/constants'
import { lightTap } from '@/lib/haptics'

import { phrasing } from '../phrasing'
import type { Schedule } from '../schedule'

/**
 * A native sheet sized to its content. The native host gives the RN tree no
 * height of its own, so the sheet measures what it holds and resizes to it —
 * also while open, when the time opens into its wheel. Content taller than the
 * screen allows scrolls inside the sheet at its tallest.
 */
export function RuleSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const theme = useTheme()
  const { height } = useWindowDimensions()
  const [measured, setMeasured] = useState(height * 0.4)
  // The grabber above and the home indicator's inset below the content.
  const chrome = 56
  const maxFraction = 0.92
  const overflows = measured + chrome > height * maxFraction
  const fraction = overflows ? maxFraction : (measured + chrome) / height
  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${Math.round(fraction * 1000) / 10}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * fraction} width="100%">
        <ScrollView
          {...pullDown(onClose)}
          // A sheet that fits leaves every drag to the sheet itself.
          scrollEnabled={overflows}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: overflows ? chrome : 0 }}
        >
          <YStack
            paddingHorizontal="$lg"
            paddingTop="$lg"
            paddingBottom="$sm"
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height
              setMeasured((prev) => (Math.abs(prev - h) < 1 ? prev : h))
            }}
          >
            <Typography variant="sacred-title" fontSize={26} lineHeight={34} textAlign="center">
              {title}
            </Typography>
            {children}
          </YStack>
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}

/** A choice set in type: the chosen one inked, the rest in the secondary ink. */
function Stamp({
  label,
  a11yLabel,
  selected,
  struck = false,
  onPress,
  role = 'button',
}: {
  label: string
  a11yLabel?: string
  selected: boolean
  struck?: boolean
  onPress: () => void
  role?: 'button' | 'radio' | 'checkbox'
}) {
  return (
    <Pressable
      onPress={() => {
        lightTap()
        onPress()
      }}
      hitSlop={4}
      accessibilityRole={role}
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ selected, checked: selected }}
      aria-selected={selected}
      aria-checked={selected}
    >
      <YStack
        minWidth={44}
        minHeight={44}
        paddingHorizontal={12}
        alignItems="center"
        justifyContent="center"
        borderRadius={1}
        backgroundColor={selected ? '$color' : 'transparent'}
      >
        <Typography
          fontSize={21}
          lineHeight={28}
          color={selected ? '$background' : '$colorSecondary'}
          textDecorationLine={struck && !selected ? 'line-through' : 'none'}
          opacity={struck && !selected ? 0.5 : 1}
        >
          {label}
        </Typography>
      </YStack>
    </Pressable>
  )
}

function Hairline() {
  return <YStack height={0.5} backgroundColor="$borderColor" marginVertical="$md" />
}

function SheetAction({
  label,
  onPress,
  disabled = false,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Typography fontSize={21} color="$colorBurgundy" opacity={disabled ? 0.4 : 1}>
        {label}
      </Typography>
    </Pressable>
  )
}

/** The other time that holds a weekday. */
export type TakenBy = { id: string; time?: string }

type Kind = 'week' | 'month' | 'holy'
type Draft = { kind: Kind; days: number[]; n: number[]; day: number; time: string }

function draftOf(schedule: Schedule, time: string): Draft {
  const base = { kind: 'week' as Kind, days: [] as number[], n: [1], day: 6, time }
  switch (schedule.type) {
    case 'daily':
      return { ...base, days: [0, 1, 2, 3, 4, 5, 6] }
    case 'days-of-week':
      return { ...base, days: schedule.days }
    case 'nth-weekday':
      return { ...base, kind: 'month', n: schedule.n, day: schedule.day }
    case 'day-of-month':
      return { ...base, kind: 'month', n: [] }
    case 'holy-days-of-obligation':
      return { ...base, kind: 'holy' }
    default:
      return { ...base, days: [0, 1, 2, 3, 4, 5, 6] }
  }
}

function scheduleOf(draft: Draft, seasons: Schedule['seasons']): Schedule {
  const base = seasons?.length ? { seasons } : {}
  if (draft.kind === 'holy') return { type: 'holy-days-of-obligation', ...base }
  if (draft.kind === 'month') return { type: 'nth-weekday', n: draft.n, day: draft.day, ...base }
  if (draft.days.length === 7) return { type: 'daily', ...base }
  return { type: 'days-of-week', days: [...draft.days].sort((a, b) => a - b), ...base }
}

// Sunday-first, as a wall calendar reads.
const weekDays = [0, 1, 2, 3, 4, 5, 6]
const ordinals = [1, 2, 3, 4, -1]

/**
 * Days and hour of one time in the rule — the same sheet adds a time, edits
 * one, or asks for the hour a practice is added with. `fields` narrows it to
 * the days (a clause of several times) or the hour (a program's fixed days).
 * `taken` marks days another time of the same hour already holds; picking one
 * claims it, and `onConfirm` reports the claim so the caller can release it.
 */
export function WhenSheet({
  open,
  onClose,
  title,
  schedule,
  time,
  fields = 'both',
  taken,
  confirmLabel,
  onConfirm,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  title: string
  schedule: Schedule
  time: string
  fields?: 'both' | 'days' | 'time'
  taken?: Map<number, TakenBy>
  confirmLabel: string
  onConfirm: (result: { schedule: Schedule; time: string; claimed: number[] }) => void
  onRemove?: () => void
}) {
  const { t, i18n } = useTranslation()
  const words = phrasing(i18n.language)
  const [draft, setDraft] = useState(() => draftOf(schedule, time))

  // Each opening starts from the time being edited.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only on open
  useEffect(() => {
    if (open) setDraft(draftOf(schedule, time))
  }, [open])

  const showDays = fields !== 'time'
  const showTime = fields !== 'days'
  const valid =
    draft.kind === 'holy' || (draft.kind === 'week' ? draft.days.length > 0 : draft.n.length > 0)
  const claimed = draft.kind === 'week' ? draft.days.filter((d) => taken?.has(d)) : []
  // An office's hour is kept by weekday; the other kinds don't apply to it.
  const byWeekday = !!taken?.size

  const toggle = (list: number[], x: number) =>
    list.includes(x) ? list.filter((y) => y !== x) : [...list, x]

  // Days still held elsewhere, one clause per time that holds them.
  const hint = (() => {
    if (draft.kind !== 'week' || !taken?.size) return undefined
    const byTime = new Map<string | undefined, number[]>()
    for (const [d, by] of taken) {
      if (draft.days.includes(d)) continue
      byTime.set(by.time, [...(byTime.get(by.time) ?? []), d])
    }
    const groups = [...byTime]
    if (groups.length === 0) return undefined
    const others =
      groups.length === 1 && draft.days.length > 0 && groups[0][1].length + draft.days.length === 7
    return groups.map(([time, days]) => words.taken(days, time, others)).join('; ')
  })()

  return (
    <RuleSheet open={open} onClose={onClose} title={title}>
      {showDays ? (
        <>
          <Hairline />
          {byWeekday ? null : (
            <XStack justifyContent="center" gap={6} paddingBottom="$md">
              {(['week', 'month', 'holy'] as const).map((kind) => (
                <Stamp
                  key={kind}
                  role="radio"
                  label={t(`rule.kind.${kind}`)}
                  selected={draft.kind === kind}
                  onPress={() => setDraft((d) => ({ ...d, kind }))}
                />
              ))}
            </XStack>
          )}
          {draft.kind === 'week' ? (
            <XStack justifyContent="center" gap={2}>
              {weekDays.map((d) => (
                <Stamp
                  key={d}
                  role="checkbox"
                  label={t(`day.${dayKeys[d]}`).charAt(0)}
                  a11yLabel={t(`day.${dayKeys[d]}`)}
                  selected={draft.days.includes(d)}
                  struck={taken?.has(d)}
                  onPress={() => setDraft((x) => ({ ...x, days: toggle(x.days, d) }))}
                />
              ))}
            </XStack>
          ) : null}
          {hint ? (
            <Typography
              fontSize={17}
              lineHeight={23}
              color="$colorSecondary"
              textAlign="center"
              paddingTop="$sm"
            >
              {hint}
            </Typography>
          ) : null}
          {draft.kind === 'month' ? (
            <YStack gap="$sm">
              <XStack justifyContent="center" gap={2}>
                {ordinals.map((n) => (
                  <Stamp
                    key={n}
                    role="checkbox"
                    label={t(`rule.ordinal.${n === -1 ? 'last' : n}`)}
                    selected={draft.n.includes(n)}
                    onPress={() => setDraft((x) => ({ ...x, n: toggle(x.n, n) }))}
                  />
                ))}
              </XStack>
              <XStack justifyContent="center" gap={2}>
                {weekDays.map((d) => (
                  <Stamp
                    key={d}
                    role="radio"
                    label={t(`day.${dayKeys[d]}`).charAt(0)}
                    a11yLabel={t(`day.${dayKeys[d]}`)}
                    selected={draft.day === d}
                    onPress={() => setDraft((x) => ({ ...x, day: d }))}
                  />
                ))}
              </XStack>
              {valid ? (
                <Typography
                  fontSize={17}
                  lineHeight={23}
                  color="$colorSecondary"
                  textAlign="center"
                >
                  {words.days(scheduleOf(draft, schedule.seasons))}
                </Typography>
              ) : null}
            </YStack>
          ) : null}
        </>
      ) : null}

      {showTime ? (
        <>
          <Hairline />
          <TimeFace
            open={open}
            value={draft.time}
            onChange={(time) => setDraft((d) => ({ ...d, time }))}
          />
        </>
      ) : null}

      <Hairline />
      <SheetAction
        label={confirmLabel}
        disabled={!valid}
        onPress={() =>
          onConfirm({ schedule: scheduleOf(draft, schedule.seasons), time: draft.time, claimed })
        }
      />
      {onRemove ? <SheetAction label={t('rule.removeTime')} onPress={onRemove} /> : null}
    </RuleSheet>
  )
}

/**
 * The hour set as a clock face in the page's own type; a tap opens the wheel
 * under it. The wheel is the system's, in its own face, so it shows only
 * while the hour is being turned.
 */
function TimeFace({
  open,
  value,
  onChange,
}: {
  open: boolean
  value: string
  onChange: (time: string) => void
}) {
  const { t, i18n } = useTranslation()
  const [turning, setTurning] = useState(false)
  useEffect(() => {
    if (!open) setTurning(false)
  }, [open])

  return (
    <YStack alignItems="center">
      <Pressable
        onPress={() => {
          lightTap()
          setTurning((x) => !x)
        }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.ruleEditTime', { time: value })}
        accessibilityState={{ expanded: turning }}
        aria-expanded={turning}
        style={{ alignItems: 'center', minHeight: 44 }}
      >
        <Typography fontSize={36} lineHeight={46} letterSpacing={1}>
          {phrasing(i18n.language).clock(value)}
        </Typography>
        {turning ? null : (
          <Typography fontSize={17} lineHeight={23} color="$colorSecondary">
            {t('rule.tapToChange')}
          </Typography>
        )}
      </Pressable>
      {turning ? (
        <TimeWheel value={value} onChange={onChange} onDone={() => setTurning(false)} />
      ) : null}
    </YStack>
  )
}

function TimeWheel({
  value,
  onChange,
  onDone,
}: {
  value: string
  onChange: (time: string) => void
  onDone: () => void
}) {
  const [h, m] = value.split(':').map(Number)
  const date = new Date(2000, 0, 1, h || 0, m || 0)
  const pick = (selected: Date | undefined) => {
    if (!selected) return
    const hh = String(selected.getHours()).padStart(2, '0')
    const mm = String(selected.getMinutes()).padStart(2, '0')
    onChange(`${hh}:${mm}`)
  }

  // Android's picker is a dialog of its own, closed by its own buttons.
  if (Platform.OS !== 'ios') {
    return (
      <DateTimePicker
        value={date}
        mode="time"
        display="default"
        onChange={(_, selected) => {
          onDone()
          pick(selected)
        }}
      />
    )
  }
  return (
    <DateTimePicker
      value={date}
      mode="time"
      display="spinner"
      minuteInterval={5}
      onChange={(_, selected) => pick(selected)}
      style={{ height: 216 }}
    />
  )
}

/** A short list of choices, each with the line that explains it. */
export function ChoiceSheet<K extends string>({
  open,
  onClose,
  title,
  options,
  selected,
  onPick,
}: {
  open: boolean
  onClose: () => void
  title: string
  options: { key: K; label: string; description?: string }[]
  selected?: K
  onPick: (key: K) => void
}) {
  return (
    <RuleSheet open={open} onClose={onClose} title={title}>
      <Hairline />
      <YStack marginHorizontal={-8}>
        {options.map((option) => {
          const isSelected = option.key === selected
          return (
            <Pressable
              key={option.key}
              onPress={() => {
                lightTap()
                onPick(option.key)
              }}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              accessibilityState={{ selected: isSelected }}
              aria-selected={isSelected}
            >
              <YStack
                paddingHorizontal={8}
                paddingVertical={10}
                borderRadius={1}
                backgroundColor={isSelected ? '$color' : 'transparent'}
              >
                <Typography
                  fontSize={21}
                  lineHeight={28}
                  color={isSelected ? '$background' : '$colorSecondary'}
                >
                  {option.label}
                </Typography>
                {option.description ? (
                  <Typography
                    fontSize={17}
                    lineHeight={23}
                    color={isSelected ? '$background' : '$colorSecondary'}
                    opacity={0.8}
                  >
                    {option.description}
                  </Typography>
                ) : null}
              </YStack>
            </Pressable>
          )
        })}
      </YStack>
    </RuleSheet>
  )
}
