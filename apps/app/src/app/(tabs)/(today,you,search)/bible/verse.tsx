import { Stack, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { VersePage } from '@/features/bible'

export default function BibleVerseScreen() {
  const { t } = useTranslation()
  const { bookId, chapter, verse } = useLocalSearchParams<{
    bookId: string
    chapter: string
    verse: string
  }>()
  return (
    <>
      <Stack.Screen options={{ title: t('bible.commentary.title') }} />
      <VersePage bookId={bookId} chapter={Number(chapter)} verse={Number(verse)} />
    </>
  )
}
