import type { Copy, Season, Way } from '@ember/holy-cards'
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import type { TFunction } from 'i18next'
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme, View, XStack, YStack } from 'tamagui'
import { useShallow } from 'zustand/react/shallow'
import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import type { DayPrayer } from '@/content/manifestTypes'
import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { useCompletionRange } from '@/features/plan-of-life/completion'
import { useProgramProgress } from '@/features/plan-of-life/hooks'
import { programRounds, traditionalStart } from '@/features/plan-of-life/program'
import { practiceHref } from '@/features/practices/practiceHref'
import { useToday } from '@/hooks/useToday'
import i18n, { localizeContent } from '@/lib/i18n'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'
import { dayPrayers, dayPrayersByDate, roundDaysKept } from '../acts'
import { howWon } from '../redeem/envelopeText'
import type { ReceiveWay } from '../useWaysToReceive'

type Glyph = 'chalice' | 'beads' | 'candles' | 'book' | 'day'

/**
 * What wins the card, door by door: what to do, when it next comes round, and
 * how far along it is. For a held card, how it came first, then the same ways
 * to receive it again.
 */
export function ReceiveChapter({ ways, copy }: { ways: ReceiveWay[]; copy: Copy | undefined }) {
  const { t } = useTranslation()
  return (
    <YStack>
      {copy && (
        <YStack alignItems="center" gap={4} paddingBottom="$md">
          <Typography variant="interface" fontSize="$3" textAlign="center">
            {howWon({ door: copy.door, date: copy.won }, t)}
          </Typography>
        </YStack>
      )}
      {copy && ways.length > 0 && (
        <Typography
          variant="label"
          fontSize={12}
          letterSpacing={2}
          textTransform="uppercase"
          color="$colorSecondary"
          textAlign="center"
          paddingTop="$md"
          paddingBottom="$sm"
        >
          {t('saints.receive.again')}
        </Typography>
      )}
      <YStack borderTopWidth={1} borderTopColor="$borderColor">
        {ways.map((way) => {
          if (way.door === 'novena') return <NovenaRow key={way.novena} novena={way.novena} />
          if (way.door === 'emberDays') {
            return way.practice ? (
              <RoundRow key={way.door} practice={way.practice} round={way.ember} />
            ) : null
          }
          if (way.door === 'prayedDay') return <PrayedDayRow key={way.door} date={way.date} />
          return <WayRow key={way.door} way={way} />
        })}
      </YStack>
    </YStack>
  )
}

function WayRow({ way }: { way: Exclude<Way, { door: 'novena' | 'emberDays' }> }) {
  const { t } = useTranslation()
  const today = useToday()
  const text = describe(way, today, t)
  if (!text) return null
  return (
    <Row
      glyph={text.glyph}
      title={text.title}
      when={text.when}
      detail={text.detail}
      progress={text.progress}
      soon={text.soon}
    />
  )
}

/** A novena: the day reached when under way, or when it next begins; a tap opens it. */
function NovenaRow({ novena }: { novena: string }) {
  const { t } = useTranslation()
  const transfers = useOfTransfers()
  const router = useRouter()
  const today = useToday()
  const manifest = getManifest(novena)
  const progress = useProgramProgress(novena, manifest?.program)
  if (!manifest?.program) return null
  const name = localizeContent(manifest.name)
  const total = manifest.program.totalDays
  const underWay = progress && !progress.isComplete && progress.completionCount > 0
  const when = (() => {
    if (underWay) return t('saints.receive.novenaDay', { day: progress.completionCount, total })
    const start = traditionalStart(manifest.program, today, transfers)
    if (start) return t('saints.receive.novenaBegins', { date: dayAndDistance(start, today, t) })
    // Its traditional days are under way: begun now, it still gives the card.
    if (manifest.program.ends) {
      const end = format(addDays(today, total - 1), 'yyyy-MM-dd')
      return t('saints.receive.novenaFromToday', { date: dayAndDistance(end, today, t) })
    }
    return t('saints.receive.novenaAnyDays', { count: total })
  })()
  return (
    <AnimatedPressable
      onPress={() => router.push(practiceHref(novena))}
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      <Row
        glyph="beads"
        title={t('saints.receive.novena', { name })}
        when={when}
        soon={!!underWay}
        progress={underWay ? { total, done: progress.completionCount } : undefined}
        action={
          underWay
            ? t('saints.receive.prayDay', { day: progress.completionCount + 1 })
            : t('saints.page.pray')
        }
      />
    </AnimatedPressable>
  )
}

