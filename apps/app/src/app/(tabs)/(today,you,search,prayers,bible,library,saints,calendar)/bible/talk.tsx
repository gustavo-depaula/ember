import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { TalkPage } from '@/features/bible'

export default function BibleTalkScreen() {
  const { t } = useTranslation()
  const { page, anchor, title, collection } = useLocalSearchParams<{
    page: string
    anchor: string
    title: string
    collection: string
  }>()
  // Reached from a verse in the reader, which names the text; a link that does not has none to show.
  if (!page || !anchor) return <Redirect href="/bible/reader" />
  return (
    <>
      <Stack.Screen options={{ title: t('bible.references.talk') }} />
      <TalkPage page={page} anchor={anchor} title={title ?? ''} collection={collection ?? ''} />
    </>
  )
}
