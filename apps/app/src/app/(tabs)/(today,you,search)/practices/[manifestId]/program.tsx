import DateTimePicker from '@react-native-community/datetimepicker'
import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, format, formatDistanceStrict, parseISO } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, PrayerSpinner, ScreenLayout, Typography } from '@/components'
import { loadChapterSource } from '@/content/books'
import type { TocNode } from '@/content/manifestTypes'
import { getManifest, loadFlow, loadPracticeData } from '@/content/resolver'
import type { CycleData } from '@/content/types'
import { useBookManifest } from '@/features/books/hooks'
import {
  FootLink,
  MissedDays,
  PrayBar,
  useProgramDayDates,
  useProgramProgress,
  useRestartProgram,
} from '@/features/plan-of-life'
import { DayStars, dayWindow, windowSize } from '@/features/plan-of-life/components/DayStars'
import {
  computeAllDayStates,
  type DayState,
  selectEnrollmentSchedule,
  settledAfterDays,
  traditionalStart,
} from '@/features/plan-of-life/program'
import { normalizeSchedule } from '@/features/plan-of-life/schedule'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { PracticePlanEditor, usePracticePlan } from '@/features/practices/components/PracticePlan'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized, getDateLocale } from '@/lib/i18n/dateLocale'

// A feast this near is what the novena is being joined for, so it waits for
// its own date; further off, it's taken as begun today.
const joinsAheadDays = 30

const unbegunDay: DayState = {
  isMissed: false,
  isCurrent: false,
  isCompleted: false,
  isFuture: true,
}

type Localized = { 'en-US'?: string; 'pt-BR'?: string }
type DayEntry = { name: string; sub?: string; excerpt?: string; chapterId?: string }

const text = (v: unknown) =>
  typeof v === 'string' ? v : v && typeof v === 'object' ? localizeContent(v as Localized) : ''

// "Dia 4: Minha luz — uma lâmpada para a mente" → name "Minha luz", sub "uma
// lâmpada para a mente". The numeral is the page's own, so the title's goes:
// "Dia 1 — Toda a humanidade", "Dia 1 · Perguntas 1–6", "1. O Credo" name
// only what follows it.
function splitTitle(title: string): Pick<DayEntry, 'name' | 'sub'> {
  const bare = title.replace(/^[^:]*\d[^:]*:\s*/, '').replace(/^\d+\.\s+/, '')
  const [head, ...rest] = bare.split(/ — | · /)
  const sub = rest.join(' — ') || undefined
  if (sub && /^\D*\d+\s*$/.test(head)) return { name: sub }
  return { name: head, sub }
}

// A course read through a book names its days by the book's chapters.
// A list shorter than the program repeats, as the engine's cycle reads it:
// the 54-day rosary turns through its three sets of mysteries.
function entryOf(entries: DayEntry[], day: number): DayEntry | undefined {
  return entries.length ? entries[day % entries.length] : undefined
}

function getDayEntries(
  cycleData: Record<string, CycleData> | undefined,
  chapterTitles: Map<string, string>,
): DayEntry[] {
  const data = cycleData && Object.values(cycleData).find((d) => d.indexBy === 'program-day')
  const entries = data && (Object.values(data.entries)[0] as Record<string, unknown>[] | undefined)
  if (!entries) return []
  return entries.map((entry) => ({
    ...splitTitle(
      text(entry.dayTitle ?? entry.monthTitle ?? entry.title ?? entry.mysteryLabel) ||
        chapterTitles.get(String(entry.chapterId)) ||
        '',
    ),
    excerpt: text(entry.meditation ?? entry.intention) || undefined,
    chapterId: typeof entry.chapterId === 'string' ? entry.chapterId : undefined,
  }))
}

function proseBook(sections: unknown[] | undefined): string | undefined {
  for (const section of sections ?? []) {
    const s = section as { type?: string; book?: string; sections?: unknown[] }
    if (s.type === 'prose' && s.book) return s.book
    const inner = proseBook(s.sections)
    if (inner) return inner
  }
  return undefined
}

function tocTitles(nodes: TocNode[] | undefined, into = new Map<string, string>()) {
  for (const node of nodes ?? []) {
    into.set(node.id, localizeContent(node.title))
    tocTitles(node.children, into)
  }
  return into
}

