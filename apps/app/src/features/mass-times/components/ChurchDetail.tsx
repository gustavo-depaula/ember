import type { ServiceKind } from '@ember/api'
import { Globe, Mail, MapPin, Phone } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, confirm, Skeleton, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import type { ChurchDetail as ChurchDetailData } from '@/lib/mass-times'
import { nextService, useChurch, wallClockNow, weeklySchedule } from '@/lib/mass-times'
import {
  dayLabel,
  describeOtherRule,
  formatTimeOfDay,
  kindLabel,
  serviceKindOrder,
  weekdayName,
} from '../format'
import { CheckInButton } from './CheckInButton'
import { ChurchFeedback } from './ChurchFeedback'
import { FavoriteButton } from './FavoriteButton'
import { MassReminderToggle } from './MassReminderToggle'
import { Panel } from './Panel'
import { QueryError } from './QueryError'

type IconComponent = typeof Phone

// Verification older than this reads as a warning — much of the directory was imported years ago.
const staleAfterMs = 2 * 365 * 86_400_000

export function ChurchDetail({ churchId }: { churchId: string }) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError, refetch } = useChurch(churchId)

  if (isLoading)
    return (
      <YStack gap="$md">
        <Skeleton height={34} width="70%" borderRadius={8} />
        <Skeleton height={64} borderRadius={12} />
        <Skeleton height={180} borderRadius={12} />
      </YStack>
    )
  if (isError || !data) return <QueryError onRetry={() => refetch()} />

  const locale = i18n.language
  const now = wallClockNow(data.timezone)
  const next = nextService(data.services, { timezone: data.timezone, kind: 'mass', now })
  const where = [data.address, data.city, data.region].filter(Boolean).join(' · ')
  const verified = data.lastVerifiedAt ? new Date(data.lastVerifiedAt) : undefined

  return (
    <YStack gap="$lg">
      <YStack gap="$xs">
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$md">
          <Typography variant="sacred-title" fontSize={26} textAlign="left" flexShrink={1}>
            {data.longName ?? data.name}
          </Typography>
          <FavoriteButton
            church={{
              id: data.id,
              name: data.name,
              city: data.city ?? undefined,
              region: data.region ?? undefined,
            }}
          />
        </XStack>
        {where ? <Typography variant="annotation">{where}</Typography> : null}
        {next ? (
          <Typography variant="interface" fontSize="$2" color="$accent">
            {t('massTimes.nextMass')} · {dayLabel(next.occurrence.date, now, t, locale)}{' '}
            {formatTimeOfDay(next.occurrence.startTime, locale)}
          </Typography>
        ) : null}
      </YStack>

      <ContactActions church={data} />

      {serviceKindOrder.map((kind) => (
        <WeeklySection key={kind} kind={kind} church={data} now={now} locale={locale} />
      ))}

      <XStack gap="$sm" flexWrap="wrap" alignItems="flex-start">
        <CheckInButton church={{ id: data.id, name: data.name }} locale={locale} />
        <MassReminderToggle church={{ id: data.id, name: data.name }} services={data.services} />
      </XStack>

      <ParishTexts church={data} />

      <ChurchFeedback churchId={data.id} />

      {verified ? (
        <Typography variant="reference" tone="muted">
          {t('massTimes.lastVerified', {
            date: verified.toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          })}
          {Date.now() - verified.getTime() > staleAfterMs
            ? ` — ${t('massTimes.mayBeOutdated')}`
            : ''}
        </Typography>
      ) : null}
    </YStack>
  )
}

