import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, Trash2 } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { HIGHLIGHT_COLOR_IDS, HIGHLIGHT_COLORS } from './highlightColors'
import type { HighlightColor } from './highlights'

const sheetFraction = 0.55

type Props = {
  open: boolean
  onClose: () => void
  /** Identity of the highlight being edited; seeding only re-runs when this
   *  changes, so a parent re-render that hands the same highlight in fresh
   *  prop references won't clobber an in-progress edit. */
  highlightId: string | undefined
  /** Excerpt of the highlighted passage (italic header above the input). */
  excerpt: string | undefined
  /** Chapter title displayed alongside the excerpt; optional. */
  chapterTitle: string | undefined
  /** Existing note content + color when opened on an existing note; defaults
   *  to '' + the highlight's current color otherwise. */
  initialNote: string
  initialColor: HighlightColor
  onSave: (note: string, color: HighlightColor) => void
  /** Wipes the note text but keeps the underlying highlight. Only renders when
   *  `initialNote` is non-empty. */
  onDeleteNote?: () => void
}

export function ReaderNoteEditor({
  open,
  onClose,
  highlightId,
  excerpt,
  chapterTitle,
  initialNote,
  initialColor,
  onSave,
  onDeleteNote,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const [note, setNote] = useState(initialNote)
  const [color, setColor] = useState<HighlightColor>(initialColor)

  // Re-seed only when the editor opens or the *highlight identity* changes —
  // a parent re-render that fans new prop references for the same highlight
  // (e.g., after a setHighlights re-pull) won't clobber an in-progress edit.
  // biome-ignore lint/correctness/useExhaustiveDependencies: seed values are intentionally read at open/identity-change only
  useEffect(() => {
    if (open) {
      setNote(initialNote)
      setColor(initialColor)
    }
  }, [open, highlightId])

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
        gap="$md"
      >
        {chapterTitle ? (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1}>
            {chapterTitle}
          </Text>
        ) : null}
        {excerpt ? (
          <Text
            fontFamily="$body"
            fontSize="$2"
            fontStyle="italic"
            color="$color"
            numberOfLines={3}
            opacity={0.85}
          >
            &ldquo;{excerpt}&rdquo;
          </Text>
        ) : null}

        <XStack gap="$sm" alignItems="center">
          {HIGHLIGHT_COLOR_IDS.map((id) => {
            const selected = id === color
            return (
              <Pressable
                key={id}
                onPress={() => setColor(id)}
                accessibilityRole="button"
                accessibilityLabel={t(`books.highlight.${id}`, { defaultValue: id })}
                accessibilityState={{ selected }}
                hitSlop={4}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: HIGHLIGHT_COLORS[id].swatch,
                    borderWidth: selected ? 2 : 0,
                    borderColor: theme.accent?.val ?? theme.color?.val,
                  }}
                />
              </Pressable>
            )
          })}
        </XStack>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={t('books.notePlaceholder', {
            defaultValue: 'Write a note about this passage…',
          })}
          placeholderTextColor={theme.colorSecondary?.val}
          multiline
          autoFocus
          textAlignVertical="top"
          style={{
            flex: 1,
            fontSize: 16,
            lineHeight: 22,
            color: theme.color?.val,
            backgroundColor: theme.backgroundSurface?.val,
            borderRadius: 10,
            padding: 12,
          }}
        />

        <XStack justifyContent="space-between" alignItems="center">
          {onDeleteNote ? (
            <Pressable
              onPress={onDeleteNote}
              accessibilityRole="button"
              accessibilityLabel={t('books.deleteNote', { defaultValue: 'Delete note' })}
              hitSlop={8}
            >
              <XStack alignItems="center" gap="$xs">
                <Trash2 size={16} color={theme.colorSecondary?.val} />
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {t('books.deleteNote', { defaultValue: 'Delete note' })}
                </Text>
              </XStack>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable
            onPress={() => onSave(note, color)}
            accessibilityRole="button"
            accessibilityLabel={t('books.saveNote', { defaultValue: 'Save note' })}
          >
            <XStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$xs"
              paddingHorizontal="$md"
              borderRadius="$md"
              backgroundColor="$accent"
            >
              <Check size={16} color={theme.background?.val} />
              <Text fontFamily="$heading" fontSize="$2" color="$background">
                {t('books.saveNote', { defaultValue: 'Save note' })}
              </Text>
            </XStack>
          </Pressable>
        </XStack>
      </YStack>
    </BottomSheet>
  )
}
