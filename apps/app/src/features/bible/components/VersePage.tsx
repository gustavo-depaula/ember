import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { PrayerSpinner, ScreenLayout, Typography } from '@/components'
import { findTranslation } from '@/lib/bibleTranslations'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { entriesForVerse, readingMinutes, spanLabel } from '../commentary'
import { useBookName, useChapter, useChapterCommentary } from '../hooks'
import { CommentaryVoices } from './CommentaryVoices'

/**
 * A verse's own page: the verse set large, then everything said of it, one
 * commentator after another and each in full. Where the half page beside the
 * text cuts a long note, this is where it reads on.
 */
export function VersePage({
  bookId,
  chapter,
  verse,
}: {
  bookId: string
  chapter: number
  verse: number
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const translation = usePreferencesStore((s) => s.translation)
  const bookName = useBookName(translation, bookId)
  const { data: chapterData } = useChapter(translation, bookId, chapter)
  const { sources, bySource, isLoading, error } = useChapterCommentary(bookId, chapter, true)

  const text = chapterData?.verses.find((v) => v.verse === verse)?.text
  // A stand-in chapter is the Douay-Rheims, whatever the edition chosen.
  const edition = chapterData?.fallback ? findTranslation('DRB') : findTranslation(translation)
  const spoken = sources
    .map((source) => ({ source, entries: entriesForVerse(bySource[source.id] ?? [], verse) }))
    .filter((s) => s.entries.length > 0)

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$md">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <XStack alignItems="center" gap="$xs" minHeight={44}>
            <ChevronLeft size={18} color={theme.colorSecondary.val} />
            <Typography tone="muted">{`${bookName} ${chapter}`}</Typography>
          </XStack>
        </Pressable>

        <YStack gap="$sm">
          {text ? (
            <Typography variant="sacred-title" textAlign="left" fontSize="$4" lineHeight="$4">
              {text}
            </Typography>
          ) : undefined}
          <Typography variant="label" tone="muted" fontSize="$1" letterSpacing={1.5}>
            {`${bookName} ${chapter}:${verse}${edition ? ` · ${edition.name}` : ''}`.toUpperCase()}
          </Typography>
        </YStack>

        {error ? (
          <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
        ) : undefined}
        {isLoading ? <PrayerSpinner /> : undefined}
        {!isLoading && !error && spoken.length === 0 ? (
          <Typography variant="caption" fontSize="$3">
            {t('bible.commentary.none', { verse })}
          </Typography>
        ) : undefined}

        {spoken.map(({ source, entries }) => (
          <YStack key={source.id} gap="$md">
            <XStack alignItems="baseline" justifyContent="space-between">
              <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
                {source.name.toUpperCase()}
              </Typography>
              <Typography variant="annotation">
                {t('bible.commentary.minutes', { count: readingMinutes(entries) })}
              </Typography>
            </XStack>
            {entries.map((entry) => (
              <YStack
                key={`${entry.from}-${entry.to}-${entry.voices[0]?.text.slice(0, 24)}`}
                gap="$sm"
              >
                {entry.from !== entry.to ? (
                  <Typography variant="reference">
                    {t('bible.commentary.onVerses', { verses: `${chapter}:${spanLabel(entry)}` })}
                  </Typography>
                ) : undefined}
                <CommentaryVoices voices={entry.voices} />
              </YStack>
            ))}
          </YStack>
        ))}
      </YStack>
    </ScreenLayout>
  )
}
