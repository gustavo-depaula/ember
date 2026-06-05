import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { ChevronRight, List, Type } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

type Props = {
  open: boolean
  onClose: () => void
  /** Omit to hide the row (e.g. books with no TOC). */
  onContents?: () => void
  onSettings: () => void
}

/**
 * The Apple Books-style menu sheet. Two rows for MVP — Contents + Themes &
 * Settings. Each row dismisses this sheet and opens a dedicated sub-sheet so
 * the surfaces never stack visually.
 */
export function ReaderMenuSheet({ open, onClose, onContents, onSettings }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <BottomSheet
      index={open ? 0 : -1}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$md" paddingBottom={insets.bottom + 16} gap="$xs">
        {onContents ? (
          <MenuRow
            icon={<List size={20} color={theme.color?.val} />}
            label={t('books.tableOfContents')}
            onPress={onContents}
          />
        ) : null}
        <MenuRow
          icon={<Type size={20} color={theme.color?.val} />}
          label={t('books.themesAndSettings', { defaultValue: 'Themes & Settings' })}
          onPress={onSettings}
        />
      </YStack>
    </BottomSheet>
  )
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$md"
        paddingHorizontal="$sm"
        borderRadius="$md"
      >
        {icon}
        <Text fontFamily="$heading" fontSize="$3" color="$color" flex={1}>
          {label}
        </Text>
        <ChevronRight size={18} color={theme.colorSecondary?.val} />
      </XStack>
    </Pressable>
  )
}
