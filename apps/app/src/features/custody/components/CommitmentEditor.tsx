import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { TFunction } from 'i18next'
import { ChevronDown, ChevronRight, X } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, TextInput, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'
import { randomId } from '@/lib/id'

import { useCommitment, useCreateCommitment, useUpdateCommitment } from '../hooks'
import { getCustodyNative } from '../native'
import { scheduleNudgesForCommitment } from '../notifications'
import { COMMITMENT_TEMPLATES } from '../templates'
import { isValidHHmm } from '../time'
import type {
  CommitmentInput,
  CommitmentKind,
  Friction,
  FrictionConfig,
  Schedule,
  Target,
} from '../types'
import { selectedDays, WEEK_LABELS, WEEK_ORDER } from '../weekDays'

// Hardcoded dark ink for text on the gold accent button. Goes through both
// themes — gold is gold in both, dark ink reads in both. A $background-style
// token would invert under light theme and break contrast.
const ACCENT_INK = '#0E0D0C'

import { DailyLimit } from './DailyLimit'
import { DayPicker } from './DayPicker'
import { FrictionPicker } from './FrictionPicker'
import { TargetPicker } from './TargetPicker'
import { TimeRange } from './TimeRange'

type Mode = { kind: 'new' } | { kind: 'edit'; commitmentId: string }

const KIND_OPTIONS: CommitmentKind[] = ['abstain', 'time-fence', 'time-limit']
const DEFAULT_SCHEDULE: Schedule = { type: 'daily' }
const DEFAULT_TINT = '#6E5C32' // ember gold subtle — bypasses tokens; tint comes from templates
// Cap on the daily-limit minutes the editor will accept. 12h is more than
// enough for any sane commitment and rejects "9999 min" typos that would
// otherwise produce a no-op limit.
const MAX_LIMIT_MINUTES = 720

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

function emptyState(): EditorState {
  return {
    name: '',
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
  // Zero-day days-of-week schedule = never active. Reject so Save disables and
  // the editor can surface a 'pick a day' hint.
  if (selectedDays(state.schedule).length === 0) return undefined
  const input: CommitmentInput = {
    name: state.name.trim(),
    kind: state.kind,
    targets: state.targets,
    schedule: state.schedule,
    friction: state.friction,
    frictionConfig: state.frictionConfig ?? undefined,
  }
  if (state.kind === 'time-fence') {
    // Both must be HH:mm; identical times yield a zero-width fence.
    // (Overnight wrap is fine — handled in schedule.ts via setDate+1.)
    if (!isValidHHmm(state.fenceStart) || !isValidHHmm(state.fenceEnd)) return undefined
    if (state.fenceStart === state.fenceEnd) return undefined
    input.fenceStart = state.fenceStart
    input.fenceEnd = state.fenceEnd
  }
  if (state.kind === 'time-limit') {
    const minutes = Number.parseInt(state.limitMinutes, 10)
    if (Number.isNaN(minutes) || minutes <= 0 || minutes > MAX_LIMIT_MINUTES) return undefined
    input.limitSeconds = minutes * 60
  }
  return input
}

function summarizeTargets(t: TFunction, targets: Target[]): string {
  if (targets.length === 0) return t('custody.editor.summary.targetsNone')
  const apps = targets.filter((tg) => tg.kind === 'ios-app' || tg.kind === 'ios-category').length
  const domains = targets.filter((tg) => tg.kind === 'domain').length
  const lists = targets.filter((tg) => tg.kind === 'domain-list').length
  const parts: string[] = []
  if (apps > 0) parts.push(t('custody.editor.targets.apps', { count: apps }))
  if (domains > 0) parts.push(t('custody.editor.targets.domains', { count: domains }))
  if (lists > 0) parts.push(t('custody.editor.targets.lists', { count: lists }))
  return parts.join(' · ')
}

function summarizeKind(t: TFunction, state: EditorState): string {
  if (state.kind === 'time-fence') {
    return t('custody.editor.summary.fence', { start: state.fenceStart, end: state.fenceEnd })
  }
  if (state.kind === 'time-limit') {
    return t('custody.editor.summary.limit', { count: state.limitMinutes })
  }
  return t('custody.editor.summary.kindAlways')
}

function summarizeDays(t: TFunction, schedule: Schedule): string {
  const days = selectedDays(schedule)
  if (days.length === 7) return t('custody.editor.summary.daysDaily')
  if (days.length === 0) return t('custody.editor.summary.daysNone')
  if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
    return t('custody.editor.summary.daysWeekdays')
  }
  if (days.length === 2 && [0, 6].every((d) => days.includes(d))) {
    return t('custody.editor.summary.daysWeekends')
  }
  return days
    .slice()
    .sort()
    .map((d) => WEEK_LABELS[WEEK_ORDER.indexOf(d)])
    .join(' ')
}

function overlineFor(t: TFunction, state: EditorState): string {
  const kindLabel = t(`custody.editor.overline.${state.kind}`)
  const daysLabel = summarizeDays(t, state.schedule).toUpperCase()
  return `${kindLabel} · ${daysLabel}`
}

