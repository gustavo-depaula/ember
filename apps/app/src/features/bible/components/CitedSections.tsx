import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import type { StyledSegment } from '@/lib/typography/justifyText'
import { LongParagraph } from './LongParagraph'
import { Capped, ReferenceRow } from './ReferenceRow'

/**
 * A numbered section of a document: `id` tells them apart, `lead` is its
 * number where the row opens with it, and `label` says what it is.
 */
export type CitedSection = { id: string; lead?: string; label: string }

function SectionText({
  section,
  load,
  language,
  after,
}: {
  section: CitedSection
  load: (section: CitedSection) => Promise<string[]>
  language?: string
  after?: (section: CitedSection) => ReactNode
}) {
  const { t } = useTranslation()
  const {
    data: paragraphs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bible', 'cited-section', section.id, language],
    queryFn: () => load(section),
    staleTime: Number.POSITIVE_INFINITY,
  })
  // Kept across renders: the line breaker's work is remembered by the
  // identity of what it was given.
  const sources = useMemo(
    () =>
      paragraphs?.map((p): StyledSegment[] => [{ text: p.replace(/\n/g, ' '), style: 'regular' }]),
    [paragraphs],
  )
  return (
    <YStack gap="$xs" paddingVertical="$sm" borderBottomWidth={1} borderBottomColor="$borderColor">
      {isLoading ? <PrayerSpinner /> : undefined}
      {error || paragraphs?.length === 0 ? (
        <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
      ) : undefined}
      {sources?.map((source) => (
        <LongParagraph key={source[0].text.slice(0, 40)} source={source} language={language} />
      ))}
      {sources && after ? after(section) : undefined}
    </YStack>
  )
}

/**
 * The numbered sections of documents that cite a verse (paragraphs of the
 * Catechism, articles of an encyclical), a row to each, opening where it
 * stands to its text. The text is the publisher's and is read from there when
 * asked for.
 */
export function CitedSections({
  sections,
  load,
  language,
  after,
}: {
  sections: CitedSection[]
  load: (section: CitedSection) => Promise<string[]>
  /** The language the text comes in, when it is not the reader's. */
  language?: string
  /** What follows a section's text once it is open (the Scripture it cites). */
  after?: (section: CitedSection) => ReactNode
}) {
  const [open, setOpen] = useState<string>()
  return (
    <Capped
      items={sections}
      render={(section) => {
        const expanded = open === section.id
        return (
          <YStack key={section.id}>
            <ReferenceRow
              lead={section.lead}
              label={section.label}
              expanded={expanded}
              onPress={() => setOpen(expanded ? undefined : section.id)}
            />
            {expanded ? (
              <SectionText section={section} load={load} language={language} after={after} />
            ) : undefined}
          </YStack>
        )
      }}
    />
  )
}
