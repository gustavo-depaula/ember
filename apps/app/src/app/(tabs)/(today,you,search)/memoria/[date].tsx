import { format, parseISO } from 'date-fns'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, Church } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout, SectionDivider, Typography } from '@/components'
import { useCheckInsOn } from '@/features/mass-times'
import { Bead, dayTally, ExtraMark, practiceName, useDayName } from '@/features/memoria'
import { formatSlotTime } from '@/features/plan-of-life/ruleString'
import { useChronicle } from '@/features/plan-of-life/useRuleRecord'
import { formatLocalized } from '@/lib/i18n/dateLocale'

/** One day of the chronicle: its plan in the order of its hours, then what went beyond it. */
export default function ChronicleDayScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { date } = useLocalSearchParams<{ date: string }>()
  const day = useChronicle()?.dayAt(date)
  const { name, festive } = useDayName(date)
  const checkIns = useCheckInsOn(date)
  // "10:45 AM" needs more room than "10h45".
  const timeWidth = i18n.language.startsWith('pt') ? 48 : 68
  const time = (hhmm: string | null) => (hhmm ? formatSlotTime(hhmm, i18n.language) : '')

  return (
    <ScreenLayout>
      <Stack.Screen options={{ title: t('memoria.dayTitle') }} />
      <YStack paddingVertical="$lg" gap="$xs">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={24} color={theme.color?.val} />
        </Pressable>
        <Typography
          variant="label"
          textAlign="center"
          color="$colorSecondary"
          textTransform="uppercase"
          letterSpacing={2}
          paddingTop="$md"
        >
          {formatLocalized(parseISO(date), t('program.dayDateFormat'))}
        </Typography>
        <Typography
          variant="sacred-title"
          fontStyle="italic"
          fontSize="$5"
          color={festive ? '$accent' : '$color'}
        >
          {name}
        </Typography>
        {day ? (
          <Typography tone="muted" textAlign="center">
            {[
              day.beads.length ? t('memoria.planTally', dayTally(day)) : '',
              day.extras.length ? t('memoria.beyondTally', { count: day.extras.length }) : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        ) : null}
      </YStack>

      <SectionDivider symbol="❦" />

      {day && !day.beads.length && !day.extras.length && !checkIns.length ? (
        <Typography variant="whisper" textAlign="center" paddingTop="$md">
          {t('memoria.emptyDay')}
        </Typography>
      ) : null}

      <YStack paddingTop="$sm">
        {day?.beads.map((bead, i) => (
          <XStack
            // biome-ignore lint/suspicious/noArrayIndexKey: beads are positional on the day
            key={i}
            alignItems="center"
            gap="$md"
            minHeight={36}
            opacity={bead.state === 'kept' ? 1 : 0.55}
          >
            <YStack width={16} alignItems="center">
              <Bead bead={bead} size={10} />
            </YStack>
            <Typography width={timeWidth} fontSize="$2" tone="muted">
              {time(bead.time)}
            </Typography>
            <Typography flex={1} fontSize="$3" numberOfLines={1}>
              {bead.programDay
                ? `${practiceName(bead.practiceId)} · ${t('memoria.programDay', { day: bead.programDay })}`
                : practiceName(bead.practiceId)}
            </Typography>
            {bead.state === 'kept' ? null : (
              <Typography fontSize="$2" fontStyle="italic" tone="muted">
                {t(`memoria.state.${bead.state}`)}
              </Typography>
            )}
          </XStack>
        ))}
      </YStack>

      {day?.extras.length ? (
        <YStack paddingTop="$lg">
          <Typography
            variant="label"
            color="$colorSecondary"
            textTransform="uppercase"
            letterSpacing={1.5}
            paddingBottom="$xs"
          >
            {t('memoria.beyondPlan')}
          </Typography>
          {day.extras.map((extra) => (
            <XStack
              key={`${extra.practiceId}:${extra.completedAt}`}
              alignItems="center"
              gap="$md"
              minHeight={36}
            >
              <YStack width={16} alignItems="center">
                <ExtraMark size={10} />
              </YStack>
              <Typography width={timeWidth} fontSize="$2" tone="muted">
                {time(format(extra.completedAt, 'HH:mm'))}
              </Typography>
              <Typography flex={1} fontSize="$3">
                {practiceName(extra.practiceId)}
              </Typography>
            </XStack>
          ))}
        </YStack>
      ) : null}

      {checkIns.length ? (
        <YStack paddingTop="$lg">
          <Typography
            variant="label"
            color="$colorSecondary"
            textTransform="uppercase"
            letterSpacing={1.5}
            paddingBottom="$xs"
          >
            {t('memoria.atChurch')}
          </Typography>
          {checkIns.map((checkIn) => (
            <XStack
              key={checkIn.id}
              alignItems="flex-start"
              gap="$md"
              minHeight={36}
              paddingVertical="$xs"
            >
              <YStack width={16} alignItems="center" paddingTop={3}>
                <Church size={13} color={theme.colorSecondary?.val} />
              </YStack>
              <Typography width={timeWidth} fontSize="$2" tone="muted">
                {time(format(new Date(checkIn.at), 'HH:mm'))}
              </Typography>
              <YStack flex={1}>
                <Typography fontSize="$3">{checkIn.churchName}</Typography>
                <Typography fontSize="$2" fontStyle="italic" tone="muted">
                  {t(`massTimes.kind.${checkIn.kind}`)}
                </Typography>
                {checkIn.note ? (
                  <Typography fontSize="$2" tone="muted">
                    {checkIn.note}
                  </Typography>
                ) : null}
              </YStack>
            </XStack>
          ))}
        </YStack>
      ) : null}
      <YStack height="$xl" />
    </ScreenLayout>
  )
}