export function CommitmentEditor({ mode }: { mode: Mode }) {
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { t } = useTranslation()
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
      const tpl = COMMITMENT_TEMPLATES.find((tp) => tp.name === existing.name)
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
      ? t('custody.editor.save.edit')
      : templateParam
        ? t('custody.editor.save.template')
        : t('custody.editor.save.create')

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Close (chevron-down) — top-left, translucent disc. Stays fixed
          while the rest of the editor scrolls. 44×44 to clear HIG. */}
      <View position="absolute" top={insets.top + 8} left={16} zIndex={20}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('custody.editor.a11y.close')}
          hitSlop={8}
        >
          <View
            width={44}
            height={44}
            borderRadius={22}
            backgroundColor="rgba(255,255,255,0.06)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.10)"
            alignItems="center"
            justifyContent="center"
          >
            <ChevronDown size={20} color={theme.color.val} />
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero — emoji disc, overline, name input.
            The radial template-tint wash lives INSIDE this region so it
            scrolls away with the hero. Two overlapping discs give a soft
            falloff. Negative left/right let the glow bleed past the
            ScrollView's `paddingHorizontal: 20`. */}
        <YStack
          alignItems="center"
          gap="$md"
          paddingTop={insets.top + 56}
          paddingBottom="$xl"
          position="relative"
          overflow="visible"
        >
          <View
            pointerEvents="none"
            position="absolute"
            top={-100}
            left={-100}
            right={-100}
            height={480}
            borderRadius={9999}
            backgroundColor={state.tint}
            opacity={0.18}
          />
          <View
            pointerEvents="none"
            position="absolute"
            top={0}
            left={20}
            right={20}
            height={320}
            borderRadius={9999}
            backgroundColor={state.tint}
            opacity={0.14}
          />
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
            {overlineFor(t, state)}
          </Text>
          <YStack alignItems="center" gap={4} width="100%">
            <TextInput
              value={state.name}
              onChangeText={(name) => setState((s) => ({ ...s, name }))}
              placeholder={t('custody.editor.name.placeholder')}
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
            label={t('custody.editor.section.apps')}
            value={summarizeTargets(t, state.targets)}
            highlight={state.targets.length === 0}
            onPress={() => setOpenSheet('targets')}
          />
          <Divider />
          <ScheduleBlock state={state} setState={setState} />
          <Divider />
          <SettingRow
            label={t('custody.editor.section.override')}
            value={t(`custody.editor.frictionChip.${state.friction}`)}
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
              color={canSave ? ACCENT_INK : '$colorSecondary'}
            >
              {saveLabel}
            </Text>
          </View>
        </Pressable>
      </YStack>

      {/* Sheets — sub-pickers.
          The targets sheet takes a tall fixed detent so the iOS
          FamilyActivityPicker has the whole screen to breathe; its content gets
          an explicit height so the picker's flex:1 fills (a native sheet gives
          flex children no height bound). The override sheet stays
          content-hugging via dynamic sizing because it's short. */}
      <BottomSheet
        index={openSheet === 'targets' ? 0 : -1}
        snapPoints={['92%']}
        enablePanDownToClose
        onClose={() => setOpenSheet(null)}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack
          height={height * 0.92}
          paddingHorizontal="$lg"
          paddingTop="$xs"
          paddingBottom={insets.bottom + 16}
          gap="$md"
        >
          <SheetHeader
            title={t('custody.editor.sheet.targets')}
            onClose={() => setOpenSheet(null)}
          />
          <TargetPicker
            commitmentId={draftId}
            targets={state.targets}
            onChange={(targets) => setState((s) => ({ ...s, targets }))}
          />
        </YStack>
      </BottomSheet>

      <BottomSheet
        index={openSheet === 'override' ? 0 : -1}
        enablePanDownToClose
        onClose={() => setOpenSheet(null)}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack
          paddingHorizontal="$lg"
          paddingTop="$xs"
          paddingBottom={insets.bottom + 16}
          gap="$md"
        >
          <SheetHeader
            title={t('custody.editor.sheet.override')}
            onClose={() => setOpenSheet(null)}
          />
          <FrictionPicker
            value={state.friction}
            config={state.frictionConfig}
            onChange={(friction, frictionConfig) =>
              setState((s) => ({ ...s, friction, frictionConfig }))
            }
          />
        </YStack>
      </BottomSheet>
    </YStack>
  )
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const theme = useTheme()
  const { t } = useTranslation()
  return (
    <XStack alignItems="center" justifyContent="space-between" paddingBottom="$xs">
      <Text fontFamily="$heading" fontSize="$4" color="$color">
        {title}
      </Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('custody.editor.a11y.close')}
        hitSlop={10}
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
  const { t } = useTranslation()
  return (
    <YStack paddingHorizontal="$md" paddingVertical="$md" gap="$md">
      <XStack alignItems="center" gap="$sm">
        <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
          {t('custody.editor.section.schedule')}
        </Text>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" numberOfLines={1}>
          {summarizeKind(t, state)}
        </Text>
      </XStack>

      {/* Kind chips */}
      <XStack gap="$xs">
        {KIND_OPTIONS.map((kind) => {
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
                <Text fontFamily="$body" fontSize="$2" color={selected ? ACCENT_INK : '$color'}>
                  {t(`custody.editor.kindChip.${kind}`)}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </XStack>

      {/* Help text for the currently selected kind — sourced from
          custody.kinds.X.help (e.g. "I will not use this — full stop."). */}
      <Text
        fontFamily="$body"
        fontSize="$1"
        color="$colorSecondary"
        textAlign="center"
        fontStyle="italic"
      >
        {t(`custody.kinds.${state.kind}.help`)}
      </Text>

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

function Divider() {
  return <View height={1} backgroundColor="rgba(255,255,255,0.06)" />
}
