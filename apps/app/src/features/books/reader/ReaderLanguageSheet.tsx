import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { languageAutonym } from './bookLanguage'

const rowHeight = 52
const headerHeight = 56
const maxFraction = 0.7

export function ReaderLanguageSheet({
  open,
  onClose,
  languages,
  current,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  languages: readonly string[]
  current: string
  onSelect: (lang: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  // Snug for a book in two or three languages; scrolls for one in twenty.
  const contentHeight = headerHeight + languages.length * rowHeight + insets.bottom + 16
  const fraction = Math.min(maxFraction, contentHeight / height)

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${fraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * fraction} paddingHorizontal="$lg" paddingTop="$md">
        <Text fontFamily="$heading" fontSize="$5" color="$color" paddingBottom="$sm">
          {t('books.language')}
        </Text>
        <FlatList
          data={languages}
          keyExtractor={(lang) => lang}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          renderItem={({ item: lang }) => (
            <Pressable
              onPress={() => onSelect(lang)}
              accessibilityRole="button"
              accessibilityState={{ selected: lang === current }}
              accessibilityLabel={languageAutonym(lang)}
            >
              <XStack height={rowHeight} alignItems="center" gap="$md" paddingHorizontal="$sm">
                <Text fontFamily="$heading" fontSize="$3" color="$color" flex={1}>
                  {languageAutonym(lang)}
                </Text>
                {lang === current ? <Check size={20} color={theme.accent?.val} /> : null}
              </XStack>
            </Pressable>
          )}
        />
      </YStack>
    </BottomSheet>
  )
}
