import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Bookmark as BookmarkIcon, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { formatSoftRelative } from '@/lib/softRelative'
import type { TocLeaf } from './bookContent'
import type { Bookmark } from './bookmarks'

type Props = {
  open: boolean
  onClose: () => void
  /** Full bookmark list (sorted newest-first); owner re-fetches after each mutation. */
  bookmarks: Bookmark[]
  /** Whether the "Add bookmark this page" CTA should be enabled — i.e. we know the cursor. */
  canAdd: boolean
  onAdd: () => void
  onRemove: (cursorId: string) => void
  leaves: TocLeaf[]
  titleLookup: Map<string, string>
  onSelect: (chapterIndex: number, fraction: number) => void
}

const sheetFraction = 0.85

export function ReaderBookmarksSheet({
  open,
  onClose,
  bookmarks,
  canAdd,
  onAdd,
  onRemove,
  leaves,
  titleLookup,
  onSelect,
}: Props) {
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
      <YStack height={height * sheetFraction} paddingTop="$md">
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$lg"
          paddingBottom="$md"
        >
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('books.bookmarks', { defaultValue: 'Bookmarks' })}
          </Text>
          <Pressable
            onPress={onAdd}
            disabled={!canAdd}
            accessibilityRole="button"
            accessibilityLabel={t('books.addBookmark', {
              defaultValue: 'Bookmark this page',
            })}
          >
            <XStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$xs"
              paddingHorizontal="$sm"
              borderRadius="$md"
              backgroundColor={canAdd ? '$accent' : '$backgroundSurface'}
              opacity={canAdd ? 1 : 0.4}
            >
              <BookmarkIcon size={16} color={canAdd ? theme.background?.val : theme.color?.val} />
              <Text fontFamily="$heading" fontSize="$1" color={canAdd ? '$background' : '$color'}>
                {t('books.addBookmark', { defaultValue: 'Bookmark this page' })}
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        {bookmarks.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$xl">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('books.noBookmarks', {
                defaultValue: 'No bookmarks yet. Tap the button above to mark this page.',
              })}
            </Text>
          </YStack>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(b) => b.cursorId}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => {
              const idx = leaves.findIndex((l) => l.id === item.chapterId)
              const chapterTitle = item.label ?? titleLookup.get(item.chapterId) ?? item.chapterId
              return (
                <XStack
                  alignItems="center"
                  paddingHorizontal="$lg"
                  paddingVertical="$sm"
                  borderBottomWidth={0.5}
                  borderColor="$borderColor"
                  gap="$sm"
                >
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                      if (idx < 0) return
                      onSelect(idx, item.fraction)
                      onClose()
                    }}
                    accessibilityRole="link"
                    accessibilityLabel={chapterTitle}
                  >
                    <YStack gap="$xs">
                      <Text fontFamily="$body" fontSize="$3" color="$color" numberOfLines={2}>
                        {chapterTitle}
                      </Text>
                      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                        {formatSoftRelative(item.createdAt, {
                          justNow: t('common.justNow', { defaultValue: 'just now' }),
                          aMomentAgo: t('common.aMomentAgo', { defaultValue: 'a moment ago' }),
                        })}
                      </Text>
                    </YStack>
                  </Pressable>
                  <Pressable
                    onPress={() => onRemove(item.cursorId)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('books.removeBookmark', {
                      defaultValue: 'Remove bookmark',
                    })}
                  >
                    <Trash2 size={18} color={theme.colorSecondary?.val} />
                  </Pressable>
                </XStack>
              )
            }}
          />
        )}
      </YStack>
    </BottomSheet>
  )
}
