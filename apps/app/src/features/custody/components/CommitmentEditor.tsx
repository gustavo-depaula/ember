import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronDown, ChevronRight, X } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { BottomSheet } from '@/components'
import { randomId } from '@/lib/id'

import { useCommitment, useCreateCommitment, useUpdateCommitment } from '../hooks'
import { getCustodyNative } from '../native'
import { scheduleNudgesForCommitment } from '../notifications'
import { COMMITMENT_TEMPLATES } from '../templates'
import type {
  CommitmentInput,
  CommitmentKind,
  Friction,
  FrictionConfig,
  Schedule,
  Target,
} from '../types'

import { FrictionPicker } from './FrictionPicker'
import { TargetPicker } from './TargetPicker'

type Mode = { kind: 'new' } | { kind: 'edit'; commitmentId: string }

// Days are JS-style: 0=Sun, 1=Mon … 6=Sat. UI orders them Mon-first per Opal /
// most calendar apps; the schedule struct holds them in JS-native order.
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const DEFAULT_SCHEDULE: Schedule = { type: 'daily' }
const KIND_CHIPS: { kind: CommitmentKind; label: string }[] = [
  { kind: 'abstain', label: 'Always' },
  { kind: 'time-fence', label: 'Hours' },
  { kind: 'time-limit', label: 'Daily limit' },
]
const FRICTION_LABELS: Record<Friction, string> = {
  none: 'Instant disable',
  wait: 'Wait to disable',
  prayer: 'Pray to disable',
}
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon-first

type EditorState = {
  name: string
  emoji: string
  tint: string
  kind: CommitmentKind
  targets: Target[]
  schedule: Schedule
  friction: Friction
  frictionConfig: FrictionConfig | null
  fenceStart: string
  fenceEnd: string
  limitMinutes: string
}

const DEFAULT_TINT = '#6E5C32' // ember gold subtle

function emptyState(): EditorState {
  return {
    name: 'New commitment',
    emoji: '🛡️',
    tint: DEFAULT_TINT,
    kind: 'abstain',
    targets: [],
    schedule: DEFAULT_SCHEDULE,
    friction: 'none',
    frictionConfig: null,
    fenceStart: '21:00',
    fenceEnd: '07:00',
    limitMinutes: '30',
  }
}

function fromTemplate(templateId: string): EditorState {
  const tpl = COMMITMENT_TEMPLATES.find((t) => t.id === templateId)
  if (!tpl) return emptyState()
  const input = tpl.build()
  return {
    name: input.name,
    emoji: tpl.emoji,
    tint: tpl.tint,
    kind: input.kind,
    targets: input.targets,
    schedule: input.schedule,
    friction: input.friction,
    frictionConfig: input.frictionConfig ?? null,
    fenceStart: input.fenceStart ?? '21:00',
    fenceEnd: input.fenceEnd ?? '07:00',
    limitMinutes: input.limitSeconds ? String(input.limitSeconds / 60) : '30',
  }
}

function toInput(state: EditorState): CommitmentInput | undefined {
  if (!state.name.trim()) return undefined
  if (state.targets.length === 0) return undefined
  const input: CommitmentInput = {
    name: state.name.trim(),
    kind: state.kind,
    targets: state.targets,
    schedule: state.schedule,
    friction: state.friction,
    frictionConfig: state.frictionConfig ?? undefined,
  }
  if (state.kind === 'time-fence') {
    input.fenceStart = state.fenceStart
    input.fenceEnd = state.fenceEnd
  }
  if (state.kind === 'time-limit') {
    const minutes = Number.parseInt(state.limitMinutes, 10)
    if (!Number.isNaN(minutes) && minutes > 0) input.limitSeconds = minutes * 60
  }
  return input
}

function selectedDays(schedule: Schedule): number[] {
  if (schedule.type === 'days-of-week') return schedule.days
  return ALL_DAYS
}

function scheduleFromDays(days: number[], existing: Schedule): Schedule {
  const seasons = existing.seasons
  if (days.length === 0 || days.length === 7) {
    return seasons ? { type: 'daily', seasons } : { type: 'daily' }
  }
  return seasons ? { type: 'days-of-week', days, seasons } : { type: 'days-of-week', days }
}

