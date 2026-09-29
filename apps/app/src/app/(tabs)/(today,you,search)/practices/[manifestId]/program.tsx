import { useQuery } from '@tanstack/react-query'
import { addDays, format, parseISO } from 'date-fns'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, PrayerSpinner, ScreenLayout, Typography } from '@/components'
import type { TocNode } from '@/content/manifestTypes'
import { getManifest, loadFlow, loadPracticeData } from '@/content/resolver'
import type { CycleData } from '@/content/types'
import { useBookManifest } from '@/features/books/hooks'
import {
  useBackfillMissedDays,
  useProgramDayDates,
  useProgramProgress,
  useRestartProgram,
} from '@/features/plan-of-life'
import { computeAllDayStates, type DayState } from '@/features/plan-of-life/program'
import { ProgramRestartModal } from '@/features/practices/components'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { getToday, useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized } from '@/lib/i18n/dateLocale'

// A long course shows the stretch around today rather than every day.
const windowSize = 9

type Localized = { 'en-US'?: string; 'pt-BR'?: string }
type DayEntry = { name: string; sub?: string; excerpt?: string }

const text = (v: unknown) =>
  typeof v === 'string' ? v : v && typeof v === 'object' ? localizeContent(v as Localized) : ''

// "Dia 4: Minha luz — uma lâmpada para a mente" → name "Minha luz", sub "uma
// lâmpada para a mente". The numeral is the page's own, so the title's goes.
function splitTitle(title: string): Pick<DayEntry, 'name' | 'sub'> {
  const bare = title.replace(/^[^:]*\d[^:]*:\s*/, '').replace(/^\d+\.\s+/, '')
  const [head, ...rest] = bare.split(' — ')
  const sub = rest.join(' — ') || undefined
  // "Dia 1 — Toda a humanidade": the numbered head says nothing the page doesn't.
  if (sub && /^\D*\d+\s*$/.test(head)) return { name: sub }
  return { name: head, sub }
}

