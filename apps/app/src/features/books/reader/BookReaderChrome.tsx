import { Bookmark, BookmarkCheck, ChevronLeft, List, Type } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

type Props = {
  visible: boolean
  title: string
  progress: number
  saved: boolean
  showToc: boolean
  onBack: () => void
  onToggleSave: () => void
  onOpenSettings: () => void
  onOpenToc: () => void
}

/**
 * Native chrome around the DOM reader surface — fades in/out on a center tap.
 * Deliberately leaner than the practice screen's chrome: no ManuscriptFrame,
 * no ornaments, no rubric coloring. Long-form reading wants the page itself
 * to dominate, with controls only when summoned.
 */
export function BookReaderChrome({
  visible,
  title,
  progress,
  saved,
  showToc,
  onBack,
  onToggleSave,
  onOpenSettings,
  onOpenToc,
}: Props) {
  const { t } = useTranslation()
  const theme = useTheme()

  if (!visible) return null

  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
      <XStack
        alignItems="center"
        gap="$sm"
        paddingHorizontal="$md"
        paddingVertical="$sm"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="$background"
      >
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={24} color={theme.color.val} />
        </Pressable>
        <YStack flex={1} paddingHorizontal="$xs">
          {/* Book title as a running head: italic EB Garamond, small, muted —
              a printed-book convention, not a screaming Cinzel inscription. */}
          <Text
            fontFamily="$body"
            fontSize="$2"
            fontStyle="italic"
            color="$colorSecondary"
            numberOfLines={1}
          >
            {title}
          </Text>
        </YStack>
        <Pressable
          onPress={onToggleSave}
          hitSlop={8}
          accessibilityRole="switch"
          accessibilityState={{ checked: saved }}
          accessibilityLabel={saved ? t('library.saved') : t('library.save')}
        >
          {saved ? (
            <BookmarkCheck size={20} color={theme.accent.val} />
          ) : (
            <Bookmark size={20} color={theme.color.val} />
          )}
        </Pressable>
        <Pressable
          onPress={onOpenSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.readingSettings')}
        >
          <Type size={20} color={theme.color.val} />
        </Pressable>
        {showToc && (
          <Pressable
            onPress={onOpenToc}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.openTableOfContents')}
          >
            <List size={22} color={theme.color.val} />
          </Pressable>
        )}
      </XStack>
      <View height={2} backgroundColor="$borderColor">
        <View height={2} backgroundColor="$accent" width={`${Math.round(progress * 100)}%`} />
      </View>
    </Animated.View>
  )
}

export function BookReaderFooter({
  visible,
  chapterTitle,
  pageDisplay,
}: {
  visible: boolean
  chapterTitle?: string
  pageDisplay?: { current: number; total: number }
}) {
  if (!visible) return null
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        backgroundColor="$background"
      >
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" numberOfLines={1} flex={1}>
          {chapterTitle ?? ''}
        </Text>
        {pageDisplay && pageDisplay.total > 0 ? (
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {pageDisplay.current + 1} / {pageDisplay.total}
          </Text>
        ) : null}
      </XStack>
    </Animated.View>
  )
}