/** A program's round: when its days next fall, or how many are kept; a tap opens it. */
function RoundRow({ practice, round: key }: { practice: string; round: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const todayStr = format(today, 'yyyy-MM-dd')
  const plan = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      cursors: s.cursors,
      completions: s.completions,
      completionsByPractice: s.completionsByPractice,
    })),
  )
  const manifest = getManifest(practice)
  const round =
    manifest?.program &&
    programRounds(manifest.program, today).find(
      (r) => r.key === key && (r.days.at(-1) as string) >= todayStr,
    )
  if (!manifest || !round) return null
  const total = round.days.length
  const underWay = round.days[0] <= todayStr
  const done = roundDaysKept(plan, manifest.id, round.days)
  const title = t('saints.receive.round', { name: localizeContent(manifest.name) })
  return (
    <AnimatedPressable
      onPress={() => router.push(practiceHref(practice))}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <Row
        glyph="candles"
        title={title}
        when={
          underWay
            ? t('saints.receive.seasonSoFar', {
                done,
                total,
                date: dayAndDistance(round.days.at(-1) as string, today, t),
              })
            : t('saints.receive.seasonFrom', { date: dayAndDistance(round.days[0], today, t) })
        }
        soon={underWay}
        progress={underWay ? { total, done } : undefined}
        action={t('saints.page.pray')}
      />
    </AnimatedPressable>
  )
}

/**
 * A prayed day, the Office of those who don't pray it: the morning offering,
 * the rosary and the examination of conscience along the arc of the day, lit
 * as far as today's are prayed. It only says what is asked and what is done;
 * the prayers are reached from where they are always prayed.
 */
function PrayedDayRow({ date }: { date: string }) {
  const { t } = useTranslation()
  const today = format(useToday(), 'yyyy-MM-dd')
  const completions = useCompletionRange(today, today)
  const prayed = useMemo(
    () =>
      (date === today ? dayPrayersByDate(completions).get(today) : undefined) ??
      new Set<DayPrayer>(),
    [completions, date, today],
  )
  const when = (() => {
    if (date !== today) return t('saints.receive.prayedDayWhen')
    if (prayed.size === dayPrayers.length) return t('saints.receive.prayedDayDone')
    return t('saints.receive.prayedDaySoFar', { done: prayed.size, total: dayPrayers.length })
  })()
  return (
    <Row glyph="day" title={t('saints.receive.prayedDay')} when={when} soon={date === today}>
      <DayArc prayed={prayed} />
    </Row>
  )
}

// The day's arc, sunrise to sunset over the horizon, in the drawing's own
// units; each prayer's place on it, and the stretch of sky lit once it and
// those before it are prayed.
const arc = 'M20 70Q140 -20 260 70'
const stations: Record<DayPrayer, { x: number; y: number; lit: string }> = {
  offering: { x: 48.8, y: 51, lit: 'M20 70Q34.4 59.2 48.8 51' },
  rosary: { x: 140, y: 25, lit: 'M20 70Q80 25 140 25' },
  examen: { x: 231.2, y: 51, lit: arc },
}
const stationAlign = { offering: 'flex-start', rosary: 'center', examen: 'flex-end' } as const

