import { Stack, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { InlineRetry, Typography } from '@/components'
import { ChantSheet } from '@/features/chant/ChantSheet'
import { sectionLabel } from '@/features/chant/chants'
import { useChantBook } from '@/features/chant/hooks'

// A page of a chant book — a Mass of the Graduale or the Kyriale, a day of the
// Antiphonale — read as one sheet.
export default function ChantPageScreen() {
  const { t } = useTranslation()
  const { bookId, sectionId } = useLocalSearchParams<{ bookId: string; sectionId: string }>()
  const book = useChantBook(`chant-book/${bookId}`)
  const section = book.data?.sections.find((s) => s.id === sectionId)
  const title = section ? sectionLabel(section) : t('chant.title')

  return (
    <>
      <Stack.Screen options={{ title }} />
      {section ? (
        <ChantSheet
          title={title}
          chants={section.chants}
          heads={section.heads}
          parts={section.parts}
          hours={bookId === 'antiphonale'}
        />
      ) : (
        <YStack flex={1} padding="$lg" backgroundColor="$background" justifyContent="center">
          {book.isError && <InlineRetry onRetry={() => book.refetch()} />}
          {book.data !== undefined && <Typography tone="muted">{t('chant.notFound')}</Typography>}
        </YStack>
      )}
    </>
  )
}
