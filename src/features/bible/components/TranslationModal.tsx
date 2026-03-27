import { Check, X } from 'lucide-react-native'
import { useMemo } from 'react'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'

import { type BollsLanguageEntry, extractLanguageCode, suggestedTranslations } from '@/lib/bolls'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { useAllTranslations } from '../hooks'
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
    <Pressable onPress={onPress}>
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

function SectionHeader({ title }: { title: string }) {
  return (
    <YStack paddingHorizontal="$lg" paddingTop="$lg" paddingBottom="$sm">
      <Text fontFamily="$heading" fontSize="$3" color="$color" fontWeight="700">
        {title}
      </Text>
    </YStack>
  )
}

function buildLanguageGroups(apiData: BollsLanguageEntry[]): Array<{
  language: string
  languageCode: string
  translations: Array<{ code: string; name: string }>
}> {
  const suggestedCodes = new Set(suggestedTranslations.map((t) => t.code))

  return apiData
    .map((lang) => ({
      language: lang.language.split(/[/（]/)[0].trim(),
      languageCode: extractLanguageCode(lang.language),
      translations: lang.translations
        .filter((t) => !suggestedCodes.has(t.short_name))
        .map((t) => ({
          code: t.short_name,
          name: t.full_name,
        })),
    }))
    .filter((g) => g.translations.length > 0)
    .sort((a, b) => a.language.localeCompare(b.language))
}

export function TranslationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const translation = usePreferencesStore((s) => s.translation)
  const setTranslation = usePreferencesStore((s) => s.setTranslation)
  const { data: apiTranslations } = useAllTranslations()

  const languageGroups = useMemo(
    () => buildLanguageGroups(apiTranslations ?? []),
    [apiTranslations],
  )

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
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={24} color={theme.color.val} />
          </Pressable>
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            Translations
          </Text>
          <View width={24} />
        </XStack>

        <ScrollView flex={1}>
          <SectionHeader title="Suggested Bibles" />
          {suggestedTranslations.map((t) => (
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

          {languageGroups.length > 0 ? (
            <>
              <SectionHeader title="All Translations" />
              {languageGroups.map((group) => (
                <YStack key={group.language}>
                  <YStack paddingHorizontal="$lg" paddingTop="$md" paddingBottom="$xs">
                    <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
                      {group.language}
                    </Text>
                  </YStack>
                  {group.translations.map((t) => (
                    <TranslationRow
                      key={t.code}
                      code={t.code}
                      name={t.name}
                      language={group.languageCode}
                      selected={translation === t.code}
                      onPress={() => handleSelect(t.code)}
                    />
                  ))}
                </YStack>
              ))}
            </>
          ) : undefined}

          <View height={insets.bottom + 24} />
        </ScrollView>
      </View>
    </Modal>
  )
}
