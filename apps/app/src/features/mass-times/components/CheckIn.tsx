import type { ServiceKind } from '@ember/api'
import { isSameDay } from 'date-fns'
import { CalendarCheck, Check } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Input, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { lightTap, selectionTick, successBuzz } from '@/lib/haptics'
import type { UpcomingService } from '@/lib/mass-times'
import type { CheckInKind } from '../checkins'
import { checkIn, useChurchAttendance } from '../checkins'
import { formatTimeOfDay, kindLabel } from '../format'
import { ActionTile } from './ActionTile'
import { ChipButton } from './ChipButton'
import { useGlassTile } from './glass'
import { SectionLabel, SmallCaps } from './SheetType'
import { useSheetLift } from './sheetLift'

const kinds: CheckInKind[] = ['mass', 'confession', 'adoration', 'visit']

// Church check-in: record a visit and what you were there for. A Mass check-in also completes the
// "mass" practice for today, so Mass attendance flows into the plan of life rather than being a
// parallel tally. Its prominence follows the moment: while a service is on (`underway`) it is the
// card under the next-time line, asking whether you're there; the rest of the day it is a tile in
// the church's action bar, handed to `actions` to render alongside the others. Either opens the
// same inline form (no modal), with the service's kind already chosen.
export function CheckIn({
  church,
  locale,
  underway,
  now,
  actions,
}: {
  church: { id: string; name: string }
  locale: string
  underway?: UpcomingService
  now: Date // the church's wall clock (wallClockNow), the frame `underway` is in
  actions: (checkInTile?: ReactNode) => ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const liftSheet = useSheetLift()
  const { count, last } = useChurchAttendance(church.id)

  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<CheckInKind>('visit')
  const [note, setNote] = useState('')
  const [justChecked, setJustChecked] = useState<CheckInKind | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)

  const checkedToday = last !== undefined && isSameDay(new Date(last), new Date())
  const lastClock = last
    ? new Date(last).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : ''

  const openForm = () => {
    void lightTap()
    liftSheet()
    setKind((underway?.service.kind as CheckInKind | undefined) ?? 'visit')
    setFailed(false)
    setOpen(true)
  }

  const confirm = async () => {
    setSaving(true)
    setFailed(false)
    try {
      await checkIn(church, { kind, note })
    } catch {
      // The form stays as it was, so trying again is one tap.
      setFailed(true)
      return
    } finally {
      setSaving(false)
    }
    void successBuzz()
    setJustChecked(kind)
    setOpen(false)
    setNote('')
    setTimeout(() => setJustChecked(undefined), 2600)
  }

  const panel = (() => {
    if (justChecked)
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
    if (open)
      return (
        <CheckInForm
          kind={kind}
          onKind={(k) => {
            void selectionTick()
            setKind(k)
          }}
          note={note}
          onNote={setNote}
          saving={saving}
          failed={failed}
          onConfirm={() => void confirm()}
          onCancel={() => setOpen(false)}
        />
      )
    if (!underway) return null
    if (checkedToday)
      return (
        <XStack minHeight={44} alignItems="center" gap="$md">
          <Check size={20} color={theme.colorGreen?.val} />
          <Typography variant="annotation" fontSize="$2" flex={1}>
            {t('massTimes.checkedInAt', { time: lastClock })}
          </Typography>
        </XStack>
      )
    return <UnderwayCard underway={underway} now={now} onCheckIn={openForm} />
  })()

  // While a service is on, the card stands above the action bar; otherwise the bar carries the
  // check-in as its last tile, and the form opens beneath the tile that was tapped.
  if (underway)
    return (
      <YStack gap="$sm">
        {panel}
        {actions()}
      </YStack>
    )

  const tile = checkedToday ? (
    <ActionTile
      label={t('massTimes.checkedInToday')}
      icon={<Check size={20} color={theme.colorGreen?.val} />}
      tone="$colorGreen"
      onPress={open ? () => setOpen(false) : openForm}
    />
  ) : (
    <ActionTile
      label={t('massTimes.checkInShort')}
      icon={<CalendarCheck size={20} color={theme.color?.val} />}
      detail={
        count > 0
          ? `${count}× · ${new Date(last ?? '').toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`
          : undefined
      }
      onPress={open ? () => setOpen(false) : openForm}
    />
  )
  return (
    <YStack gap="$sm">
      {actions(tile)}
      {panel}
    </YStack>
  )
}

// "Mass at 20:00 · now ✠ — At Mass? [Check in]": the one filled card on the sheet, shown only while
// the service is on, so it is loud exactly when a check-in makes sense.
function UnderwayCard({
  underway,
  now,
  onCheckIn,
}: {
  underway: UpcomingService
  now: Date
  onCheckIn: () => void
}) {
  const { t } = useTranslation()
  const tile = useGlassTile(true)
  const serviceKind = underway.service.kind as ServiceKind
  const time = formatTimeOfDay(underway.occurrence.startTime)
  const minutesToStart = Math.ceil((underway.instant.getTime() - now.getTime()) / 60_000)
  const label = { kind: kindLabel(serviceKind, t), time }

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <YStack backgroundColor={tile} borderRadius={16} padding="$md" gap="$sm">
        <SectionLabel cross>
          {minutesToStart > 0
            ? t('massTimes.underwaySoon', { ...label, count: minutesToStart })
            : t('massTimes.underwayNow', label)}
        </SectionLabel>
        <Typography variant="sacred-title" textAlign="left" fontSize={22} lineHeight={28}>
          {t(`massTimes.underwayQuestion.${serviceKind}`)}
        </Typography>
        <PrimaryButton label={t('massTimes.checkInConfirm')} onPress={onCheckIn} />
      </YStack>
    </Animated.View>
  )
}

function CheckInForm({
  kind,
  onKind,
  note,
  onNote,
  saving,
  failed,
  onConfirm,
  onCancel,
}: {
  kind: CheckInKind
  onKind: (kind: CheckInKind) => void
  note: string
  onNote: (note: string) => void
  saving: boolean
  failed: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  return (
    <Animated.View entering={FadeIn.duration(180)}>
      <YStack gap="$sm" paddingVertical="$sm">
        <SmallCaps>{t('massTimes.checkInPrompt')}</SmallCaps>
        <XStack gap="$sm" flexWrap="wrap">
          {kinds.map((k) => (
            <ChipButton
              key={k}
              label={t(`massTimes.kind.${k}`)}
              selected={kind === k}
              onPress={() => onKind(k)}
            />
          ))}
        </XStack>
        <Input
          value={note}
          onChangeText={onNote}
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
        {failed ? (
          <Typography variant="reference" color="$colorBurgundy">
            {t('massTimes.saveFailed')}
          </Typography>
        ) : null}
        <PrimaryButton
          label={t('massTimes.checkInConfirm')}
          onPress={onConfirm}
          disabled={saving}
        />
        <AnimatedPressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('massTimes.cancel')}
          style={{ alignSelf: 'center' }}
        >
          <XStack minHeight={44} alignItems="center" paddingHorizontal="$md">
            <Typography variant="interface" fontSize="$2" color="$colorSecondary">
              {t('massTimes.cancel')}
            </Typography>
          </XStack>
        </AnimatedPressable>
      </YStack>
    </Animated.View>
  )
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack
        minHeight={48}
        borderRadius={12}
        backgroundColor="$color"
        alignItems="center"
        justifyContent="center"
        gap="$sm"
        opacity={disabled ? 0.5 : 1}
      >
        <Check size={18} color={theme.background?.val} />
        <Typography variant="interface" fontSize="$3" color="$background">
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
