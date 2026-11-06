import { ChevronLeft, ChevronRight, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'
import { InlineMarkdown } from '@/components/prayer/InlineMarkdown'

import {
  useBookName,
  useChapter,
  useChapterWords,
  useLexiconEntries,
  useLexiconSources,
  useOccurrences,
  useParallelVerses,
} from '../hooks'
import { describeParsing, parseRobinson } from '../morphology'
import { transliterate } from '../transliterate'
import { isUnchecked, type Place, type WordEntry } from '../words'

// The lexicons in the order the sheet offers them: the short NT glosses first,
// Liddell, who knows the Septuagint's words too, after.
const lexicons = ['dodson', 'abbott-smith', 'middle-liddell', 'strongs'] as const
type Tab = (typeof lexicons)[number] | 'occurrences'

// Occurrences are read a page at a time: a lemma like καί stands in thousands
// of verses, each from its book's file.
const occurrencePage = 20

/** A word as the page prints it, without the punctuation that clings to it. */
function bare(token: string) {
  return token.replace(/[^\p{L}\p{M}’ʼ']/gu, '')
}

/**
 * The study of one Greek word: its lemma and sound, its parsing spelled out,
 * what each lexicon says of it, and where else it stands. ‹ › walk the
 * chapter word by word.
 */
export function WordStudy({
  edition,
  bookId,
  chapter,
  verse,
  token,
  entry,
  backTo,
  bottomPadding,
  onStep,
  onBack,
  onClose,
  onOpenPlace,
}: {
  edition: string
  bookId: string
  chapter: number
  verse: number
  /** The word as printed on the page. */
  token: string
  entry: WordEntry
  /** The verse the study was opened from, to go back to its Words. */
  backTo?: string
  bottomPadding: number
  onStep: (direction: -1 | 1) => void
  onBack: () => void
  onClose: () => void
  /** Turns the reader to another verse where the lemma stands, in the edition's own numbering. */
  onOpenPlace: (bookId: string, chapter: number, verse: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const bookName = useBookName(edition, bookId)
  const [lemma, morph, gloss] = entry
  const [tab, setTab] = useState<Tab>('dodson')
  const dodson = useLexiconEntries('dodson', lemma)
  const occurrences = useOccurrences(edition, lemma)
  const parsing = parseRobinson(morph)
  const short = dodson.data?.[0]?.gloss
  const strong = dodson.data?.find((e) => e.strong)?.strong

  const facts = [
    `${bare(token)}${gloss ? `, “${gloss}”` : ''}`,
    strong ? t('bible.study.strong', { n: strong }) : undefined,
  ].filter(Boolean)
  const count = occurrences.data?.length

  return (
    <YStack flex={1}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        minHeight={40}
        paddingHorizontal="$lg"
      >
        <Typography variant="section-title">{`${bookName} ${chapter}:${verse}`}</Typography>
        <XStack alignItems="center" gap="$lg">
          <Pressable
            onPress={() => onStep(-1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.previousWord')}
          >
            <ChevronLeft size={20} color={theme.colorSecondary.val} />
          </Pressable>
          <Pressable
            onPress={() => onStep(1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.nextWord')}
          >
            <ChevronRight size={20} color={theme.colorSecondary.val} />
          </Pressable>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeWordStudy')}
          >
            <X size={18} color={theme.colorSecondary.val} />
          </Pressable>
        </XStack>
      </XStack>
      {backTo ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.backToPlace', { place: backTo })}
        >
          <XStack alignItems="center" gap="$xs" minHeight={36} paddingHorizontal="$lg">
            <ChevronLeft size={16} color={theme.colorSecondary.val} />
            <Typography variant="annotation" fontSize="$2">
              {backTo}
            </Typography>
          </XStack>
        </Pressable>
      ) : undefined}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        }}
      >
        <YStack gap="$xs">
          <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
            {/* The body face: the title and label faces have no Greek. */}
            <Typography fontSize={34} lineHeight={46}>
              {lemma}
            </Typography>
            <Typography variant="caption" fontSize="$3">
              {transliterate(lemma)}
            </Typography>
          </XStack>
          {short ? <Typography fontSize="$4">{short}</Typography> : undefined}
          {isUnchecked(entry) ? (
            <Typography variant="caption" fontSize="$2">
              {t('bible.study.unchecked')}
            </Typography>
          ) : undefined}
          {parsing ? (
            <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
              <Typography variant="label" fontSize="$1" letterSpacing={1.5}>
                {t(`bible.morph.pos.${parsing.pos}`).toUpperCase()}
              </Typography>
              <Typography fontSize="$3">{describeParsing(parsing, t, { pos: false })}</Typography>
            </XStack>
          ) : undefined}
          <XStack flexWrap="wrap" alignItems="baseline">
            <Typography variant="annotation" fontSize="$2">
              {facts.join(' · ')}
            </Typography>
            {count ? (
              <Pressable
                onPress={() => setTab('occurrences')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('bible.study.occurs', { count })}
              >
                <Typography variant="annotation" fontSize="$2" color="$colorBurgundy">
                  {` · ${t('bible.study.occurs', { count })}`}
                </Typography>
              </Pressable>
            ) : undefined}
          </XStack>
        </YStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16, marginHorizontal: -24 }}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 24 }}
          accessibilityRole="tablist"
        >
          {[...lexicons, 'occurrences' as const].map((id) => {
            const selected = id === tab
            const label = t(`bible.study.tabs.${id}`)
            return (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                aria-selected={selected}
              >
                <View
                  minHeight={40}
                  justifyContent="center"
                  borderBottomWidth={2}
                  borderBottomColor={selected ? '$colorBurgundy' : 'transparent'}
                >
                  <Typography
                    variant="label"
                    fontSize="$1"
                    letterSpacing={1.5}
                    color={selected ? '$colorBurgundy' : '$color'}
                  >
                    {label.toUpperCase()}
                  </Typography>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
        <View height={1} backgroundColor="$borderColor" marginHorizontal={-24} />

        <YStack paddingTop="$md">
          {tab === 'occurrences' ? (
            <Occurrences
              edition={edition}
              lemma={lemma}
              places={occurrences.data}
              isLoading={occurrences.isLoading}
              error={occurrences.error ?? undefined}
              onOpenPlace={onOpenPlace}
            />
          ) : (
            <LexiconTab source={tab} lemma={lemma} />
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

function LexiconTab({ source, lemma }: { source: string; lemma: string }) {
  const { t } = useTranslation()
  const entries = useLexiconEntries(source, lemma)
  const sources = useLexiconSources()
  const about = sources.data?.find((s) => s.id === source)

  if (entries.error ?? sources.error) {
    return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  }
  if (entries.isLoading) return <PrayerSpinner />
  if (!entries.data?.length) {
    return (
      <Typography variant="caption" fontSize="$3">
        {t('bible.study.notInLexicon', { lexicon: about?.name ?? source })}
      </Typography>
    )
  }
  return (
    <YStack gap="$md">
      {entries.data.map((entry) => (
        <YStack key={`${entry.lemma}-${entry.def.slice(0, 24)}`} gap="$xs">
          <Typography fontSize="$4">{entry.lemma}</Typography>
          <Typography fontSize="$3" lineHeight={24}>
            <InlineMarkdown source={entry.def} />
          </Typography>
        </YStack>
      ))}
      {about ? (
        <Typography variant="caption" fontSize="$2">
          {`${about.author}, ${about.name} (${about.year}) · ${about.licence}`}
        </Typography>
      ) : undefined}
    </YStack>
  )
}

function Occurrences({
  edition,
  lemma,
  places,
  isLoading,
  error,
  onOpenPlace,
}: {
  edition: string
  lemma: string
  places: Place[] | undefined
  isLoading: boolean
  error?: Error
  onOpenPlace: (bookId: string, chapter: number, verse: number) => void
}) {
  const { t } = useTranslation()
  const [shown, setShown] = useState(occurrencePage)
  if (error) return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  if (isLoading || !places) return <PrayerSpinner />
  return (
    <YStack gap="$md">
      {places.slice(0, shown).map(([bookId, chapter, verse]) => (
        <Occurrence
          key={`${bookId}-${chapter}-${verse}`}
          edition={edition}
          lemma={lemma}
          bookId={bookId}
          chapter={chapter}
          verse={verse}
          onOpen={() => onOpenPlace(bookId, chapter, verse)}
        />
      ))}
      {places.length > shown ? (
        <Pressable
          onPress={() => setShown(shown + occurrencePage)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('bible.study.more', { count: places.length - shown })}
        >
          <Typography variant="caption" fontSize="$3" color="$colorBurgundy">
            {t('bible.study.more', { count: places.length - shown })}
          </Typography>
        </Pressable>
      ) : undefined}
    </YStack>
  )
}

/** A verse where the lemma stands, its form of the word in burgundy. */
function Occurrence({
  edition,
  lemma,
  bookId,
  chapter,
  verse,
  onOpen,
}: {
  edition: string
  lemma: string
  bookId: string
  chapter: number
  verse: number
  onOpen: () => void
}) {
  const bookName = useBookName(edition, bookId)
  const text = useChapter(edition, bookId, chapter)
  const words = useChapterWords(edition, bookId, chapter)
  // The verse in the Douay-Rheims beneath, carried through the edition's
  // numbering: the reader who cannot yet read the Greek reads what it says.
  const douay = useParallelVerses(edition, 'DRB', bookId, chapter, [verse])
  const label = `${bookName} ${chapter}:${verse}`
  const tokens = text.data?.verses.find((v) => v.verse === verse)?.text.split(/\s+/)
  const lemmas = words.data?.[verse]
  return (
    <Pressable onPress={onOpen} accessibilityRole="link" accessibilityLabel={label}>
      <YStack gap={2}>
        <Typography variant="reference">{label}</Typography>
        {tokens ? (
          <Typography fontSize="$3" lineHeight={24}>
            {tokens.map((token, i) => (
              <Typography
                // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
                key={i}
                fontSize="$3"
                color={lemmas?.[i]?.[0] === lemma ? '$colorBurgundy' : '$color'}
              >
                {i === 0 ? token : ` ${token}`}
              </Typography>
            ))}
          </Typography>
        ) : undefined}
        {douay.data?.[verse] ? (
          <Typography variant="annotation" fontSize="$2" lineHeight={20}>
            {douay.data[verse]}
          </Typography>
        ) : undefined}
      </YStack>
    </Pressable>
  )
}
