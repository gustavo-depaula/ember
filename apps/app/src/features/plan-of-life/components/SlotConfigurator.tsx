import DateTimePicker from '@react-native-community/datetimepicker'
import { Bell, ChevronRight, Clock, Plus, Trash2 } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Switch } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm } from '@/components'
import { calmSpring } from '@/config/animation'
import { tierConfig } from '@/config/constants'
import type { SlotState } from '@/db/events'
import type { Tier } from '@/db/schema'
import { lightTap, mediumTap } from '@/lib/haptics'
import { enrichSlot } from '../getPracticeName'
import { parseSchedule } from '../schedule'
import { deriveTimeBlock } from '../timeBlocks'
import { SchedulePicker } from './SchedulePicker'
import { TierBadge } from './TierBadge'

const tierEntries = Object.entries(tierConfig) as [Tier, { color: string }][]

function TierSelector({ value, onChange }: { value: Tier; onChange: (tier: Tier) => void }) {
  const { t } = useTranslation()
  return (
    <XStack gap="$sm">
      {tierEntries.map(([tier, config]) => (
        <AnimatedPressable
          key={tier}
          onPress={() => {
            lightTap()
            onChange(tier)
          }}
          style={{ flex: 1 }}
        >
          <YStack
            paddingVertical="$sm"
            paddingHorizontal="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor={value === tier ? config.color : '$borderColor'}
            backgroundColor={value === tier ? config.color : 'transparent'}
            alignItems="center"
            opacity={value === tier ? 1 : 0.7}
          >
            <Text fontFamily="$body" fontSize="$3" color={value === tier ? 'white' : '$color'}>
              {t(`tier.${tier}`)}
            </Text>
          </YStack>
        </AnimatedPressable>
      ))}
    </XStack>
  )
}

function TimeInput({
  value,
  onChange,
}: {
  value: string | null
  onChange: (time: string | null) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [showPicker, setShowPicker] = useState(false)

  const date = useMemo(() => {
    if (!value) return new Date(2000, 0, 1, 8, 0)
    const [h, m] = value.split(':').map(Number)
    return new Date(2000, 0, 1, h || 0, m || 0)
  }, [value])

  const blockLabel = value ? deriveTimeBlock(value) : 'flexible'

  if (!value) {
    return (
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onChange('08:00')
          if (Platform.OS !== 'ios') setShowPicker(true)
        }}
      >
        <XStack
          alignItems="center"
          gap="$sm"
          paddingVertical="$sm"
          paddingHorizontal="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          borderStyle="dashed"
        >
          <Clock size={18} color={theme.accent.val} />
          <Text fontFamily="$body" fontSize="$3" color="$accent">
            {t('editor.setTime')}
          </Text>
        </XStack>
      </AnimatedPressable>
    )
  }

  return (
    <XStack alignItems="center" gap="$md">
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={date}
          mode="time"
          display="compact"
          onValueChange={(_, selected) => {
            if (selected) {
              const hh = String(selected.getHours()).padStart(2, '0')
              const mm = String(selected.getMinutes()).padStart(2, '0')
              onChange(`${hh}:${mm}`)
            }
          }}
        />
      ) : (
        <>
          <AnimatedPressable
            onPress={() => {
              lightTap()
              setShowPicker(true)
            }}
          >
            <XStack
              alignItems="center"
              gap="$sm"
              paddingVertical="$sm"
              paddingHorizontal="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
            >
              <Clock size={18} color={theme.accent.val} />
              <Text fontFamily="$body" fontSize="$3" color="$accent">
                {value}
              </Text>
            </XStack>
          </AnimatedPressable>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display="default"
              onValueChange={(_, selected) => {
                setShowPicker(false)
                if (selected) {
                  const hh = String(selected.getHours()).padStart(2, '0')
                  const mm = String(selected.getMinutes()).padStart(2, '0')
                  onChange(`${hh}:${mm}`)
                }
              }}
            />
          )}
        </>
      )}
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
        {t(`timeBlock.${blockLabel}`)}
      </Text>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onChange(null)
        }}
        hitSlop={12}
      >
        <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
          {t('common.clear')}
        </Text>
      </AnimatedPressable>
    </XStack>
  )
}

