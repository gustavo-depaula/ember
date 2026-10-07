import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { VersePage } from '@/features/bible'

export default function BibleVerseScreen() {
  const { t } = useTranslation()
  const { bookId, chapter, verse } = useLocalSearchParams<{
    bookId: string
    chapter: string
    verse: string
  }>()
  // A link that names no verse (hand-typed, cut short) has no page to show.
  if (!bookId || !(Number(chapter) > 0) || !(Number(verse) > 0)) {
    return <Redirect href="/bible/reader" />
  }
  return (
    <>
      <Stack.Screen options={{ title: t('bible.commentary.title') }} />
      <VersePage bookId={bookId} chapter={Number(chapter)} verse={Number(verse)} />
    </>
  )
}
