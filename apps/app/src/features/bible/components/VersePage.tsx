import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { PrayerSpinner, ScreenLayout, Typography } from '@/components'
import { findTranslation } from '@/lib/bibleTranslations'
import { fetchParagraphs } from '@/sources/ccc/extract'
import { fetchClerusPlace } from '@/sources/clerus/place'
import { usePreferencesStore } from '@/stores/preferencesStore'

import {
  type CitingDocument,
  citationsForVerse,
  getChapterCitations,
  passageLabel,
  splitByVerse,
} from '../citations'
import {
  type CommentaryEntry,
  type CommentarySource,
  entriesForVerse,
  getLectures,
  readingMinutes,
  spanLabel,
} from '../commentary'
import { useBookName, useChapter, useChapterCommentary, useEntryVoices } from '../hooks'
import { CitedSections } from './CitedSections'
import { CommentaryVoices } from './CommentaryVoices'
import { ParagraphScripture, VerseAtMass, VersePopes, VerseSumma } from './VerseReferences'

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

/** Paragraphs of the Catechism, each opening to its text and the Scripture it cites. */
function CatechismParagraphs({ label, paragraphs }: { label: string; paragraphs: number[] }) {
  const { t, i18n } = useTranslation()
  if (paragraphs.length === 0) return undefined
  // vatican.va has the Catechism in both of the app's languages.
  const language = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  return (
    <YStack gap="$sm">
      <Typography variant="annotation" fontSize="$2">
        {label}
      </Typography>
      <CitedSections
        work={t('bible.church.catechismName')}
        language={language}
        sections={paragraphs.map((n) => ({ id: String(n), n: String(n) }))}
        load={async ({ n }) => (await fetchParagraphs(Number(n), 1, language)).map((p) => p.text)}
        after={({ n }) => <ParagraphScripture paragraph={Number(n)} />}
      />
    </YStack>
  )
}

/** Documents of the councils and popes, each with its numbered sections opening to their text. */
function CitingDocuments({ label, documents }: { label: string; documents: CitingDocument[] }) {
  if (documents.length === 0) return undefined
  return (
    <YStack gap="$sm">
      <Typography variant="annotation" fontSize="$2">
        {label}
      </Typography>
      {documents.map((document) => (
        <YStack key={document.work} gap="$xs">
          <Typography variant="section-title" fontSize="$3">
            {document.work}
          </Typography>
          <CitedSections
            work={document.work}
            sections={document.places.map(([n, file, anchor]) => ({ id: `${file}#${anchor}`, n }))}
            // Clerus holds these documents in Portuguese.
            language="pt-BR"
            load={({ id }) => {
              const [file, anchor] = id.split('#')
              return fetchClerusPlace(file, anchor)
            }}
          />
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
  const split = cited ? splitByVerse(cited, verse) : undefined
  // Whether anything cites the verse itself, which the rest is then "elsewhere" to.
  const nearby = Boolean(split && (split.ccc.here.length || split.magisterium.here.length))
  const { data: lectures } = useQuery({
    queryKey: ['bible', 'lectures', bookId, chapter],
    queryFn: () => getLectures(bookId, chapter),
    staleTime: Number.POSITIVE_INFINITY,
  })
  const onVerse = entriesForVerse(lectures ?? [], verse)

  function openInBook(book: string, chapterId: string) {
    router.push({
      pathname: '/browse/book/[bookId]/read',
      params: { bookId: book, chapter: chapterId },
    })
  }

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
        !cited?.ccc.length &&
        !cited?.homilies?.length &&
        !cited?.magisterium?.length ? (
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
                  onPress={() => openInBook(lecture.bookId, lecture.chapterId)}
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

        {cited &&
        split &&
        (cited.ccc.length > 0 || cited.homilies?.length || cited.magisterium?.length) ? (
          <YStack gap="$md">
            <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
              {t('bible.church.title', {
                passage: `${bookName} ${passageLabel(cited.passage)}`,
              }).toUpperCase()}
            </Typography>
            {cited.homilies?.length ? (
              <YStack>
                <Typography variant="annotation" fontSize="$2">
                  {t('bible.church.homilies')}
                </Typography>
                {cited.homilies.map((homily) => {
                  const label = t(`bible.church.${homily.author}.${homily.kind}`, { n: homily.n })
                  return (
                    <Pressable
                      key={`${homily.book}-${homily.chapter}`}
                      onPress={() => openInBook(homily.book, homily.chapter)}
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
            {/* What cites this verse itself, then what cites only its neighbours. */}
            <CatechismParagraphs
              label={t('bible.church.catechismVerse')}
              paragraphs={split.ccc.here}
            />
            <CitingDocuments
              label={t('bible.church.magisteriumVerse')}
              documents={split.magisterium.here}
            />
            <CatechismParagraphs
              label={t(nearby ? 'bible.church.catechismElsewhere' : 'bible.church.catechism')}
              paragraphs={split.ccc.elsewhere}
            />
            <CitingDocuments
              label={t(nearby ? 'bible.church.magisteriumElsewhere' : 'bible.church.magisterium')}
              documents={split.magisterium.elsewhere}
            />
          </YStack>
        ) : undefined}

        <VerseSumma bookId={bookId} chapter={chapter} verse={verse} />
        <VersePopes bookId={bookId} chapter={chapter} verse={verse} />
        <VerseAtMass bookId={bookId} chapter={chapter} verse={verse} />
      </YStack>
    </ScreenLayout>
  )
}
