import { isSameDay, parseISO, subDays } from 'date-fns'
import { useRouter } from 'expo-router'
import { Church } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { dayKeys } from '@/config/constants'
import { getManifest } from '@/content/resolver'
import { useYearCalendar } from '@/features/calendar'
import { useCheckInsOn } from '@/features/mass-times'
import type { ChronicleBead, ChronicleDay } from '@/features/plan-of-life/chronicle'
import { hourHue } from '@/features/plan-of-life/ruleString'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { getCelebrationsForDate, getLiturgicalDayName } from '@/lib/liturgical'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

const beadSize = 9
const maxGap = 6
const churchSize = 13

export function practiceName(practiceId: string): string {
  const manifest = getManifest(practiceId)
  return manifest ? localizeContent(manifest.name) : practiceId
}

/** The day's name in the calendar, and whether it is kept as a feast (or Sunday). */
export function useDayName(date: string): { name: string; festive: boolean } {
  const { t } = useTranslation()
  const transfers = useOfTransfers()
  const day = parseISO(date)
  const { data: calendar } = useYearCalendar(day.getFullYear())
  const principal = calendar ? getCelebrationsForDate(calendar, day)?.principal : undefined
  const name =
    (principal && localizeContent(principal.entry.name)) ||
    getLiturgicalDayName(day, 'of', { t: (k, o) => t(k, o) as string }, transfers)
  const festive =
    day.getDay() === 0 || principal?.rank === 'solemnity' || principal?.rank === 'feast'
  return { name, festive }
}

/** Kept of the times due so far; today's times still ahead aren't counted yet. */
export function dayTally(day: ChronicleDay) {
  const due = day.beads.filter((b) => b.state !== 'ahead')
  return { kept: due.filter((b) => b.state === 'kept').length, due: due.length }
}

export function ChronicleDayRow({ day }: { day: ChronicleDay }) {
  const { t } = useTranslation()
  const router = useRouter()
  const today = useToday()
  const { name, festive } = useDayName(day.date)
  const date = parseISO(day.date)
  const label = (() => {
    if (isSameDay(date, today)) return t('memoria.today')
    if (isSameDay(date, subDays(today, 1))) return t('memoria.yesterday')
    return `${t(`day.${dayKeys[date.getDay()]}`)} ${date.getDate()}`
  })()
  // A plan built in one sitting — a tradition applied — joins as one line.
  const joined = day.notes.filter((n) => n.kind === 'joined')
  const notes = [
    ...(joined.length > 2
      ? [t('memoria.note.joinedMany', { count: joined.length })]
      : joined.map((n) => t('memoria.note.joined', { name: practiceName(n.practiceId) }))),
    ...day.notes
      .filter((n) => n.kind !== 'joined')
      .map((n) => t(`memoria.note.${n.kind}`, { name: practiceName(n.practiceId) })),
  ]
  const { kept, due } = dayTally(day)
  const extras = day.extras.length
  const churches = useCheckInsOn(day.date).length

  return (
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/memoria/[date]', params: { date: day.date } })}
      accessibilityRole="button"
      accessibilityLabel={t('a11y.openChronicleDay', {
        day: `${label}, ${name}`,
        kept,
        due,
        count: extras,
      })}
    >
      <YStack paddingVertical="$sm" gap={9} borderBottomWidth={0.5} borderColor="$borderColor">
        <XStack alignItems="baseline" gap={10}>
          <Typography
            variant="label"
            width={64}
            fontSize={12}
            color="$colorSecondary"
            textTransform="uppercase"
            letterSpacing={1.5}
            numberOfLines={1}
          >
            {label}
          </Typography>
          <Typography
            flex={1}
            fontSize="$3"
            fontStyle="italic"
            numberOfLines={1}
            color={festive ? '$accent' : '$colorSecondary'}
          >
            {name}
          </Typography>
          <Typography fontSize="$2" tone="muted">
            {due ? `${kept}/${due}` : ''}
            {extras ? <Typography color="$accent">{` +${extras}`}</Typography> : null}
          </Typography>
        </XStack>
        <BeadString beads={day.beads} extras={extras} churches={churches} />
        {notes.map((note) => (
          <Typography key={note} fontSize="$2" fontStyle="italic" tone="muted">
            {note}
          </Typography>
        ))}
      </YStack>
    </AnimatedPressable>
  )
}

/**
 * The day's plan as a string of beads in the plan's hour colours — filled
 * where prayed, hollow where not, dashed where still ahead, a star for a
 * program's day — and, loose after it, a diamond for each prayer beyond it,
 * then a little church for each check-in.
 */
function BeadString({
  beads,
  extras,
  churches,
}: {
  beads: ChronicleBead[]
  extras: number
  churches: number
}) {
  const theme = useTheme()
  const [width, setWidth] = useState(0)
  const count = beads.length + extras
  const tail =
    (extras ? maxGap * 2 : 0) + churches * (churchSize + maxGap) + (churches ? maxGap : 0)
  const gap =
    count > 1 && width
      ? Math.max(1, Math.min(maxGap, (width - tail - count * beadSize) / (count - 1)))
      : maxGap

  return (
    <XStack
      alignItems="center"
      height={14}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {beads.length ? (
        // The string runs between the beads, not as one absolute line behind them: an
        // absolute top="50%" resolves below the beads' middle on iOS.
        <XStack alignItems="center">
          {beads.map((bead, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: beads are positional on the day
            <XStack key={i} alignItems="center">
              {i > 0 ? <YStack width={gap} height={0.5} backgroundColor="$accentSubtle" /> : null}
              <Bead bead={bead} />
            </XStack>
          ))}
        </XStack>
      ) : null}
      {extras ? (
        <XStack alignItems="center" gap={gap} marginLeft={beads.length ? maxGap * 2 : 0}>
          {Array.from({ length: extras }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical marks
            <ExtraMark key={i} />
          ))}
        </XStack>
      ) : null}
      {churches ? (
        <XStack alignItems="center" gap={maxGap} marginLeft={count ? maxGap * 2 : 0}>
          {Array.from({ length: churches }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: identical marks
            <Church key={i} size={churchSize} color={theme.colorSecondary?.val} />
          ))}
        </XStack>
      ) : null}
    </XStack>
  )
}

export function Bead({ bead, size = beadSize }: { bead: ChronicleBead; size?: number }) {
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  if (bead.kind === 'program') {
    return (
      <YStack width={size + 3} alignItems="center" backgroundColor="$background">
        <Typography
          fontSize={size + 5}
          lineHeight={size + 5}
          color={bead.state === 'kept' ? '$accent' : '$colorSecondary'}
        >
          {bead.state === 'kept' ? '✦' : '✧'}
        </Typography>
      </YStack>
    )
  }
  const hue = hourHue(bead.time, dark)
  if (bead.state === 'kept') {
    return <YStack width={size} height={size} borderRadius={size} backgroundColor={hue} />
  }
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size}
      borderWidth={1}
      borderStyle={bead.state === 'ahead' ? 'dashed' : 'solid'}
      borderColor={bead.state === 'ahead' ? theme.colorSecondary.val : hue}
      opacity={bead.state === 'ahead' ? 1 : 0.6}
      backgroundColor="$background"
    />
  )
}

export function ExtraMark({ size = beadSize }: { size?: number }) {
  return (
    <YStack
      width={size - 1}
      height={size - 1}
      backgroundColor="$color"
      transform={[{ rotate: '45deg' }]}
    />
  )
}
