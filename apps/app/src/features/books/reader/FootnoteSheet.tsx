import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, YStack } from 'tamagui'

import { stripHtml } from '@/lib/html'

const sheetFraction = 0.5

type Props = {
  /** Footnote inner HTML (already stripped of back-arrows); undefined = closed. */
  content: string | undefined
  onClose: () => void
}

export function FootnoteSheet({ content, onClose }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const text = content ? stripHtml(content, { preserveLineBreaks: true }) : ''

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
