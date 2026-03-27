import DateTimePicker from '@react-native-community/datetimepicker'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch } from 'react-native'
import { Input, Text, XStack, YStack } from 'tamagui'

import { tierConfig } from '@/config/constants'
import type { Frequency, Practice, Tier, TimeBlock } from '@/db/schema'
import { parseFrequencyDays } from '@/features/plan-of-life/utils'

import { FrequencyPicker } from './FrequencyPicker'
import { IconPicker } from './IconPicker'

type PracticeFormData = {
  name: string
  icon: string
  tier: Tier
  timeBlock: TimeBlock
  frequency: Frequency
  frequencyDays: number[]
  notifyEnabled: boolean
  notifyTime: string
  description: string
  enabled: boolean
}

const tierEntries = Object.entries(tierConfig) as [Tier, { color: string }][]

function TierSelector({ value, onChange }: { value: Tier; onChange: (tier: Tier) => void }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        {t('editor.tier')}
      </Text>
      <XStack gap="$xs">
        {tierEntries.map(([tier, config]) => (
          <Pressable key={tier} onPress={() => onChange(tier)} style={{ flex: 1 }}>
            <YStack
              paddingVertical="$sm"
              borderRadius="$md"
              borderWidth={1}
              borderColor={value === tier ? config.color : '$borderColor'}
              backgroundColor={value === tier ? config.color : 'transparent'}
              alignItems="center"
              opacity={value === tier ? 1 : 0.7}
            >
              <Text fontFamily="$body" fontSize="$2" color={value === tier ? 'white' : '$color'}>
                {t(`tier.${tier}`)}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  )
}

const timeBlocks: TimeBlock[] = ['morning', 'daytime', 'evening', 'flexible']

function TimeBlockSelector({
  value,
  onChange,
}: {
  value: TimeBlock
  onChange: (block: TimeBlock) => void
}) {
  const { t } = useTranslation()

  return (
    <YStack gap="$xs">
      <Text fontFamily="$heading" fontSize="$2" color="$color">
        {t('editor.timeOfDay')}
      </Text>
      <XStack gap="$xs" flexWrap="wrap">
        {timeBlocks.map((block) => (
          <Pressable key={block} onPress={() => onChange(block)}>
            <YStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$md"
              borderWidth={1}
              borderColor={value === block ? '$accent' : '$borderColor'}
              backgroundColor={value === block ? '$accent' : 'transparent'}
            >
              <Text fontFamily="$body" fontSize="$2" color={value === block ? 'white' : '$color'}>
                {t(`timeBlock.${block}`)}
              </Text>
            </YStack>
          </Pressable>
        ))}
      </XStack>
    </YStack>
  )
}

export function PracticeEditSheet({
  practice,
  onSave,
  onDelete,
  onClose,
}: {
  practice?: Practice
  onSave: (data: PracticeFormData) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isBuiltin = practice ? practice.is_builtin === 1 : false
  const isNew = !practice

  const [form, setForm] = useState<PracticeFormData>({
    name: practice?.name ?? '',
    icon: practice?.icon ?? 'prayer',
    tier: practice?.tier ?? 'essential',
    timeBlock: practice?.time_block ?? 'flexible',
    frequency: practice?.frequency ?? 'daily',
    frequencyDays: practice ? parseFrequencyDays(practice) : [],
    notifyEnabled: practice?.notify_enabled === 1,
    notifyTime: practice?.notify_time ?? '08:00',
    description: practice?.description ?? '',
    enabled: practice ? practice.enabled === 1 : true,
  })

  function update<K extends keyof PracticeFormData>(key: K, value: PracticeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const notifyDate = useMemo(() => {
    const [h, m] = form.notifyTime.split(':').map(Number)
    const d = new Date()
    d.setHours(h || 0, m || 0, 0, 0)
    return d
  }, [form.notifyTime])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ maxHeight: '85%' }}
    >
      <YStack
        backgroundColor="$background"
        borderTopLeftRadius="$lg"
        borderTopRightRadius="$lg"
        padding="$lg"
        gap="$lg"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {isNew ? t('editor.newPractice') : t('editor.editPractice')}
          </Text>
          <Pressable onPress={onClose}>
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
              {t('editor.cancel')}
            </Text>
          </Pressable>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <YStack gap="$lg">
            <YStack gap="$xs">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.name')}
              </Text>
              <Input
                value={form.name}
                onChangeText={(text) => update('name', text)}
                placeholder={t('editor.namePlaceholder')}
                fontFamily="$body"
                fontSize="$3"
                height={48}
                borderColor="$borderColor"
                readOnly={isBuiltin}
                opacity={isBuiltin ? 0.7 : 1}
              />
            </YStack>

            <YStack gap="$xs">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.icon')}
              </Text>
              <IconPicker selected={form.icon} onSelect={(icon) => update('icon', icon)} />
            </YStack>

            <TierSelector value={form.tier} onChange={(tier) => update('tier', tier)} />
            <TimeBlockSelector value={form.timeBlock} onChange={(b) => update('timeBlock', b)} />
            <FrequencyPicker
              frequency={form.frequency}
              frequencyDays={form.frequencyDays}
              onChangeFrequency={(f) => update('frequency', f)}
              onChangeDays={(days) => update('frequencyDays', days)}
            />

            <YStack gap="$xs">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.description')}
              </Text>
              <Input
                value={form.description}
                onChangeText={(text) => update('description', text)}
                placeholder={t('editor.descriptionPlaceholder')}
                fontFamily="$body"
                fontSize="$2"
                height={48}
                borderColor="$borderColor"
              />
            </YStack>

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.notifications')}
              </Text>
              <Switch
                value={form.notifyEnabled}
                onValueChange={(v) => update('notifyEnabled', v)}
              />
            </XStack>

            {form.notifyEnabled && (
              <XStack alignItems="center" gap="$md">
                <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" flex={1}>
                  {t('editor.reminderTime')}
                </Text>
                <DateTimePicker
                  value={notifyDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  onValueChange={(_, date) => {
                    const hh = String(date.getHours()).padStart(2, '0')
                    const mm = String(date.getMinutes()).padStart(2, '0')
                    update('notifyTime', `${hh}:${mm}`)
                  }}
                />
              </XStack>
            )}

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.enabled')}
              </Text>
              <Switch value={form.enabled} onValueChange={(v) => update('enabled', v)} />
            </XStack>

            <Pressable onPress={() => onSave(form)}>
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                padding="$md"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {isNew ? t('editor.createPractice') : t('editor.saveChanges')}
                </Text>
              </YStack>
            </Pressable>

            {onDelete && !isBuiltin && (
              <Pressable onPress={onDelete}>
                <Text
                  fontFamily="$body"
                  fontSize="$2"
                  color="$colorBurgundy"
                  textAlign="center"
                  paddingVertical="$sm"
                >
                  {t('editor.deletePractice')}
                </Text>
              </Pressable>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  )
}
