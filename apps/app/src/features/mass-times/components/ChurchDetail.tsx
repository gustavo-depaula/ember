import type { ServiceKind } from '@ember/api'
import { Globe, Mail, MapPin, Phone } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Linking, Platform } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Card, Skeleton, Typography } from '@/components'
import { lightTap } from '@/lib/haptics'
import type { ChurchDetail as ChurchDetailData } from '@/lib/mass-times'
import { expandUpcoming, useChurch, wallClockNow } from '@/lib/mass-times'
import { dayLabel, formatTimeOfDay, kindLabel, serviceKindOrder } from '../format'
import { CheckInButton } from './CheckInButton'
import { ChurchFeedback } from './ChurchFeedback'
import { FavoriteButton } from './FavoriteButton'
import { OutlineChip } from './OutlineChip'
import { QueryError } from './QueryError'

type IconComponent = typeof Phone

export function ChurchDetail({ churchId }: { churchId: string }) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError, refetch } = useChurch(churchId)

  if (isLoading) return <Skeleton height={240} borderRadius={12} />
  if (isError || !data) return <QueryError onRetry={() => refetch()} />

  const locale = i18n.language
  const now = wallClockNow(data.timezone)

  return (
    <YStack gap="$lg">
      <YStack gap="$xs">
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$md">
          <Typography variant="sacred-title" fontSize={26} textAlign="left" flexShrink={1}>
            {data.name}
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
        {data.address ? (
          <Typography variant="annotation">
            {[data.address, data.city, data.region].filter(Boolean).join(' · ')}
          </Typography>
        ) : null}
      </YStack>

      <ContactActions church={data} />

      <CheckInButton church={{ id: data.id, name: data.name }} locale={locale} />

      {serviceKindOrder.map((kind) => (
        <ScheduleSection key={kind} kind={kind} church={data} now={now} locale={locale} />
      ))}

      <ParishTexts church={data} />

      <ChurchFeedback churchId={data.id} />

      {data.lastVerifiedAt ? (
        <Typography variant="reference" tone="muted">
          {t('massTimes.lastVerified', {
            date: new Date(data.lastVerifiedAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          })}
        </Typography>
      ) : null}
    </YStack>
  )
}

// Upcoming times for one kind, grouped by day. Hidden when the church has no structured services of
// that kind (the raw parish text below still carries those hours).
function ScheduleSection({
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
  const upcoming = expandUpcoming(church.services, { from: now, kinds: [kind], perService: 3 })
  if (upcoming.length === 0) return null

  // Collapse to one row per day, with that day's times in order.
  const byDay = new Map<string, string[]>()
  for (const u of upcoming.slice(0, 8)) {
    const label = dayLabel(u.occurrence.date, now, t, locale)
    const times = byDay.get(label) ?? []
    times.push(formatTimeOfDay(u.occurrence.startTime, locale))
    byDay.set(label, times)
  }

  return (
    <YStack gap="$sm">
      <Typography variant="label">{kindLabel(kind, t)}</Typography>
      <Card gap="$xs">
        {[...byDay.entries()].map(([day, times]) => (
          <XStack key={day} justifyContent="space-between" alignItems="baseline" gap="$md">
            <Typography variant="interface" fontSize="$3">
              {day}
            </Typography>
            <Typography variant="interface" fontSize="$3" tone="muted">
              {times.join(' · ')}
            </Typography>
          </XStack>
        ))}
      </Card>
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
      <Card gap="$md">
        {texts.map((text) => (
          <YStack key={`${text.kind}-${(text.rawText ?? '').slice(0, 12)}`} gap="$xs">
            <Typography variant="reference" tone="muted">
              {t(`massTimes.kind.${text.kind}`, { defaultValue: t('massTimes.information') })}
            </Typography>
            <Typography variant="interface" fontSize="$3">
              {text.rawText}
            </Typography>
          </YStack>
        ))}
      </Card>
    </YStack>
  )
}

function ContactActions({ church }: { church: ChurchDetailData }) {
  const { t } = useTranslation()
  const website = church.links.find((l) => l.kind === 'website')?.url

  const actions: Array<{ id: string; label: string; icon: IconComponent; url: string }> = []
  actions.push({
    id: 'directions',
    label: t('massTimes.directions'),
    icon: MapPin,
    url: directionsUrl(church.lat, church.lng, church.name),
  })
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
    <XStack gap="$sm" flexWrap="wrap">
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
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={() => {
        void lightTap()
        void Linking.openURL(url)
      }}
    >
      <OutlineChip gap="$xs" paddingHorizontal="$md" paddingVertical="$sm">
        <Icon size={15} color={theme.accent?.val} />
        <Typography variant="interface" fontSize="$3">
          {label}
        </Typography>
      </OutlineChip>
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
