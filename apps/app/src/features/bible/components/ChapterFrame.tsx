import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { Typography } from '@/components'
import { useReadingMargin, useReadingMaxWidth } from '@/hooks/useReadingStyle'

/**
 * The column a chapter is set in, whatever its layout: the reading measure,
 * the book and chapter over it, and a word where the page is not the edition
 * chosen (the Douay-Rheims standing in, or an edition completing it).
 */
export function ChapterFrame({
  bookName,
  chapter,
  fallback,
  completedBy,
  gap,
  children,
}: {
  bookName: string
  chapter: number
  fallback?: boolean
  /** The edition the chapter is read from, where it completes the one chosen. */
  completedBy?: string
  /** Between the verses. */
  gap: '$xs' | '$lg'
  children: ReactNode
}) {
  const { t } = useTranslation()
  const margin = useReadingMargin()
  const maxWidth = useReadingMaxWidth()
  return (
    <YStack
      gap={gap}
      paddingVertical="$lg"
      paddingHorizontal={margin}
      width="100%"
      maxWidth={maxWidth}
      alignSelf="center"
    >
      <YStack alignItems="center" gap="$md" paddingBottom="$md">
        <Typography variant="label" tone="muted" fontSize="$5" textAlign="center">
          {bookName}
        </Typography>
        <Typography variant="label" tone="muted" fontSize="$4">
          {t('position.chapter', { n: chapter })}
        </Typography>
      </YStack>

      {fallback ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          {t('bible.showingFallback')}
        </Text>
      ) : undefined}
      {completedBy ? (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" textAlign="center">
          {t('bible.showingEdition', { name: completedBy })}
        </Text>
      ) : undefined}
      {children}
    </YStack>
  )
}
