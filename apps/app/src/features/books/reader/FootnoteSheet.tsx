import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, YStack } from 'tamagui'

const sheetFraction = 0.5

type Props = {
  /** Footnote inner HTML (already stripped of back-arrows); undefined = closed. */
  content: string | undefined
  onClose: () => void
}

// HTML → plain text. Footnotes from marked-footnote are usually a single
// paragraph; richer cases (multi-paragraph, inline emphasis) lose formatting
// here. Acceptable for MVP — full HTML rendering would mean shipping
// react-native-render-html just for this surface.
function htmlToPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>(?!\s*<)/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

export function FootnoteSheet({ content, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const text = content ? htmlToPlain(content) : ''

  return (
    <BottomSheet
      index={content ? 0 : -1}
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
        <Text fontFamily="$heading" fontSize="$3" color="$colorSecondary">
          {t('books.footnote', { defaultValue: 'Footnote' })}
        </Text>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <Text fontFamily="$body" fontSize="$3" color="$color" lineHeight="$3">
            {text}
          </Text>
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}
