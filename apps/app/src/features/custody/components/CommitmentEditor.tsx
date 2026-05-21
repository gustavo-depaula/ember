import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronDown, ChevronRight } from 'lucide-react-native'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

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

const DEFAULT_SCHEDULE: Schedule = { type: 'daily' }
const KIND_LABELS: Record<CommitmentKind, string> = {
  abstain: 'Always blocked',
  'time-fence': 'Blocked between hours',
  'time-limit': 'Daily limit',
}
const FRICTION_LABELS: Record<Friction, string> = {
  none: 'Instant disable',
  wait: 'Wait before disabling',
  prayer: 'Pray before disabling',
}

type EditorState = {
  name: string
  emoji: string
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

function summarizeSchedule(state: EditorState): string {
  if (state.kind === 'time-fence') return `${state.fenceStart} – ${state.fenceEnd}, daily`
  if (state.kind === 'time-limit') return `Max ${state.limitMinutes} min / day`
  return 'Always'
}

type SectionKey = 'targets' | 'schedule' | 'override' | null

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
  const [open, setOpen] = useState<SectionKey>(null)
  const toggle = (key: Exclude<SectionKey, null>) => setOpen((c) => (c === key ? null : key))

  useEffect(() => {
    if (mode.kind === 'edit' && existing) {
      setState({
        name: existing.name,
        emoji: '🛡️',
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

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.borderColor.val,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    color: theme.color.val,
  }

  return (
    <YStack flex={1}>
      <YStack flex={1} gap="$lg" paddingHorizontal="$lg" paddingTop="$lg">
        {/* Identity */}
        <YStack alignItems="center" gap="$md" paddingVertical="$md">
          <View
            width={72}
            height={72}
            borderRadius={36}
            backgroundColor="$accentSubtle"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={36}>{state.emoji}</Text>
          </View>
          <TextInput
            value={state.name}
            onChangeText={(name) => setState((s) => ({ ...s, name }))}
            placeholder="Name this block"
            placeholderTextColor={theme.colorSecondary.val}
            style={{
              fontFamily: 'EBGaramond_500Medium',
              fontSize: 22,
              textAlign: 'center',
              color: theme.color.val,
              minWidth: 240,
              paddingVertical: 4,
            }}
          />
        </YStack>

        {/* Grouped list */}
        <YStack gap={0} borderRadius="$lg" backgroundColor="$backgroundSurface" overflow="hidden">
          <Section
            label="Apps & Sites"
            value={summarizeTargets(state.targets)}
            highlight={state.targets.length === 0}
            isOpen={open === 'targets'}
            onToggle={() => toggle('targets')}
          >
            <TargetPicker
              commitmentId={draftId}
              targets={state.targets}
              onChange={(targets) => setState((s) => ({ ...s, targets }))}
            />
          </Section>
          <Divider />
          <Section
            label="Schedule"
            value={summarizeSchedule(state)}
            isOpen={open === 'schedule'}
            onToggle={() => toggle('schedule')}
          >
            <ScheduleSection
              state={state}
              setState={setState}
              inputStyle={inputStyle}
              themeSecondary={theme.colorSecondary.val}
            />
          </Section>
          <Divider />
          <Section
            label="Override"
            value={FRICTION_LABELS[state.friction]}
            isOpen={open === 'override'}
            onToggle={() => toggle('override')}
          >
            <FrictionPicker
              value={state.friction}
              config={state.frictionConfig}
              onChange={(friction, frictionConfig) =>
                setState((s) => ({ ...s, friction, frictionConfig }))
              }
            />
          </Section>
        </YStack>
      </YStack>

      {/* Pinned Save */}
      <YStack
        paddingHorizontal="$lg"
        paddingTop="$md"
        paddingBottom={Math.max(insets.bottom, 16)}
        backgroundColor="$background"
      >
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <View
            paddingVertical={16}
            borderRadius={28}
            backgroundColor={canSave ? '$accent' : '$borderColor'}
            alignItems="center"
          >
            <Text fontFamily="$heading" fontSize="$3" color="white">
              {mode.kind === 'new'
                ? t('custody.commitments.create')
                : t('custody.commitments.edit')}
            </Text>
          </View>
        </Pressable>
      </YStack>
    </YStack>
  )
}

function Section({
  label,
  value,
  isOpen,
  onToggle,
  highlight,
  children,
}: {
  label: string
  value: string
  isOpen: boolean
  onToggle: () => void
  highlight?: boolean
  children: React.ReactNode
}) {
  const theme = useTheme()
  return (
    <YStack>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={label}>
        <XStack alignItems="center" paddingHorizontal="$md" paddingVertical="$md" gap="$sm">
          <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
            {label}
          </Text>
          <Text
            fontFamily="$body"
            fontSize="$2"
            color={highlight ? '$accent' : '$colorSecondary'}
            numberOfLines={1}
            maxWidth={180}
          >
            {value}
          </Text>
          {isOpen ? (
            <ChevronDown size={16} color={theme.colorSecondary?.val} />
          ) : (
            <ChevronRight size={16} color={theme.colorSecondary?.val} />
          )}
        </XStack>
      </Pressable>
      {isOpen && (
        <YStack padding="$md" paddingTop={0}>
          {children}
        </YStack>
      )}
    </YStack>
  )
}

function ScheduleSection({
  state,
  setState,
  inputStyle,
  themeSecondary,
}: {
  state: EditorState
  setState: React.Dispatch<React.SetStateAction<EditorState>>
  inputStyle: object
  themeSecondary: string
}) {
  const KINDS: CommitmentKind[] = ['abstain', 'time-fence', 'time-limit']
  return (
    <YStack gap="$sm">
      <XStack gap="$xs" flexWrap="wrap">
        {KINDS.map((k) => {
          const selected = k === state.kind
          return (
            <Pressable
              key={k}
              onPress={() => setState((s) => ({ ...s, kind: k }))}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <YStack
                paddingHorizontal="$md"
                paddingVertical="$xs"
                borderRadius={999}
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accent' : 'transparent'}
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? 'white' : '$color'}>
                  {KIND_LABELS[k]}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
      {state.kind === 'time-fence' && (
        <XStack gap="$md" alignItems="center">
          <YStack gap="$xs" flex={1}>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              From
            </Text>
            <TextInput
              value={state.fenceStart}
              onChangeText={(fenceStart) => setState((s) => ({ ...s, fenceStart }))}
              placeholder="21:00"
              placeholderTextColor={themeSecondary}
              style={inputStyle}
            />
          </YStack>
          <YStack gap="$xs" flex={1}>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              To
            </Text>
            <TextInput
              value={state.fenceEnd}
              onChangeText={(fenceEnd) => setState((s) => ({ ...s, fenceEnd }))}
              placeholder="07:00"
              placeholderTextColor={themeSecondary}
              style={inputStyle}
            />
          </YStack>
        </XStack>
      )}
      {state.kind === 'time-limit' && (
        <XStack alignItems="center" gap="$xs">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Max minutes per day
          </Text>
          <TextInput
            value={state.limitMinutes}
            onChangeText={(limitMinutes) => setState((s) => ({ ...s, limitMinutes }))}
            keyboardType="number-pad"
            style={{ ...inputStyle, minWidth: 64 }}
          />
        </XStack>
      )}
    </YStack>
  )
}

function Divider() {
  return <View height={1} backgroundColor="$borderColor" marginLeft="$md" />
}
