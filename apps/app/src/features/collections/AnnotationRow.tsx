/**
 * Apparatus rendered beneath an item card title — the small structured
 * metadata of a real prayer book. Each present field gets one row:
 *
 *   ◦ rubric         "Kneel; pray slowly"
 *   ✦ indulgence     "300 days; plenary on usual conditions"
 *   § attribution    "St. Alphonsus de Ligório, 1755"
 *   ∗ context        "After Holy Communion"
 *   ⌚ time           "Morning"
 *
 * If no annotation fields are populated, renders nothing.
 */

import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { InlineMarkdown } from '@/components/prayer'
import type { CollectionItemAnnotation } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

const TIME_LABEL_KEY: Record<NonNullable<CollectionItemAnnotation['recommendedTime']>, string> = {
  morning: 'collections.time.morning',
  noon: 'collections.time.noon',
  evening: 'collections.time.evening',
  night: 'collections.time.night',
}

export function AnnotationRow({
  annotation,
}: {
  annotation: CollectionItemAnnotation | undefined
}) {
  const { t } = useTranslation()
  if (!annotation) return null

  const rows: { glyph: string; text: string }[] = []
  if (annotation.rubric) rows.push({ glyph: '◦', text: localizeContent(annotation.rubric) })
  if (annotation.indulgence) rows.push({ glyph: '✦', text: localizeContent(annotation.indulgence) })
  if (annotation.attribution)
    rows.push({ glyph: '§', text: localizeContent(annotation.attribution) })
  if (annotation.context) rows.push({ glyph: '∗', text: localizeContent(annotation.context) })
  if (annotation.recommendedTime) {
    rows.push({ glyph: '⌚', text: t(TIME_LABEL_KEY[annotation.recommendedTime]) })
  }

  if (rows.length === 0) return null

  return (
    <YStack gap={2} paddingTop={2}>
      {rows.map((row) => (
        <XStack key={row.glyph} gap="$xs" alignItems="flex-start">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" minWidth={14}>
            {row.glyph}
          </Text>
          <Text flex={1} fontFamily="$body" fontSize="$1" color="$colorSecondary">
            <InlineMarkdown source={row.text} />
          </Text>
        </XStack>
      ))}
    </YStack>
  )
}
