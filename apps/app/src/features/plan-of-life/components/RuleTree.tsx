import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { calmSpring } from '@/config/animation'
import { dayKeys } from '@/config/constants'
import type { SlotState } from '@/db/events'
import { lightTap } from '@/lib/haptics'

import { enrichSlot } from '../getPracticeName'
import { useUpdateSlot } from '../hooks'
import { parseSchedule } from '../schedule'
import { SlotQuickEdit } from './SlotQuickEdit'

// Each practice is its own little block: an illuminated header (icon + name)
// with its slots always shown below as a small branch. Branches use hairline
// ├─ └─ connectors; the spine belongs to the practice, not the whole list.
const INDENT = 24
const ROW_H = 40
const ICON = 26
const RAIL_W = 1.5
const railLine = { backgroundColor: '$accentSubtle', opacity: 0.55 } as const

type PracticeGroup = { practiceId: string; slots: SlotState[] }

export function RuleTree({ slots }: { slots: SlotState[] }) {
  const updateSlot = useUpdateSlot()
  const [openSlotId, setOpenSlotId] = useState<string | undefined>()

  const groups = useMemo(() => {
    const byId = new Map<string, SlotState[]>()
    for (const s of slots) {
      const arr = byId.get(s.practice_id) ?? []
      arr.push(s)
      byId.set(s.practice_id, arr)
    }
    return Array.from(byId, ([practiceId, slotList]) => ({ practiceId, slots: slotList }))
  }, [slots])

  function toggleSlot(id: string) {
    lightTap()
    setOpenSlotId((cur) => (cur === id ? undefined : id))
  }

  return (
    <YStack gap="$lg">
      {groups.map((group) => (
        <PracticeBlock
          key={group.practiceId}
          group={group}
          openSlotId={openSlotId}
          onToggleSlot={toggleSlot}
          onUpdate={(id, data) => updateSlot.mutate({ id, data })}
        />
      ))}
    </YStack>
  )
}

function PracticeBlock({
  group,
  openSlotId,
  onToggleSlot,
  onUpdate,
}: {
  group: PracticeGroup
  openSlotId: string | undefined
  onToggleSlot: (id: string) => void
  onUpdate: (id: string, data: Record<string, unknown>) => void
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const head = enrichSlot(group.slots[0], t)

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          router.push({
            pathname: '/plan/[practiceId]',
            params: { practiceId: group.practiceId },
          })
        }}
        accessibilityRole="link"
        accessibilityLabel={head.name}
      >
        <XStack alignItems="center" gap="$md" minHeight={44} paddingHorizontal="$xs">
          <PracticeIcon name={head.icon} size={ICON} />
          <Typography flex={1} fontSize="$5" numberOfLines={1}>
            {head.name}
          </Typography>
          <Typography tone="muted" fontSize="$4">
            ›
          </Typography>
        </XStack>
      </AnimatedPressable>

      <YStack paddingLeft="$xs">
        {group.slots.map((slot, j) => (
          <SlotBranch
            key={slot.id}
            slot={slot}
            isLast={j === group.slots.length - 1}
            expanded={openSlotId === slot.id}
            onToggle={() => onToggleSlot(slot.id)}
            onUpdate={(data) => onUpdate(slot.id, data)}
          />
        ))}
      </YStack>
    </Animated.View>
  )
}

function SlotBranch({
  slot,
  isLast,
  expanded,
  onToggle,
  onUpdate,
}: {
  slot: SlotState
  isLast: boolean
  expanded: boolean
  onToggle: () => void
  onUpdate: (data: Record<string, unknown>) => void
}) {
  const { t } = useTranslation()
  const { label, days } = cadenceInfo(slot, t)
  // The time leads when set; otherwise the cadence word does. The day names
  // always trail muted (e.g. "Semanal  Seg · Qua").
  const primary = slot.time ?? label

  const rotation = useSharedValue(expanded ? 90 : 0)
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))

  function handleToggle() {
    lightTap()
    rotation.value = withSpring(expanded ? 0 : 90, calmSpring)
    onToggle()
  }

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
      <AnimatedPressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`${primary}${slot.time ? ` ${label}` : ''}${days ? ` ${days}` : ''}`}
        accessibilityState={{ expanded }}
      >
        <XStack alignItems="center" minHeight={ROW_H}>
          <Elbow isLast={isLast} />
          <XStack flex={1} alignItems="baseline" gap="$sm">
            <Typography fontSize="$4" numberOfLines={1}>
              {primary}
            </Typography>
            {slot.time ? (
              <Typography tone="muted" fontSize="$2">
                {label}
              </Typography>
            ) : undefined}
            {days ? (
              <Typography tone="muted" fontSize="$2">
                {days}
              </Typography>
            ) : undefined}
          </XStack>
          <Animated.View style={chevronStyle}>
            <Typography tone="muted" fontSize="$4">
              ›
            </Typography>
          </Animated.View>
        </XStack>
      </AnimatedPressable>

      {expanded && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={{ paddingLeft: INDENT }}
        >
          <SlotQuickEdit slot={slot} onUpdate={onUpdate} />
        </Animated.View>
      )}
    </Animated.View>
  )
}

// A single-level ├ / └ connector for a slot hanging off its practice header.
function Elbow({ isLast }: { isLast: boolean }) {
  const mid = INDENT / 2
  return (
    <YStack width={INDENT} height={ROW_H} position="relative" marginRight="$sm">
      <YStack
        position="absolute"
        left={mid}
        top={0}
        height={ROW_H / 2}
        width={RAIL_W}
        {...railLine}
      />
      <YStack
        position="absolute"
        left={mid}
        top={ROW_H / 2}
        width={mid}
        height={RAIL_W}
        {...railLine}
      />
      {!isLast && (
        <YStack
          position="absolute"
          left={mid}
          top={ROW_H / 2}
          bottom={0}
          width={RAIL_W}
          {...railLine}
        />
      )}
    </YStack>
  )
}

// The cadence as a word (`label`) plus, for a weekly rule, the specific day
// names (`days`) — rendered muted beside it, e.g. "Semanal  Seg · Qua".
function cadenceInfo(
  slot: SlotState,
  t: ReturnType<typeof useTranslation>['t'],
): { label: string; days?: string } {
  const schedule = parseSchedule(slot.schedule)
  switch (schedule.type) {
    case 'daily':
      return { label: t('frequency.daily') }
    case 'days-of-week': {
      const days = [...schedule.days].sort((a, b) => a - b)
      if (days.length === 7) return { label: t('frequency.daily') }
      return {
        label: t('frequency.weekly'),
        days: days.map((d) => t(`day.${dayKeys[d]}`)).join(' · '),
      }
    }
    case 'times-per':
      return { label: t('frequency.timesPer', { count: schedule.count }) }
    case 'day-of-month':
    case 'nth-weekday':
      return { label: t('frequency.monthly') }
    case 'holy-days-of-obligation':
      return { label: t('frequency.holyDays') }
    default:
      return { label: t('timeBlock.flexible') }
  }
}
