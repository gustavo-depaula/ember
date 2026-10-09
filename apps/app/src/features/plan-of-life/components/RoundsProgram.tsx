import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceStrict, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerSpinner, ScreenLayout, Typography } from '@/components'
import type { PracticeManifest } from '@/content/manifestTypes'
import { fetchSource } from '@/content/preprocessFlow'
import { loadPracticeData } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { PracticePlanEditor, usePracticePlan } from '@/features/practices/components/PracticePlan'
import { markedOnTheDay } from '@/features/saints/acts'
import { SaintCardTile } from '@/features/saints/components/SaintCardTile'
import { useSaintsCatalog } from '@/features/saints/data/catalog'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { formatLocalized, getDateLocale } from '@/lib/i18n/dateLocale'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { useSlotsForPractice, useUpdateSlot } from '../hooks'
import { currentRound, type DayState, joinsRound, programRounds, type Round } from '../program'
import { parseSchedule } from '../schedule'
import { DayStars } from './DayStars'
import { FootLink, PrayBar } from './MissedDays'
import { DatePill, DayLine, Fleuron, JoinMode, roman } from './ProgramParts'

type DayTitles = { dayTitle?: { 'en-US'?: string; 'pt-BR'?: string } }[]

/**
 * The page of a program the calendar brings round (the Ember days): the round
 * under way or next to come as stars under its dates, today's day opened as a
 * chapter, and the year's cards beneath. It is joined for the next round or
 * for every one, and never begun, restarted or lost: a day gone by unkept is
 * an empty ring, and the days after it are still offered.
 */
