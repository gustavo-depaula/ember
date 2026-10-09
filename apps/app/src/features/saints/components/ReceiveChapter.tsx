import type { Copy, EmberSeason, Season, Way } from '@ember/holy-cards'
import { nextEmberWeek } from '@ember/liturgical'
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme, View, XStack, YStack } from 'tamagui'
import { useShallow } from 'zustand/react/shallow'
import { AnimatedPressable } from '@/components'
import { Typography } from '@/components/typography'
import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { useProgramProgress } from '@/features/plan-of-life/hooks'
import { traditionalStart } from '@/features/plan-of-life/program'
import { practiceHref } from '@/features/practices/practiceHref'
import { useToday } from '@/hooks/useToday'
import i18n, { localizeContent } from '@/lib/i18n'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'
import { emberDaysKept } from '../acts'
import { howWon } from '../redeem/envelopeText'

type Glyph = 'chalice' | 'beads' | 'candles' | 'book'

/**
 * What wins the card, door by door: what to do, when it next comes round, and
 * how far along it is. For a held card, how it came first, then the same ways
 * to receive it again.
 */
export function ReceiveChapter({ ways, copy }: { ways: Way[]; copy: Copy | undefined }) {
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
          if (way.door === 'emberDays') return <EmberRow key={way.door} ember={way.ember} />
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

// The practice that keeps the Ember days.
const emberPractice = 'ember-days'

/** The season's three Ember days: when they next fall, or how many are kept; a tap opens them. */
function EmberRow({ ember }: { ember: EmberSeason }) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const plan = useEventStore(
    useShallow((s) => ({
      slots: s.slots,
      cursors: s.cursors,
      completions: s.completions,
      completionsByPractice: s.completionsByPractice,
    })),
  )
  const week = nextEmberWeek(today, ember)
  const underWay = week.days[0] <= format(today, 'yyyy-MM-dd')
  const done = emberDaysKept(plan, week)
  const title = t('saints.receive.emberDays')
  return (
    <AnimatedPressable
      onPress={() => router.push(practiceHref(emberPractice))}
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
                total: 3,
                date: dayAndDistance(week.days[2], today, t),
              })
            : t('saints.receive.seasonFrom', { date: dayAndDistance(week.days[0], today, t) })
        }
        soon={underWay}
        progress={underWay ? { total: 3, done } : undefined}
        action={t('saints.page.pray')}
      />
    </AnimatedPressable>
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
}: {
  glyph: Glyph
  title: string
  when: string
  detail?: string
  progress?: { total: number; done: number }
  soon?: boolean
  action?: string
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
