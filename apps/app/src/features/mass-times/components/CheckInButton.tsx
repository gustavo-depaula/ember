import { CalendarCheck, Check, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'
import type { CheckInKind } from '../checkins'
import { useCheckInsStore, useChurchAttendance } from '../checkins'
import { ChipButton } from './ChipButton'
import { SmallCaps } from './SheetType'

const kinds: CheckInKind[] = ['mass', 'confession', 'adoration', 'visit']

// Church check-in: record a visit and what you were there for. A Mass check-in also completes the
// "mass" practice for today, so Mass attendance flows into the plan of life rather than being a
// parallel tally. A ruled row that discloses the form inline (no modal), with a success haptic and a
// brief confirmation in the row's place.
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
  const { count, last } = useChurchAttendance(church.id)

  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<CheckInKind>('mass')
  const [note, setNote] = useState('')
  const [justChecked, setJustChecked] = useState<CheckInKind | undefined>(undefined)

  const confirm = () => {
    void successBuzz()
    checkIn(church, { kind, note })
    setJustChecked(kind)
    setOpen(false)
    setNote('')
    setKind('mass')
    setTimeout(() => setJustChecked(undefined), 2200)
  }

  if (justChecked) {
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <XStack minHeight={52} paddingVertical="$sm" alignItems="center" gap="$md">
          <Check size={20} color={theme.colorGreen?.val} />
          <YStack flex={1}>
            <Typography variant="interface" fontSize="$3">
              {t('massTimes.checkedIn')}
            </Typography>
            {justChecked === 'mass' ? (
              <Typography variant="annotation">{t('massTimes.massCompleted')}</Typography>
            ) : null}
          </YStack>
        </XStack>
      </Animated.View>
    )
  }

  if (!open) {
    return (
      <AnimatedPressable
        onPress={() => {
          void lightTap()
          setOpen(true)
        }}
        accessibilityRole="button"
        accessibilityLabel={t('massTimes.checkIn')}
      >
        <XStack minHeight={52} paddingVertical="$sm" alignItems="center" gap="$md">
          <CalendarCheck size={20} color={theme.colorSecondary?.val} />
          <YStack flex={1}>
            <Typography variant="interface" fontSize="$3">
              {t('massTimes.checkIn')}
            </Typography>
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
          <ChevronRight size={16} color={theme.colorSecondary?.val} />
        </XStack>
      </AnimatedPressable>
    )
  }

  return (
    <Animated.View entering={FadeIn.duration(180)}>
      <YStack gap="$sm" paddingVertical="$md">
        <SmallCaps>{t('massTimes.checkInPrompt')}</SmallCaps>
        <XStack gap="$sm" flexWrap="wrap">
          {kinds.map((k) => (
            <ChipButton
              key={k}
              label={t(`massTimes.kind.${k}`)}
              selected={kind === k}
              onPress={() => {
                void selectionTick()
                setKind(k)
              }}
            />
          ))}
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
          <ChipButton label={t('massTimes.checkInConfirm')} selected onPress={confirm} />
          <ChipButton label={t('massTimes.cancel')} onPress={() => setOpen(false)} />
        </XStack>
      </YStack>
    </Animated.View>
  )
}