function DayArc({ prayed }: { prayed: Set<DayPrayer> }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const ink = theme.accentHover.val
  const reached = dayPrayers.filter((_, i) =>
    dayPrayers.slice(0, i + 1).every((p) => prayed.has(p)),
  )
  const lit = reached.at(-1)
  return (
    <YStack paddingTop={8}>
      <Svg
        viewBox="0 0 280 78"
        style={{ width: '100%', aspectRatio: 280 / 78 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Path
          d="M8 70h264"
          stroke={theme.borderColor.val}
          strokeWidth={1.2}
          strokeDasharray="2 4"
        />
        <Path d={arc} stroke={theme.borderColor.val} strokeWidth={1.2} fill="none" />
        {lit && <Path d={stations[lit].lit} stroke={ink} strokeWidth={1.6} fill="none" />}
        {dayPrayers.map((prayer) => (
          <Circle
            key={prayer}
            cx={stations[prayer].x}
            cy={stations[prayer].y}
            r={7}
            stroke={ink}
            strokeWidth={1.5}
            fill={prayed.has(prayer) ? ink : theme.background.val}
          />
        ))}
      </Svg>
      <XStack>
        {dayPrayers.map((prayer) => (
          <YStack key={prayer} flex={1} alignItems={stationAlign[prayer]}>
            <Typography
              variant="interface"
              fontSize="$2"
              color={prayed.has(prayer) ? '$colorSecondary' : undefined}
            >
              {t(`saints.receive.dayPrayer.${prayer}`)}
            </Typography>
            <Typography variant="annotation">
              {t(`saints.receive.dayPrayerWhen.${prayer}`)}
            </Typography>
          </YStack>
        ))}
      </XStack>
    </YStack>
  )
}

function Row({
  glyph,
  title,
  when,
  detail,
  progress,
  soon,
  action,
  children,
}: {
  glyph: Glyph
  title: string
  when: string
  detail?: string
  progress?: { total: number; done: number }
  soon?: boolean
  action?: string
  children?: ReactNode
}) {
  return (
    <XStack gap="$md" paddingVertical="$md" borderBottomWidth={1} borderBottomColor="$borderColor">
      <View width={28} paddingTop={2}>
        <GlyphIcon glyph={glyph} />
      </View>
      <YStack flex={1} gap={2}>
        <Typography variant="interface" fontSize="$3">
          {title}
        </Typography>
        <Typography variant="annotation" color={soon ? '$colorBurgundy' : undefined}>
          {when}
        </Typography>
        {progress && <Beads {...progress} />}
        {children}
        {detail && (
          <Typography variant="annotation" fontStyle="italic" paddingTop={4}>
            {detail}
          </Typography>
        )}
        {action && (
          <XStack paddingTop="$sm">
            <View
              borderWidth={1}
              borderColor={soon ? '$colorBurgundy' : '$accent'}
              backgroundColor={soon ? '$colorBurgundy' : 'transparent'}
              borderRadius={14}
              paddingHorizontal={10}
              paddingVertical={3}
            >
              <Typography
                variant="label"
                fontSize={10}
                letterSpacing={1.5}
                textTransform="uppercase"
                color={soon ? '$background' : '$accentHover'}
              >
                {action}
              </Typography>
            </View>
          </XStack>
        )}
      </YStack>
    </XStack>
  )
}

// A bead per day (or Sunday) up to a dozen; a longer count is a rule that fills.
function Beads({ total, done }: { total: number; done: number }) {
  if (total > 12) {
    return (
      <View
        height={4}
        borderRadius={2}
        backgroundColor="$borderColor"
        marginTop={8}
        overflow="hidden"
      >
        <View
          height={4}
          width={`${Math.min(100, (done / total) * 100)}%`}
          backgroundColor="$accentHover"
        />
      </View>
    )
  }
  return (
    <XStack
      gap={6}
      paddingTop={6}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: beads are positions, not items
          key={i}
          width={12}
          height={12}
          borderRadius={6}
          borderWidth={1.5}
          borderColor="$accentHover"
          backgroundColor={i < done ? '$accentHover' : 'transparent'}
        />
      ))}
    </XStack>
  )
}

