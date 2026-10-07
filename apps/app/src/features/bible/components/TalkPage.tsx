import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PrayerSpinner, ScreenLayout, Typography } from '@/components'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { fetchClerusTalk } from '@/sources/clerus/talk'
import { LongParagraph } from './LongParagraph'

/**
 * A pope's homily or address, read from Biblia Clerus where a verse's page
 * pointed to it. The text is the Holy See's, in Portuguese, and is fetched
 * when the page opens.
 */
export function TalkPage({
  page,
  anchor,
  title,
  collection,
}: {
  page: string
  anchor: string
  title: string
  collection: string
}) {
  const { t } = useTranslation()
  const {
    data: paragraphs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bible', 'talk', page, anchor],
    queryFn: () => fetchClerusTalk(page, anchor),
    staleTime: Number.POSITIVE_INFINITY,
  })
  // Kept across renders: the line breaker's work is remembered by the
  // identity of what it was given.
  const sources = useMemo(
    () => paragraphs?.map((p): StyledSegment[] => [{ text: p, style: 'regular' }]),
    [paragraphs],
  )

  return (
    <ScreenLayout>
      <YStack gap="$md" paddingVertical="$md">
        <YStack gap="$xs">
          <Typography variant="label" tone="muted" fontSize="$1" letterSpacing={1.5}>
            {collection.toUpperCase()}
          </Typography>
          <Typography variant="sacred-title" textAlign="left" fontSize="$4" lineHeight="$4">
            {title}
          </Typography>
        </YStack>
        {isLoading ? <PrayerSpinner /> : undefined}
        {error ? (
          <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
        ) : undefined}
        <YStack gap="$sm">
          {sources?.map((source, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a fixed run of text, never reordered
            <LongParagraph key={i} source={source} language="pt-BR" />
          ))}
        </YStack>
        {sources ? (
          <Typography variant="annotation" fontSize="$2">
            {t('bible.references.fromClerus')}
          </Typography>
        ) : undefined}
      </YStack>
    </ScreenLayout>
  )
}
