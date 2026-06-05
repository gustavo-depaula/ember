import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, XStack, YStack } from 'tamagui'

import { ReadingConfig } from '@/components/ReadingConfigModal'
import { usePreferencesStore } from '@/stores/preferencesStore'

const sheetFraction = 0.9

/**
 * Apple Books-style "Themes & Settings": theme picker + the shared
 * `ReadingConfig` controls (font / size / spacing / margins / align / family).
 * Lives in a BottomSheet, opened from the menu sheet. Changes push live into
 * the foliate paginator via the BookReader's config-update effect.
 */
export function ReaderSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const themePreference = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} width="100%" paddingHorizontal="$lg" paddingTop="$md">
        <Text fontFamily="$heading" fontSize="$4" color="$color" paddingBottom="$md">
          {t('books.themesAndSettings', { defaultValue: 'Themes & Settings' })}
        </Text>
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          <YStack gap="$lg">
            <ThemePicker
              value={themePreference}
              onChange={setTheme}
              labels={{
                light: t('settings.themeLight', { defaultValue: 'Light' }),
                dark: t('settings.themeDark', { defaultValue: 'Dark' }),
                system: t('settings.themeSystem', { defaultValue: 'System' }),
              }}
            />
            <ReadingConfig />
          </YStack>
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}

function ThemePicker({
  value,
  onChange,
  labels,
}: {
  value: 'light' | 'dark' | 'system'
  onChange: (v: 'light' | 'dark' | 'system') => void
  labels: { light: string; dark: string; system: string }
}) {
  return (
    <XStack borderRadius="$lg" borderWidth={1} borderColor="$borderColor" overflow="hidden">
      {(['light', 'dark', 'system'] as const).map((opt) => {
        const selected = opt === value
        return (
          <XStack
            key={opt}
            flex={1}
            justifyContent="center"
            paddingVertical="$sm"
            backgroundColor={selected ? '$accent' : '$backgroundSurface'}
            onPress={() => onChange(opt)}
            pressStyle={{ opacity: 0.85 }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text fontFamily="$heading" fontSize="$2" color={selected ? '$background' : '$color'}>
              {labels[opt]}
            </Text>
          </XStack>
        )
      })}
    </XStack>
  )
}
