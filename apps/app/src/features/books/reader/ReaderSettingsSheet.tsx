import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, XStack, YStack } from 'tamagui'

import { ReadingConfig } from '@/components/ReadingConfigModal'
import { READER_PALETTE_IDS, type ReaderPaletteId, resolvePalette } from '@/config/readerPalettes'
import { usePreferencesStore } from '@/stores/preferencesStore'

const sheetFraction = 0.9

export function ReaderSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const themePreference = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)
  const readerPalette = usePreferencesStore((s) => s.readerPalette)
  const setReaderPalette = usePreferencesStore((s) => s.setReaderPalette)

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
            <PalettePicker value={readerPalette} onChange={setReaderPalette} />

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

function PalettePicker({
  value,
  onChange,
}: {
  value: ReaderPaletteId
  onChange: (v: ReaderPaletteId) => void
}) {
  const { t } = useTranslation()
  // 'auto' has no fixed swatch — show with the current resolved palette.
  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
        {t('books.paletteLabel', { defaultValue: 'Reader palette' })}
      </Text>
      <XStack gap="$sm" flexWrap="wrap">
        {READER_PALETTE_IDS.map((id) => {
          const selected = id === value
          const swatch = id === 'auto' ? null : resolvePalette(id, false)
          return (
            <YStack
              key={id}
              alignItems="center"
              gap={4}
              onPress={() => onChange(id)}
              pressStyle={{ opacity: 0.85 }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <XStack
                width={48}
                height={48}
                borderRadius={24}
                borderWidth={selected ? 2 : 1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={swatch ? swatch.background : '$background'}
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                {swatch ? (
                  <Text fontFamily="$body" fontStyle="italic" fontSize="$3" color={swatch.color}>
                    Aa
                  </Text>
                ) : (
                  <Text fontFamily="$body" fontSize="$1" color="$color" letterSpacing={0.5}>
                    AUTO
                  </Text>
                )}
                {selected ? (
                  <XStack
                    position="absolute"
                    bottom={-2}
                    right={-2}
                    width={16}
                    height={16}
                    borderRadius={8}
                    backgroundColor="$accent"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Check size={10} color="white" />
                  </XStack>
                ) : null}
              </XStack>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {t(`books.palette.${id}`, { defaultValue: id })}
              </Text>
            </YStack>
          )
        })}
      </XStack>
    </YStack>
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