function GlyphIcon({ glyph }: { glyph: Glyph }) {
  const ink = useTheme().accentHover.val
  const line = { stroke: ink, strokeWidth: 1.4, fill: 'none' }
  return (
    <Svg
      width={26}
      height={26}
      viewBox="0 0 28 28"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {glyph === 'chalice' && (
        <Path d="M8 4h12c0 6-2.5 9-6 9s-6-3-6-9zM14 13v8M9 24h10M11 21h6" {...line} />
      )}
      {glyph === 'book' && (
        <Path d="M4 6c4-1 7 0 10 2 3-2 6-3 10-2v16c-4-1-7 0-10 2-3-2-6-3-10-2zM14 8v16" {...line} />
      )}
      {glyph === 'day' && (
        <Path
          d="M3 21h22M8 21a6 6 0 0 1 12 0M14 8v3.5M5.5 12.5l2.4 2.4M22.5 12.5l-2.4 2.4"
          {...line}
        />
      )}
      {glyph === 'candles' && (
        <Path
          d="M5 12h4v12H5zM12 10h4v14h-4zM19 12h4v12h-4zM7 9.5c-1-1 0-2.5 0-3.5 1 1 1.6 2.5 0 3.5zM14 7.5c-1-1 0-2.5 0-3.5 1 1 1.6 2.5 0 3.5zM21 9.5c-1-1 0-2.5 0-3.5 1 1 1.6 2.5 0 3.5zM3 24h22"
          {...line}
        />
      )}
      {glyph === 'beads' && (
        <>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + Math.PI / 2
            return (
              <Circle
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed ring of beads
                key={i}
                cx={14 + 8 * Math.cos(a)}
                cy={10 - 6.8 * Math.sin(a)}
                r={1.6}
                fill={ink}
              />
            )
          })}
          <Path d="M14 18.5v8M11.2 21.5h5.6" {...line} />
        </>
      )}
    </Svg>
  )
}

/** "Sunday, 4 October · in 2 days", with today and tomorrow named. */
function dayAndDistance(iso: string, today: Date, t: TFunction): string {
  const date = new Intl.DateTimeFormat(i18n.language || 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseISO(iso))
  const days = differenceInCalendarDays(parseISO(iso), today)
  if (days === 0) return t('saints.receive.today', { date })
  if (days === 1) return t('saints.receive.tomorrow', { date })
  return t('saints.receive.inDays', { date, count: days })
}

function describe(
  way: Exclude<Way, { door: 'novena' | 'emberDays' }>,
  today: Date,
  t: TFunction,
):
  | {
      glyph: Glyph
      title: string
      when: string
      detail?: string
      progress?: { total: number; done: number }
      soon?: boolean
    }
  | undefined {
  const todayIso = format(today, 'yyyy-MM-dd')
  const season = (s: Season) => t(`saints.receive.season.${s}`)
  switch (way.door) {
    case 'mass':
    case 'office': {
      const soon = differenceInCalendarDays(parseISO(way.date), today) <= 2
      return {
        glyph: way.door === 'mass' ? 'chalice' : 'book',
        title: t(`saints.receive.${way.door}`),
        when: dayAndDistance(way.date, today, t),
        detail: way.door === 'office' ? t('saints.receive.officeWhy') : undefined,
        soon,
      }
    }
    case 'drawn':
      return {
        glyph: 'chalice',
        title: t('saints.receive.drawn'),
        when: t('saints.receive.drawnWhen'),
      }
    case 'seasonSunday':
    case 'seasonWeekday': {
      const begun = way.days[0] <= todayIso
      const total = way.door === 'seasonSunday' ? way.days.length : way.needed
      const when = begun
        ? t('saints.receive.seasonSoFar', {
            done: way.attended,
            total,
            date: dayAndDistance(way.days[way.days.length - 1], today, t),
          })
        : t('saints.receive.seasonFrom', { date: dayAndDistance(way.days[0], today, t) })
      return {
        glyph: way.door === 'seasonSunday' ? 'candles' : 'chalice',
        title:
          way.door === 'seasonSunday'
            ? t('saints.receive.seasonSundays', { season: season(way.season) })
            : t('saints.receive.seasonWeekdays', {
                season: season(way.season),
                needed: way.needed,
                total: way.days.length,
              }),
        when,
        progress: { total, done: way.attended },
        soon: begun,
      }
    }
    case 'triduum':
    case 'gaudete':
    case 'laetare':
      return {
        glyph: way.door === 'triduum' ? 'chalice' : 'candles',
        title: t(`saints.receive.${way.door}`),
        when: dayAndDistance(way.days[0], today, t),
      }
    default:
      // Books and lineages give nothing the app records yet.
      return undefined
  }
}
