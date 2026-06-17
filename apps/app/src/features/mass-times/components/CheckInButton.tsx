import { format } from 'date-fns'
import { CalendarCheck, Check } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { useLogCompletion } from '@/features/plan-of-life'
import { getToday } from '@/hooks/useToday'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'
import type { CheckInKind } from '../checkins'
import { useCheckInsStore, useChurchAttendance } from '../checkins'
import { OutlineChip } from './OutlineChip'

const kinds: CheckInKind[] = ['mass', 'confession', 'adoration', 'visit']

// Church check-in: record a visit and what you were there for. A Mass check-in also completes the
// "mass" practice for today, so Mass attendance flows into the plan of life rather than being a
// parallel tally. Inline disclosure (no modal), with a success haptic + brief confirmation.
export function CheckInButton({
  church,
  locale,
}: {
  church: { id: string; name: string }
  locale: string
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const checkIn = useCheckInsStore((s) => s.checkIn)
  const logCompletion = useLogCompletion()
  const { count, last } = useChurchAttendance(church.id)

  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<CheckInKind>('mass')
  const [note, setNote] = useState('')
  const [justChecked, setJustChecked] = useState<CheckInKind | undefined>(undefined)

  const confirm = () => {
    void successBuzz()
    checkIn(church, { kind, note })
    if (kind === 'mass') {
      logCompletion.mutate({
        practiceId: 'mass',
        date: format(getToday(), 'yyyy-MM-dd'),
        subId: 'default',
      })
    }
    setJustChecked(kind)
    setOpen(false)
    setNote('')
    setKind('mass')
    setTimeout(() => setJustChecked(undefined), 2200)
  }

  if (justChecked) {
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <YStack gap="$xs" alignItems="flex-start">
          <OutlineChip
            gap="$xs"
            paddingHorizontal="$md"
            paddingVertical="$sm"
            backgroundColor="$accent"
          >
            <Check size={16} color={theme.background?.val} />
            <Typography variant="interface" fontSize="$3" color="$background">
              {t('massTimes.checkedIn')}
            </Typography>
          </OutlineChip>
          {justChecked === 'mass' ? (
            <Typography variant="annotation">{t('massTimes.massCompleted')}</Typography>
          ) : null}
        </YStack>
      </Animated.View>
    )
  }

  if (!open) {
    return (
      <YStack gap="$xs" alignItems="flex-start">
        <AnimatedPressable
          onPress={() => {
            void lightTap()
            setOpen(true)
          }}
          accessibilityRole="button"
        >
          <OutlineChip gap="$xs" paddingHorizontal="$md" paddingVertical="$sm">
            <CalendarCheck size={16} color={theme.accent?.val} />
            <Typography variant="interface" fontSize="$3">
              {t('massTimes.checkIn')}
            </Typography>
          </OutlineChip>
        </AnimatedPressable>
        {count > 0 ? (
          <Typography variant="annotation">
            {t('massTimes.attendanceCount', { count })}
            {last
              ? ` · ${t('massTimes.lastAttended', {
                  date: new Date(last).toLocaleDateString(locale, {
                    month: 'short',
                    day: 'numeric',
                  }),
                })}`
              : ''}
          </Typography>
        ) : null}
      </YStack>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(180)}>
      <YStack gap="$sm">
        <Typography variant="label">{t('massTimes.checkInPrompt')}</Typography>
        <XStack gap="$sm" flexWrap="wrap">
          {kinds.map((k) => {
            const active = kind === k
            return (
              <AnimatedPressable
                key={k}
                onPress={() => {
                  void selectionTick()
                  setKind(k)
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <OutlineChip
                  paddingHorizontal="$md"
                  paddingVertical="$xs"
                  backgroundColor={active ? '$accent' : 'transparent'}
                >
                  <Typography
                    variant="interface"
                    fontSize="$3"
                    color={active ? '$background' : '$color'}
                  >
                    {t(`massTimes.kind.${k}`)}
                  </Typography>
                </OutlineChip>
              </AnimatedPressable>
            )
          })}
        </XStack>
        <Input
          value={note}
          onChangeText={setNote}
          placeholder={t('massTimes.checkInNotePlaceholder')}
          multiline
          numberOfLines={2}
          minHeight={56}
          verticalAlign="top"
        />
        {kind === 'mass' ? (
          <Typography variant="reference" tone="muted">
            {t('massTimes.checkInMassHint')}
          </Typography>
        ) : null}
        <XStack gap="$sm">
          <AnimatedPressable onPress={confirm} accessibilityRole="button">
            <OutlineChip paddingHorizontal="$md" paddingVertical="$sm" backgroundColor="$accent">
              <Typography variant="interface" fontSize="$3" color="$background">
                {t('massTimes.checkInConfirm')}
              </Typography>
            </OutlineChip>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => setOpen(false)} accessibilityRole="button">
            <OutlineChip paddingHorizontal="$md" paddingVertical="$sm">
              <Typography variant="interface" fontSize="$3">
                {t('massTimes.cancel')}
              </Typography>
            </OutlineChip>
          </AnimatedPressable>
        </XStack>
      </YStack>
    </Animated.View>
  )
}
