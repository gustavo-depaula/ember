import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { SchedulePicker } from '@/features/plan-of-life/components/SchedulePicker'

import { useCommitment, useCreateCommitment, useUpdateCommitment } from '../hooks'
import { scheduleNudgesForCommitment } from '../notifications'
import type {
  Anchor,
  CommitmentInput,
  CommitmentKind,
  FallPolicy,
  Friction,
  FrictionConfig,
  Schedule,
  Severity,
  Target,
} from '../types'

import { AnchorPreview } from './AnchorPreview'
import { FrictionPicker } from './FrictionPicker'
import { SeverityPicker } from './SeverityPicker'
import { ShieldAnchorPicker } from './ShieldAnchorPicker'
import { TargetPicker } from './TargetPicker'

type Mode = { kind: 'new' } | { kind: 'edit'; commitmentId: string }

const KINDS: CommitmentKind[] = ['abstain', 'time-limit', 'time-fence']
const DEFAULT_SCHEDULE: Schedule = { type: 'daily' }

type EditorState = {
  name: string
  description: string
  confessorNote: string
  kind: CommitmentKind
  targets: Target[]
  schedule: Schedule
  severity: Severity
  friction: Friction
  frictionConfig: FrictionConfig | null
  shieldAnchor: Anchor | null
  fallPolicy: FallPolicy
  fenceStart: string
  fenceEnd: string
  limitMinutes: string
}

function emptyState(): EditorState {
  return {
    name: '',
    description: '',
    confessorNote: '',
    kind: 'abstain',
    targets: [],
    schedule: DEFAULT_SCHEDULE,
    severity: 'firm',
    friction: 'none',
    frictionConfig: null,
    shieldAnchor: null,
    fallPolicy: 'log',
    fenceStart: '21:00',
    fenceEnd: '07:00',
    limitMinutes: '30',
  }
}

function toInput(state: EditorState): CommitmentInput | undefined {
  if (!state.name.trim()) return undefined
  if (state.targets.length === 0) return undefined
  const input: CommitmentInput = {
    name: state.name.trim(),
    description: state.description.trim() || undefined,
    confessorNote: state.confessorNote.trim() || undefined,
    kind: state.kind,
    targets: state.targets,
    schedule: state.schedule,
    severity: state.severity,
    friction: state.friction,
    frictionConfig: state.frictionConfig ?? undefined,
    shieldAnchor: state.shieldAnchor ?? undefined,
    fallPolicy: state.fallPolicy,
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

export function CommitmentEditor({ mode }: { mode: Mode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const editingId = mode.kind === 'edit' ? mode.commitmentId : undefined
  const { data: existing } = useCommitment(editingId)
  const create = useCreateCommitment()
  const update = useUpdateCommitment()

  const [state, setState] = useState<EditorState>(emptyState)

  useEffect(() => {
    if (mode.kind === 'edit' && existing) {
      setState({
        name: existing.name,
        description: existing.description ?? '',
        confessorNote: existing.confessor_note ?? '',
        kind: existing.kind,
        targets: existing.targets,
        schedule: existing.schedule,
        severity: existing.severity,
        friction: existing.friction,
        frictionConfig: existing.friction_config,
        shieldAnchor: existing.shield_anchor,
        fallPolicy: existing.fall_policy,
        fenceStart: existing.fence_start ?? '21:00',
        fenceEnd: existing.fence_end ?? '07:00',
        limitMinutes: existing.limit_seconds ? String(existing.limit_seconds / 60) : '30',
      })
    }
  }, [mode.kind, existing])

  const input = toInput(state)
  const canSave = !!input

  const onSave = async () => {
    if (!input) return
    if (mode.kind === 'new') {
      const created = await create.mutateAsync(input)
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
    <YStack gap="$lg" paddingVertical="$lg">
      {/* Name + description */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Name
        </Text>
        <TextInput
          value={state.name}
          onChangeText={(name) => setState((s) => ({ ...s, name }))}
          placeholder="e.g. No Instagram between 21:00 and 07:00"
          placeholderTextColor={theme.colorSecondary.val}
          style={inputStyle}
        />
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Description (optional)
        </Text>
        <TextInput
          value={state.description}
          onChangeText={(description) => setState((s) => ({ ...s, description }))}
          multiline
          style={{ ...inputStyle, minHeight: 60 }}
        />
      </YStack>

      {/* Kind */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Kind
        </Text>
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
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor={selected ? '$accent' : '$borderColor'}
                  backgroundColor={selected ? '$accent' : 'transparent'}
                >
                  <Text fontFamily="$body" fontSize="$2" color={selected ? 'white' : '$color'}>
                    {t(`custody.kinds.${k}.label`)}
                  </Text>
                </YStack>
              </Pressable>
            )
          })}
        </XStack>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {t(`custody.kinds.${state.kind}.help`)}
        </Text>
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
                placeholderTextColor={theme.colorSecondary.val}
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
                placeholderTextColor={theme.colorSecondary.val}
                style={inputStyle}
              />
            </YStack>
          </XStack>
        )}
        {state.kind === 'time-limit' && (
          <XStack alignItems="center" gap="$xs">
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              Daily limit (minutes)
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

      {/* Targets */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Targets
        </Text>
        <TargetPicker
          targets={state.targets}
          onChange={(targets) => setState((s) => ({ ...s, targets }))}
        />
      </YStack>

      {/* Schedule */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Schedule
        </Text>
        <SchedulePicker
          schedule={state.schedule}
          onChangeSchedule={(schedule) => setState((s) => ({ ...s, schedule }))}
        />
      </YStack>

      {/* Severity */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Severity
        </Text>
        <SeverityPicker
          value={state.severity}
          onChange={(severity) => setState((s) => ({ ...s, severity }))}
        />
      </YStack>

      {/* Friction (bound only) */}
      {state.severity === 'bound' && (
        <YStack gap="$xs">
          <Text fontFamily="$heading" fontSize="$2" color="$color">
            Friction
          </Text>
          <FrictionPicker
            value={state.friction}
            config={state.frictionConfig}
            onChange={(friction, frictionConfig) =>
              setState((s) => ({ ...s, friction, frictionConfig }))
            }
          />
        </YStack>
      )}

      {/* Shield anchor */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Shield anchor
        </Text>
        <ShieldAnchorPicker
          value={state.shieldAnchor}
          onChange={(shieldAnchor) => setState((s) => ({ ...s, shieldAnchor }))}
        />
        <YStack
          padding="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$backgroundSurface"
        >
          <AnchorPreview anchor={state.shieldAnchor} />
        </YStack>
      </YStack>

      {/* Confessor note */}
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          Confessor note (private)
        </Text>
        <TextInput
          value={state.confessorNote}
          onChangeText={(confessorNote) => setState((s) => ({ ...s, confessorNote }))}
          multiline
          placeholder="Notes for confession prep…"
          placeholderTextColor={theme.colorSecondary.val}
          style={{ ...inputStyle, minHeight: 60 }}
        />
      </YStack>

      {/* Save */}
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
      >
        <YStack
          padding="$md"
          borderRadius="$md"
          backgroundColor={canSave ? '$accent' : '$borderColor'}
          alignItems="center"
        >
          <Text fontFamily="$heading" fontSize="$3" color="white">
            {mode.kind === 'new' ? t('custody.commitments.create') : t('custody.commitments.edit')}
          </Text>
        </YStack>
      </Pressable>
    </YStack>
  )
}
