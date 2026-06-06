import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { ChevronRight, List, Search, Type } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

type Props = {
  open: boolean
  onClose: () => void
  /** Omit to hide the row (e.g. books with no TOC). */
  onContents?: () => void
  onSearch: () => void
  onSettings: () => void
}

// Fixed snap point. Without one the native sheet measures content height
// after mount and re-animates, producing a visible double-snap on iOS.
const sheetFraction = 0.4

export function ReaderMenuSheet({ open, onClose, onContents, onSearch, onSettings }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack
        height={height * sheetFraction}
        paddingHorizontal="$lg"
        paddingTop="$md"
        paddingBottom={insets.bottom + 16}
        gap="$xs"
      >
        {onContents ? (
          <MenuRow
            icon={<List size={22} color={theme.color?.val} />}
            label={t('browse.tableOfContents')}
            onPress={onContents}
          />
        ) : null}
        <MenuRow
          icon={<Search size={22} color={theme.color?.val} />}
          label={t('books.search', { defaultValue: 'Search book' })}
          onPress={onSearch}
        />
        <MenuRow
          icon={<Type size={22} color={theme.color?.val} />}
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
