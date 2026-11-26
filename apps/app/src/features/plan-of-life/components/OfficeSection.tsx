import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, Slab, Typography } from '@/components'
import type { SlotState } from '@/db/events'
import { BookCover } from '@/features/covers'
import type { BlockTone } from '@/features/explore/bgColor'
import { jewelTones } from '@/features/explore/bgColor'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { getSlotPinLabel } from '../getPracticeName'
import { autoPinForPlan } from '../hooks'
import {
  keptHours,
  type Office,
  type OfficeKey,
  officeHours,
  offices,
  setOfficeHours,
} from '../offices'
import { HourToggle } from './HourToggle'

// Each book in its binding's color, as a shelf would show them.
const tones: Record<OfficeKey, BlockTone> = {
  lh: jewelTones.marian,
  da: jewelTones.green,
  mon: jewelTones.stone,
  bvm: { from: '#4A2860', to: '#1F1030' },
}

/**
 * The Divine Office on the plan sheet: an Office the plan keeps, named with its
 * hours and a way to change them, and the books not yet in it — one tap from
 * choosing which of their hours join the string.
 */
export function OfficeSection({
  slots,
  onChoose,
}: {
  slots: SlotState[]
  onChoose: (office: Office) => void
}) {
  const { t } = useTranslation()
  const kept = offices.filter((o) => slots.some((s) => s.practice_id === o.practiceId))
  const rest = offices.filter((o) => !kept.includes(o))

  return (
    <YStack gap="$md">
      <YStack gap="$xs">
        <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
          {t('plan.office')}
        </Typography>
        <Typography variant="caption">
          {t(rest.length === offices.length ? 'plan.officeLede' : 'plan.officeLedeKept')}
        </Typography>
      </YStack>
      {kept.map((o) => {
        const name = t(`plan.offices.${o.key}`)
        const hours = slots
          .filter((s) => s.practice_id === o.practiceId)
          .map((s) => getSlotPinLabel(s))
          .filter(Boolean)
        return (
          <XStack key={o.key} gap="$md" alignItems="flex-start">
            <BookCover title={name} tone={tones[o.key]} format="missal" width={52} />
            <YStack flex={1} gap={2}>
              <Typography fontSize="$3">{name}</Typography>
              <Typography variant="caption">{hours.join(' · ')}</Typography>
              <AnimatedPressable
                testID={`plan-office-change-${o.key}`}
                onPress={() => {
                  lightTap()
                  onChoose(o)
                }}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.changeOfficeHours', { name })}
              >
                <Typography variant="label" color="$accent" minHeight={44} paddingTop="$sm">
                  {t('plan.officeChange')} ›
                </Typography>
              </AnimatedPressable>
            </YStack>
          </XStack>
        )
      })}
      {rest.length > 0 && (
        <XStack gap="$md">
          {rest.map((o) => {
            const name = t(`plan.offices.${o.key}`)
            return (
              <AnimatedPressable
                key={o.key}
                testID={`plan-office-${o.key}`}
                style={{ flex: 1, maxWidth: '25%' }}
                onPress={() => {
                  lightTap()
                  onChoose(o)
                }}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.openOfficeBook', { name })}
              >
                <YStack gap="$xs" alignItems="center">
                  <BookCover title={name} tone={tones[o.key]} format="missal" width={64} />
                  <Typography
                    variant="caption"
                    textAlign="center"
                    alignSelf="stretch"
                    fontSize={12}
                    lineHeight={15}
                  >
                    {t(`plan.offices.${o.key}Hint`)}
                  </Typography>
                </YStack>
              </AnimatedPressable>
            )
          })}
        </XStack>
      )}
    </YStack>
  )
}

/**
 * Which hours of an Office the plan keeps, chosen in the sheet: Lauds, Vespers
 * and Compline proposed for a book not yet kept, the kept hours otherwise.
 */
export function OfficeHoursStep({
  office,
  slots,
  onDone,
}: {
  office: Office
  slots: SlotState[]
  onDone: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const already = keptHours(slots, office.practiceId)
  const [chosen, setChosen] = useState<readonly string[]>(already.length ? already : office.hours)
  const hours = useQuery({
    queryKey: ['office-hours', office.practiceId],
    queryFn: () => officeHours(office.practiceId),
  })
  const save = useMutation({
    mutationFn: () => setOfficeHours(office.practiceId, chosen),
    onSuccess: () => {
      autoPinForPlan(office.practiceId)
      onDone()
    },
    onError: (e) =>
      confirm({
        title: t('error.somethingWrong'),
        description: e instanceof Error ? e.message : String(e),
        singleAction: true,
      }),
  })
  const name = t(`plan.offices.${office.key}`)

  return (
    <YStack gap="$md">
      <XStack alignItems="center" gap="$xs">
        <AnimatedPressable
          testID="plan-office-back"
          onPress={onDone}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.goBack')}
        >
          <ChevronLeft size={26} strokeWidth={1.75} color={theme.accent.val} />
        </AnimatedPressable>
        <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
          {name}
        </Typography>
      </XStack>
      <YStack gap="$xs">
        <Typography variant="screen-title" fontSize="$5">
          {t('plan.officeHours')}
        </Typography>
        <Typography variant="caption">{t('plan.officeHoursLede')}</Typography>
      </YStack>
      <YStack>
        {(hours.data ?? []).map((h) => {
          const on = chosen.includes(h.id)
          return (
            <HourToggle
              key={h.id}
              testID={`plan-hour-${h.id}`}
              label={localizeContent(h.label)}
              time={h.time}
              on={on}
              onToggle={() =>
                setChosen((prev) => (on ? prev.filter((id) => id !== h.id) : [...prev, h.id]))
              }
            />
          )
        })}
      </YStack>
      <Slab
        testID="plan-office-add"
        label={
          already.length ? t('plan.officeSave') : t('plan.officeAdd', { count: chosen.length })
        }
        busy={save.isPending}
        disabled={chosen.length === 0}
        onPress={() => save.mutate()}
      />
    </YStack>
  )
}