function summarizeTargets(targets: Target[]): string {
  if (targets.length === 0) return 'None'
  const apps = targets.filter((t) => t.kind === 'ios-app' || t.kind === 'ios-category').length
  const domains = targets.filter((t) => t.kind === 'domain').length
  const lists = targets.filter((t) => t.kind === 'domain-list').length
  const parts: string[] = []
  if (apps > 0) parts.push(`${apps} app${apps === 1 ? '' : 's'}`)
  if (domains > 0) parts.push(`${domains} domain${domains === 1 ? '' : 's'}`)
  if (lists > 0) parts.push(`${lists} list${lists === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

function summarizeKind(state: EditorState): string {
  if (state.kind === 'time-fence') return `${state.fenceStart}–${state.fenceEnd}`
  if (state.kind === 'time-limit') return `Max ${state.limitMinutes} min / day`
  return 'Always'
}

function summarizeDays(schedule: Schedule): string {
  const days = selectedDays(schedule)
  if (days.length === 7) return 'Daily'
  if (days.length === 0) return 'No days'
  // Weekdays = Mon–Fri ≡ 1..5
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) return 'Weekdays'
  if (days.length === 2 && [0, 6].every((d) => days.includes(d))) return 'Weekends'
  return days
    .slice()
    .sort()
    .map((d) => WEEK_LABELS[WEEK_ORDER.indexOf(d)])
    .join(' ')
}

function overlineFor(state: EditorState): string {
  const k =
    state.kind === 'time-fence' ? 'HOURS' : state.kind === 'time-limit' ? 'LIMIT' : 'ABSTAIN'
  return `${k} · ${summarizeDays(state.schedule).toUpperCase()}`
}

export function CommitmentEditor({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { template: templateParam } = useLocalSearchParams<{ template?: string }>()

  const editingId = mode.kind === 'edit' ? mode.commitmentId : undefined
  const { data: existing } = useCommitment(editingId)
  const create = useCreateCommitment()
  const update = useUpdateCommitment()

  const draftId = useMemo(() => editingId ?? randomId(), [editingId])
  const [state, setState] = useState<EditorState>(() =>
    mode.kind === 'new' && templateParam ? fromTemplate(templateParam) : emptyState(),
  )
  // Sheet routing — null = closed, otherwise the picker key.
  const [openSheet, setOpenSheet] = useState<'targets' | 'override' | null>(null)

  useEffect(() => {
    if (mode.kind === 'edit' && existing) {
      // Look up tint via the template the user originally picked (if any
      // — we don't store it). Falls back to the gold subtle.
      const tpl = COMMITMENT_TEMPLATES.find((t) => t.name === existing.name)
      setState({
        name: existing.name,
        emoji: tpl?.emoji ?? '🛡️',
        tint: tpl?.tint ?? DEFAULT_TINT,
        kind: existing.kind,
        targets: existing.targets,
        schedule: existing.schedule,
        friction: existing.friction,
        frictionConfig: existing.friction_config,
        fenceStart: existing.fence_start ?? '21:00',
        fenceEnd: existing.fence_end ?? '07:00',
        limitMinutes: existing.limit_seconds ? String(existing.limit_seconds / 60) : '30',
      })
    }
  }, [mode.kind, existing])

  const input = toInput(state)
  const isSaving = create.isPending || update.isPending
  const canSave = !!input && !isSaving

  const onSave = async () => {
    if (!input || isSaving) return
    const native = getCustodyNative()
    if (native.isSupported()) {
      const status = await native.getAuthorizationStatus()
      if (status === 'notDetermined') await native.requestAuthorization()
    }
    if (mode.kind === 'new') {
      const created = await create.mutateAsync({ ...input, id: draftId })
      await scheduleNudgesForCommitment(created)
    } else {
      const updated = await update.mutateAsync({ id: mode.commitmentId, patch: input })
      await scheduleNudgesForCommitment(updated)
    }
    router.back()
  }

  const saveLabel =
    mode.kind === 'edit'
      ? 'Save changes'
      : templateParam
        ? 'Begin custody'
        : t('custody.commitments.create')

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Soft radial wash of the template tint, bleeding from the top.
          Two overlapping discs give a smoother falloff than one. */}
      <View
        position="absolute"
        top={-220}
        left={-80}
        right={-80}
        height={480}
        borderRadius={9999}
        backgroundColor={state.tint}
        opacity={0.18}
        pointerEvents="none"
      />
      <View
        position="absolute"
        top={-120}
        left={40}
        right={40}
        height={320}
        borderRadius={9999}
        backgroundColor={state.tint}
        opacity={0.14}
        pointerEvents="none"
      />

      {/* Close (chevron-down) — top-left, translucent disc. */}
      <View position="absolute" top={insets.top + 8} left={16} zIndex={20}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <View
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor="rgba(255,255,255,0.06)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.10)"
            alignItems="center"
            justifyContent="center"
          >
            <ChevronDown size={18} color={theme.color.val} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 56,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero — emoji disc, overline, name input */}
        <YStack alignItems="center" gap="$md" paddingBottom="$xl">
          <View
            width={88}
            height={88}
            borderRadius={44}
            backgroundColor="rgba(255,255,255,0.04)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.10)"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={44}>{state.emoji}</Text>
          </View>
          <Text
            fontFamily="$body"
            fontSize="$1"
            color="$colorSecondary"
            letterSpacing={2}
            textAlign="center"
          >
            {overlineFor(state)}
          </Text>
          <YStack alignItems="center" gap={4} width="100%">
            <TextInput
              value={state.name}
              onChangeText={(name) => setState((s) => ({ ...s, name }))}
              placeholder="Name this commitment"
              placeholderTextColor={theme.colorSecondary.val}
              selectTextOnFocus
              style={{
                fontFamily: 'EBGaramond_500Medium',
                fontSize: 26,
                textAlign: 'center',
                color: theme.color.val,
                minWidth: 240,
                paddingVertical: 4,
              }}
            />
            <View height={1} width={160} backgroundColor="$accent" opacity={0.5} />
          </YStack>
        </YStack>

        {/* Settings card */}
        <YStack
          borderRadius="$lg"
          backgroundColor="rgba(255,255,255,0.03)"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.06)"
          overflow="hidden"
        >
          <SettingRow
            label="Apps & Sites"
            value={summarizeTargets(state.targets)}
            highlight={state.targets.length === 0}
            onPress={() => setOpenSheet('targets')}
          />
          <Divider />
          <ScheduleBlock state={state} setState={setState} />
          <Divider />
          <SettingRow
            label="Override"
            value={FRICTION_LABELS[state.friction]}
            onPress={() => setOpenSheet('override')}
          />
        </YStack>
      </ScrollView>

      {/* Pinned Save button */}
      <YStack paddingHorizontal="$lg" paddingTop="$md" paddingBottom={Math.max(insets.bottom, 16)}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <View
            paddingVertical={16}
            borderRadius={28}
            backgroundColor={canSave ? '$accent' : 'rgba(255,255,255,0.08)'}
            alignItems="center"
          >
            <Text
              fontFamily="$heading"
              fontSize="$3"
              color={canSave ? '#0E0D0C' : '$colorSecondary'}
            >
              {saveLabel}
            </Text>
          </View>
        </Pressable>
      </YStack>

      {/* Sheets — sub-pickers */}
      <BottomSheet
        visible={openSheet === 'targets'}
        onClose={() => setOpenSheet(null)}
        maxHeight="85%"
      >
        <SheetHeader title="Apps & Sites" onClose={() => setOpenSheet(null)} />
        <TargetPicker
          commitmentId={draftId}
          targets={state.targets}
          onChange={(targets) => setState((s) => ({ ...s, targets }))}
        />
      </BottomSheet>

      <BottomSheet visible={openSheet === 'override'} onClose={() => setOpenSheet(null)}>
        <SheetHeader title="When you try to disable" onClose={() => setOpenSheet(null)} />
        <FrictionPicker
          value={state.friction}
          config={state.frictionConfig}
          onChange={(friction, frictionConfig) =>
            setState((s) => ({ ...s, friction, frictionConfig }))
          }
        />
      </BottomSheet>
    </YStack>
  )
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const theme = useTheme()
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingBottom="$xs">
      <Text fontFamily="$heading" fontSize="$4" color="$color">
        {title}
      </Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
      >
        <View
          width={28}
          height={28}
          borderRadius={14}
          backgroundColor="$backgroundSurface"
          alignItems="center"
          justifyContent="center"
        >
          <X size={14} color={theme.colorSecondary?.val} />
        </View>
      </Pressable>
    </XStack>
  )
}

function SettingRow({
  label,
  value,
  highlight,
  onPress,
}: {
  label: string
  value: string
  highlight?: boolean
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <XStack alignItems="center" paddingHorizontal="$md" paddingVertical="$md" gap="$sm">
        <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
          {label}
        </Text>
        <Text
          fontFamily="$body"
          fontSize="$2"
          color={highlight ? '$accent' : '$colorSecondary'}
          numberOfLines={1}
          maxWidth={200}
        >
          {value}
        </Text>
        <ChevronRight size={16} color={theme.colorSecondary?.val} />
      </XStack>
    </Pressable>
  )
}

function ScheduleBlock({
  state,
  setState,
}: {
  state: EditorState
  setState: React.Dispatch<React.SetStateAction<EditorState>>
}) {
  return (
    <YStack paddingHorizontal="$md" paddingVertical="$md" gap="$md">
      <XStack alignItems="center" gap="$sm">
        <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
          Schedule
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" numberOfLines={1}>
          {summarizeKind(state)}
        </Text>
      </XStack>

      {/* Kind chips */}
      <XStack gap="$xs">
        {KIND_CHIPS.map(({ kind, label }) => {
          const selected = kind === state.kind
          return (
            <Pressable
              key={kind}
              onPress={() => setState((s) => ({ ...s, kind }))}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{ flex: 1 }}
            >
              <View
                paddingVertical={8}
                borderRadius={999}
                borderWidth={1}
                borderColor={selected ? '$accent' : 'rgba(255,255,255,0.10)'}
                backgroundColor={selected ? '$accent' : 'transparent'}
                alignItems="center"
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? '#0E0D0C' : '$color'}>
                  {label}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </XStack>

      {state.kind === 'time-fence' && (
        <TimeRange
          start={state.fenceStart}
          end={state.fenceEnd}
          onChange={(fenceStart, fenceEnd) => setState((s) => ({ ...s, fenceStart, fenceEnd }))}
        />
      )}
      {state.kind === 'time-limit' && (
        <DailyLimit
          minutes={state.limitMinutes}
          onChange={(limitMinutes) => setState((s) => ({ ...s, limitMinutes }))}
        />
      )}

      <DayPicker
        schedule={state.schedule}
        onChange={(schedule) => setState((s) => ({ ...s, schedule }))}
      />
    </YStack>
  )
}

function TimeRange({
  start,
  end,
  onChange,
}: {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}) {
  const theme = useTheme()
  const pill = {
    fontFamily: 'EBGaramond_500Medium',
    fontSize: 22,
    color: theme.color.val,
    textAlign: 'center' as const,
    minWidth: 96,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 14,
  }
  return (
    <XStack alignItems="center" gap="$sm" justifyContent="center">
      <TextInput
        value={start}
        onChangeText={(v) => onChange(v, end)}
        placeholder="21:00"
        placeholderTextColor={theme.colorSecondary.val}
        style={pill}
      />
      <View flex={1} height={1} backgroundColor="$accent" opacity={0.4} />
      <View width={6} height={6} borderRadius={3} backgroundColor="$accent" opacity={0.6} />
      <View flex={1} height={1} backgroundColor="$accent" opacity={0.4} />
      <TextInput
        value={end}
        onChangeText={(v) => onChange(start, v)}
        placeholder="07:00"
        placeholderTextColor={theme.colorSecondary.val}
        style={pill}
      />
    </XStack>
  )
}

function DailyLimit({
  minutes,
  onChange,
}: {
  minutes: string
  onChange: (minutes: string) => void
}) {
  const theme = useTheme()
  return (
    <XStack alignItems="center" gap="$sm" justifyContent="center">
      <TextInput
        value={minutes}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={{
          fontFamily: 'EBGaramond_500Medium',
          fontSize: 22,
          color: theme.color.val,
          textAlign: 'center',
          minWidth: 80,
          paddingVertical: 10,
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          borderRadius: 14,
        }}
      />
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        minutes per day
      </Text>
    </XStack>
  )
}

function DayPicker({
  schedule,
  onChange,
}: {
  schedule: Schedule
  onChange: (next: Schedule) => void
}) {
  const days = selectedDays(schedule)
  const toggle = (day: number) => {
    const set = new Set(days)
    if (set.has(day)) set.delete(day)
    else set.add(day)
    onChange(scheduleFromDays([...set].sort(), schedule))
  }

  return (
    <YStack gap="$xs">
      <Text
        fontFamily="$body"
        fontSize="$1"
        color="$colorSecondary"
        letterSpacing={1.5}
        textTransform="uppercase"
      >
        On these days
      </Text>
      <XStack gap="$xs" justifyContent="space-between">
        {WEEK_ORDER.map((day, idx) => {
          const selected = days.includes(day)
          return (
            <Pressable
              key={day}
              onPress={() => toggle(day)}
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${WEEK_LABELS[idx]}`}
              accessibilityState={{ selected }}
            >
              <View
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor={selected ? '$accent' : 'transparent'}
                borderWidth={1}
                borderColor={selected ? '$accent' : 'rgba(255,255,255,0.18)'}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color={selected ? '#0E0D0C' : '$colorSecondary'}
                >
                  {WEEK_LABELS[idx]}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}

function Divider() {
  return <View height={1} backgroundColor="rgba(255,255,255,0.06)" />
}
