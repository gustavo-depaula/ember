import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { NotebookPen, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { formatSoftRelative } from '@/lib/softRelative'
import type { TocLeaf } from './bookContent'
import { HIGHLIGHT_COLORS } from './highlightColors'
import type { Highlight } from './highlights'

const sheetFraction = 0.85

type Props = {
  open: boolean
  onClose: () => void
  highlights: Highlight[]
  leaves: TocLeaf[]
  titleLookup: Map<string, string>
  /** Jump to a highlight; owner uses `goToWithFind` to land on the exact text. */
  onSelect: (highlight: Highlight, chapterIndex: number) => void
  onRemove: (cursorId: string) => void
}

export function ReaderHighlightsSheet({
  open,
  onClose,
  highlights,
  leaves,
  titleLookup,
  onSelect,
  onRemove,
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
        <XStack alignItems="center" paddingHorizontal="$lg" paddingBottom="$md">
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('books.highlights', { defaultValue: 'Highlights & Notes' })}
          </Text>
        </XStack>

        {highlights.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$xl">
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {t('books.noHighlights', {
                defaultValue: 'No highlights yet. Select text in the page to start.',
              })}
            </Text>
          </YStack>
        ) : (
          <FlatList
            data={highlights}
            keyExtractor={(h) => h.cursorId}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => {
              const idx = leaves.findIndex((l) => l.id === item.chapterId)
              const chapterTitle = titleLookup.get(item.chapterId) ?? item.chapterId
              const stripeColor = HIGHLIGHT_COLORS[item.color].swatch
              return (
                <XStack
                  alignItems="stretch"
                  paddingVertical="$sm"
                  borderBottomWidth={0.5}
                  borderColor="$borderColor"
                >
                  <View
                    style={{
                      width: 4,
                      backgroundColor: stripeColor,
                      marginRight: 12,
                      marginLeft: 16,
                      borderRadius: 2,
                    }}
                  />
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => {
                      if (idx < 0) return
                      onSelect(item, idx)
                      onClose()
                    }}
                    accessibilityRole="link"
                    accessibilityLabel={chapterTitle}
                  >
                    <YStack gap="$xs" paddingRight="$md">
                      <Text
                        fontFamily="$body"
                        fontSize="$1"
                        color="$colorSecondary"
                        numberOfLines={1}
                      >
                        {chapterTitle}
                      </Text>
                      <Text
                        fontFamily="$body"
                        fontSize="$3"
                        fontStyle="italic"
                        color="$color"
                        numberOfLines={3}
                      >
                        &ldquo;{item.text}&rdquo;
                      </Text>
                      {item.note ? (
                        <XStack alignItems="flex-start" gap="$xs" paddingTop="$xs">
                          <NotebookPen
                            size={12}
                            color={theme.colorSecondary?.val}
                            style={{ marginTop: 4 }}
                          />
                          <Text
                            fontFamily="$body"
                            fontSize="$2"
                            color="$color"
                            numberOfLines={4}
                            flex={1}
                          >
                            {item.note}
                          </Text>
                        </XStack>
                      ) : null}
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
                    accessibilityLabel={t('books.removeHighlight', {
                      defaultValue: 'Remove highlight',
                    })}
                    style={{ paddingHorizontal: 16, justifyContent: 'center' }}
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