// A chapter's first paragraph of prose, as plain text: past its heading, images
// and editorial notes, with markup and tags dropped.
function openingParagraph(source: string): string | undefined {
  const plain = (block: string) =>
    block
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^\s*>\s?/gm, '')
      .replace(/[*_`]/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const blocks = source
    .replace(/<\/(p|div|h\d|blockquote)>/gi, '\n\n')
    .split(/\n\s*\n/)
    .filter((b) => !/^\s*(#|<h\d)/i.test(b))
  return blocks.map(plain).find((b) => b.length >= 80 && !/^\(.*\)$/.test(b))
}

function roman(n: number): string {
  const numerals = [
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ] as const
  let out = ''
  let rest = n
  for (const [value, glyph] of numerals) {
    while (rest >= value) {
      out += glyph
      rest -= value
    }
  }
  return out
}

/**
 * A novena or other program, set like a devocionário page: the name, its days
 * as stars under the date they fall on, today's day opened as a chapter, and
 * the others as the book's contents. Before it's joined the page is the day
 * it would begin and the bar that joins it, over the contents, each day open
 * to read.
 */
export default function ProgramDetailScreen() {
  const { t, i18n } = useTranslation()
  const { manifestId, from } = useLocalSearchParams<{ manifestId: string; from?: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const today = useToday()
  const progress = useProgramProgress(manifest?.id ?? '', manifest?.program, today)
  const dates = useProgramDayDates(manifest?.id ?? '', manifest?.program)
  const restartProgramMutation = useRestartProgram()
  // Beginning it turns this page into the program under way, in place.
  const plan = usePracticePlan(manifest, { openOnBegin: false })
  const [pickedStart, setPickedStart] = useState<string>()

  const cycleDataQuery = useQuery({
    queryKey: ['practice-data', manifestId],
    queryFn: async () => (manifestId ? ((await loadPracticeData(manifestId)) ?? null) : null),
    enabled: !!manifestId,
    staleTime: Infinity,
  })
  const flowQuery = useQuery({
    queryKey: ['practice-flow', manifestId],
    queryFn: async () => (manifestId ? ((await loadFlow(manifestId)) ?? null) : null),
    enabled: !!manifestId,
    staleTime: Infinity,
  })
  const book = useBookManifest(proseBook(flowQuery.data?.sections))
  const entries = useMemo(
    () => getDayEntries(cycleDataQuery.data ?? undefined, tocTitles(book.data?.toc)),
    [cycleDataQuery.data, book.data],
  )
  // A day read from a book opens with the chapter's first lines.
  const dayIndex = progress?.programDay ?? 0
  const chapterId = entryOf(entries, dayIndex)?.chapterId
  const { data: chapterOpening } = useQuery({
    queryKey: ['chapter-opening', book.data?.id, chapterId, i18n.language],
    queryFn: async () => {
      const bookEntry = book.data
      if (!bookEntry || !chapterId) return null
      const lang = bookEntry.chapters?.[chapterId]?.[i18n.language]
        ? i18n.language
        : Object.keys(bookEntry.chapters?.[chapterId] ?? {})[0]
      if (!lang) return null
      const source = await loadChapterSource(bookEntry, chapterId, lang)
      return (source && openingParagraph(source.text)) ?? null
    },
    enabled: !!book.data && !!chapterId,
    staleTime: Infinity,
  })

  if (!manifest?.program) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  const name = localizeContent(manifest.name)
  const numeral = (i: number) => roman(i + 1)
  const dayName = (i: number) => entryOf(entries, i)?.name || t('program.dayLabel', { day: i + 1 })
  const back = (
    <Pressable
      onPress={() => router.back()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.goBack')}
      style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
    >
      <ChevronLeft size={24} strokeWidth={1.5} color={theme.color.val} />
    </Pressable>
  )

  const todayStr = format(today, 'yyyy-MM-dd')

  if (!plan.isInPlan) {
    const { program } = manifest
    const count = program.totalDays
    const defaultSchedule = normalizeSchedule(
      manifest.defaults?.slots?.[0]?.schedule ?? { type: 'daily' },
    )
    const monthly =
      defaultSchedule.type === 'nth-weekday' || defaultSchedule.type === 'day-of-month'
    // Only a program kept to the calendar has a first day to choose; one that
    // waits for its prayers, or keeps its own days of the month, is just joined.
    const dated =
      selectEnrollmentSchedule(program.progressPolicy, defaultSchedule, count, todayStr).type ===
      'fixed-program'
    const traditional = dated ? traditionalStart(program, today) : undefined
    const near =
      !!traditional && differenceInCalendarDays(parseISO(traditional), today) <= joinsAheadDays
    const start = pickedStart ?? (near && traditional ? traditional : todayStr)
    return (
      <ScreenLayout>
        <YStack paddingVertical="$lg">
          {back}
          <PracticeHeader
            name={name}
            caption={t(monthly ? 'program.durationMonths' : 'program.durationDays', { count })}
          />
          {dated && (
            <StartChoice
              today={todayStr}
              traditional={traditional}
              value={start}
              onChange={setPickedStart}
            />
          )}
          <PrayBar
            label={t('program.join')}
            onPress={() => plan.addToPlan(dated ? { startDate: start } : undefined)}
          />
          <Fleuron />
          <YStack>
            {/* A long course lists its opening days; the caption gives the count. */}
            {Array.from({ length: Math.min(windowSize, count) }, (_, i) => (
              <DayLine
                // biome-ignore lint/suspicious/noArrayIndexKey: the days are positional
                key={i}
                numeral={numeral(i)}
                name={dayName(i)}
                state={unbegunDay}
                date={dated ? format(addDays(parseISO(start), i), 'yyyy-MM-dd') : undefined}
                a11yState={t('program.upcoming')}
                onPress={() =>
                  router.push({
                    pathname: '/pray/[practiceId]',
                    params: { practiceId: manifest.id, programDay: String(i), read: '1' },
                  })
                }
              />
            ))}
          </YStack>
        </YStack>
        <PracticePlanEditor plan={plan} />
      </ScreenLayout>
    )
  }

  if (!progress) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  const { programDay, totalDays, isComplete, completionBehavior, shouldPromptRestart } = progress
  const states = computeAllDayStates(progress)
  const prayed = states.filter((s) => s.isCompleted).length
  // Every day gone by and some of them missed: nothing is left to pray.
  const ended = !isComplete && states.every((s) => s.isCompleted || s.isMissed)
  const canOpen = !shouldPromptRestart && !progress.isProjection
  const needsRestart = shouldPromptRestart && !isComplete && !progress.isProjection
  // A day is prayed on its date; ahead of it, it can only be read. A missed day
  // can still be prayed late while the program is under way, and counts for
  // its own date. A program that restarts on a miss can't make one up, and a
  // day already prayed isn't prayed again. A program that waits has no dates
  // of its own — its days are prayed in turn.
  const lastDate = dates.at(-1)
  const lateStillOpen =
    !!lastDate && differenceInCalendarDays(today, parseISO(lastDate)) <= settledAfterDays
  const dayMode = (i: number): 'pray' | 'late' | 'read' => {
    const date = dates[i]
    if (!date || date === todayStr) return 'pray'
    if (date > todayStr) return 'read'
    if (progress.policy === 'wait') return 'pray'
    return progress.policy === 'continue' && states[i].isMissed && lateStillOpen ? 'late' : 'read'
  }
  const openDay = (i: number, mode = dayMode(i)) =>
    router.push({
      pathname: '/pray/[practiceId]',
      params: {
        practiceId: manifest.id,
        programDay: String(i),
        ...(mode === 'read' ? { read: '1' } : {}),
        ...(mode === 'late' ? { dayDate: dates[i] } : {}),
      },
    })
  const fullDate = (date: string, pattern: string) => formatLocalized(parseISO(date), t(pattern))
  const nextDate = dates[programDay] && dates[programDay] > todayStr ? dates[programDay] : undefined
  const shown = dayWindow(programDay, totalDays)
  const current = entryOf(entries, programDay)
  const excerpt = current?.excerpt ?? chapterOpening ?? undefined

  function handleRestart() {
    restartProgramMutation.mutate({ practiceId: manifest?.id ?? '' })
  }

  return (
    <ScreenLayout>
      <YStack paddingVertical="$lg">
        {back}

        <PracticeHeader name={name} caption={t('program.prayedOf', { prayed, count: totalDays })} />

        <DayStars days={shown.map((i) => ({ state: states[i], date: dates[i] }))} />

        {needsRestart ? (
          // Where today's day would be, so opening the page is the warning.
          <YStack paddingTop="$xl" gap="$sm">
            <Typography variant="sacred-title" fontSize={30} lineHeight={38} fontStyle="italic">
              {t('program.missedTitle', {
                count: states.filter((s) => s.isMissed).length || progress.missedDays,
              })}
            </Typography>
            <MissedDays practiceId={manifest.id} program={manifest.program} />
          </YStack>
        ) : isComplete || ended ? (
          <YStack alignItems="center" gap="$md" paddingTop="$xl">
            <Typography variant="sacred-title" fontSize="$5" fontStyle="italic">
              {isComplete ? t('program.complete') : t('program.ended')}
            </Typography>
            <Typography tone="muted" fontSize="$3" textAlign="center">
              {isComplete ? t('program.completeCelebration') : t('program.endedMessage')}
            </Typography>
            {(ended || completionBehavior === 'offer-restart') && (
              <PrayBar label={t('program.restart')} onPress={handleRestart} />
            )}
          </YStack>
        ) : (
          <YStack alignItems="center" paddingTop="$xl">
            <Typography variant="sacred-title" fontSize={26} lineHeight={34} color="$accent">
              {numeral(programDay)}
            </Typography>
            <Typography variant="sacred-title" fontSize={30} lineHeight={38} fontStyle="italic">
              {dayName(programDay)}
            </Typography>
            {current?.sub && (
              <Typography
                variant="sacred-title"
                fontStyle="italic"
                tone="muted"
                fontSize={18}
                lineHeight={24}
              >
                {current.sub}
              </Typography>
            )}
            {excerpt && (
              <Typography
                fontSize="$4"
                lineHeight={28}
                paddingTop="$lg"
                alignSelf="stretch"
                textAlign="justify"
                numberOfLines={4}
              >
                {excerpt}
              </Typography>
            )}
            {canOpen && nextDate ? (
              <>
                <DatePill label={fullDate(nextDate, 'program.dayDateFormat')} />
                <FootLink
                  label={t('program.readAhead')}
                  onPress={() => openDay(programDay, 'read')}
                />
              </>
            ) : null}
            {canOpen && !nextDate ? (
              <PrayBar label={t('practice.pray')} onPress={() => openDay(programDay)} />
            ) : null}
          </YStack>
        )}

        <Fleuron />

        <YStack>
          {(totalDays <= windowSize ? states.map((_, i) => i) : shown)
            .filter((i) => isComplete || ended || needsRestart || i !== programDay)
            .map((i) => (
              <DayLine
                key={i}
                numeral={numeral(i)}
                name={dayName(i)}
                state={states[i]}
                date={dates[i]}
                a11yState={(() => {
                  if (states[i].isCompleted) return t('program.completed')
                  if (states[i].isMissed) return t('program.missed')
                  return t('program.upcoming')
                })()}
                onPress={canOpen ? () => openDay(i) : undefined}
              />
            ))}
        </YStack>

        <XStack justifyContent="center" gap="$lg" paddingTop="$lg">
          <FootLink
            label={t('program.startOver')}
            onPress={async () => {
              const ok = await confirm({
                title: t('program.startOver'),
                description: t('program.startOverConfirm', { name }),
                confirmLabel: t('program.startOver'),
                destructive: true,
              })
              if (ok) handleRestart()
            }}
          />
          <FootLink
            label={t('program.inPlan')}
            chevron
            onPress={() =>
              from === 'plan'
                ? router.back()
                : router.push({
                    pathname: '/plan/[practiceId]',
                    params: { practiceId: manifest.id, from: 'program' },
                  })
            }
          />
        </XStack>
      </YStack>
    </ScreenLayout>
  )
}

// The day a program not yet joined would begin: today, the date its feast
// sets, or another picked from the calendar. The choice is typographic — the
// one chosen in ink over a rule, the others muted.
function StartChoice({
  today,
  traditional,
  value,
  onChange,
}: {
  today: string
  traditional?: string
  value: string
  onChange: (date: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [picking, setPicking] = useState(false)
  const dateLabel = (date: string) => formatLocalized(parseISO(date), t('program.dateFormat'))
  const other = value !== today && value !== traditional
  // How far off the feast's date is, so the choice explains itself.
  const away = (date: string) =>
    differenceInCalendarDays(parseISO(date), parseISO(today)) === 1
      ? t('program.tomorrow')
      : formatDistanceStrict(parseISO(date), parseISO(today), {
          addSuffix: true,
          locale: getDateLocale(),
        })
  const pick = (date: string) => {
    setPicking(false)
    onChange(date)
  }
  const options = [
    {
      key: 'today',
      label: t('program.today'),
      hint: undefined,
      selected: value === today,
      onPress: () => pick(today),
    },
    ...(traditional && traditional !== today
      ? [
          {
            key: 'traditional',
            label: dateLabel(traditional),
            hint: away(traditional),
            selected: value === traditional,
            onPress: () => pick(traditional),
          },
        ]
      : []),
    {
      key: 'other',
      label: other ? dateLabel(value) : t('program.anotherDay'),
      hint: undefined,
      selected: other,
      onPress: () => setPicking((shown) => !shown),
    },
  ]

  return (
    <YStack alignItems="center" paddingTop="$lg">
      <Typography variant="caption" fontSize={17} lineHeight={24}>
        {t('program.whenToBegin')}
      </Typography>
      <XStack gap="$lg" justifyContent="center" flexWrap="wrap">
        {options.map((option) => (
          <Pressable
            key={option.key}
            onPress={option.onPress}
            accessibilityRole="radio"
            accessibilityLabel={option.hint ? `${option.label}, ${option.hint}` : option.label}
            accessibilityState={{ checked: option.selected }}
            aria-checked={option.selected}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <YStack
              borderBottomWidth={1}
              borderColor={option.selected ? '$accent' : 'transparent'}
              paddingBottom={2}
            >
              <Typography fontSize="$3" tone={option.selected ? 'default' : 'muted'}>
                {option.label}
                {option.hint ? (
                  <Typography fontSize="$1" tone="muted">{` · ${option.hint}`}</Typography>
                ) : null}
              </Typography>
            </YStack>
          </Pressable>
        ))}
      </XStack>
      {picking && (
        <DateTimePicker
          value={parseISO(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={parseISO(today)}
          accentColor={theme.accent.val}
          onChange={(event, selected) => {
            // Android's picker is a dialog: it's gone once it answers.
            if (Platform.OS !== 'ios') setPicking(false)
            if (event.type !== 'dismissed' && selected) onChange(format(selected, 'yyyy-MM-dd'))
          }}
        />
      )}
    </YStack>
  )
}

// The day's date where the Rezar bar will be: what the day waits for, not a
// control.
function DatePill({ label }: { label: string }) {
  return (
    <YStack alignSelf="stretch" paddingHorizontal={30} paddingTop={24}>
      <YStack
        height={50}
        borderRadius={25}
        borderWidth={1}
        borderColor="$accentSubtle"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="label" letterSpacing={1.5} color="$accent">
          {label}
        </Typography>
      </YStack>
    </YStack>
  )
}

function Fleuron() {
  return (
    <XStack
      alignItems="center"
      gap="$md"
      paddingTop="$xl"
      paddingBottom="$md"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
      <Typography color="$accent" fontSize="$3">
        ❦
      </Typography>
      <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
    </XStack>
  )
}

// A line of the contents: numeral, the day's name, a dotted leader, and the
// date it falls on — or the star once it's prayed.
function DayLine({
  numeral,
  name,
  state,
  date,
  a11yState,
  onPress,
}: {
  numeral: string
  name: string
  state: DayState
  date?: string
  a11yState: string
  onPress?: () => void
}) {
  const { t } = useTranslation()
  const faded = state.isCompleted || state.isMissed
  const missedLabel = t('program.missed').toLowerCase()
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${numeral}, ${name}, ${a11yState}`}
      accessibilityState={{ disabled: !onPress }}
      aria-disabled={!onPress}
    >
      <XStack alignItems="baseline" gap="$sm" minHeight={36} paddingVertical={4}>
        <Typography
          variant="sacred-title"
          textAlign="left"
          fontSize="$2"
          minWidth={40}
          tone="muted"
        >
          {numeral}
        </Typography>
        <Typography
          fontSize="$3"
          numberOfLines={1}
          flexShrink={1}
          tone={faded ? 'muted' : 'default'}
        >
          {name}
        </Typography>
        <YStack flex={1} overflow="hidden" minWidth={12}>
          <Typography
            fontSize="$1"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode="clip"
            opacity={0.6}
          >
            {' ·'.repeat(80)}
          </Typography>
        </YStack>
        {state.isCompleted ? (
          <Typography color="$accent" fontSize="$2">
            ✦
          </Typography>
        ) : state.isMissed ? (
          <Typography fontSize="$1" tone="muted" fontStyle="italic">
            {missedLabel}
          </Typography>
        ) : (
          <Typography fontSize="$1" tone="muted">
            {date ? formatLocalized(parseISO(date), 'd MMM').replace('.', '') : ''}
          </Typography>
        )}
      </XStack>
    </AnimatedPressable>
  )
}