function SlotRow({
  slot,
  expanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: {
  slot: SlotState
  expanded: boolean
  onToggleExpand: () => void
  onUpdate: (data: Record<string, unknown>) => void
  onDelete?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const enriched = enrichSlot(slot, t)
  const schedule = parseSchedule(slot.schedule)

  const [localEnabled, setLocalEnabled] = useState(slot.enabled === 1)
  const [localNotify, setLocalNotify] = useState(
    slot.notify ? JSON.parse(slot.notify).enabled : false,
  )

  const chevronRotation = useSharedValue(0)
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }))

  function handleToggleExpand() {
    lightTap()
    chevronRotation.value = withSpring(expanded ? 0 : 90, calmSpring)
    onToggleExpand()
  }

  return (
    <Animated.View layout={LinearTransition.duration(250)}>
      <YStack backgroundColor="$backgroundSurface" borderRadius="$lg" padding="$md" gap="$sm">
        <AnimatedPressable onPress={handleToggleExpand}>
          <XStack alignItems="center" gap="$md" minHeight={44}>
            <Switch
              value={localEnabled}
              trackColor={{ false: theme.borderColor.val, true: theme.accent.val }}
              thumbColor="white"
              onValueChange={(v) => {
                setLocalEnabled(v)
                lightTap()
                onUpdate({ enabled: v ? 1 : 0 })
              }}
            />
            <YStack flex={1} gap="$xs" opacity={slot.enabled === 1 ? 1 : 0.5}>
              <Text fontFamily="$body" fontSize="$4" color="$color">
                {enriched.name}
              </Text>
              <XStack gap="$sm" alignItems="center">
                <TierBadge tier={slot.tier} />
                {slot.time && (
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    {slot.time}
                  </Text>
                )}
              </XStack>
            </YStack>
            <Animated.View style={chevronStyle}>
              <ChevronRight size={20} color={theme.colorSecondary.val} />
            </Animated.View>
          </XStack>
        </AnimatedPressable>

        {expanded && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <YStack gap="$lg" paddingTop="$sm">
              <YStack gap="$sm">
                <XStack alignItems="center" gap="$sm">
                  <Clock size={16} color={theme.color.val} />
                  <Text fontFamily="$heading" fontSize="$2" color="$color">
                    {t('editor.timeOfDay')}
                  </Text>
                </XStack>
                <TimeInput value={slot.time} onChange={(time) => onUpdate({ time })} />
              </YStack>

              <YStack borderBottomWidth={0.5} borderColor="$borderColor" />

              <YStack gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$color">
                  {t('editor.tier')}
                </Text>
                <TierSelector value={slot.tier} onChange={(tier) => onUpdate({ tier })} />
              </YStack>

              <YStack borderBottomWidth={0.5} borderColor="$borderColor" />

              <SchedulePicker
                schedule={schedule}
                onChangeSchedule={(s) => onUpdate({ schedule: JSON.stringify(s) })}
              />

              <YStack borderBottomWidth={0.5} borderColor="$borderColor" />

              <XStack alignItems="center" minHeight={44}>
                <Bell size={18} color={theme.colorSecondary.val} />
                <Text fontFamily="$body" fontSize="$3" color="$color" flex={1} marginLeft="$sm">
                  {t('editor.notifications')}
                </Text>
                <Switch
                  value={localNotify}
                  trackColor={{ false: theme.borderColor.val, true: theme.accent.val }}
                  thumbColor="white"
                  onValueChange={(v) => {
                    setLocalNotify(v)
                    lightTap()
                    onUpdate({ notify: JSON.stringify({ enabled: v }) })
                  }}
                />
              </XStack>

              {onDelete && (
                <AnimatedPressable
                  onPress={async () => {
                    mediumTap()
                    const ok = await confirm({
                      title: t('editor.removeSlot'),
                      description: t('editor.removeSlotConfirm'),
                      confirmLabel: t('common.remove'),
                      destructive: true,
                    })
                    if (ok) onDelete()
                  }}
                >
                  <XStack
                    borderWidth={1}
                    borderColor="$colorBurgundy"
                    borderRadius="$md"
                    paddingVertical="$sm"
                    paddingHorizontal="$md"
                    alignItems="center"
                    justifyContent="center"
                    gap="$sm"
                    minHeight={44}
                  >
                    <Trash2 size={18} color={theme.colorBurgundy?.val ?? '#8B0000'} />
                    <Text fontFamily="$body" fontSize="$3" color="$colorBurgundy">
                      {t('editor.removeSlot')}
                    </Text>
                  </XStack>
                </AnimatedPressable>
              )}
            </YStack>
          </Animated.View>
        )}
      </YStack>
    </Animated.View>
  )
}

export function SlotConfigurator({
  slots,
  onUpdateSlot,
  onAddSlot,
  onDeleteSlot,
}: {
  slots: SlotState[]
  onUpdateSlot: (slotId: string, data: Record<string, unknown>) => void
  onAddSlot: () => void
  onDeleteSlot: (slotId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [expandedIndex, setExpandedIndex] = useState<number | undefined>()

  return (
    <YStack gap="$md">
      <YStack gap="$xs">
        <Text fontFamily="$heading" fontSize="$3" color="$color" letterSpacing={1}>
          {slots.length > 1 ? t('editor.slots') : t('editor.settings')}
        </Text>
        <YStack borderBottomWidth={1.5} borderColor="$accent" width={32} />
      </YStack>

      {slots.map((slot, i) => (
        <SlotRow
          key={slot.id}
          slot={slot}
          expanded={expandedIndex === i}
          onToggleExpand={() => setExpandedIndex(expandedIndex === i ? undefined : i)}
          onUpdate={(data) => onUpdateSlot(slot.id, data)}
          onDelete={slots.length > 1 ? () => onDeleteSlot(slot.id) : undefined}
        />
      ))}

      <AnimatedPressable
        onPress={() => {
          lightTap()
          onAddSlot()
        }}
      >
        <XStack
          borderWidth={1}
          borderColor="$accent"
          borderRadius="$lg"
          borderStyle="dashed"
          paddingVertical="$sm"
          paddingHorizontal="$md"
          alignItems="center"
          justifyContent="center"
          gap="$sm"
          minHeight={44}
        >
          <Plus size={18} color={theme.accent.val} />
          <Text fontFamily="$body" fontSize="$3" color="$accent">
            {t('editor.addSlot')}
          </Text>
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}
