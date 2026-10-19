import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Bookmark, ChevronRight, Highlighter, List, Search, Type } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { EditionSelector } from '../EditionSelector'
import type { BookEdition } from '../editions'

type Props = {
  open: boolean
  onClose: () => void
  editions: BookEdition[]
  edition: string
  onEdition: (edition: string) => void
  /** Omit to hide the row (e.g. books with no TOC). */
  onContents?: () => void
  onSearch: () => void
  onBookmarks: () => void
  onHighlights: () => void
  onSettings: () => void
}

// Per-row contribution to the sheet height (in viewport fractions). Adding it
// up keeps the sheet snug as rows come and go (TOC is optional). A fixed
// fraction would leave dead space on books without a TOC.
const ROW_FRACTION = 0.09
const CHROME_FRACTION = 0.13
// The edition pills: a label line plus wrapped rows, about two pills a row.
const EDITION_LABEL_FRACTION = 0.04
const EDITION_ROW_FRACTION = 0.055

export function ReaderMenuSheet({
  open,
  onClose,
  editions,
  edition,
  onEdition,
  onContents,
  onSearch,
  onBookmarks,
  onHighlights,
  onSettings,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const rowCount = (onContents ? 1 : 0) + 4
  const editionFraction =
    editions.length > 1
      ? EDITION_LABEL_FRACTION + Math.ceil(editions.length / 2) * EDITION_ROW_FRACTION
      : 0
  const sheetFraction = CHROME_FRACTION + rowCount * ROW_FRACTION + editionFraction

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
        <YStack paddingHorizontal="$sm" paddingBottom={editions.length > 1 ? '$sm' : 0}>
          <EditionSelector editions={editions} edition={edition} onChange={onEdition} />
        </YStack>
        {onContents ? (
          <MenuRow
            icon={<List size={22} color={theme.color?.val} />}
            label={t('browse.tableOfContents')}
            onPress={onContents}
          />
        ) : null}
        <MenuRow
          icon={<Bookmark size={22} color={theme.color?.val} />}
          label={t('books.bookmarks', { defaultValue: 'Bookmarks' })}
          onPress={onBookmarks}
        />
        <MenuRow
          icon={<Highlighter size={22} color={theme.color?.val} />}
          label={t('books.highlights', { defaultValue: 'Highlights & Notes' })}
          onPress={onHighlights}
        />
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
