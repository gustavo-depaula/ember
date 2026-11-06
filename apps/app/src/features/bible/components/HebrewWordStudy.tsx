import { ChevronLeft, ChevronRight, X } from 'lucide-react-native'
import { type ComponentProps, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useTheme, View, XStack, YStack } from 'tamagui'

import { PrayerSpinner, Typography } from '@/components'

import { accentOf, accentSystem } from '../hebrew/accents'
import { describeHebrew, grammarTerms, stemName } from '../hebrew/morphology'
import { syllables } from '../hebrew/sound'
import {
  type HebrewWord,
  hebrewTokens,
  isAffix,
  isStudiable,
  type LexiconParagraph,
  type MorphFields,
  mainPiece,
} from '../hebrew/words'
import {
  useAccentTable,
  useBookName,
  useChapter,
  useHebrewChapterWords,
  useHebrewLexicon,
  useHebrewMorphology,
  useHebrewOccurrences,
  useParallelVerses,
  useRootFamily,
} from '../hooks'
import { distinctPlaces, type Form, facetsOf, matches } from '../occurrenceFilter'
import { BackRow } from './BackRow'
import { OccurrenceFilter } from './OccurrenceFilter'
import { TabLine } from './TabLine'

const hebrewFace = 'EzraSIL'

/** Hebrew in a face that has its points and accents, right to left. */
export function HebrewText({ children, ...props }: ComponentProps<typeof Typography>) {
  return (
    <Typography {...props} fontFamily={hebrewFace as '$body'} style={{ writingDirection: 'rtl' }}>
      {children}
    </Typography>
  )
}

type Tab = 'family' | 'bdb' | 'strongs' | 'occurrences'

/** God's Name, glossed and read as the Church reads it: H3068 and H3069 in their senses. */
const isTheName = (dStrong: string) => /^H306[89]/.test(dStrong)

/**
 * A Hebrew word on the study sheet: its pieces, its sound, its dictionary
 * form, its grammar in plain words and in the grammarians', its accent, its
 * root and the words built on it, and where else it stands.
 */
