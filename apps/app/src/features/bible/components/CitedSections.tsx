import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { ReadingParagraph } from '@/components/ReadingParagraph'
import type { StyledSegment } from '@/lib/typography/justifyText'

/** A numbered section of a document: `id` tells them apart, `n` is what is shown. */
export type CitedSection = { id: string; n: string }

/**
 * The numbered sections of a document that cite a passage (paragraphs of the
 * Catechism, articles of an encyclical): their numbers, each opening to its
 * text. The text is the publisher's and is read from there when asked for.
 */
export function CitedSections({
  work,
  sections,
  load,
  language,
}: {
  /** The document's name, which also heads the text once a section is open. */
  work: string
  sections: CitedSection[]
  load: (section: CitedSection) => Promise<string[]>
  /** The language the text comes in, when it is not the reader's. */
  language?: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<CitedSection>()
  const {
    data: paragraphs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bible', 'cited-section', work, open?.id],
    queryFn: () => load(open as CitedSection),
    enabled: open !== undefined,
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
    <YStack gap="$sm">
      <XStack flexWrap="wrap" columnGap="$md" rowGap="$xs">
        {sections.map((section) => {
          const selected = open?.id === section.id
          return (
            <Pressable
              key={section.id}
              onPress={() => setOpen(selected ? undefined : section)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.citedSection', { work, n: section.n })}
              accessibilityState={{ expanded: selected }}
              aria-expanded={selected}
            >
              <Typography
                fontSize="$3"
                lineHeight="$4"
                color={selected ? '$colorBurgundy' : '$color'}
                textDecorationLine={selected ? 'underline' : 'none'}
              >
                {section.n}
              </Typography>
            </Pressable>
          )
        })}
      </XStack>
      {open === undefined ? undefined : (
        <YStack gap="$xs">
          <Typography variant="reference">{`${work}, ${open.n}`}</Typography>
          {isLoading ? <PrayerSpinner /> : undefined}
          {error || paragraphs?.length === 0 ? (
            <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
          ) : undefined}
          {sources?.map((source) => (
            <ReadingParagraph
              key={source[0].text.slice(0, 40)}
              source={source}
              language={language}
            />
          ))}
        </YStack>
      )}
    </YStack>
  )
}
