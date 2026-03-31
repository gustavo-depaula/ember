import DateTimePicker from '@react-native-community/datetimepicker'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch } from 'react-native'
import { Input, Text, XStack, YStack } from 'tamagui'

import { tierConfig } from '@/config/constants'
import { getManifest, getManifestIconKey } from '@/content/practices'
import type { PracticeManifest } from '@/content/types'
import type { Tier, TimeBlock, UserPractice } from '@/db/schema'
import { localizeContent } from '@/lib/i18n'

import type { Notification, Schedule } from '../schedule'
import { parseSchedule } from '../schedule'
import { IconPicker } from './IconPicker'
import { SchedulePicker } from './SchedulePicker'

export type PracticeFormData = {
  name: string
  icon: string
  tier: Tier
  timeBlock: TimeBlock
  schedule: Schedule
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

function getNotifyTime(schedule: Schedule): string {
  return schedule.notify?.[0]?.at ?? '08:00'
}

function hasNotify(schedule: Schedule): boolean {
  return (schedule.notify?.length ?? 0) > 0
}

export function PracticeEditSheet({
  practice,
  manifest,
  mode = 'edit',
  onSave,
  onDelete,
  onClose,
}: {
  practice?: UserPractice
  manifest?: PracticeManifest
  mode?: 'edit' | 'add'
  onSave: (data: PracticeFormData) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isAddMode = mode === 'add'

  // Determine if builtin by checking manifest existence
  const practiceManifest = manifest ?? (practice ? getManifest(practice.practice_id) : undefined)
  const isBuiltin = !!practiceManifest

  const manifestName = practiceManifest ? localizeContent(practiceManifest.name) : ''
  const manifestDesc = practiceManifest?.description
    ? localizeContent(practiceManifest.description)
    : ''

  const currentSchedule = practice ? parseSchedule(practice.schedule) : { type: 'daily' as const }

  const [form, setForm] = useState<PracticeFormData>({
    name: practice?.custom_name ?? manifestName ?? '',
    icon:
      practice?.custom_icon ??
      (practiceManifest ? getManifestIconKey(practiceManifest.id) : 'prayer'),
    tier: practice?.tier ?? 'ideal',
    timeBlock: practice?.time_block ?? 'flexible',
    schedule: currentSchedule,
    description: practice?.custom_desc ?? manifestDesc ?? '',
    enabled: practice ? practice.enabled === 1 : true,
  })

  function update<K extends keyof PracticeFormData>(key: K, value: PracticeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const notifyEnabled = hasNotify(form.schedule)
  const notifyTime = getNotifyTime(form.schedule)

  const notifyDate = useMemo(() => {
    const [h, m] = notifyTime.split(':').map(Number)
    const d = new Date()
    d.setHours(h || 0, m || 0, 0, 0)
    return d
  }, [notifyTime])

  function toggleNotify(enabled: boolean) {
    if (enabled) {
      const notify: Notification[] = [{ at: notifyTime }]
      update('schedule', { ...form.schedule, notify })
    } else {
      const { notify: _, ...rest } = form.schedule as Schedule & { notify?: Notification[] }
      update('schedule', rest as Schedule)
    }
  }

  function updateNotifyTime(time: string) {
    const notify: Notification[] = [{ at: time }]
    update('schedule', { ...form.schedule, notify })
  }

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
            {isAddMode
              ? manifestName || t('catalog.addToPlan')
              : !practice
                ? t('editor.newPractice')
                : t('editor.editPractice')}
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
            {!isBuiltin && (
              <>
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
                  />
                </YStack>

                <YStack gap="$xs">
                  <Text fontFamily="$heading" fontSize="$2" color="$color">
                    {t('editor.icon')}
                  </Text>
                  <IconPicker selected={form.icon} onSelect={(icon) => update('icon', icon)} />
                </YStack>
              </>
            )}

            <TierSelector value={form.tier} onChange={(tier) => update('tier', tier)} />
            <TimeBlockSelector value={form.timeBlock} onChange={(b) => update('timeBlock', b)} />
            <SchedulePicker
              schedule={form.schedule}
              onChangeSchedule={(s) => update('schedule', s)}
            />

            {!isBuiltin && (
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
            )}

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontFamily="$heading" fontSize="$2" color="$color">
                {t('editor.notifications')}
              </Text>
              <Switch value={notifyEnabled} onValueChange={toggleNotify} />
            </XStack>

            {notifyEnabled && (
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
                    updateNotifyTime(`${hh}:${mm}`)
                  }}
                />
              </XStack>
            )}

            {!isAddMode && (
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$heading" fontSize="$2" color="$color">
                  {t('editor.enabled')}
                </Text>
                <Switch value={form.enabled} onValueChange={(v) => update('enabled', v)} />
              </XStack>
            )}

            <Pressable onPress={() => onSave(form)}>
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                padding="$md"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {isAddMode
                    ? t('catalog.addToPlan')
                    : !practice
                      ? t('editor.createPractice')
                      : t('editor.saveChanges')}
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
