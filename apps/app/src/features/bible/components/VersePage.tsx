import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { PrayerSpinner, ScreenLayout, Typography } from '@/components'
import { findTranslation } from '@/lib/bibleTranslations'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { citationsForVerse, getChapterCitations, passageLabel } from '../citations'
import {
  type CommentaryEntry,
  type CommentarySource,
  entriesForVerse,
  getLectures,
  readingMinutes,
  spanLabel,
} from '../commentary'
import { useBookName, useChapter, useChapterCommentary, useEntryVoices } from '../hooks'
import { CatechismCitations } from './CatechismCitations'
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

  // The index of citations is an addition to the page: without it (offline,
  // a book it lacks) the commentary still stands, so its failure is not shown.
  const { data: passages } = useQuery({
    queryKey: ['bible', 'citations', bookId, chapter],
    queryFn: () => getChapterCitations(bookId, chapter),
    staleTime: Number.POSITIVE_INFINITY,
  })
  const cited = citationsForVerse(passages ?? [], verse)
  const { data: lectures } = useQuery({
    queryKey: ['bible', 'lectures', bookId, chapter],
    queryFn: () => getLectures(bookId, chapter),
    staleTime: Number.POSITIVE_INFINITY,
  })
  const onVerse = entriesForVerse(lectures ?? [], verse)

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
        {!isLoading &&
        !error &&
        spoken.length === 0 &&
        onVerse.length === 0 &&
        !cited?.ccc.length ? (
          <Typography variant="caption" fontSize="$3">
            {t('bible.commentary.none', { verse })}
          </Typography>
        ) : undefined}

        {spoken.map(({ source, entries }) => (
          <SourceCommentary key={source.id} source={source} entries={entries} chapter={chapter} />
        ))}

        {onVerse.length > 0 ? (
          <YStack gap="$sm">
            <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
              {t('bible.commentary.aquinas').toUpperCase()}
            </Typography>
            {onVerse.map((lecture) => {
              const label = t('bible.commentary.lecture', {
                verses: `${chapter}:${spanLabel(lecture)}`,
              })
              return (
                <Pressable
                  key={lecture.chapterId}
                  onPress={() =>
                    router.push({
                      pathname: '/browse/book/[bookId]/read',
                      params: { bookId: lecture.bookId, chapter: lecture.chapterId },
                    })
                  }
                  accessibilityRole="link"
                  accessibilityLabel={label}
                >
                  <XStack alignItems="center" gap="$xs" minHeight={44}>
                    <Typography fontSize="$3">{label}</Typography>
                    <ChevronRight size={16} color={theme.colorSecondary.val} />
                  </XStack>
                </Pressable>
              )
            })}
          </YStack>
        ) : undefined}

        {cited && cited.ccc.length > 0 ? (
          <YStack gap="$md">
            <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
              {t('bible.church.title', {
                passage: `${bookName} ${passageLabel(cited.passage)}`,
              }).toUpperCase()}
            </Typography>
            <Typography variant="annotation" fontSize="$2">
              {t('bible.church.catechism')}
            </Typography>
            <CatechismCitations paragraphs={cited.ccc} />
          </YStack>
        ) : undefined}
      </YStack>
    </ScreenLayout>
  )
}