// One service kind's standing week, bulletin-style: a row per weekday that has times, today's row in
// accent with its already-past times dimmed, then the monthly/seasonal rules as footnotes. Hidden when
// the church lists no structured times of this kind (the parish's own text below still has them).
function WeeklySection({
  kind,
  church,
  now,
  locale,
}: {
  kind: ServiceKind
  church: ChurchDetailData
  now: Date
  locale: string
}) {
  const { t } = useTranslation()
  const { days, other } = weeklySchedule(church.services, kind)
  if (days.length === 0 && other.length === 0) return null

  const today = now.getUTCDay()
  const clock = (time: string) => time.padStart(5, '0')
  const nowClock = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`

  return (
    <YStack gap="$sm">
      <Typography variant="label">{kindLabel(kind, t)}</Typography>
      <Panel gap="$sm">
        {days.map(({ dow, times }) => {
          const isToday = dow === today
          return (
            <XStack key={dow} justifyContent="space-between" alignItems="baseline" gap="$md">
              <Typography
                variant="interface"
                fontSize="$3"
                color={isToday ? '$accent' : '$color'}
                fontWeight={isToday ? '600' : '400'}
              >
                {weekdayName(dow, locale)}
              </Typography>
              <XStack flexShrink={1} flexWrap="wrap" justifyContent="flex-end" columnGap="$sm">
                {times.map((time) => (
                  <Typography
                    key={time}
                    variant="interface"
                    fontSize="$3"
                    color={isToday ? '$accent' : '$colorSecondary'}
                    opacity={isToday && clock(time) < nowClock ? 0.4 : 1}
                  >
                    {formatTimeOfDay(time, locale)}
                  </Typography>
                ))}
              </XStack>
            </XStack>
          )
        })}
        {other.length > 0 ? (
          <YStack
            gap="$xs"
            paddingTop={days.length > 0 ? '$sm' : 0}
            borderTopWidth={days.length > 0 ? 1 : 0}
            borderColor="$borderColor"
          >
            {other.map((rule) => (
              <XStack
                key={`${rule.kind}-${JSON.stringify(rule)}`}
                justifyContent="space-between"
                gap="$md"
              >
                <Typography variant="annotation" flexShrink={1}>
                  {describeOtherRule(rule, t, locale)}
                </Typography>
                <Typography variant="annotation">
                  {formatTimeOfDay(rule.startTime, locale)}
                </Typography>
              </XStack>
            ))}
          </YStack>
        ) : null}
      </Panel>
    </YStack>
  )
}

const textKindOrder = ['mass_times', 'seasonal_mass_times', 'confession', 'adoration', 'info']

// The parish's own free-text hours — the authoritative source for seasonal/holyday times the
// structured rules deliberately omit.
function ParishTexts({ church }: { church: ChurchDetailData }) {
  const { t } = useTranslation()
  const texts = church.texts
    .filter((x) => x.rawText)
    .sort((a, b) => textKindOrder.indexOf(a.kind) - textKindOrder.indexOf(b.kind))
  if (texts.length === 0) return null

  return (
    <YStack gap="$sm">
      <Typography variant="label">{t('massTimes.asListed')}</Typography>
      <Panel gap="$md">
        {texts.map((text) => (
          <YStack key={`${text.kind}-${(text.rawText ?? '').slice(0, 12)}`} gap="$xs">
            <Typography variant="reference" tone="muted">
              {t(`massTimes.textKind.${text.kind}`, { defaultValue: t('massTimes.information') })}
            </Typography>
            <Typography variant="interface" fontSize="$2">
              {text.rawText}
            </Typography>
          </YStack>
        ))}
      </Panel>
    </YStack>
  )
}

// Directions / call / email / website as a row of equal tiles, icon over label (the Maps place-card
// action bar), so they read as one control instead of wrapping chips.
function ContactActions({ church }: { church: ChurchDetailData }) {
  const { t } = useTranslation()
  const website = church.links.find((l) => l.kind === 'website')?.url

  const actions: Array<{ id: string; label: string; icon: IconComponent; url: string }> = [
    {
      id: 'directions',
      label: t('massTimes.directions'),
      icon: MapPin,
      url: directionsUrl(church.lat, church.lng, church.name),
    },
  ]
  if (church.phoneE164)
    actions.push({
      id: 'call',
      label: t('massTimes.call'),
      icon: Phone,
      url: `tel:${church.phoneE164}`,
    })
  if (church.email)
    actions.push({
      id: 'email',
      label: t('massTimes.email'),
      icon: Mail,
      url: `mailto:${church.email}`,
    })
  if (website)
    actions.push({ id: 'website', label: t('massTimes.website'), icon: Globe, url: website })

  return (
    <XStack gap="$sm">
      {actions.map(({ id, ...action }) => (
        <ContactButton key={id} {...action} />
      ))}
    </XStack>
  )
}

function ContactButton({
  label,
  icon: Icon,
  url,
}: {
  label: string
  icon: IconComponent
  url: string
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const open = () => {
    void lightTap()
    // No mail account, no dialer (iPad), a malformed parish URL — say so rather than do nothing.
    Linking.openURL(url).catch(() =>
      confirm({ title: t('error.somethingWrong'), description: url, singleAction: true }),
    )
  }
  return (
    <AnimatedPressable
      style={{ flex: 1 }}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        paddingVertical="$sm"
        alignItems="center"
        gap={4}
      >
        <Icon size={20} color={theme.accent?.val} />
        <Typography variant="interface" fontSize="$1" numberOfLines={1}>
          {label}
        </Typography>
      </YStack>
    </AnimatedPressable>
  )
}

function directionsUrl(lat: number, lng: number, name: string): string {
  const label = encodeURIComponent(name)
  return Platform.select({
    ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
    default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  })
}
