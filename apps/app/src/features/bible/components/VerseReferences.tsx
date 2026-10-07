import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { loadMissalCalendar } from '@/lib/missal/loaders'

import { usePreferencesStore } from '@/stores/preferencesStore'

import { useBookName } from '../hooks'
import {
  type CitedVerses,
  getChapterReadings,
  getParagraphScripture,
  getSummaArticles,
  getTalks,
  readingsForVerse,
  summaBookId,
  summaLabel,
  type Talk,
  versesLabel,
} from '../references'

// Each of these is an addition to the verse's page, read from an index the
// corpus may not have for a book (or the device, offline): where one cannot
// be read the page stands without it, so its failure is not shown.

type Place = { bookId: string; chapter: number; verse: number }

const shownAtFirst = 5

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack gap="$xs">
      <Typography variant="label" color="$colorBurgundy" letterSpacing={1.5}>
        {title.toUpperCase()}
      </Typography>
      {children}
    </YStack>
  )
}

/** A long list opens with its first few; the rest are a tap away. */
function Capped<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  const { t } = useTranslation()
  const [all, setAll] = useState(false)
  const hidden = items.length - shownAtFirst
  return (
    <YStack>
      {(all ? items : items.slice(0, shownAtFirst)).map(render)}
      {hidden > 0 ? (
        <Pressable
          onPress={() => setAll(!all)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ expanded: all }}
          aria-expanded={all}
        >
          <XStack minHeight={44} alignItems="center">
            <Typography variant="caption" fontSize="$3" color="$colorBurgundy">
              {all ? t('bible.references.fewer') : t('bible.references.more', { count: hidden })}
            </Typography>
          </XStack>
        </Pressable>
      ) : undefined}
    </YStack>
  )
}

function LinkRow({ label, note, onPress }: { label: string; note?: string; onPress: () => void }) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={note ? `${note}, ${label}` : label}
    >
      <XStack alignItems="center" gap="$xs" minHeight={44} paddingVertical="$xs">
        <YStack flex={1}>
          {note ? (
            <Typography variant="annotation" fontSize="$2">
              {note}
            </Typography>
          ) : undefined}
          <Typography fontSize="$3">{label}</Typography>
        </YStack>
        <ChevronRight size={16} color={theme.colorSecondary.val} />
      </XStack>
    </Pressable>
  )
}

/** The Masses whose readings hold the verse. */
export function VerseAtMass({ bookId, chapter, verse }: Place) {
  const { t, i18n } = useTranslation()
  const { data: readings } = useQuery({
    queryKey: ['bible', 'lectionary', bookId, chapter],
    queryFn: () => getChapterReadings(bookId, chapter),
    staleTime: Number.POSITIVE_INFINITY,
  })
  const { data: calendar } = useQuery({
    queryKey: ['missal', 'calendar'],
    queryFn: async () => (await loadMissalCalendar()) ?? null,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const read = readingsForVerse(readings ?? [], verse)
  if (read.length === 0 || !calendar) return undefined

  const language = i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
  return (
    <Section title={t('bible.references.mass')}>
      <Capped
        items={read}
        render={(reading) => {
          const title = calendar.lectionary[reading.day]?.title
          const part = t(`bible.references.part.${reading.part}`)
          return (
            <YStack
              key={`${reading.day}|${reading.part}|${reading.cycle ?? ''}`}
              paddingVertical="$xs"
            >
              <Typography variant="annotation" fontSize="$2">
                {reading.cycle
                  ? `${part} · ${t('bible.references.cycle', { cycle: reading.cycle })}`
                  : part}
              </Typography>
              <Typography fontSize="$3">
                {title?.[language] ?? title?.['*'] ?? title?.la ?? reading.day}
              </Typography>
            </YStack>
          )
        }}
      />
    </Section>
  )
}

/** The articles of the Summa Theologiae that quote the verse, each opening in the book. */
export function VerseSumma({ bookId, chapter, verse }: Place) {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: articles } = useQuery({
    queryKey: ['bible', 'summa', bookId, chapter, verse],
    queryFn: () => getSummaArticles(bookId, chapter, verse),
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (!articles?.length) return undefined

  return (
    <Section title={t('bible.references.summa')}>
      <Capped
        items={articles}
        render={([chapterId, title]) => (
          <LinkRow
            key={chapterId}
            note={summaLabel(chapterId)}
            label={title}
            onPress={() =>
              router.push({
                pathname: '/browse/book/[bookId]/read',
                params: { bookId: summaBookId, chapter: chapterId },
              })
            }
          />
        )}
      />
    </Section>
  )
}

/** The popes' homilies and addresses that quote the verse, a collection at a time. */
export function VersePopes({ bookId, chapter, verse }: Place) {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: talks } = useQuery({
    queryKey: ['bible', 'talks', bookId, chapter, verse],
    queryFn: () => getTalks(bookId, chapter, verse),
    staleTime: Number.POSITIVE_INFINITY,
  })
  if (!talks?.length) return undefined

  const collections = talks.reduce<Record<string, Talk[]>>((groups, talk) => {
    groups[talk[0]] = [...(groups[talk[0]] ?? []), talk]
    return groups
  }, {})
  return (
    <Section title={t('bible.references.popes')}>
      <YStack gap="$sm">
        {Object.entries(collections).map(([collection, held]) => (
          <YStack key={collection}>
            <Typography variant="section-title" fontSize="$3">
              {collection}
            </Typography>
            <Capped
              items={held}
              render={([, title, page, anchor]) => (
                <LinkRow
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
    </Section>
  )
}

function ScriptureLink({ cited }: { cited: CitedVerses }) {
  const router = useRouter()
  const translation = usePreferencesStore((s) => s.translation)
  const [bookId, chapter, from] = cited
  const label = `${useBookName(translation, bookId)} ${versesLabel(cited)}`
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/bible/verse',
          params: { bookId, chapter: String(chapter), verse: String(from) },
        })
      }
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
 * The Scripture a paragraph of the Catechism cites, each place opening its own
 * page: from a verse to the paragraph, and on to the other verses it gathers.
 */
export function ParagraphScripture({ paragraph }: { paragraph: number }) {
  const { t } = useTranslation()
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
          <ScriptureLink key={verses.join('|')} cited={verses} />
        ))}
      </XStack>
    </YStack>
  )
}
