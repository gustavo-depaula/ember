import { ChevronDown } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack } from 'tamagui'

import { Typography } from '@/components'

export function ReaderHeader({
  bookName,
  chapter,
  onBookPress,
  onChapterPress,
}: {
  bookName: string
  chapter: number
  onBookPress: () => void
  onChapterPress: () => void
}) {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$sm">
      <Pressable
        onPress={onBookPress}
        style={{ flex: 1 }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.selectBook')}
      >
        <XStack alignItems="center" gap="$xs">
          <Typography fontSize="$5" fontWeight="500" numberOfLines={1} flexShrink={1}>
            {bookName}
          </Typography>
          <ChevronDown size={18} color={theme.color.val} />
        </XStack>
      </Pressable>

      <Pressable
        onPress={onChapterPress}
        style={{ paddingLeft: 32, paddingVertical: 8 }}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.selectChapter')}
      >
        <Typography fontSize="$5" tone="muted">
          {chapter}
        </Typography>
      </Pressable>
    </XStack>
  )
}