export function HebrewWordStudy({
  edition,
  bookName,
  bookId,
  chapter,
  verse,
  slots,
  index,
  word,
  backTo,
  bottomPadding,
  onStep,
  onBack,
  onClose,
  onOpenPlace,
}: {
  edition: string
  bookName: string
  bookId: string
  chapter: number
  verse: number
  /** The verse's word slots, with all their marks: the accent is read from them. */
  slots: string[]
  index: number
  word: HebrewWord
  backTo?: string
  bottomPadding: number
  onStep: (direction: -1 | 1) => void
  onBack: () => void
  onClose: () => void
  onOpenPlace: (bookId: string, chapter: number, verse: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const main = word.p.indexOf(mainPiece(word) ?? word.p[0])
  const [chosen, setChosen] = useState(main)
  const piece = word.p[chosen] ?? word.p[main]
  const [dStrong, pieceGloss, morph] = piece
  const name = isTheName(dStrong)
  const brief = useHebrewLexicon('tbesh', dStrong)
  const morphology = useHebrewMorphology(edition, true)
  const accents = useAccentTable(edition, true)
  const family = useRootFamily(dStrong)
  const occurrences = useHebrewOccurrences(edition, dStrong)
  const fields = morphology.data?.[morph]
  const root = name ? undefined : (family.data ?? undefined)
  const [tab, setTab] = useState<Tab>(root ? 'family' : 'bdb')
  const shownTab = tab === 'family' && !root ? 'bdb' : tab

  const accent =
    accents.data &&
    accentOf(accents.data, accentSystem(accents.data, bookId, chapter, verse), slots, index)
  const sound = word.t ? syllables(word.t, slots[index]) : []
  const count = occurrences.data?.length
  const lemma = brief.data?.lemma ?? piece[3]
  const tabs: Tab[] = [...(root ? (['family'] as const) : []), 'bdb', 'strongs', 'occurrences']

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
            {/* Right to left: the word before is to the right. */}
            <ChevronRight size={20} color={theme.colorSecondary.val} />
          </Pressable>
          <Pressable
            onPress={() => onStep(1)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.nextWord')}
          >
            <ChevronLeft size={20} color={theme.colorSecondary.val} />
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
      {backTo ? <BackRow place={backTo} onPress={onBack} /> : undefined}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        }}
      >
        <YStack gap="$xs">
          {/* The word in its pieces, read right to left; each opens its own entry. */}
          <XStack flexDirection="row-reverse" gap={3} alignSelf="flex-end">
            {word.p.map(([d, gloss, , hebrew], i) => {
              const on = i === chosen
              return (
                <Pressable
                  // biome-ignore lint/suspicious/noArrayIndexKey: a word's pieces are positional
                  key={i}
                  onPress={() => setChosen(i)}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.studyWord', { word: hebrew })}
                  accessibilityState={{ selected: on }}
                >
                  <YStack
                    alignItems="center"
                    paddingHorizontal={isAffix(d) ? 10 : 16}
                    paddingVertical={6}
                    borderRadius={6}
                    backgroundColor={on ? '$colorBurgundy' : '$backgroundSurface'}
                  >
                    <HebrewText
                      fontSize={isAffix(d) ? 30 : 38}
                      lineHeight={56}
                      color={on ? '$background' : '$color'}
                    >
                      {hebrew}
                    </HebrewText>
                    <Typography fontSize="$2" color={on ? '$background' : '$colorSecondary'}>
                      {gloss || '—'}
                    </Typography>
                  </YStack>
                </Pressable>
              )
            })}
          </XStack>

          {sound.length ? (
            <Typography variant="caption" fontSize="$3">
              {sound.map((s, i) => (
                <Typography
                  // biome-ignore lint/suspicious/noArrayIndexKey: syllables are positional
                  key={i}
                  variant="caption"
                  fontSize="$3"
                  fontWeight={s.stressed ? '700' : '400'}
                >
                  {`${i ? '·' : ''}${s.text}`}
                </Typography>
              ))}
            </Typography>
          ) : undefined}

          <XStack
            alignItems="baseline"
            gap="$sm"
            flexWrap="wrap"
            flexDirection="row-reverse"
            justifyContent="flex-end"
          >
            <HebrewText fontSize={36} lineHeight={54}>
              {lemma}
            </HebrewText>
            {brief.data?.x ? (
              <Typography variant="caption" fontSize="$3">
                {name ? 'YHWH' : brief.data.x}
              </Typography>
            ) : undefined}
          </XStack>
          <Typography fontSize="$4">
            {name ? t('bible.hebrewStudy.name') : pieceGloss || brief.data?.gloss}
          </Typography>
          {name ? (
            <Typography variant="caption" fontSize="$2">
              {t('bible.hebrewStudy.nameNote')}
            </Typography>
          ) : undefined}

          {fields ? <Grammar fields={fields} morph={morph} /> : undefined}

          {accent && chosen === main ? (
            <YStack>
              <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
                <Typography variant="label" fontSize="$1" letterSpacing={1.5}>
                  {t('bible.hebrewStudy.accent').toUpperCase()}
                </Typography>
                <Typography fontSize="$3">
                  {[
                    accent.accent.name,
                    t(`bible.hebrewStudy.${accent.kind}`),
                    accent.inPause ? t('bible.hebrewStudy.inPause') : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </XStack>
              <Typography variant="caption" fontSize="$1">
                {t('bible.hebrewStudy.accentSource')}
              </Typography>
            </YStack>
          ) : undefined}

          {word.w ? (
            <Typography variant="caption" fontSize="$2">
              {word.q
                ? t('bible.hebrewStudy.written', { written: word.w, read: word.q })
                : t('bible.hebrewStudy.writtenNotRead', { written: word.w })}
            </Typography>
          ) : undefined}

          {root ? (
            <Pressable
              onPress={() => setTab('family')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('bible.hebrewStudy.family', { count: root.members.length })}
            >
              <XStack alignItems="baseline" gap="$md" flexWrap="wrap">
                <Typography variant="label" fontSize="$1" letterSpacing={1.5}>
                  {t('bible.hebrewStudy.root').toUpperCase()}
                </Typography>
                <HebrewText fontSize={26} lineHeight={40}>
                  {(root.root.match(/[\u05d0-\u05ea][\u0591-\u05c7]*/g) ?? []).join(' · ')}
                </HebrewText>
                <Typography variant="annotation" fontSize="$2" color="$colorBurgundy">
                  {t('bible.hebrewStudy.family', { count: root.members.length })}
                </Typography>
              </XStack>
            </Pressable>
          ) : undefined}

          <XStack flexWrap="wrap" alignItems="baseline">
            <Typography variant="annotation" fontSize="$2">
              {t('bible.study.strong', { n: dStrong.replace(/^H0*/, '') })}
            </Typography>
            {count ? (
              <Pressable
                onPress={() => setTab('occurrences')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('bible.hebrewStudy.occurs', { count })}
              >
                <Typography variant="annotation" fontSize="$2" color="$colorBurgundy">
                  {` · ${t('bible.hebrewStudy.occurs', { count })}`}
                </Typography>
              </Pressable>
            ) : undefined}
          </XStack>
        </YStack>

        <YStack marginTop={16}>
          <TabLine
            tabs={tabs.map((id) => ({ id, label: t(`bible.hebrewStudy.tabs.${id}`) }))}
            selected={shownTab}
            onSelect={setTab}
            bleed
            ruled
          />
        </YStack>

        <YStack paddingTop="$md">
          {shownTab === 'family' ? (
            root ? (
              <Family root={root} current={dStrong} />
            ) : undefined
          ) : shownTab === 'occurrences' ? (
            <HebrewOccurrences
              edition={edition}
              dStrong={dStrong}
              morphology={morphology.data}
              onOpenPlace={onOpenPlace}
            />
          ) : (
            <HebrewLexiconTab source={shownTab} dStrong={dStrong} />
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

/** The parsing three ways: the part of speech and plain words; the grammarians' terms; the code itself. */
function Grammar({ fields, morph }: { fields: MorphFields; morph: string }) {
  const { t } = useTranslation()
  const plain = describeHebrew(fields, t)
  const terms = grammarTerms(fields)
  return (
    <YStack gap={2}>
      <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
        <Typography variant="label" fontSize="$1" letterSpacing={1.5}>
          {[
            fields.l === 'aramaic' ? t('bible.hebrewStudy.aramaic') : undefined,
            t(`bible.hebrewMorph.function.${fields.f}`),
          ]
            .filter(Boolean)
            .join(' · ')
            .toUpperCase()}
        </Typography>
        <Typography fontSize="$3">{plain.join(' · ')}</Typography>
      </XStack>
      <XStack alignItems="baseline" gap="$sm" flexWrap="wrap">
        {terms ? (
          <Typography fontSize="$3" fontStyle="italic">
            {terms}
          </Typography>
        ) : undefined}
        <Typography variant="reference" fontSize="$1">
          {morph}
        </Typography>
      </XStack>
    </YStack>
  )
}

function Family({
  root,
  current,
}: {
  root: NonNullable<ReturnType<typeof useRootFamily>['data']>
  current: string
}) {
  const { t } = useTranslation()
  return (
    <YStack gap="$sm">
      <Typography variant="caption" fontSize="$2">
        {t('bible.hebrewStudy.familyIntro', { root: root.root })}
      </Typography>
      {root.members.map((member) => (
        <XStack
          key={member.d}
          alignItems="center"
          gap="$md"
          paddingVertical="$xs"
          paddingHorizontal="$sm"
          borderRadius={6}
          backgroundColor={member.d === current ? '$backgroundSurface' : 'transparent'}
        >
          <View minWidth={96} alignItems="flex-end">
            <HebrewText fontSize={26} lineHeight={40}>
              {member.lemma}
            </HebrewText>
          </View>
          <YStack flex={1}>
            <Typography variant="caption" fontSize="$2">
              {member.x}
            </Typography>
            <Typography fontSize="$3">{member.gloss}</Typography>
          </YStack>
          <Typography variant="annotation" fontSize="$2">
            {member.count}
          </Typography>
        </XStack>
      ))}
    </YStack>
  )
}

const lexiconNames: Record<string, string> = { bdb: 'Brown–Driver–Briggs', strongs: 'Strong’s' }

/** An entry of BDB or Strong's as its source wrote it, paragraph by paragraph. */
function HebrewLexiconTab({ source, dStrong }: { source: 'bdb' | 'strongs'; dStrong: string }) {
  const { t } = useTranslation()
  const entry = useHebrewLexicon(source, dStrong)
  if (entry.error) return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  if (entry.isLoading) return <PrayerSpinner />
  if (!entry.data?.body?.length) {
    return (
      <Typography variant="caption" fontSize="$3">
        {t('bible.hebrewStudy.notInLexicon', { lexicon: lexiconNames[source] })}
      </Typography>
    )
  }
  return (
    <YStack gap="$sm">
      {isTheName(dStrong) ? (
        <Typography variant="caption" fontSize="$2">
          {t('bible.hebrewStudy.quotedAsWritten')}
        </Typography>
      ) : undefined}
      {entry.data.body.map((paragraph, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: an entry's paragraphs are positional
        <LexiconLine key={i} paragraph={paragraph} />
      ))}
    </YStack>
  )
}

/** One paragraph of an entry, indented by its depth in the outline, its sense label first. */
function LexiconLine({ paragraph }: { paragraph: LexiconParagraph }) {
  return (
    <Typography fontSize="$3" lineHeight={26} marginLeft={paragraph.d * 14}>
      {paragraph.n ? (
        <Typography fontSize="$3" fontWeight="700">{`${paragraph.n}. `}</Typography>
      ) : undefined}
      {paragraph.r.map(([kind, text], i) => {
        const key = `${i}`
        if (kind === 'he') {
          return (
            <Typography key={key} fontFamily={hebrewFace as '$body'} fontSize="$4">
              {text}
            </Typography>
          )
        }
        if (kind === 'def')
          return (
            <Typography key={key} fontSize="$3" fontWeight="600">
              {text}
            </Typography>
          )
        if (kind === 'pos' || kind === 'asp' || kind === 'em') {
          return (
            <Typography key={key} fontSize="$3" fontStyle="italic">
              {text}
            </Typography>
          )
        }
        if (kind === 'stem')
          return (
            <Typography key={key} fontSize="$3" fontWeight="700">
              {text}
            </Typography>
          )
        if (kind === 'ref' || kind === 'strong') {
          return (
            <Typography key={key} variant="reference" fontSize="$2">
              {text}
            </Typography>
          )
        }
        return (
          <Typography key={key} fontSize="$3">
            {text}
          </Typography>
        )
      })}
    </Typography>
  )
}

// What a Hebrew word's occurrences are narrowed by, and where each reads in TEHMC's fields.
const hebrewFeatures: [feature: string, field: keyof MorphFields][] = [
  ['stem', 's'],
  ['form', 'm'],
  ['person', 'p'],
  ['gender', 'g'],
  ['number', 'n'],
  ['state', 'st'],
]

const occurrencePage = 20

function HebrewOccurrences({
  edition,
  dStrong,
  morphology,
  onOpenPlace,
}: {
  edition: string
  dStrong: string
  morphology: Record<string, MorphFields> | undefined
  onOpenPlace: (bookId: string, chapter: number, verse: number) => void
}) {
  const { t } = useTranslation()
  const [shown, setShown] = useState(occurrencePage)
  const [selection, setSelection] = useState<Form>({})
  const { data: rows, isLoading, error } = useHebrewOccurrences(edition, dStrong)
  const forms = useMemo(
    () =>
      (rows ?? []).map(([, , , morph]) => {
        const fields = morphology?.[morph]
        return Object.fromEntries(
          hebrewFeatures.map(([feature, field]) => [feature, fields?.[field]]),
        )
      }),
    [rows, morphology],
  )
  const facets = useMemo(
    () =>
      facetsOf(
        forms,
        hebrewFeatures.map(([feature]) => feature),
        selection,
      ),
    [forms, selection],
  )
  const places = useMemo(
    () => distinctPlaces((rows ?? []).filter((_, i) => matches(forms[i], selection))),
    [rows, forms, selection],
  )
  if (error) return <Typography variant="annotation">{t('common.couldntLoad')}</Typography>
  if (isLoading || !rows) return <PrayerSpinner />
  return (
    <YStack gap="$md">
      <OccurrenceFilter
        facets={facets}
        selection={selection}
        label={(feature, value) =>
          feature === 'stem' ? stemName(value) : t(`bible.hebrewMorph.${feature}.${value}`)
        }
        onChange={(next) => {
          setSelection(next)
          setShown(occurrencePage)
        }}
      />
      {places.slice(0, shown).map(([bookId, chapter, verse]) => (
        <HebrewOccurrence
          key={`${bookId}-${chapter}-${verse}`}
          edition={edition}
          dStrong={dStrong}
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

/** A verse where the word stands, the word in burgundy, and the Douay beneath. */
function HebrewOccurrence({
  edition,
  dStrong,
  bookId,
  chapter,
  verse,
  onOpen,
}: {
  edition: string
  dStrong: string
  bookId: string
  chapter: number
  verse: number
  onOpen: () => void
}) {
  const bookName = useBookName(edition, bookId)
  const text = useChapter(edition, bookId, chapter)
  const words = useHebrewChapterWords(edition, bookId, chapter, true)
  const douay = useParallelVerses(edition, 'DRB', bookId, chapter)
  const label = `${bookName} ${chapter}:${verse}`
  const found = text.data?.verses.find((v) => v.verse === verse)
  const slots = found ? hebrewTokens(found.text) : undefined
  const entries = words.data?.[verse]
  return (
    <Pressable onPress={onOpen} accessibilityRole="link" accessibilityLabel={label}>
      <YStack gap={2}>
        <Typography variant="reference">{label}</Typography>
        {slots ? (
          <HebrewText fontSize={22} lineHeight={36} textAlign="right">
            {slots.map((slot, i) => {
              const entry = entries?.[i]
              const here = isStudiable(entry) && entry.p.some(([d]) => d === dStrong)
              return (
                <HebrewText
                  // biome-ignore lint/suspicious/noArrayIndexKey: a verse's words are positional
                  key={i}
                  fontSize={22}
                  color={here ? '$colorBurgundy' : '$color'}
                >
                  {i === 0 || slots[i - 1].endsWith('־') ? slot : ` ${slot}`}
                </HebrewText>
              )
            })}
          </HebrewText>
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
