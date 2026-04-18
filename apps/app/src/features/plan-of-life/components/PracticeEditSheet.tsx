import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import { Input, Text, XStack, YStack } from 'tamagui'

import { tierConfig } from '@/config/constants'
import { getManifestIconKey } from '@/content/registry'
import type { PracticeManifest } from '@/content/types'
import type { Tier } from '@/db/schema'
import { localizeContent } from '@/lib/i18n'

import type { Schedule } from '../schedule'
import { IconPicker } from './IconPicker'
import { SchedulePicker } from './SchedulePicker'

export type PracticeFormData = {
  name: string
  icon: string
  tier: Tier
  schedule: Schedule
  description: string
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
        {tierEntries.map(([tier, config]) => {
          const label = t(`tier.${tier}`)
          return (
            <Pressable
              key={tier}
              onPress={() => onChange(tier)}
              style={{ flex: 1 }}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected: value === tier }}
            >
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
                  {label}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}

export function PracticeEditSheet({
  manifest,
  onSave,
  onClose,
}: {
  manifest?: PracticeManifest
  onSave: (data: PracticeFormData) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const isBuiltin = !!manifest

  const manifestName = manifest ? localizeContent(manifest.name) : ''
  const manifestDesc = manifest?.description ? localizeContent(manifest.description) : ''

  const [form, setForm] = useState<PracticeFormData>({
    name: manifestName ?? '',
    icon: manifest ? getManifestIconKey(manifest.id) : 'prayer',
    tier: (manifest?.defaults?.slots?.[0]?.tier as Tier) ?? 'ideal',
    schedule: manifest?.defaults?.slots?.[0]?.schedule
      ? (manifest.defaults.slots[0].schedule as Schedule)
      : { type: 'daily' as const },
    description: manifestDesc ?? '',
  })

  function update<K extends keyof PracticeFormData>(key: K, value: PracticeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
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
            {manifestName || t('editor.newPractice')}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('editor.cancel')}
          >
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

            <Pressable
              onPress={() => onSave(form)}
              accessibilityRole="button"
              accessibilityLabel={manifest ? t('catalog.addToPlan') : t('editor.createPractice')}
            >
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                padding="$md"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {manifest ? t('catalog.addToPlan') : t('editor.createPractice')}
                </Text>
              </YStack>
            </Pressable>
          </YStack>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  )
}
