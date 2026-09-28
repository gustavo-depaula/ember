import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { Input, Text, XStack, YStack } from 'tamagui'

import { IconPicker } from './IconPicker'

export type PracticeFormData = {
  name: string
  icon: string
  description: string
}

/**
 * A practice of one's own: its name, icon and a line about it. Its days and
 * hour are asked next, as for any practice joining the rule.
 */
export function PracticeEditSheet({
  onSave,
  onClose,
}: {
  onSave: (data: PracticeFormData) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<PracticeFormData>({ name: '', icon: 'prayer', description: '' })

  function update<K extends keyof PracticeFormData>(key: K, value: PracticeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ maxHeight: '85%' }}>
      <YStack
        backgroundColor="$background"
        borderTopLeftRadius="$lg"
        borderTopRightRadius="$lg"
        padding="$lg"
        gap="$lg"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('editor.newPractice')}
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

            <Pressable
              onPress={() => onSave(form)}
              disabled={!form.name.trim()}
              accessibilityRole="button"
              accessibilityLabel={t('editor.createPractice')}
            >
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                padding="$md"
                alignItems="center"
              >
                <Text fontFamily="$heading" fontSize="$3" color="white">
                  {t('editor.createPractice')}
                </Text>
              </YStack>
            </Pressable>
          </YStack>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  )
}