// A course read through a book names its days by the book's chapters.
function getDayEntries(
  cycleData: Record<string, CycleData> | undefined,
  chapterTitles: Map<string, string>,
): DayEntry[] {
  const data = cycleData && Object.values(cycleData).find((d) => d.indexBy === 'program-day')
  const entries = data && (Object.values(data.entries)[0] as Record<string, unknown>[] | undefined)
  if (!entries) return []
  return entries.map((entry) => ({
    ...splitTitle(
      text(entry.dayTitle ?? entry.monthTitle) || chapterTitles.get(String(entry.chapterId)) || '',
    ),
    excerpt: text(entry.meditation ?? entry.intention) || undefined,
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
 * the others as the book's contents.
 */
export default function ProgramDetailScreen() {
  const { t } = useTranslation()
  const { manifestId } = useLocalSearchParams<{ manifestId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const manifest = manifestId ? getManifest(manifestId) : undefined
  const today = useToday()
  const progress = useProgramProgress(manifest?.id ?? '', manifest?.program, today)
  const dates = useProgramDayDates(manifest?.id ?? '', manifest?.program)
  const restartProgramMutation = useRestartProgram()
  const backfillMutation = useBackfillMissedDays()

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

  if (!manifest?.program || !progress) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  const { programDay, totalDays, isComplete, completionBehavior, shouldPromptRestart } = progress
  const states = computeAllDayStates(progress)
  const prayed = states.filter((s) => s.isCompleted).length
  const name = localizeContent(manifest.name)
  const numeral = (i: number) => roman(i + 1)
  const dayName = (i: number) => entries[i]?.name || t('program.dayLabel', { day: i + 1 })
  const canOpen = !shouldPromptRestart && !progress.isProjection
  const openDay = (i: number) =>
    router.push({
      pathname: '/pray/[practiceId]',
      params: { practiceId: manifest.id, programDay: String(i) },
    })
  const start =
    totalDays <= windowSize
      ? 0
      : Math.min(Math.max(programDay - Math.floor(windowSize / 2), 0), totalDays - windowSize)
  const shown = Array.from({ length: Math.min(windowSize, totalDays) }, (_, k) => start + k)
  const current = entries[programDay]

  function handleRestart() {
    restartProgramMutation.mutate({ practiceId: manifest?.id ?? '' })
  }

  function handleBackfill() {
    if (!manifest || !progress) return
    const missedDates = Array.from({ length: progress.missedDays }, (_, k) =>
      format(addDays(getToday(), -(progress.missedDays - k)), 'yyyy-MM-dd'),
    )
    backfillMutation.mutate({ practiceId: manifest.id, dates: missedDates })
  }

  return (
    <ScreenLayout>
      <YStack paddingVertical="$lg">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <ChevronLeft size={24} strokeWidth={1.5} color={theme.color.val} />
        </Pressable>

        <PracticeHeader name={name} caption={t('program.prayedOf', { prayed, count: totalDays })} />

        <DayStars days={shown.map((i) => ({ state: states[i], date: dates[i] }))} />

        {shouldPromptRestart && !isComplete && !progress.isProjection && (
          <ProgramRestartModal
            practiceName={name}
            missedDays={progress.missedDays}
            onRestart={handleRestart}
            onContinue={handleBackfill}
          />
        )}

        {isComplete ? (
          <YStack alignItems="center" gap="$md" paddingTop="$xl">
            <Typography variant="sacred-title" fontSize="$5" fontStyle="italic">
              {t('program.complete')}
            </Typography>
            <Typography tone="muted" fontSize="$3" textAlign="center">
              {t('program.completeCelebration')}
            </Typography>
            {completionBehavior === 'offer-restart' && (
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
            {current?.excerpt && (
              <Typography
                fontSize="$4"
                lineHeight={28}
                paddingTop="$lg"
                alignSelf="stretch"
                textAlign="justify"
                numberOfLines={4}
              >
                {current.excerpt}
              </Typography>
            )}
            {canOpen && <PrayBar label={t('practice.pray')} onPress={() => openDay(programDay)} />}
          </YStack>
        )}

        <Fleuron />

        <YStack>
          {(totalDays <= windowSize ? states.map((_, i) => i) : shown)
            .filter((i) => isComplete || i !== programDay)
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
              router.push({ pathname: '/plan/[practiceId]', params: { practiceId: manifest.id } })
            }
          />
        </XStack>
      </YStack>
    </ScreenLayout>
  )
}

// The days as the fidelity wall draws them: a lit star for a day prayed, an
// open one for today, a dot for a day missed or still to come.
function DayStars({ days }: { days: { state: DayState; date?: string }[] }) {
  const theme = useTheme()
  const parsed = days.map((d) => (d.date ? parseISO(d.date) : undefined))
  const months = [...new Set(parsed.filter(Boolean).map((d) => formatLocalized(d as Date, 'LLLL')))]

  return (
    <YStack
      paddingVertical="$md"
      borderBottomWidth={0.5}
      borderColor="$borderColor"
      gap="$sm"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <XStack justifyContent="space-between">
        {days.map(({ state }, k) => {
          const date = parsed[k]
          const glyph = (() => {
            if (state.isCompleted) return { char: '✦', size: 18, color: theme.accent.val }
            if (state.isCurrent) return { char: '✧', size: 18, color: theme.colorSecondary.val }
            return { char: '●', size: 4, color: theme.wallEmpty.val }
          })()
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the cells are positional
            <YStack key={k} alignItems="center" gap={4} width={34}>
              <Typography variant="label" fontSize={10} letterSpacing={1} tone="muted">
                {date
                  ? formatLocalized(date, 'EEE').replace('.', '').slice(0, 3).toUpperCase()
                  : ''}
              </Typography>
              <YStack height={26} justifyContent="center">
                <Typography fontSize={glyph.size} lineHeight={26} color={glyph.color}>
                  {glyph.char}
                </Typography>
              </YStack>
              <Typography fontSize="$2" color={state.isCurrent ? '$color' : '$colorSecondary'}>
                {date ? format(date, 'd') : ''}
              </Typography>
            </YStack>
          )
        })}
      </XStack>
      {months.length > 0 && (
        <XStack justifyContent="space-between">
          {months.slice(0, 2).map((m) => (
            <Typography key={m} variant="label" fontSize={10} letterSpacing={1.5} tone="muted">
              {m.toUpperCase()}
            </Typography>
          ))}
        </XStack>
      )}
    </YStack>
  )
}

function PrayBar({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ alignSelf: 'stretch', paddingHorizontal: 30, paddingTop: 24 }}
    >
      <YStack
        height={50}
        borderRadius={25}
        backgroundColor="$accent"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="label" letterSpacing={1.5} color="$background">
          {label}
        </Typography>
      </YStack>
    </AnimatedPressable>
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
  const faded = state.isCompleted || state.isMissed
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
        ) : (
          <Typography fontSize="$1" tone="muted">
            {date ? formatLocalized(parseISO(date), 'd MMM').replace('.', '') : ''}
          </Typography>
        )}
      </XStack>
    </AnimatedPressable>
  )
}

function FootLink({
  label,
  chevron,
  onPress,
}: {
  label: string
  chevron?: boolean
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Typography tone="muted" fontSize="$2" minHeight={44} paddingTop="$sm">
        {chevron ? `${label} ›` : label}
      </Typography>
    </AnimatedPressable>
  )
}
