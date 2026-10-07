import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { fetchParagraphs } from '@/sources/ccc/extract'
import type { Lang } from '@/sources/ccc/parse'

/**
 * The paragraphs of the Catechism that cite a passage: their numbers, each
 * opening to its text. The text is read from vatican.va in the language of the
 * app, so this is commentary a Portuguese reader has in Portuguese.
 */
export function CatechismCitations({ paragraphs }: { paragraphs: number[] }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState<number>()
  const lang: Lang = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  const {
    data: text,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ccc', 'paragraph', open, lang],
    queryFn: async () => (await fetchParagraphs(open as number, 1, lang)).at(0)?.text ?? null,
    enabled: open !== undefined,
    staleTime: Number.POSITIVE_INFINITY,
  })

  return (
    <YStack gap="$sm">
      <XStack flexWrap="wrap" columnGap="$md" rowGap="$xs">
        {paragraphs.map((n) => (
          <Pressable
            key={n}
            onPress={() => setOpen(open === n ? undefined : n)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.catechismParagraph', { n })}
            accessibilityState={{ expanded: open === n }}
            aria-expanded={open === n}
          >
            <Typography
              fontSize="$3"
              lineHeight="$4"
              color={open === n ? '$colorBurgundy' : '$color'}
              textDecorationLine={open === n ? 'underline' : 'none'}
            >
              {n}
            </Typography>
          </Pressable>
        ))}
      </XStack>
      {open === undefined ? undefined : (
        <YStack gap="$xs">
          <Typography variant="reference">{t('bible.church.paragraph', { n: open })}</Typography>
          {isLoading ? <PrayerSpinner /> : undefined}
          {error || text === null ? (
            <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
          ) : undefined}
          {text ? (
            <Typography fontSize="$3" lineHeight="$3" selectable>
              {text}
            </Typography>
          ) : undefined}
        </YStack>
      )}
    </YStack>
  )
}
