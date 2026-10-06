import { Check, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'
import { translations } from '@/lib/bibleTranslations'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { LanguageBadge } from './TranslationBadge'

function TranslationRow({
  code,
  name,
  language,
  description,
  selected,
  onPress,
}: {
  code: string
  name: string
  language: string
  description?: string
  selected: boolean
  onPress: () => void
}) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${code}, ${name}`}
      accessibilityState={{ selected }}
    >
      <XStack
        paddingVertical="$md"
        paddingHorizontal="$lg"
        gap="$md"
        alignItems="center"
        backgroundColor={selected ? '$backgroundSurface' : 'transparent'}
      >
        <LanguageBadge code={language} />
        <YStack flex={1} gap={2}>
          <XStack gap="$sm" alignItems="baseline">
            <Text fontFamily="$heading" fontSize="$2" color="$color" fontWeight="700">
              {code}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {name}
            </Text>
          </XStack>
          {description ? (
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={2}>
              {description}
            </Text>
          ) : undefined}
        </YStack>
        {selected ? <Check size={20} color={theme.accent.val} /> : undefined}
      </XStack>
    </Pressable>
  )
}

export function TranslationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const translation = usePreferencesStore((s) => s.translation)
  const setTranslation = usePreferencesStore((s) => s.setTranslation)

  function handleSelect(code: string) {
    setTranslation(code)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View flex={1} backgroundColor="$background">
        <XStack
          paddingTop={insets.top + 8}
          paddingBottom="$sm"
          paddingHorizontal="$lg"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeModal')}
          >
            <X size={24} color={theme.color.val} />
          </Pressable>
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('translations.title')}
          </Text>
          <View width={24} />
        </XStack>

        <ScrollView flex={1}>
          {translations.map((t) => (
            <TranslationRow
              key={t.code}
              code={t.code}
              name={t.name}
              language={t.language}
              description={t.description}
              selected={translation === t.code}
              onPress={() => handleSelect(t.code)}
            />
          ))}

          <View height={insets.bottom + 24} />
        </ScrollView>
      </View>
    </Modal>
  )
}
