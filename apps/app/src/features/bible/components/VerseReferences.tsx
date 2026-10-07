import { useQueries, useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { translationsFor } from '@/lib/bibleTranslations'
import { getChapter } from '@/lib/content'
import { localizeContent } from '@/lib/i18n'
import { loadMissalCalendar } from '@/lib/missal/loaders'
import { fetchParagraphs } from '@/sources/ccc/extract'
import { cccLeaves } from '@/sources/ccc/structure'
import { fetchClerusPlace } from '@/sources/clerus/place'
import { usePreferencesStore } from '@/stores/preferencesStore'

import type { CitingDocument } from '../citations'
import { spanLabel } from '../commentary'
import { useBookName, type VerseReferences } from '../hooks'
import {
  type CitedVerses,
  getParagraphScripture,
  type ReferenceKind,
  summaBookId,
  summaLabel,
  type Talk,
  versesLabel,
} from '../references'
import { CitedSections } from './CitedSections'
import { Capped, ReferenceRow } from './ReferenceRow'

/** Opens the reader at a verse the text in hand cites. */
type OpenPlace = (bookId: string, chapter: number, verse: number) => void

function ScriptureLink({ cited, onOpen }: { cited: CitedVerses; onOpen: OpenPlace }) {
  const translation = usePreferencesStore((s) => s.translation)
  const [bookId, chapter, from] = cited
  const label = `${useBookName(translation, bookId)} ${versesLabel(cited)}`
  return (
    <Pressable
      onPress={() => onOpen(bookId, chapter, from)}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Typography fontSize="$2" color="$colorBurgundy">
        {label}
      </Typography>
    </Pressable>
  )
}

/**
 * The Scripture a paragraph of the Catechism cites, each place turning the
 * reader to it: from a verse to the paragraph, and on to the other verses it
 * gathers.
 */
function ParagraphScripture({ paragraph, onOpen }: { paragraph: number; onOpen: OpenPlace }) {
  const { t } = useTranslation()
  // An addition to the paragraph's text, which stands without it.
  const { data: cited } = useQuery({
    queryKey: ['bible', 'catechism-scripture', paragraph],
    queryFn: () => getParagraphScripture(paragraph),
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (!cited?.length) return undefined
  return (
    <YStack gap="$xs" paddingTop="$xs">
      <Typography variant="annotation" fontSize="$2">
        {t('bible.references.cites')}
      </Typography>
      <XStack flexWrap="wrap" columnGap="$md" rowGap="$xs">
        {cited.map((verses) => (
          <ScriptureLink key={verses.join('|')} cited={verses} onOpen={onOpen} />
        ))}
      </XStack>
    </YStack>
  )
}

function Rest() {
  const { t } = useTranslation()
  return (
    <Typography variant="annotation" fontSize="$2" paddingTop="$md">
      {t('bible.references.rest')}
    </Typography>
  )
}

/** Paragraphs of the Catechism, each named by its chapter and opening to its text. */
function CatechismParagraphs({ paragraphs, onOpen }: { paragraphs: number[]; onOpen: OpenPlace }) {
  const { i18n } = useTranslation()
  // vatican.va has the Catechism in both of the app's languages.
  const language = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  return (
    <CitedSections
      language={language}
      sections={paragraphs.map((n) => {
        const chapter = cccLeaves.find((leaf) => leaf.from <= n && n <= leaf.to)
        return {
          id: `ccc-${n}`,
          lead: String(n),
          label: chapter ? localizeContent(chapter.title) : '',
        }
      })}
      load={async ({ lead }) =>
        (await fetchParagraphs(Number(lead), 1, language)).map((p) => p.text)
      }
      after={({ lead }) => <ParagraphScripture paragraph={Number(lead)} onOpen={onOpen} />}
    />
  )
}

/** Sections of the councils' and popes' documents, each opening to its text. */
function DocumentSections({ documents }: { documents: CitingDocument[] }) {
  return (
    <CitedSections
      // Clerus holds these documents in Portuguese.
      language="pt-BR"
      sections={documents.flatMap((document) =>
        document.places.map(([n, file, anchor]) => ({
          id: `${file}#${anchor}`,
          lead: n,
          label: document.work,
        })),
      )}
      load={({ id }) => {
        const [file, anchor] = id.split('#')
        return fetchClerusPlace(file, anchor)
      }}
    />
  )
}

function MassDays({ readings }: { readings: VerseReferences['readings'] }) {
  const { t, i18n } = useTranslation()
  const {
    data: calendar,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['missal', 'calendar'],
    queryFn: async () => (await loadMissalCalendar()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (isLoading) return <PrayerSpinner />
  if (error || !calendar) {
    return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  }
  const language = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  return (
    <Capped
      items={readings}
      render={(reading) => {
        const title = calendar.lectionary[reading.day]?.title
        const part = t(`bible.references.part.${reading.part}`)
        return (
          <ReferenceRow
            key={`${reading.day}|${reading.part}|${reading.cycle ?? ''}`}
            note={
              reading.cycle
                ? `${part} · ${t('bible.references.cycle', { cycle: reading.cycle })}`
                : part
            }
            label={title?.[language] ?? title?.['*'] ?? title?.la ?? reading.day}
          />
        )
      }}
    />
  )
}

function PapalTexts({ talks }: { talks: Talk[] }) {
  const router = useRouter()
  const collections = talks.reduce<Record<string, Talk[]>>((groups, talk) => {
    groups[talk[0]] = [...(groups[talk[0]] ?? []), talk]
    return groups
  }, {})
  return (
    <YStack gap="$md">
      {Object.entries(collections).map(([collection, held]) => (
        <YStack key={collection}>
          <Typography variant="annotation" fontSize="$2">
            {collection}
          </Typography>
          <Capped
            items={held}
            render={([, title, page, anchor]) => (
              <ReferenceRow
                key={`${page}#${anchor}`}
                label={title}
                onPress={() =>
                  router.push({
                    pathname: '/bible/talk',
                    params: { page, anchor, title, collection },
                  })
                }
              />
            )}
          />
        </YStack>
      ))}
    </YStack>
  )
}

/**
 * The verse in every edition the app has, the reader's own language first.
 * An edition that lacks the chapter and would stand in the Douay-Rheims for
 * it is left out, so no text is shown twice under two names.
 */
function VerseTranslations({
  bookId,
  chapter,
  verse,
}: {
  bookId: string
  chapter: number
  verse: number
}) {
  const { t, i18n } = useTranslation()
  const editions = translationsFor(i18n.language)
  const chapters = useQueries({
    queries: editions.map((edition) => ({
      // The reader's own key for a chapter, so the edition open above is already here.
      queryKey: ['chapter', edition.code, bookId, chapter],
      queryFn: () => getChapter(edition.code, bookId, chapter),
    })),
  })
  return (
    <YStack gap="$md">
      {editions.map((edition, i) => {
        const { data, isLoading, error } = chapters[i]
        if (data?.fallback && edition.code !== 'DRB') return undefined
        const text = data?.verses.find((v) => v.verse === verse)?.text
        if (data && !text) return undefined
        return (
          <YStack key={edition.code} gap={2}>
            <Typography variant="annotation" fontSize="$2">
              {edition.name}
            </Typography>
            {isLoading ? <PrayerSpinner /> : undefined}
            {error ? (
              <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
            ) : undefined}
            {text ? <Typography fontSize="$3">{text}</Typography> : undefined}
          </YStack>
        )
      })}
    </YStack>
  )
}

/**
 * One kind of what points at a verse, as the half page beside the text lists
 * it. A short text (a paragraph of the Catechism, a section of an encyclical)
 * opens where it stands; a long one (an article, a homily) opens as a page.
 */
export function VerseReferenceList({
  kind,
  bookId,
  chapter,
  verse,
  references,
  onOpenPlace,
}: {
  kind: ReferenceKind
  bookId: string
  chapter: number
  verse: number
  references: VerseReferences
  onOpenPlace: OpenPlace
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const { isLoading, error } = references.status[kind]
  if (error) return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  if (isLoading) return <PrayerSpinner />
  if (references.counts[kind] === 0) {
    return (
      <Typography variant="caption" fontSize="$3">
        {t(`bible.references.none.${kind}`, { verse })}
      </Typography>
    )
  }

  function openInBook(bookId: string, chapterId: string) {
    router.push({
      pathname: '/browse/book/[bookId]/read',
      params: { bookId, chapter: chapterId },
    })
  }

  if (kind === 'translations') {
    return <VerseTranslations bookId={bookId} chapter={chapter} verse={verse} />
  }
  if (kind === 'catechism') {
    const { here, elsewhere } = references.catechism
    return (
      <YStack>
        <CatechismParagraphs paragraphs={here} onOpen={onOpenPlace} />
        {elsewhere.length > 0 ? <Rest /> : undefined}
        <CatechismParagraphs paragraphs={elsewhere} onOpen={onOpenPlace} />
      </YStack>
    )
  }
  if (kind === 'councils') {
    const { here, elsewhere } = references.councils
    return (
      <YStack>
        <Typography variant="annotation" fontSize="$2">
          {t('bible.references.inPortuguese')}
        </Typography>
        <DocumentSections documents={here} />
        {elsewhere.length > 0 ? <Rest /> : undefined}
        <DocumentSections documents={elsewhere} />
      </YStack>
    )
  }
  if (kind === 'summa') {
    return (
      <YStack>
        {references.lectures.map((lecture) => (
          <ReferenceRow
            key={lecture.chapterId}
            label={t('bible.commentary.lecture', { verses: `${chapter}:${spanLabel(lecture)}` })}
            onPress={() => openInBook(lecture.bookId, lecture.chapterId)}
          />
        ))}
        <Capped
          items={references.articles}
          render={([chapterId, title]) => (
            <ReferenceRow
              key={chapterId}
              note={`${t('bible.references.summa')} ${summaLabel(chapterId)}`}
              label={title}
              onPress={() => openInBook(summaBookId, chapterId)}
            />
          )}
        />
      </YStack>
    )
  }
  if (kind === 'homilies') {
    return (
      <Capped
        items={references.homilies}
        render={(homily) => (
          <ReferenceRow
            key={`${homily.book}-${homily.chapter}`}
            label={t(`bible.church.${homily.author}.${homily.kind}`, { n: homily.n })}
            onPress={() => openInBook(homily.book, homily.chapter)}
          />
        )}
      />
    )
  }
  if (kind === 'popes') {
    return (
      <YStack gap="$xs">
        <Typography variant="annotation" fontSize="$2">
          {t('bible.references.inPortuguese')}
        </Typography>
        <PapalTexts talks={references.talks} />
      </YStack>
    )
  }
  return <MassDays readings={references.readings} />
}
