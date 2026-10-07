import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { PrayerSpinner, ScreenLayout, Typography } from '@/components'
import { findTranslation } from '@/lib/bibleTranslations'
import { usePreferencesStore } from '@/stores/preferencesStore'

import {
  type CommentaryEntry,
  type CommentarySource,
  entriesForVerse,
  readingMinutes,
  spanLabel,
} from '../commentary'
import { useBookName, useChapter, useChapterCommentary, useEntryVoices } from '../hooks'
import { CommentaryVoices } from './CommentaryVoices'

/** One commentator on the verse, in full: each entry's words, read from where they are kept. */
function SourceCommentary({
  source,
  entries,
  chapter,
}: {
  source: CommentarySource
  entries: CommentaryEntry[]
  chapter: number
}) {
  const { t } = useTranslation()
  const { byEntry, isLoading, error } = useEntryVoices(entries)
  return (
    <YStack gap="$md">
      <XStack alignItems="baseline" justifyContent="space-between">
        <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
          {source.name.toUpperCase()}
        </Typography>
        {isLoading || error ? undefined : (
          <Typography variant="annotation">
            {t('bible.commentary.minutes', { count: readingMinutes(byEntry.flat()) })}
          </Typography>
        )}
      </XStack>
      {error ? <Typography variant="annotation">{t('common.couldntLoad')}</Typography> : undefined}
      {isLoading ? <PrayerSpinner /> : undefined}
      {entries.map((entry, i) => (
        <YStack key={entry.lecture?.chapterId ?? `${entry.from}-${entry.to}`} gap="$sm">
          {entry.from !== entry.to ? (
            <Typography variant="reference">
              {t('bible.commentary.onVerses', { verses: `${chapter}:${spanLabel(entry)}` })}
            </Typography>
          ) : undefined}
          <CommentaryVoices voices={byEntry[i] ?? []} />
        </YStack>
      ))}
    </YStack>
  )
}

/**
 * A verse with its commentary in full: where the half page beside the text
 * cuts a long note, this is where it reads on. `source` is the commentator it
 * was cut from; without one, every commentator on the verse follows another.
 */
export function VersePage({
  bookId,
  chapter,
  verse,
  source,
}: {
  bookId: string
  chapter: number
  verse: number
  source?: string
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
    .filter((s) => source === undefined || s.id === source)
    .map((s) => ({ source: s, entries: entriesForVerse(bySource[s.id] ?? [], verse) }))
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

        {spoken.map((s) => (
          <SourceCommentary
            key={s.source.id}
            source={s.source}
            entries={s.entries}
            chapter={chapter}
          />
        ))}
      </YStack>
    </ScreenLayout>
  )
}