export function RoundsProgram({ manifest }: { manifest: PracticeManifest }) {
  const { t } = useTranslation()
  const router = useRouter()
  const queryClient = useQueryClient()
  const today = useToday()
  const todayStr = format(today, 'yyyy-MM-dd')
  const plan = usePracticePlan(manifest, { openOnBegin: false })
  const updateSlot = useUpdateSlot()
  const slot = useSlotsForPractice(manifest.id).find((s) => s.enabled === 1)
  const schedule = slot ? parseSchedule(slot.schedule) : undefined
  // Joined for every round unless she says the next ones only.
  const [joinStanding, setJoinStanding] = useState(true)
  const { byId } = useSaintsCatalog()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const translation = usePreferencesStore((s) => s.translation)
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  // As one string, so the page redraws only when a day is marked.
  const kept = useEventStore((s) => [...markedOnTheDay(s, manifest.id)].sort().join(',')).split(',')

  const program = manifest.program
  const round = program && currentRound(program, today)
  const days = round?.days ?? []
  const focus = (() => {
    const upcoming = days.findIndex((d) => d >= todayStr)
    return upcoming === -1 ? undefined : upcoming
  })()
  // In the plan for this round: every round, or this very one.
  const joined = !!schedule && !!round && joinsRound(schedule, round)
  const prayToday = joined && focus !== undefined && days[focus] === todayStr

  const { data: titles } = useQuery({
    queryKey: ['practice-data', manifest.id],
    queryFn: async () => (await loadPracticeData(manifest.id)) ?? null,
    staleTime: Infinity,
  })
  const excerptRef = program?.excerpt
  const { data: excerpt } = useQuery({
    queryKey: ['program-excerpt', manifest.id, todayStr, contentLanguage],
    queryFn: async () => {
      if (!excerptRef) return null
      const lines = [
        await fetchSource(excerptRef.ref, excerptRef.params ?? {}, {
          queryClient,
          prefs: { lang: contentLanguage, translation, jurisdiction },
          date: today,
        }),
      ].flat()
      const line = lines.find((p) => p.type === 'text')
      return line?.type === 'text' ? line.text.primary : null
    },
    enabled: prayToday && !!excerptRef,
    staleTime: Infinity,
    throwOnError: true,
  })

  if (!program || !round) {
    return (
      <ScreenLayout>
        <PrayerSpinner />
      </ScreenLayout>
    )
  }

  const name = localizeContent(manifest.name)
  const dayData = Object.values(titles ?? {}).find((d) => d.indexBy === 'program-day')
  const dayTitles = ((Object.values(dayData?.entries ?? {})[0] ?? []) as DayTitles).map((e) =>
    e.dayTitle ? localizeContent(e.dayTitle) : '',
  )
  const dayName = (i: number) => dayTitles[i] || t('program.dayLabel', { day: i + 1 })
  const cardOf = (r: Round) => byId[program.holyCard?.[r.key] ?? '']
  const roundName = (r: Round) => cardOf(r)?.name ?? name

  const states: DayState[] = days.map((d) => {
    const isCompleted = kept.includes(d)
    return {
      isCompleted,
      isMissed: !isCompleted && d < todayStr,
      isCurrent: !isCompleted && d === todayStr && joined,
      isFuture: !isCompleted && d > todayStr,
    }
  })
  const begun = days[0] <= todayStr
  const over = focus === undefined
  const prayed = states.filter((s) => s.isCompleted).length
  const longDate = (date: string) => formatLocalized(parseISO(date), t('program.dayDateFormat'))
  const away = formatDistanceStrict(parseISO(days[0]), today, {
    addSuffix: true,
    unit: 'day',
    locale: getDateLocale(),
  })
  // The year from this round on: the round shown, then the three after it.
  const year = (() => {
    const all = programRounds(program, today)
    const from = all.findIndex((r) => r.days[0] === days[0])
    return all.slice(from, from + 4)
  })()
  const next = year[1]

  const openDay = (i: number, read: boolean) =>
    router.push({
      pathname: '/pray/[practiceId]',
      params: { practiceId: manifest.id, programDay: String(i), ...(read ? { read: '1' } : {}) },
    })
  const a11yState = (s: DayState) =>
    s.isCompleted
      ? t('program.completed')
      : s.isMissed
        ? t('program.missed')
        : t('program.upcoming')

  const caption = (() => {
    if (!joined) return manifest.subtitle ? localizeContent(manifest.subtitle) : undefined
    if (!begun) return away
    return t('program.prayedOf', { prayed, count: days.length })
  })()

  return (
    <ScreenLayout>
      <YStack paddingVertical="$lg">
        <PracticeHeader onBack={() => router.back()} name={name} caption={caption} />

        <DayStars days={states.map((state, i) => ({ state, date: days[i] }))} />

        {/* Titles span the page: Android measures a centred italic line a hair
            too narrow when shrink-wrapped and drops its last word. */}
        <YStack alignItems="center" paddingTop="$xl">
          {over ? (
            // Every day gone by: kept whole, its card; otherwise only what comes next.
            <>
              <Typography
                variant="sacred-title"
                fontSize={30}
                lineHeight={38}
                fontStyle="italic"
                alignSelf="stretch"
              >
                {roundName(round)}
              </Typography>
              {prayed === days.length ? (
                <>
                  <Typography
                    variant="sacred-title"
                    fontStyle="italic"
                    tone="muted"
                    fontSize={18}
                    lineHeight={24}
                    alignSelf="stretch"
                  >
                    {t('program.keptWhole')}
                  </Typography>
                  {cardOf(round) ? (
                    <YStack paddingTop="$lg">
                      <CardLink saint={cardOf(round)} width={150} />
                    </YStack>
                  ) : null}
                </>
              ) : null}
            </>
          ) : prayToday || (begun && joined) ? (
            <>
              <Typography variant="sacred-title" fontSize={26} lineHeight={34} color="$accent">
                {roman(focus + 1)}
              </Typography>
              <Typography
                variant="sacred-title"
                fontSize={30}
                lineHeight={38}
                fontStyle="italic"
                alignSelf="stretch"
              >
                {dayName(focus)}
              </Typography>
              <Typography
                variant="sacred-title"
                fontStyle="italic"
                tone="muted"
                fontSize={18}
                lineHeight={24}
                alignSelf="stretch"
              >
                {roundName(round)}
              </Typography>
              {prayToday && excerpt ? (
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
              ) : null}
              {prayToday && !states[focus].isCompleted ? (
                <PrayBar label={t('practice.pray')} onPress={() => openDay(focus, false)} />
              ) : null}
              {!prayToday ? <DatePill label={longDate(days[focus])} /> : null}
            </>
          ) : (
            // Not begun, or not joined: the round to come and what it prays.
            <>
              <Typography
                variant="sacred-title"
                fontSize={30}
                lineHeight={38}
                fontStyle="italic"
                alignSelf="stretch"
              >
                {roundName(round)}
              </Typography>
              {cardOf(round)?.prayerExcerpt ? (
                <Typography
                  fontSize="$4"
                  lineHeight={28}
                  paddingTop="$md"
                  textAlign="center"
                  fontStyle="italic"
                  tone="muted"
                >
                  {cardOf(round)?.prayerExcerpt}
                </Typography>
              ) : null}
              {joined ? (
                <DatePill label={longDate(days[focus])} />
              ) : (
                <>
                  <YStack paddingTop="$md">
                    <JoinMode rounds standing={joinStanding} onChange={setJoinStanding} />
                  </YStack>
                  <PrayBar
                    label={t('program.join')}
                    onPress={() => plan.addToPlan({ startDate: days[0], standing: joinStanding })}
                  />
                </>
              )}
              <FootLink label={t('program.readAhead')} onPress={() => openDay(focus, true)} />
            </>
          )}
          {over && next ? (
            <Typography tone="muted" fontStyle="italic" fontSize="$2" paddingTop="$md">
              {t('program.nextRound', { name: roundName(next), date: longDate(next.days[0]) })}
            </Typography>
          ) : null}
        </YStack>

        <Fleuron />

        <YStack>
          {joined
            ? days.map((d, i) =>
                !over && begun && i === focus ? null : (
                  <DayLine
                    key={d}
                    numeral={roman(i + 1)}
                    name={dayName(i)}
                    state={states[i]}
                    date={d}
                    a11yState={a11yState(states[i])}
                    onPress={() => openDay(i, d !== todayStr || states[i].isCompleted)}
                  />
                ),
              )
            : // Before it's joined, the year: each round and its days.
              year.map((r, i) => (
                <DayLine
                  key={r.days[0]}
                  numeral={roman(i + 1)}
                  name={roundName(r)}
                  state={{ isCompleted: false, isMissed: false, isCurrent: false, isFuture: true }}
                  trailing={`${r.days.map((d) => Number(d.slice(8))).join(' · ')} ${formatLocalized(parseISO(r.days[0]), 'MMM').replace('.', '')}`}
                  a11yState={t('program.upcoming')}
                />
              ))}
        </YStack>

        <XStack justifyContent="space-between" paddingTop="$xl">
          {year.map((r) => {
            const saint = cardOf(r)
            return saint ? <CardLink key={r.days[0]} saint={saint} width={72} /> : null
          })}
        </XStack>

        {joined && slot ? (
          <YStack alignItems="center" paddingTop="$lg">
            {/* The way she joined, still hers to change. */}
            <JoinMode
              rounds
              standing={schedule?.standing === true}
              onChange={(standing) =>
                updateSlot.mutate({
                  id: slot.id,
                  data: {
                    schedule: JSON.stringify(
                      standing
                        ? { type: 'ember-days', standing: true }
                        : { type: 'ember-days', only: days[0] },
                    ),
                  },
                })
              }
            />
            <FootLink
              label={t('program.inPlan')}
              chevron
              onPress={() =>
                router.push({
                  pathname: '/plan/[practiceId]',
                  params: { practiceId: manifest.id, from: 'program' },
                })
              }
            />
          </YStack>
        ) : null}
      </YStack>
      <PracticePlanEditor plan={plan} />
    </ScreenLayout>
  )
}

// A round's card: its print until a round is kept whole, and a way to its page.
function CardLink({
  saint,
  width,
}: {
  saint: NonNullable<ReturnType<typeof useSaintsCatalog>['byId'][string]>
  width: number
}) {
  const router = useRouter()
  return (
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/saints/[index]', params: { index: saint.id } })}
      accessibilityRole="link"
      accessibilityLabel={saint.name}
    >
      <SaintCardTile saint={saint} width={width} />
    </AnimatedPressable>
  )
}
